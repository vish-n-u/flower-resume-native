import axios from 'axios'

// Replace with your actual server URL.
// For local development:
//   - Android emulator: http://10.0.2.2:4000
//   - iOS simulator:    http://localhost:4000
//   - Physical device:  http://<your-machine-ip>:4000
export const API_BASE_URL = "https://resume-builder-dq3j.onrender.com"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

export default api
