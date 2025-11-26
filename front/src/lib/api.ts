import { env } from "@/config/env";
import axios from "axios";

/**
 * API Client Configuration
 *
 * Centralized axios instance for all backend API calls.
 */

export const apiClient = axios.create({
  baseURL: env.agentBackendUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    const message =
      error.response?.data?.error || error.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default apiClient;
