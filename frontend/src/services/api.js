import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
