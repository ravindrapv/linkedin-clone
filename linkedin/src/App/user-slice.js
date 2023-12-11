import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { db } from "../firebase";

export const googleSignIn = createAsyncThunk(
  "user/googleSignInStatus",
  async () => {
    const payload = await signInWithPopup(auth, provider);
    return payload.user;
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfileStatus",
  async ({ newDescription, newBio }) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const collectionRef = db.collection("users");
        await collectionRef.doc(user.uid).set({}, { merge: true });
        await user.updateProfile({
          displayName: user.displayName,
          photoURL: user.photoURL,
        });

        await collectionRef.doc(user.uid).set(
          {
            description: newDescription,
            bio: newBio,
          },
          { merge: true }
        );

        return {
          ...user,
          description: newDescription,
          bio: newBio,
        };
      } catch (error) {
        console.error("Error updating user profile", error);
        throw error;
      }
    } else {
      throw new Error("User not found");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: { value: null, loading: false },
  reducers: {
    signIn: (state, action) => {
      state.value = action.payload;
    },
    signOut: (state) => {
      state.value = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(googleSignIn.fulfilled, (state, action) => {
      state.value = action.payload;
      state.loading = false;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.value = action.payload;
      state.loading = false;
    });
  },
});

export const { signIn, signOut } = userSlice.actions;
export default userSlice.reducer;
