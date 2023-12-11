import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { db } from "../firebase";

export const googleSignIn = createAsyncThunk(
  "user/googleSignInStatus",
  async () => {
    try {
      const payload = await signInWithPopup(auth, provider);
      return payload.user;
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfileStatus",
  async ({ newDescription, newBio }) => {
    try {
      const user = auth.currentUser;

      if (user) {
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
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error updating user profile", error);
      throw error;
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: { value: null, loading: false, error: null },
  reducers: {
    signIn: (state, action) => {
      state.value = action.payload;
      state.loading = false;
      state.error = null;
    },
    signOut: (state) => {
      state.value = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.value = action.payload;
        state.loading = false;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.value = action.payload;
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { signIn, signOut } = userSlice.actions;
export default userSlice.reducer;
