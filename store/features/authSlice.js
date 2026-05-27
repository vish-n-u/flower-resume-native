import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getToken, removeToken } from '@utils/storage'
import api from '@configs/api'

// On app boot: read saved token → verify with server → hydrate user
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { dispatch }) => {
  const token = await getToken()
  if (!token) return

  try {
    const { data } = await api.get('/api/users/data', {
      headers: { Authorization: token },
    })
    if (data.user) {
      dispatch(login({ token, user: data.user }))
    }
  } catch {
    await removeToken()
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    loading: true,
  },
  reducers: {
    login(state, action) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.loading = false
    },
    logout(state) {
      state.token = null
      state.user = null
      state.loading = false
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(bootstrapAuth.pending, (state) => {
      state.loading = true
    })
    builder.addCase(bootstrapAuth.fulfilled, (state) => {
      state.loading = false
    })
    builder.addCase(bootstrapAuth.rejected, (state) => {
      state.loading = false
    })
  },
})

export const { login, logout, updateUser, setLoading } = authSlice.actions
export default authSlice.reducer
