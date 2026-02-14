import axios from "axios";
import dotenv from "dotenv";

// dotenv.config();
const apiClient = axios.create({
  // baseURL: process.env.API_BASE_URL,
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default apiClient;
