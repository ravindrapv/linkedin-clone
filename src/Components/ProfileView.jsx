import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useParams, NavLink } from "react-router-dom";
import { updateProfile } from "../App/user-slice";
import Header from "./Hedader";
import Connection from "./ConnectionComponent";

const Popup = ({ children }) => {
  return (
    <PopupOverlay>
      <PopupContainer>{children}</PopupContainer>
    </PopupOverlay>
  );
};

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }
`;

const PopupContainer = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 800px;
  max-width: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;

  label {
    display: flex;
    justify-content: flex-start; /* Align labels to the right */
    align-items: center;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333; /* Darken the label color for better contrast */
    width: 100%;
  }

  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
  }

  /* Style for Save and Cancel buttons */
  button {
    background-color: #007bff; /* Blue color for Save button */
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
    font-size: 16px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
  }

  /* Change background color on hover for Save button */
  button:hover {
    background-color: #0056b3;
  }

  /* Style for Cancel button */
  button.cancel {
    background-color: #ccc;
    color: #333; /* Darken the text color for better visibility */
  }

  /* Center the Save and Cancel buttons */
  div {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
  }
`;

const ProfileView = () => {
  const { userId } = useParams();
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIndex, setEditedIndex] = useState(null);
  const [editedOrganization, setEditedOrganization] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStartDate, setEditedStartDate] = useState("");
  const [editedEndDate, setEditedEndDate] = useState("");
  const [newOrganization, setNewOrganization] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, "users", userId || user?.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserData(userData);
        dispatch(updateProfile(userData));
      } else {
        setError("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching user data from Firebase", error);
      setError("Error fetching user data from Firebase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [dispatch, userId, user]);

  console.log(dispatch);
  console.log(userId);
  console.log(user);
  const handleAddEmploymentDetail = async () => {
    try {
      const userDocRef = doc(db, "users", userId || user?.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      if (!userData.employmentDetails) {
        await setDoc(userDocRef, { employmentDetails: [] }, { merge: true });
      }

      const endDateValue = newEndDate || "Currently Employed";

      await updateDoc(userDocRef, {
        employmentDetails: arrayUnion({
          organization: newOrganization,
          title: newTitle,
          description: newDescription,
          startDate: newStartDate,
          endDate: endDateValue,
        }),
      });

      setNewOrganization("");
      setNewTitle("");
      setNewDescription("");
      setNewStartDate("");
      setNewEndDate("");
      setIsEditing(false);
      setIsPopupOpen(false);
      fetchUserData();
    } catch (error) {
      console.error("Error updating employment details", error);
    }
  };

  const handleEditClick = (index) => {
    setIsEditing(true);
    setEditedIndex(index);
    const currentDetail = userData.employmentDetails[index] || {};
    setEditedOrganization(currentDetail.organization || "");
    setEditedTitle(currentDetail.title || "");
    setEditedDescription(currentDetail.description || "");
    setEditedStartDate(currentDetail.startDate || "");
    setEditedEndDate(currentDetail.endDate || "");
    setIsPopupOpen(true);
  };

  const handleSaveEdit = async () => {
    if (
      editedOrganization &&
      editedTitle &&
      editedDescription &&
      editedStartDate &&
      editedEndDate &&
      editedIndex !== null
    ) {
      try {
        const updatedDetails = [...userData.employmentDetails];
        updatedDetails[editedIndex] = {
          organization: editedOrganization,
          title: editedTitle,
          description: editedDescription,
          startDate: editedStartDate,
          endDate: editedEndDate,
        };

        const userDocRef = doc(db, "users", userId || user?.uid);
        await updateDoc(userDocRef, {
          employmentDetails: updatedDetails,
        });

        setIsEditing(false);
        setEditedIndex(null);
        setEditedOrganization("");
        setEditedTitle("");
        setEditedDescription("");
        setEditedStartDate("");
        setEditedEndDate("");
        setIsPopupOpen(false);
        fetchUserData();
      } catch (error) {
        console.error("Error updating employment details", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedIndex(null);
    setEditedOrganization("");
    setEditedTitle("");
    setEditedDescription("");
    setEditedStartDate("");
    setEditedEndDate("");
    setIsPopupOpen(false);
  };

  if (loading) {
    return <LoadingSpinner>Loading...</LoadingSpinner>;
  }

  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  if (!userData) {
    return <ErrorContainer>No user data available.</ErrorContainer>;
  }

  const { description, bio, employmentDetails } = userData;
  const { displayName, photoURL } = user;

  console.log(userData);
  console.log(user);

  return (
    <>
      <div>
        <>
          <main>
            <Header />
            <section>
              <div className="grid grid-cols-8 grid-rows-[70px_minmax(70px,_1fr)] gap-2 mt-5 max-[1060px]:w-10/12 max-[768px]:mx-auto">
                {/* grid main box 1 */}
                <div className="  bg-white col-[2_/_span_4] rounded-md row-[1_/_span_1] flex items-center justify-between max-[768px]:col-span-8">
                  <p className="ml-5">
                    <span className=" text-black font-bold ">
                      Analytics &amp; tools
                    </span>
                    <br />
                    <span className="text-gray-400 font-bold text-[12px]">
                      Post impressions past 7 days
                    </span>
                  </p>
                  <i className="fa-sharp fa-solid fa-arrow-right mr-5 text-gray-400" />
                </div>
                {/* grid slider 1 */}
                <div className="col-[6_/_span_2] row-[1_/_span_2]  bg-white rounded-md w-[374px] max-[1060px]:w-[300px] max-[1060px]:h-fit max-[768px]:col-span-8 max-[768px]:row-[6_/_span_1] max-[768px]:w-full">
                  <div className="flex justify-between">
                    <p className="px-4 py-4">
                      <span className=" text-black font-bold">
                        Profile language
                      </span>
                      <br />
                      <span className="text-gray-400 font-bold text-[14px]">
                        English
                      </span>
                    </p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      data-supported-dps="24x24"
                      fill="currentColor"
                      className="mercado-match mt-2 mr-2 text-gray-400"
                      width={24}
                      height={24}
                      focusable="false"
                    >
                      <path d="M21.13 2.86a3 3 0 00-4.17 0l-13 13L2 22l6.19-2L21.13 7a3 3 0 000-4.16zM6.77 18.57l-1.35-1.34L16.64 6 18 7.35z" />
                    </svg>
                  </div>
                  <div>
                    <hr className="w-11/12  h-[1px] border-[#ffffff1f] mx-auto" />
                  </div>
                  <div className="flex justify-between">
                    <p className="px-4 py-4  text-black font-bold">
                      <span>Public profile &amp; URL</span>
                      <br />
                      <span className="text-gray-400 text-[14px]">
                        profile/Cy5SeZ4M43YvX93GikSLjb7IGP42
                      </span>
                    </p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      data-supported-dps="24x24"
                      fill="currentColor"
                      className="mercado-match mt-2 mr-2 text-gray-400"
                      width={24}
                      height={24}
                      focusable="false"
                    >
                      <path d="M21.13 2.86a3 3 0 00-4.17 0l-13 13L2 22l6.19-2L21.13 7a3 3 0 000-4.16zM6.77 18.57l-1.35-1.34L16.64 6 18 7.35z" />
                    </svg>
                  </div>
                </div>
                <div className="col-[2_/_span_4] row-[2_/_span_2]  bg-white rounded-md max-[768px]:row-[2_/_span_1] max-[768px]:col-span-8">
                  <div>
                    <div>
                      <div className="flex">
                        <img
                          src="https://miro.medium.com/v2/resize:fit:1400/0*IMK4r0ciK6Sa7k_k"
                          alt=""
                          className="h-full w-full rounded-tl-md rounded-tr-md static"
                        />
                      </div>
                      <div className="w-36 h-36">
                        <img
                          src={photoURL ? photoURL : "/Images/photo.svg"}
                          alt={displayName}
                          className="w-[144px] h-[144px]  -mt-24 ml-3 rounded-full absolute  border-4 border-[rgb(29,34,38)] max-[1060px]:w-24 max-[1060px]:h-24 max-[1060px]:-mt-16"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between -mt-24">
                      <div className="ml-5">
                        <h1 className="font-bold  text-black text-2xl max-[990px]:text-[18px]">
                          {displayName}
                        </h1>
                        <p className="text-gray-800 font-medium max-[990px]:text-[13px]">
                          {description}
                        </p>
                        <p className="text-gray-400 max-[990px]:text-[13px]">
                          Davanagere, karnataka, India.
                          <span className="text-blue-600 font-medium max-[990px]:text-[13px]">
                            Contact info
                          </span>
                        </p>
                        <div className=" flex gap-4">
                          <NavLink
                            to="/connection"
                            state={{
                              username: JSON.stringify(user.displayName),
                              photoURL: JSON.stringify(user.photoURL),
                              designation: JSON.stringify(userData.description),
                            }}
                          >
                            <p className="text-blue-600 font-medium max-[990px]:text-[13px]">
                              connection
                            </p>
                          </NavLink>
                          <NavLink
                            to="/Invitation"
                            state={{
                              username: JSON.stringify(user.displayName),
                              photoURL: JSON.stringify(user.photoURL),
                              designation: JSON.stringify(userData.description),
                            }}
                          >
                            <p className="text-blue-600 font-medium max-[990px]:text-[13px]">
                              Invitation
                            </p>
                          </NavLink>
                        </div>
                        <div className="mt-2">
                          <button className=" bg-customBlue text-white rounded-l-full rounded-r-full w-20 h-8">
                            Open to
                          </button>
                          <button className="text-blue-500 border-blue-500 border rounded-l-full rounded-r-full h-8 w-40 ml-1 max-[951px]:mt-2">
                            Add profile section
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" bg-white col-[2_/_span_4] row-span-4 rounded-md max-[768px]:col-span-8 max-[768px]:row-[4_/_span_1] p-4">
                    <div className="flex justify-between mt-4 mx-4">
                      <div>
                        <h2 className=" text-black font-bold text-xl">About</h2>
                      </div>
                    </div>
                    <hr className="w-full  h-[1px] border-[#ffffff1f] mx-auto mb-5 mt-5" />
                    <p className="mb-2 flex justify-center font-bold  text-black">
                      {bio}
                    </p>
                  </div>
                </div>
                {/* grid slider 2 */}
                <div className="col-[6_/_span_2]  bg-white row-[3_/_span_2] rounded-md w-[374px] max-[1060px]:w-[300px] max-[1060px]:mt-1  max-[768px]:col-span-8 max-[768px]:row-[8_/_span_1]  max-[768px]:w-full">
                  {/* slider-2-box-1 */}
                  <p className="px-8 py-5  text-black font-bold">
                    People also viewed
                  </p>
                  <Connection />
                </div>
                {/* grid main box 3 */}
                <div
                  className=" bg-white col-[2_/_span_4] row-[4_/_span_1] rounded-md max-[768px]:row-[3_/_span_1]
          max-[768px]:col-span-8 h-fit"
                >
                  <h2 className=" text-black text-xl font-bold ml-5">
                    Resourses
                  </h2>
                  <p className="text-gray-400 font-medium ml-5">
                    <i className="fa-solid fa-eye mb-4" />
                    Private to you
                  </p>
                  <div>
                    <h2 className=" text-black font-bold  ml-5">
                      <i className="fa-sharp fa-solid fa-satellite-dish text-gray-400" />
                      Creator mode{" "}
                      <span className="px-[8px] bg-green-500 rounded-md text-black">
                        on
                      </span>
                    </h2>
                    <p className="text-gray-400 font-normal text-[14px] ml-5">
                      Get discovered, showcase content on your profile, and get
                      access to creator tools.
                    </p>
                  </div>
                  <hr className="w-11/12  h-[1px] border-[#ffffff1f] mx-auto mb-2 mt-2" />
                  <div>
                    <h2 className="text-gray-400 ml-5">
                      <i className="mr-10 fa-solid fa-user-group" />
                      <span className=" text-black font-bold -ml-9">
                        My network
                      </span>
                    </h2>
                    <p className="ml-5 font-normal text-gray-400 text-[14px]">
                      See and manage your connections and intrests.
                    </p>
                  </div>
                  <hr className="w-full  h-[1px] border-[#ffffff1f] mx-auto mb-2 mt-2" />
                  <p className="mb-2 flex justify-center font-bold  text-black">
                    {" "}
                    Show all 5 resourses
                  </p>
                </div>
                {/* grid main box 4 */}
                <div className="bg-white col-[2_/_span_4] row-span-4 rounded-md max-[768px]:col-span-8 max-[768px]:row-[4_/_span_1] p-4">
                  <div className="flex justify-between mt-4 mx-4">
                    <div>
                      <h2 className="text-black font-bold text-xl">
                        Experience
                      </h2>
                    </div>
                    <div className="flex">
                      <button
                        onClick={() =>
                          handleEditClick(employmentDetails.length)
                        }
                        className="mr-4 text-blue-500 font-medium border border-blue-500 px-2 py-1 rounded-l-full rounded-r-full"
                      >
                        Add Experience
                      </button>
                      <button onClick={() => handleEditClick()}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          data-supported-dps="24x24"
                          fill="currentColor"
                          className="mercado-match text-black"
                          width={24}
                          height={24}
                          focusable="false"
                        >
                          <path d="M21.13 2.86a3 3 0 00-4.17 0l-13 13L2 22l6.19-2L21.13 7a3 3 0 000-4.16zM6.77 18.57l-1.35-1.34L16.64 6 18 7.35z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <hr className="w-full h-[1px] border-[#ffffff1f] mx-auto mb-5 mt-5" />
                  {employmentDetails &&
                    employmentDetails.map((detail, index) => (
                      <div key={index} className="mb-6">
                        <p className="text-xl">{detail.organization}</p>
                        <p className="font-bold text-xl">{detail.title}</p>
                        <p className="text-gray-500">{detail.description}</p>
                        <div className="flex text-gray-700">
                          <p>{detail.startDate}-- to</p>
                          <p>--{detail.endDate}</p>
                        </div>
                        <button
                          className="editButton text-blue-500"
                          onClick={() => handleEditClick(index)}
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  {isEditing && editedIndex !== null && (
                    <div className="mb-6">
                      <input
                        type="text"
                        required
                        placeholder="Organization Name"
                        value={editedOrganization}
                        onChange={(e) => setEditedOrganization(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Title"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Description"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={editedStartDate}
                        onChange={(e) => setEditedStartDate(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="End Date:"
                        value={editedEndDate}
                        onChange={(e) => setEditedEndDate(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
                      />
                      <div className="btn">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-blue-500 text-white px-6 py-2 rounded cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-300 text-white px-6 py-2 rounded cursor-pointer ml-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {!isEditing && (
                    <button
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                      onClick={() => setIsPopupOpen(true)}
                    >
                      Add new
                    </button>
                  )}
                  {isPopupOpen && (
                    <div>
                      <label>Organization Name:</label>
                      <input
                        type="text"
                        required
                        placeholder="Organization Name"
                        value={newOrganization}
                        onChange={(e) => setNewOrganization(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={handleAddEmploymentDetail}
                        className="bg-blue-500 text-white px-6 py-2 rounded cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                ;
                <div>
                  {" "}
                  {isPopupOpen && (
                    <Popup onClose={() => setIsPopupOpen(false)}>
                      <label>Organization Name:</label>
                      <input
                        type="text"
                        required="true"
                        placeholder="Organization Name"
                        value={isEditing ? editedOrganization : newOrganization}
                        onChange={(e) =>
                          isEditing
                            ? setEditedOrganization(e.target.value)
                            : setNewOrganization(e.target.value)
                        }
                      />
                      <label>Title:</label>
                      <input
                        type="text"
                        required
                        placeholder="Title"
                        value={isEditing ? editedTitle : newTitle}
                        onChange={(e) =>
                          isEditing
                            ? setEditedTitle(e.target.value)
                            : setNewTitle(e.target.value)
                        }
                      />
                      <label>Description:</label>
                      <input
                        type="text"
                        required
                        placeholder="Description"
                        value={isEditing ? editedDescription : newDescription}
                        onChange={(e) =>
                          isEditing
                            ? setEditedDescription(e.target.value)
                            : setNewDescription(e.target.value)
                        }
                      />
                      <label>Start Date:</label>
                      <input
                        type="date"
                        required
                        placeholder="Start Date"
                        value={isEditing ? editedStartDate : newStartDate}
                        onChange={(e) =>
                          isEditing
                            ? setEditedStartDate(e.target.value)
                            : setNewStartDate(e.target.value)
                        }
                      />
                      <label>End Date:</label>
                      <input
                        type="date"
                        value={isEditing ? editedEndDate : newEndDate}
                        onChange={(e) =>
                          isEditing
                            ? setEditedEndDate(e.target.value)
                            : setNewEndDate(e.target.value)
                        }
                      />
                      <div>
                        {isEditing ? (
                          <div>
                            <SaveButton onClick={handleSaveEdit}>
                              Save
                            </SaveButton>
                            <CancelButton onClick={handleCancelEdit}>
                              Cancel
                            </CancelButton>
                          </div>
                        ) : (
                          <SaveButton onClick={handleAddEmploymentDetail}>
                            Add
                          </SaveButton>
                        )}
                      </div>
                    </Popup>
                  )}
                </div>
                {/* grid slider 3 */}
              </div>
            </section>
            {/* Grid section end */}
          </main>
          <footer className="mt-20">
            <div className="text-sm flex justify-between mx-auto items-center text-center w-9/12 font-medium text-gray-400 mb-20 flex-wrap">
              <div className="p-2 max-[296px]:mx-auto">
                <ul className="text-left">
                  <li>About</li>
                  <li className="mt-2">Community Guidelines</li>
                  <li className="mt-2">
                    Privacy &amp; Terms <i className="fa-solid fa-caret-down" />
                  </li>
                  <li className="mt-2">Sales Solutions</li>
                  <li className="mt-2">Safety Center</li>
                </ul>
                <p className=" mt-10 text-xs max-[880px]:mx-auto max-[880px]:mt-52 max-[704px]:mt-96 max-[346px]:mt-[500px] max-[296px]:mt-[600px]">
                  LinkedIn Corporation © 2023
                </p>
              </div>
              <div className="p-2 max-[296px]:mt-10 max-[296px]:mx-auto">
                <ul className="text-left">
                  <li className="-mt-8">Accessibility</li>
                  <li className="mt-2">Careers</li>
                  <li className="mt-2">Ad Choices</li>
                  <li className="mt-2">Mobile</li>
                </ul>
              </div>
              <div className="max-[509px]:mx-auto max-[509px]:mt-10 max-[509px]:mb-5">
                <ul className="text-left">
                  <li className="-mt-8">Talent Solutions</li>
                  <li className="mt-2">Marketing Solutions</li>
                  <li className="mt-2">Advertising</li>
                  <li className="mt-2">Small Business</li>
                </ul>
              </div>
              <div className="p-2 max-[880px]:mx-auto">
                <ul className="text-left">
                  <li>
                    <p className="text-base">
                      <i className="fa-solid  fa-circle-question" />
                      Question?
                    </p>
                    <p className="text-xs">Visit our Help Center.</p>
                  </li>
                  <li className="mt-2">
                    <p className="text-base">
                      <i className="fa-solid fa-gear" />
                      Manage your account and privacy
                    </p>
                    <p className="text-xs">GO to your Settings.</p>
                  </li>
                  <li className="mt-2">
                    <p className="text-base">
                      <i className="fa-solid fa-shield-halved" />
                      Recommendation transparency
                    </p>
                    <p className="text-xs">
                      Learn more about Recommendation Content
                    </p>
                  </li>
                </ul>
              </div>
              <div className="mb-24 p-2 max-[1221px]:mx-auto ">
                <p className="flex">Select Language</p>
                <button className="flex justify-between w-60 border p-1 rounded-md  bg-white">
                  <div>English (English)</div>
                  <div>
                    <i className="fa-solid fa-caret-down" />
                  </div>
                </button>
              </div>
            </div>
          </footer>
        </>
      </div>
    </>
  );
};

const SaveButton = styled.button`
  background-color: #0a66c2;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 18px;
  color: red;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 24px;
`;

export default ProfileView;
