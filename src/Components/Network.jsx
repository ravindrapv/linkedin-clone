import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, doc, getDocs } from "firebase/firestore";
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import Header from "./Hedader";

function Network() {
  const location = useLocation();

  const [user, setUser] = useState([]);

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

  useEffect(() => {
    showrequest();
  }, []);

  console.log(user);

  return (
    <>
      <Header />
      <div className="w-full h-8"></div>
      <div
        style={{ padding: "20px", backgroundColor: "#F6F7F3", height: "100vh" }}
      >
        {user
          .filter((user) => user.status === "connected")
          .map((eachUser) => {
            return (
              <Paper key={user.id} className=" mt-4">
                <List>
                  <ListItem>
                    <Avatar src={eachUser.profile_image} />
                    <ListItemText
                      primary={eachUser.username}
                      secondary={eachUser.designation}
                    />
                    <Link
                      to="/"
                      state={{
                        designation: location.state?.designation,
                        username: eachUser.username,
                        id: eachUser.id,
                        profile_image: eachUser.profile_image,
                      }}
                    >
                      <Button variant="outlined">connected</Button>
                    </Link>
                  </ListItem>
                </List>
              </Paper>
            );
          })}
      </div>
    </>
  );
}

export default Network;
