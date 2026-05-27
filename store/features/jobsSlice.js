import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@configs/api'

export const fetchJobs = createAsyncThunk('jobs/fetch', async (token) => {
  const { data } = await api.get('/api/jobs/feed', { headers: { Authorization: token } })
  return data.jobs
})

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false
        state.jobs = action.payload || []
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default jobsSlice.reducer
