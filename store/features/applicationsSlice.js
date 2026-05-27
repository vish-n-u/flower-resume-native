import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@configs/api'

export const fetchApplications = createAsyncThunk(
  'applications/fetch',
  async (token) => {
    const { data } = await api.get('/api/applications', {
      headers: { Authorization: token },
    })
    return data.applications
  }
)

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    applications: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => { state.loading = true })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false
        state.applications = action.payload || []
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default applicationsSlice.reducer
