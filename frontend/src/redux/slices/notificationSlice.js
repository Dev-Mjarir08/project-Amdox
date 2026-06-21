import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/api";

// Thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/notifications");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch notifications");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.populate || await axiosInstance.patch(`/api/notifications/${id}/read`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to mark notification read");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/api/notifications/read-all");
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to mark all read");
    }
  }
);

const initialState = {
  list: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addToastNotification: (state, action) => {
      // Custom notifications if needed
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.list.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.list[index].read = true;
        }
        state.unreadCount = state.list.filter((n) => !n.read).length;
      })
      // Mark all read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addToastNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
