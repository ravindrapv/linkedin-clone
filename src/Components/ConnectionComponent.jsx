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

  console.log(location);

  const [userData, setUserData] = useState([]);

  const getUsers = async () => {
    const userRef = collection(db, "users");
    console.log(location.state);
    try {
      const data = await getDocs(userRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setUserData(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (userId) => {
    const requestDoc = doc(db, "users", userId);
    const connectRef = doc(requestDoc, "RequestIn", auth.currentUser?.uid);
    console.log(typeof location.state);
    console.log("heeeeeeee");

    try {
      await setDoc(connectRef, {
        username: location.state?.username,
        designation: location.state?.designation,
        profile_image: location.state?.photoURL,
        id: auth.currentUser?.uid,
        status: "pending",
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  console.log(userData);

  return (
    <>
      <Header />
      <div className=" w-full h-6"></div>
      <div>
        <List>
          {userData
            .filter((user) => user.id !== auth.currentUser?.uid)
            .map((otherUser) => (
              <Paper key={otherUser.id} style={{ marginBottom: "10px" }}>
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
              </Paper>
            ))}
        </List>
      </div>
    </>
  );
}

export default Connection;
