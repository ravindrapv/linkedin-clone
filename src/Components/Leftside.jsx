import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { updateProfile } from "../App/user-slice";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Route, Routes, useNavigate, NavLink } from "react-router-dom";
import ProfileView from "./ProfileView";

const Leftside = () => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBio, setNewBio] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (user && !isDataLoaded) {
      const fetchData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            openEditModal();
            return;
          }

          const userData = userDocSnap.data();
          setNewName(user.displayName || ""); // Set the name
          setNewDescription(userData.description || "");
          setNewBio(userData.bio || "");
          if (
            !user.displayName.trim() &&
            !userData.description.trim() &&
            !userData.bio.trim()
          ) {
            openEditModal();
          }
        } catch (error) {
          console.error("Error fetching user data from Firebase", error);
        } finally {
          setIsDataLoaded(true);
        }
      };

      fetchData();
    }
  }, [user, isDataLoaded]);
  console.log(user);
  console.log(isDataLoaded);
  const openEditModal = () => {
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
  };

  const handleViewProfileClick = () => {
    navigate(`/profile/${user.uid}`);
  };

  const handleSaveClick = async () => {
    dispatch(
      updateProfile({ name: newName, description: newDescription, bio: newBio })
    );

    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          name: newName,
          description: newDescription,
          bio: newBio,
        },
        { merge: true }
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data in Firebase", error);
    }
  };

  return (
    <Container>
      <ArtCard>
        <UserInfo>
          <CardBackground />
          <a href="/feed">
            <Photo src={user?.photoURL ? user.photoURL : "/Images/photo.svg"} />
            <CustomLink to="/feed">{user && user.displayName}</CustomLink>
          </a>
          {isDataLoaded && (
            <>
              {isEditing ? (
                <EditProfileForm className=" hidden">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={user.displayName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <label>Description:</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                  <label>Bio:</label>
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                  />
                  <SaveButton onClick={handleSaveClick}>Save</SaveButton>
                  <CancelButton onClick={closeEditModal}>Cancel</CancelButton>
                </EditProfileForm>
              ) : (
                <>
                  <Description>{newDescription}</Description>
                  <Bio>{newBio}</Bio>
                  <EditButton onClick={openEditModal}>Edit Profile</EditButton>
                  <ViewProfileButton onClick={handleViewProfileClick}>
                    View Profile
                  </ViewProfileButton>
                </>
              )}
            </>
          )}
        </UserInfo>

        <Widget>
          <a href="/feed">
            <div>
              <span>
                <NavLink to={"/Network"}>connections</NavLink>
              </span>
              <span>Grow your network</span>
            </div>
          </a>
        </Widget>

        <Item>
          <span>
            <img src="/Images/item-icon.svg" alt="" />
            My Items
          </span>
        </Item>
      </ArtCard>
      {/* Edit Modal */}
      {isEditing && (
        <EditModal>
          <ModalCard>
            <ModalHeader>
              <ModalCloseButton onClick={closeEditModal}>
                &times;
              </ModalCloseButton>
            </ModalHeader>
            <EditProfileForm>
              <label>Name:</label>
              <input
                type="text"
                value={user.displayName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <label>Description:</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <label>Bio:</label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
              />
              <div className=" flex gap-4">
                <SaveButton onClick={handleSaveClick}>Save</SaveButton>
                <CancelButton onClick={closeEditModal}>Cancel</CancelButton>
              </div>
            </EditProfileForm>
          </ModalCard>
        </EditModal>
      )}
      <Routes>
        <Route path="/profile/*" element={<ProfileView />} />
      </Routes>
    </Container>
  );
};

// Refined styles inspired by LinkedIn

const ViewProfileButton = styled.button`
  background-color: #fff;
  color: #0a66c2;
  border: 1px solid #0a66c2;
  padding: 8px 24px;
  border-radius: 999px;
  cursor: pointer;
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #0a66c2;
    color: #fff;
  }
`;

const CustomLink = styled.div`
  font-size: 20px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.9);
  font-weight: 700;
`;

const Container = styled.div`
  grid-area: leftside;
`;

const ArtCard = styled.div`
  text-align: center;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 8px;
  transition: box-shadow 0.3s;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding: 16px;
  word-wrap: break-word;
  word-break: break-word;
`;

const CardBackground = styled.div`
  background: url("/Images/card-bg.svg");
  background-position: center;
  background-size: cover;
  height: 54px;
  margin: -16px -16px 0;
`;

const Photo = styled.img`
  box-shadow: none;
  width: 96px;
  height: 96px;
  box-sizing: border-box;
  background-clip: content-box;
  background-color: white;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border: 2px solid white;
  margin: -48px auto 16px;
  border-radius: 50%;
`;

const EditProfileForm = styled.div`
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
  }

  input,
  textarea {
    width: 100%;
    padding: 12px;
    margin-bottom: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
`;

const SaveButton = styled.button`
  background-color: #0a66c2;
  color: #fff;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;

  &:hover {
    background-color: #004182;
  }
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: #fff;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-right: 8px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #999;
  }
`;

const Description = styled.p`
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.7);
  font-size: 16px;
`;

const Bio = styled.p`
  color: rgba(0, 0, 0, 0.7);
  font-size: 16px;
`;

const EditButton = styled.button`
  background-color: #fff;
  color: #0a66c2;
  border: 1px solid #0a66c2;
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f2f8fc;
  }
`;

const Widget = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding: 16px;

  & > a {
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 16px;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    div {
      display: flex;
      flex-direction: column;
      text-align: left;

      span {
        font-size: 14px;
        line-height: 1.4;

        &:first-child {
          color: rgba(0, 0, 0, 0.6);
        }

        &:nth-child(2) {
          color: rgba(0, 0, 0, 1);
          font-weight: 600;
        }
      }
    }
  }

  p {
    color: #0a66c2;
    font-size: 14px;
    font-weight: 600;
  }
`;

const Item = styled.a`
  border-color: rgba(0, 0, 0, 0.8);
  text-align: left;
  padding: 16px;
  font-size: 14px;
  display: block;

  span {
    display: flex;
    align-items: center;
    color: rgba(0, 0, 0, 1);
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const EditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 500px;
  padding: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px;
`;

const ModalCloseButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;

  &:hover {
    color: #555;
  }
`;

export default Leftside;
