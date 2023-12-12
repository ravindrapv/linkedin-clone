import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import Header from "./Hedader";

function Connection() {
  const location = useLocation();
  const [userData, setUserData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const getUsers = async () => {
    const userRef = collection(db, "users");
    try {
      const data = await getDocs(userRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(data);
      setUserData(filteredData);
      console.log(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (userId) => {
    const requestDoc = collection(db, "requests");
    const connectRef = doc(requestDoc, "RequestIn", `${auth.currentUser?.uid}`);
    try {
      const currentUserData = {
        name: currentUser.displayName,
        profile_image: currentUser.photoURL,
      };

      // Find the index of the other user in the userData array
      const otherUserIndex = userData.findIndex((user) => user.id === userId);

      if (otherUserIndex !== -1) {
        const updatedOtherUserData = {
          ...userData[otherUserIndex],
          ...currentUserData,
          status: "pending",
        };

        // Update the userData array with the updated data
        const updatedUserData = [...userData];
        updatedUserData[otherUserIndex] = updatedOtherUserData;

        // Set the updated userData to state
        setUserData(updatedUserData);
      }

      // Save the connection request
      await setDoc(connectRef, {
        username: location.state.username,
        designation: location.state.designation,
        profile_image: location.state.profile_img,
        id: auth.currentUser?.uid,
        status: "pending",
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    getUsers();

    return () => unsubscribe();
  }, []);

  console.log(currentUser, "curentuser");
  console.log(userData);
  return (
    <>
      <Header />
      <h1>hello world</h1>
      <div
        style={{ padding: "20px", backgroundColor: "#F6F7F3", height: "100vh" }}
      >
        {currentUser &&
          userData
            .filter((user) => user.id !== currentUser.uid)
            .map((otherUser) => (
              <Paper key={otherUser.id}>
                <List>
                  <ListItem>
                    <Avatar src={otherUser.profile_image} />
                    <ListItemText
                      primary={otherUser.name}
                      secondary={otherUser.description}
                    />
                    <Button
                      onClick={() => sendRequest(otherUser.id)}
                      variant="outlined"
                      size="small"
                    >
                      Connect
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            ))}
      </div>
    </>
  );
}

export default Connection;
