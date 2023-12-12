import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useParams, NavLink, Navigate, useNavigate } from "react-router-dom";
import { updateProfile } from "../App/user-slice";
import Header from "./Hedader";

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
  const navigate = useNavigate();
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

  // const handleAddEmploymentDetail = async () => {
  //   if (
  //     newOrganization &&
  //     newTitle &&
  //     newDescription &&
  //     newStartDate &&
  //     newEndDate
  //   ) {
  //     try {
  //       const userDocRef = doc(db, "users", userId || user?.uid);
  //       await updateDoc(userDocRef, {
  //         employmentDetails: arrayUnion({
  //           organization: newOrganization,
  //           title: newTitle,
  //           description: newDescription,
  //           startDate: newStartDate,
  //           endDate: newEndDate,
  //         }),
  //       });
  //       setNewOrganization("");
  //       setNewTitle("");
  //       setNewDescription("");
  //       setNewStartDate("");
  //       setNewEndDate("");
  //       setIsEditing(false);
  //       setIsPopupOpen(false);
  //     } catch (error) {
  //       console.error("Error updating employment details", error);
  //     }
  //   }
  // };

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
      {/* <Container>
        <Header />
        <CoverPhoto />
        <ProfileContainer>
          <ProfileImage
            src={photoURL ? photoURL : "/Images/photo.svg"}
            alt={displayName}
          />
          <DisplayName>{displayName}</DisplayName>
          <Description>{description}</Description>
          <Bio>
            <div>
              <div className="container max-w-4xl px-10 py-6 mx-auto rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-400"></span>
                </div>
                <div className="mt-3">
                  <b className="b">About</b>
                  <p className="mt-2">{bio}</p>
                </div>
              </div>
            </div>
          </Bio>
          <hr />
          <EmploymentDetailsContainer>
            <h3>Experience</h3>
            {employmentDetails &&
              employmentDetails.map((detail, index) => (
                <EmploymentDetail key={index}>
                  <p>
                    <b>Organization :</b>
                    {detail.organization}
                  </p>
                  <p>
                    <b>Title:</b> {detail.title}
                  </p>
                  <p>
                    <b>Description:</b> {detail.description}
                  </p>
                  <p>
                    <b>Start Date:</b> {detail.startDate}
                  </p>
                  <p>
                    <b>End Date:</b>
                    {detail.endDate}
                  </p>
                  <button
                    className="editButton"
                    onClick={() => handleEditClick(index)}
                  >
                    Edit
                  </button>
                </EmploymentDetail>
              ))}
            {isEditing && editedIndex !== null && (
              <EditForm>
                <input
                  type="text"
                  placeholder="Organization Name"
                  value={editedOrganization}
                  onChange={(e) => setEditedOrganization(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Start Date"
                  value={editedStartDate}
                  onChange={(e) => setEditedStartDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="End Date:"
                  value={editedEndDate}
                  onChange={(e) => setEditedEndDate(e.target.value)}
                />
                <div className="btn">
                  <SaveButton onClick={handleSaveEdit}>Save</SaveButton>
                  <CancelButton onClick={handleCancelEdit}>Cancel</CancelButton>
                </div>
              </EditForm>
            )}
            {!isEditing && (
              <EditButton
                onClick={() => handleEditClick(employmentDetails.length)}
              >
                Add Employment Detail
              </EditButton>
            )}
          </EmploymentDetailsContainer>
        </ProfileContainer>

        {isPopupOpen && (
          <Popup onClose={() => setIsPopupOpen(false)}>
            <label>Organization Name:</label>
            <input
              type="text"
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
            {isEditing ? (
              <div>
                <SaveButton onClick={handleSaveEdit}>Save</SaveButton>
                <CancelButton onClick={handleCancelEdit}>Cancel</CancelButton>
              </div>
            ) : (
              <SaveButton onClick={handleAddEmploymentDetail}>Add</SaveButton>
            )}
          </Popup>
        )}
      </Container> */}
      <div>
        <>
          <main>
            <Header />
            <section>
              <div className="grid grid-cols-8 grid-rows-[70px_minmax(70px,_1fr)] gap-2 mt-5 max-[1060px]:w-10/12 max-[768px]:mx-auto">
                {/* grid main box 1 */}
                <div className="  bg-slate-100 col-[2_/_span_4] rounded-md row-[1_/_span_1] flex items-center justify-between max-[768px]:col-span-8">
                  <p className="ml-5">
                    <span className=" text-black font-bold ">
                      Analytics &amp; tools
                    </span>
                    <br />
                    <span className="text-gray-400 font-bold text-[12px]">
                      Post impressions past 7 days
                    </span>
                    <span className=" text-black font-bold text-[12px]">
                      197
                    </span>
                    <span className="text-green-400 font-bold text-[12px] ml-1">
                      <i className="fa-solid fa-caret-up" />
                      19,600%
                    </span>
                  </p>
                  <i className="fa-sharp fa-solid fa-arrow-right mr-5 text-gray-400" />
                </div>
                {/* grid slider 1 */}
                <div className="col-[6_/_span_2] row-[1_/_span_2]  bg-slate-100 rounded-md w-[374px] max-[1060px]:w-[300px] max-[1060px]:h-fit max-[768px]:col-span-8 max-[768px]:row-[6_/_span_1] max-[768px]:w-full">
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
                {/* grid main box 2*/}
                <div className="col-[2_/_span_4] row-[2_/_span_2]  bg-slate-100 rounded-md max-[768px]:row-[2_/_span_1] max-[768px]:col-span-8">
                  <div>
                    <div>
                      <div className="flex">
                        <img
                          src="https://miro.medium.com/v2/resize:fit:1400/0*IMK4r0ciK6Sa7k_k"
                          alt=""
                          className="h-full w-full rounded-tl-md rounded-tr-md static z-10"
                        />
                        <div className="-ml-12 mt-5 rounded-full h-8 w-8 bg-[#fff] flex items-center justify-center z-20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            data-supported-dps="16x16"
                            fill="currentColor"
                            className="mercado-match text-blue-600 w-5 h-5"
                            width={16}
                            height={16}
                            focusable="false"
                          >
                            <path d="M14.13 1.86a3 3 0 00-4.17 0l-7 7L1 15l6.19-2 6.94-7a3 3 0 000-4.16zm-8.36 9.71l-1.35-1.34L9.64 5 11 6.35z" />
                          </svg>
                        </div>
                      </div>
                      <div className="w-36 h-36">
                        <img
                          src={photoURL ? photoURL : "/Images/photo.svg"}
                          alt={displayName}
                          className="w-[144px] h-[144px]  -mt-24 ml-3 rounded-full absolute z-20 border-4 border-[rgb(29,34,38)] max-[1060px]:w-24 max-[1060px]:h-24 max-[1060px]:-mt-16"
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
                          Talks about #webdevelpoment
                        </p>
                        <p className="text-gray-400 max-[990px]:text-[13px]">
                          Davanagere, karnataka, India.
                          <span className="text-blue-600 font-medium max-[990px]:text-[13px]">
                            Contact info
                          </span>
                        </p>
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
                        <div className="mt-2">
                          <button className="bg-blue-500 rounded-l-full rounded-r-full w-20 h-8">
                            Open to
                          </button>
                          <button className="text-blue-500 border-blue-500 border rounded-l-full rounded-r-full h-8 w-40 ml-1 max-[951px]:mt-2">
                            Add profile section
                          </button>
                          <button className=" text-black border-white border rounded-l-full rounded-r-full h-8 w-16 ml-1 max-[1060px]:mt-2">
                            More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" bg-slate-100 col-[2_/_span_4] row-span-4 rounded-md max-[768px]:col-span-8 max-[768px]:row-[4_/_span_1] p-4">
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
                <div className="col-[6_/_span_2]  bg-slate-100 row-[3_/_span_2] rounded-md w-[374px] max-[1060px]:w-[300px] max-[1060px]:mt-1  max-[768px]:col-span-8 max-[768px]:row-[8_/_span_1]  max-[768px]:w-full">
                  {/* slider-2-box-1 */}
                  <p className="px-8 py-5  text-black font-bold">
                    People also viewed
                  </p>
                  <div className="flex  text-black px-8 py-4">
                    <div className="w-[60px] h-[60px] rounded-full">
                      <img
                        src="https://media.licdn.com/dms/image/D4D03AQFpe9ODTLbXTQ/profile-displayphoto-shrink_200_200/0/1698399975239?e=1707955200&v=beta&t=cEK8yPzNV0e1mNGgj19cQZNFd17BPOj2ICxrI_kO08Q"
                        alt=""
                        className="w-[60px] h-[60px] rounded-full"
                      />
                    </div>
                    <div className="ml-5">
                      <p>
                        <span className="font-bold">Abhishek Patel</span>
                        <span className="text-gray-400">· 2nd</span>
                      </p>
                      <p className="text-gray-400 text-[14px] font-medium">
                        {" "}
                        SED @ mount blue
                      </p>
                      <p />
                    </div>
                  </div>
                  <div className="flex justify-center  text-black font-bold">
                    <button className="border-2 rounded-l-full rounded-r-full w-40 h-10">
                      <i className="fa-solid fa-user-plus mr-2" />
                      Connect
                    </button>
                  </div>
                  <hr className="w-11/12  h-[1px] border-[#ffffff1f] mx-auto mt-6" />
                  {/* grid-slider-2-box-2 */}
                  <div className="flex  text-black px-8 py-4">
                    <div className="w-[60px] h-[60px] rounded-full">
                      <img
                        src="https://media.licdn.com/dms/image/C4E03AQHUZ0gyQ0zsYQ/profile-displayphoto-shrink_200_200/0/1619003822409?e=1707955200&v=beta&t=8Rb4Fo_qz6tKM4i1tUYi5-OexwIPbXUMD4x1ssy4Qts"
                        alt=""
                        className="w-[60px] h-[60px] rounded-full"
                      />
                    </div>
                    <div className="ml-5">
                      <p>
                        <span className="font-bold">Seena Gregory</span>
                        <span className="text-gray-400">· 1st</span>
                      </p>
                      <p className="text-gray-400 text-[14px] font-medium">
                        Accounts Executive
                      </p>
                      <p />
                    </div>
                  </div>
                  <div className="flex justify-center  text-black font-bold">
                    <button className="border-2 rounded-l-full rounded-r-full w-40 h-10">
                      <i className="fa-solid fa-plus mr-2" />
                      Connect
                    </button>
                  </div>
                  <hr className="w-11/12  h-[1px] border-[#ffffff1f] mx-auto mt-6" />
                  {/* grid-slider-2-box-3 */}
                  <div className="flex  text-black px-8 py-4">
                    <div className="w-[60px] h-[60px] rounded-full">
                      <img
                        src="https://media.licdn.com/dms/image/C5603AQGi2cGPbdWqNg/profile-displayphoto-shrink_200_200/0/1634532786337?e=1707955200&v=beta&t=WCGH2VOawaFVhMoHT6ec17FSq2IqPltdp6Xm-_ICpd4"
                        alt=""
                        className="w-[60px] h-[60px] rounded-full"
                      />
                    </div>
                    <div className="ml-5">
                      <p>
                        <span className="font-bold">Kevin John</span>
                        <span className="text-gray-400">· 2nd</span>
                      </p>
                      <p className="text-gray-400 text-[14px] font-medium w-40">
                        Artificial intelligence Enthusiastic's{" "}
                      </p>
                      <p />
                    </div>
                  </div>
                  <div className="flex justify-center  text-black font-bold">
                    <button className="border-2 rounded-l-full rounded-r-full w-40 h-10">
                      <i className="fa-solid fa-plus mr-2" />
                      Connect
                    </button>
                  </div>
                  <hr className="w-11/12  h-[1px] border-[#ffffff1f] mx-auto mt-6" />
                  {/* grid-slider-2-box-4 */}
                  <div className="flex  text-black px-8 py-4">
                    <div className="w-[60px] h-[60px] rounded-full">
                      <img
                        src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR-o6hgJ_xP_VYrdNT2so6fF7YnrifpJS3RTYnASME-qUhYf6Mz"
                        alt=""
                        className="w-[60px] h-[60px] rounded-full"
                      />
                    </div>
                    <div className="ml-5">
                      <p>
                        <span className="font-bold">anil maurya</span>
                        <span className="text-gray-400">· 2nd</span>
                      </p>
                      <p className="text-gray-400 text-[14px] font-medium">
                        Assistant Manager
                      </p>
                      <p />
                    </div>
                  </div>
                  <div className="flex justify-center  text-black font-bold">
                    <button className="border-2 rounded-l-full rounded-r-full w-40 h-10">
                      <i className="fa-solid fa-user-plus mr-2" />
                      Connect
                    </button>
                  </div>
                  <hr className="w-11/12  h-[1px] border-[#ffffff1f] mx-auto mt-6" />
                  {/* grid-slider-2-box-5 */}
                  <div className="flex  text-black px-8 py-4">
                    <div className="w-[60px] h-[60px] rounded-full">
                      <img
                        src="https://media.licdn.com/dms/image/D4D03AQF3VjmJ6YfwWw/profile-displayphoto-shrink_400_400/0/1671718163886?e=1707955200&v=beta&t=OsgxTG-jr4W8XOJIojt-rXVFeL-85oUhSlge0_EkPPI"
                        alt=""
                        className="w-[60px] h-[60px] rounded-full"
                      />
                    </div>
                    <div className="ml-5">
                      <p>
                        <span className="font-bold">Anil Maurya</span>
                        <span className="text-gray-400">· 3rd</span>
                      </p>
                      <p className="text-gray-400 text-[14px] font-medium">
                        SAA-C03 AWS Certified
                      </p>
                      <p />
                    </div>
                  </div>
                  <div className="flex justify-center  text-black font-bold">
                    <button className="border-2 rounded-l-full rounded-r-full w-40 h-10">
                      <i className="fa-solid fa-user-plus mr-2" />
                      Connect
                    </button>
                  </div>
                  <hr className="w-11/12  h-[1px] border-[#ffffff1f] mx-auto mt-6" />
                  <p className="text-center font-bold  text-black mt-3 mb-3">
                    Show All
                  </p>
                </div>
                {/* grid main box 3 */}
                <div
                  className=" bg-slate-100 col-[2_/_span_4] row-[4_/_span_1] rounded-md max-[768px]:row-[3_/_span_1]
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
                <div className=" bg-slate-100 col-[2_/_span_4] row-span-4 rounded-md max-[768px]:col-span-8 max-[768px]:row-[4_/_span_1] p-4">
                  <div className="flex justify-between mt-4 mx-4">
                    <div>
                      <h2 className=" text-black font-bold text-xl">
                        Experience
                      </h2>
                    </div>
                    <div>
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
                            className="mercado-match  text-black"
                            width={24}
                            height={24}
                            focusable="false"
                          >
                            <path d="M21.13 2.86a3 3 0 00-4.17 0l-13 13L2 22l6.19-2L21.13 7a3 3 0 000-4.16zM6.77 18.57l-1.35-1.34L16.64 6 18 7.35z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <hr className="w-full  h-[1px] border-[#ffffff1f] mx-auto mb-5 mt-5" />
                  {employmentDetails &&
                    employmentDetails.map((detail, index) => (
                      <EmploymentDetail key={index}>
                        <p className="  text-xl">{detail.organization}</p>
                        <p className=" font-bold text-xl">{detail.title}</p>
                        <p className=" text-gray-500">{detail.description}</p>
                        <div className=" flex">
                          <p className=" text-gray-700">
                            {" "}
                            {detail.startDate}-- to
                          </p>
                          <p className=" text-gray-700"> --{detail.endDate}</p>
                        </div>
                        <button
                          className="editButton"
                          onClick={() => handleEditClick(index)}
                        >
                          Edit
                        </button>
                      </EmploymentDetail>
                    ))}

                  {isEditing && editedIndex !== null && (
                    <EditForm>
                      <input
                        type="text"
                        required
                        placeholder="Organization Name"
                        value={editedOrganization}
                        onChange={(e) => setEditedOrganization(e.target.value)}
                      />
                      <input
                        type="text"
                        required
                        placeholder="Title"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        required
                        placeholder="Description"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={editedStartDate}
                        onChange={(e) => setEditedStartDate(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="End Date:"
                        value={editedEndDate}
                        onChange={(e) => setEditedEndDate(e.target.value)}
                      />
                      <div className="btn">
                        <SaveButton onClick={handleSaveEdit}>Save</SaveButton>
                        <CancelButton onClick={handleCancelEdit}>
                          Cancel
                        </CancelButton>
                      </div>
                    </EditForm>
                  )}
                  {!isEditing && (
                    <button
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                      onClick={() => setIsPopupOpen(true)}
                    >
                      {" "}
                      Add new
                    </button>
                  )}
                  {isPopupOpen && (
                    <Popup onClose={() => setIsPopupOpen(false)}>
                      <label>Organization Name:</label>
                      <input
                        type="text"
                        required
                        placeholder="Organization Name"
                        value={newOrganization}
                        onChange={(e) => setNewOrganization(e.target.value)}
                      />
                      <SaveButton onClick={handleAddEmploymentDetail}>
                        Add
                      </SaveButton>
                    </Popup>
                  )}
                </div>
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
                  {/* ... existing code ... */}
                </div>
                {/* grid main box 4 */}
                {/* <div className=" bg-slate-100 col-[2_/_span_4] row-span-5 rounded-md max-[768px]:col-span-8 max-[768px]:row-[5_/_span_1]">
                  <div className="flex justify-between mt-5 mx-4 mb-6">
                    <div className=" text-black font-bold text-xl">
                      <h2>Skills</h2>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <button className="mr-4 text-blue-500 font-medium border border-blue-500 px-2 py-1 rounded-l-full rounded-r-full">
                          Take skill quiz
                        </button>
                        <i className="fa-solid fa-plus mr-4  text-black" />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          data-supported-dps="24x24"
                          fill="currentColor"
                          className="mercado-match  text-black"
                          width={24}
                          height={24}
                          focusable="false"
                        >
                          <path d="M21.13 2.86a3 3 0 00-4.17 0l-13 13L2 22l6.19-2L21.13 7a3 3 0 000-4.16zM6.77 18.57l-1.35-1.34L16.64 6 18 7.35z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div>
                      <div>
                        <h2 className="font-medium text-xl  text-black mb-2">
                          Html 5
                        </h2>
                      </div>
                      <div className="flex">
                        <img
                          src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT43Xzff_Z_V_02kJjxjXr70dtEKuG_kgbbrl12KUclVZyKRkZM"
                          alt=""
                          className="w-6 h-6"
                        />
                        <p className="ml-2  text-black text-[14px]">
                          tumkur ,karnataka
                        </p>
                      </div>
                    </div>
                    <hr className="w-[95%]  h-[1px] border-[#ffffff1f] mx-auto mt-7 mb-7" />
                    <div>
                      <div>
                        <h2 className="font-medium text-xl  text-black mb-2">
                          Cascading style sheets (CSS)
                        </h2>
                      </div>
                      <div className="flex">
                        <img
                          src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT43Xzff_Z_V_02kJjxjXr70dtEKuG_kgbbrl12KUclVZyKRkZM"
                          alt=""
                          className="w-6 h-6"
                        />
                        <p className="ml-2  text-black text-[14px]">
                          tumkur ,karnataka
                        </p>
                      </div>
                    </div>
                    <hr className="w-[95%]  h-[1px] border-[#ffffff1f] mx-auto mt-7 mb-7" />
                    <div className="mb-5">
                      <div>
                        <h2 className="font-medium text-xl  text-black mb-2">
                          Tailwind CSS
                        </h2>
                      </div>
                      <div className="flex">
                        <img
                          src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT43Xzff_Z_V_02kJjxjXr70dtEKuG_kgbbrl12KUclVZyKRkZM"
                          className="w-6 h-6"
                          alt=""
                        />
                        <p className="ml-2  text-black text-[14px]">
                          tumkur ,karnataka
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}
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
                <p className="absolute mt-10 text-xs max-[880px]:mx-auto max-[880px]:mt-52 max-[704px]:mt-96 max-[346px]:mt-[500px] max-[296px]:mt-[600px]">
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
                <button className="flex justify-between w-60 border p-1 rounded-md  bg-slate-100">
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

const EditForm = styled.div`
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333; /* Darken the label color for better contrast */
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
    justify-content: center;
  }
`;

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

const EditButton = styled.button`
  background-color: #f5f5f5; /* Light gray color */
  color: #0a66c2;
  border: 1px solid #0a66c2;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0; /* Lighter gray on hover */
  }
`;

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   background-color: #f4f2ee;
// `;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 18px;
  color: red;
`;

// const CoverPhoto = styled.div`
//   background: url("https://miro.medium.com/v2/resize:fit:1400/0*IMK4r0ciK6Sa7k_k");
//   background-size: cover;
//   height: 200px;
//   width: 100%;
// `;

// const ProfileContainer = styled.div`
//   display: flex;
//   width: 80%;
//   flex-direction: column;
//   align-items: start;
//   margin-top: -75px;
//   padding: 2rem;
//   border-radius: 8px;
//   background-color: #fff;
//   box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
// `;

// const ProfileImage = styled.img`
//   width: 100px;
//   height: 100px;
//   border-radius: 50%;
//   margin-bottom: 16px;
// `;

// const DisplayName = styled.h2`
//   font-size: 20px;
//   font-weight: 600;
//   margin-bottom: 8px;
//   max-width: 700px;
//   padding: 0 1rem;
// `;

// const Description = styled.p`
//   color: rgba(0, 0, 0, 0.6);
//   margin-bottom: 8px;
//   max-width: 700px;
//   padding: 0 1rem;
// `;

// const Bio = styled.p`
//   width: 100%;
//   color: rgba(0, 0, 0, 0.6);
//   margin-bottom: 16px;
//   max-width: 700px;
//   border-radius: 16px;
//   box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
// `;

// const EmploymentDetailsContainer = styled.div`
//   width: 100%;
//   max-width: 700px;
//   margin-top: 32px;
//   box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
//   border-radius: 16px;
//   background-color: #fff;
//   padding: 2rem;

//   label {
//     display: block;
//     margin-top: 16px;
//   }

//   input {
//     width: 100%;
//     padding: 8px;
//     margin-bottom: 16px;
//     border: 1px solid #ddd;
//     border-radius: 4px;
//   }

//   button {
//     background-color: #0a66c2;
//     color: #fff;
//     padding: 8px 16px;
//     border: none;
//     border-radius: 4px;
//     cursor: pointer;
//   }
// `;

const EmploymentDetail = styled.div`
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
    rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;

  p {
    margin: 8px 0;
  }

  .editButton {
    background-color: #fff;
    color: #0a66c2;
    border: 1px solid #0a66c2;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .editButton:hover {
    background-color: #0a66c2;
    color: #fff;
  }
`;
const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 24px;
`;

export default ProfileView;
