import axios from "axios";
import { storage } from "@/app/services/auth.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Create Axios Instance for Form Data
const formAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

// Subscribe to token refresh queue
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Notify subscribers after token refresh
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request Interceptor: Attach Token Dynamically
formAPI.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry & Refresh
formAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = storage.getRefreshToken();

        if (refreshToken) {
          const formdata = new FormData();
          formdata.append("token", refreshToken);

          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, formdata);

          // Store new tokens
          storage.setTokens(data.access_token, data.refresh_token);

          formAPI.defaults.headers.Authorization = `Bearer ${data.access_token}`;
          onRefreshed(data.access_token);

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axios(originalRequest);
        } else {
          storage.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        storage.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default formAPI;
