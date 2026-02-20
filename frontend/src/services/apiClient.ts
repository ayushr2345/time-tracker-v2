import axios from "axios";
import { DEFAULT_PORTS } from "@time-tracker/shared";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://localhost:${DEFAULT_PORTS.DEFAULT_PORT_BACKEND}/api`;
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default apiClient;
