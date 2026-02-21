import axios from "axios";

// Vite guarantees this will exist
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default apiClient;
