import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default apiClient;
