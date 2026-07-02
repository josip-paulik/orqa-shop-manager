import { createSlice } from "@reduxjs/toolkit";
import { loadUsers, createUser, updateUser, deleteUser } from "./service";
import type { User } from "./types";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

type UsersState = {
  items: User[];
  status: LoadStatus;
  error: string | null;
  lastFetchedAt: number | null;
};

const initialState: UsersState = {
  items: [],
  status: "idle",
  error: null,
  lastFetchedAt: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load users.";
      })
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.users;
        state.lastFetchedAt = Date.now();
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to create user.";
      })
      .addCase(updateUser.pending, (state) => {
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.map((user) =>
          user.id === action.payload.updated.id ? action.payload.updated : user,
        );
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update user.";
      })
      .addCase(deleteUser.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.users;
        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete user.";
      });
  },
});

export default usersSlice.reducer;
