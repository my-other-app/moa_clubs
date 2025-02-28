import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.NEXT_PUBLIC_REFRESH_TOKEN;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const jsonAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`, // Attach token from .env.local
  },
  withCredentials: true, // Required if using httpOnly cookies
});

// 🔹 Debugging Logs
console.log("✅ Loaded API Base URL:", API_BASE_URL);
console.log("✅ Loaded Access Token:", ACCESS_TOKEN ? "Present ✅" : "Not Found ❌");

// Subscribe to token refresh queue
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Notify all subscribers when a new token is obtained
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request Interceptor: Attach Token Dynamically
jsonAPI.interceptors.request.use(
  (config) => {
    console.log("📤 Sending Request to:", config.url);
    console.log("🔹 Request Headers Before:", config.headers);

    if (ACCESS_TOKEN) {
      config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
      console.log("✅ Token Found & Attached to Request");
    } else {
      console.warn("❌ No Token Found! Check .env.local");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Expiry and Refresh
jsonAPI.interceptors.response.use(
  (response) => {
    console.log("✅ Response Received:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("🔄 Token Expired! Attempting Refresh...");
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔹 Using Refresh Token from .env.local:", REFRESH_TOKEN ? "Present ✅" : "Not Found ❌");

        if (REFRESH_TOKEN) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: REFRESH_TOKEN });
          console.log("✅ Token Refreshed:", data.access_token);

          // Update headers with new token
          jsonAPI.defaults.headers.Authorization = `Bearer ${data.access_token}`;
          onRefreshed(data.access_token);

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axios(originalRequest);
        } else {
          console.warn("⚠️ No Refresh Token Found! Logging Out...");
        }
      } catch (refreshError) {
        console.error("❌ Token Refresh Failed! Logging Out...", refreshError);
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default jsonAPI;
