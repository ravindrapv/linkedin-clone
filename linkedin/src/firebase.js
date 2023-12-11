import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBeVncR07PNIekv-dDhuA7nDNYm_1Z9bJA",
  authDomain: "linkedin-9194a.firebaseapp.com",
  projectId: "linkedin-9194a",
  storageBucket: "linkedin-9194a.appspot.com",
  messagingSenderId: "255473927713",
  appId: "1:255473927713:web:2e8353694b3181286dc560",
  measurementId: "G-R0SLDVT6GD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

console.log("db object:", db);
export { auth, db, storage, provider };
