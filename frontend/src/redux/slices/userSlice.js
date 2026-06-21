import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/api";

// Fetch all employees thunk
export const fetchEmployees = createAsyncThunk("user/fetchEmployees", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/api/employees");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch employees");
  }
});

const initialState = {
  employees: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
