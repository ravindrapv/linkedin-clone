import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { updateProfile } from "../App/user-slice";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Route, Routes, useNavigate } from "react-router-dom";
import ProfileView from "./ProfileView";

const Leftside = () => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newBio, setNewBio] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setNewDescription(userData.description || "");
            setNewBio(userData.bio || "");
          }
        } catch (error) {
          console.error("Error fetching user data from Firebase", error);
        } finally {
          setIsDataLoaded(true);
        }
      };

      fetchData();
    }
  }, [user]);

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
    dispatch(updateProfile({ description: newDescription, bio: newBio }));

    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
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
            <CustomLink to="/feed">
              Welcome, {user && user.displayName}
            </CustomLink>
          </a>
          {isDataLoaded && (
            <>
              {isEditing ? (
                <EditProfileForm>
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
              <span>Connections</span>
              <span>Grow your network</span>
            </div>
            <p>130</p>
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
          </ModalCard>
        </EditModal>
      )}
      <Routes>
        <Route path="/profile/*" element={<ProfileView />} />
      </Routes>
    </Container>
  );
};

const ViewProfileButton = styled.button`
  background-color: #fff;
  color: #0a66c2;
  border: 1px solid #0a66c2;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px; // Adjust the margin as needed
`;

const CustomLink = styled.div`
  font-size: 16px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.9);
  font-weight: 600;
`;

const Container = styled.div`
  grid-area: leftside;
`;

const ArtCard = styled.div`
  text-align: center;
  overflow: hidden;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 5px;
  transition: box-shadow 83ms;
  position: relative;
  border: none;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%);
`;

const UserInfo = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding: 12px 12px 16px;
  word-wrap: break-word;
  word-break: break-word;
`;

const CardBackground = styled.div`
  background: url("/Images/card-bg.svg");
  background-position: center;
  background-size: 462px;
  height: 54px;
  margin: -12px -12px 0;
`;

const Photo = styled.img`
  box-shadow: none;
  width: 72px;
  height: 72px;
  box-sizing: border-box;
  background-clip: content-box;
  background-color: white;
  background-position: center;
  background-size: 60%;
  background-repeat: no-repeat;
  border: 2px solid white;
  margin: -38px auto 12px;
  border-radius: 50%;
`;

const Link = styled.div`
  font-size: 16px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.9);
  font-weight: 600;
`;

const EditProfileForm = styled.div`
  label {
    display: block;
    margin-bottom: 8px;
  }

  textarea {
    width: 100%;
    height: 80px;
    margin-bottom: 16px;
    resize: vertical;
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

const Description = styled.p`
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.6);
`;

const Bio = styled.p`
  color: rgba(0, 0, 0, 0.6);
`;

const EditButton = styled.button`
  background-color: #fff;
  color: #0a66c2;
  border: 1px solid #0a66c2;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const Widget = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding-top: 12px;
  padding-bottom: 12px;

  & > a {
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 4px 12px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    div {
      display: flex;
      flex-direction: column;
      text-align: left;

      span {
        font-size: 12px;
        line-height: 1.333;

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
    font-size: 13px;
    font-weight: 600;
  }
`;

const Item = styled.a`
  border-color: rgba(0, 0, 0, 0.8);
  text-align: left;
  padding: 12px;
  font-size: 12px;
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

const CommunityCard = styled(ArtCard)`
  padding: 8px 0 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 75px;

  a {
    color: black;
    padding: 4px 12px 4px 12px;
    font-size: 12px;

    &:hover {
      color: #0a66c2;
    }

    span {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &:last-child {
      color: rgba(0, 0, 0, 0.6);
      text-decoration: none;
      border-top: 1px solid #d6cec2;
      padding: 12px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
      }
    }
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
