import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    // api interceptor unwraps axios response.data -> response = ApiResponse { data: { user, accessToken } }
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data; // { user, accessToken }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', data);
    return response; // api interceptor already unwrapped axios response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch (_) {}
  localStorage.removeItem('accessToken');
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response; // api interceptor already unwrapped axios response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false, loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.loading = false; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isAuthenticated = true; state.user = action.payload?.data?.user || action.payload?.user || action.payload;
      })
      .addCase(getMe.rejected, (state) => { state.isAuthenticated = false; state.user = null; })
      .addCase(logout.fulfilled, (state) => { state.isAuthenticated = false; state.user = null; });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
