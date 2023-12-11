import React from "react";
import { Route, Routes } from "react-router-dom";
import ProfileView from "./ProfileView";

const ProfileRoutes = () => (
  <Routes>
    <Route path=":userId" element={<ProfileView />} />
  </Routes>
);

export default ProfileRoutes;
