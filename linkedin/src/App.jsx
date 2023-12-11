import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Header from "./Components/Hedader";
import Home from "./Components/Home";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useDispatch } from "react-redux";
import { signIn } from "./App/user-slice";
import ProfileView from "./Components/ProfileView";
import Invitation from "./Components/Invitation";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(signIn(user));
      }
    });
  });
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/feed/*"
          element={
            <>
              <Header />
              <Home />
            </>
          }
        />
        <Route path="/profile/*" element={<ProfileView />} />
        <Route path="/connections/*" element={<Invitation />} />
      </Routes>
    </div>
  );
}
export default App;
