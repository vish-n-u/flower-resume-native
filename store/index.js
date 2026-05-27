import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import applicationsReducer from './features/applicationsSlice'
import jobsReducer from './features/jobsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationsReducer,
    jobs: jobsReducer,
  },
})
