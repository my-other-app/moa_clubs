import axios from "axios";

// Read environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TOKEN_TYPE = process.env.NEXT_PUBLIC_TOKEN_TYPE || "Bearer";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  async (config) => {
    let accessToken = sessionStorage.getItem("accessToken") || process.env.NEXT_PUBLIC_ACCESS_TOKEN;

    if (accessToken) {
      config.headers["Authorization"] = `${TOKEN_TYPE} ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Unauthorized) - Token Expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Access token expired. Refreshing...");

      const newAccessToken = await refreshAccessToken(); // Try refreshing the token
      if (newAccessToken) {
        error.config.headers["Authorization"] = `${TOKEN_TYPE} ${newAccessToken}`;
        return apiClient(error.config); // Retry the failed request
      }
    }
    return Promise.reject(error);
  }
);

// Function to Refresh Token
const refreshAccessToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem("refreshToken") || process.env.NEXT_PUBLIC_REFRESH_TOKEN;
    if (!refreshToken) {
      console.error("No refresh token found. User must log in again.");
      return null;
    }

    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const newAccessToken = response.data.access_token;
    sessionStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return null;
  }
};

export default apiClient;
