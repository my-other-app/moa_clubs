import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 🔹 Create Axios Instance
const jsonAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required if using httpOnly cookies
});

// 🔹 Fetch tokens dynamically from localStorage
const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

// 🔹 Subscribe to token refresh queue
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// 🔹 Notify subscribers after token refresh
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// 🔹 Request Interceptor: Attach Token Dynamically
jsonAPI.interceptors.request.use(
  (config) => {
    console.log("📤 Sending Request to:", config.url);
    
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("✅ Token Attached to Request");
    } else {
      console.warn("❌ No Token Found! Redirecting to login...");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// 🔹 Response Interceptor: Handle Token Expiry & Refresh
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
        const refreshToken = getRefreshToken();
        console.log("🔹 Using Refresh Token:", refreshToken ? "Present ✅" : "Not Found ❌");

        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
          console.log("✅ Token Refreshed:", data.access_token);

          // Update tokens in localStorage
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);

          jsonAPI.defaults.headers.Authorization = `Bearer ${data.access_token}`;
          onRefreshed(data.access_token);

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axios(originalRequest);
        } else {
          console.warn("⚠️ No Refresh Token Found! Logging Out...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login"; // Redirect user to login page
        }
      } catch (refreshError) {
        console.error("❌ Token Refresh Failed! Logging Out...", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // Redirect user to login page
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default jsonAPI;
