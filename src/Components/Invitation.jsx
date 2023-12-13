import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useLocation } from "react-router-dom";
import Header from "./Hedader";

function Invitation() {
  const location = useLocation();

  const [user, setUser] = useState([]);
  const [connected, setConnected] = useState(false);

  const showrequest = async () => {
    const requestRef = doc(db, "users", `${auth.currentUser?.uid}`);
    const requestInRef = collection(requestRef, "RequestIn");
    try {
      const data = await getDocs(requestInRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setUser(filteredData);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteReq = async (user) => {
    const userDoc = doc(db, "users", `${auth.currentUser?.uid}`);
    const delDocument = doc(userDoc, "RequestIn", `${user.id}`);
    try {
      await deleteDoc(delDocument);
    } catch (err) {
      console.error(err);
    }
  };

  const addConnect = async (user) => {
    const acceptDoc = doc(db, "users", `${user.id}`);
    const connectionDoc = doc(
      acceptDoc,
      "RequestIn",
      `${auth.currentUser.uid}`
    );
    try {
      await setDoc(connectionDoc, {
        designation: location.state.designation,
        username: location.state.username,
        profile_image: location.state.profile_img,
        status: "connected",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const acceptReq = async (user) => {
    const acceptDoc = doc(db, "users", `${auth.currentUser?.uid}`);
    const connectionDoc = doc(acceptDoc, "RequestIn", `${user.id}`);
    try {
      await setDoc(connectionDoc, {
        designation: user.designation,
        username: user.username,
        profile_image: user.profile_image,
        id: user.id,
        status: "connected",
      });
      addConnect(user);
      setConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    showrequest();
    setConnected(false);
  }, [user]);

  return (
    <>
      <Header />
      <div className="w-full h-6"></div>
      <div
        style={{ padding: "20px", backgroundColor: "#F6F7F3", height: "100vh" }}
      >
        {user
          .filter((user) => user.status === "pending")
          .map((eachUser) => {
            return (
              <Paper key={eachUser.id}>
                <List>
                  <ListItem>
                    <Tooltip title="Connected" open={connected}>
                      <Avatar src={eachUser.profile_image} />
                    </Tooltip>
                    <ListItemText
                      primary={eachUser.username}
                      secondary={eachUser.designation}
                    />
                    <Button
                      onClick={() => deleteReq(eachUser)}
                      sx={{ color: "grey" }}
                      size="small"
                    >
                      Ignore
                    </Button>
                    <Button
                      onClick={() => acceptReq(eachUser)}
                      sx={{ ml: "5px" }}
                      variant="outlined"
                      size="small"
                    >
                      Accept
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            );
          })}
      </div>
    </>
  );
}

export default Invitation;
