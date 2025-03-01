import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const formAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

// 🔹 Fetch tokens dynamically from localStorage
const getToken = () => localStorage.getItem("accessToken");
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
formAPI.interceptors.request.use(
  (config) => {
    console.log("📤 Sending Request to:", config.url);

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token Attached to Request");
    } else {
      console.warn("❌ No Token Found! Redirecting to login...");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor: Handle Token Expiry & Refresh
formAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
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
          const formdata = new FormData();
          formdata.append("token", refreshToken);

          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, formdata);

          // Store new tokens in localStorage
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);

          formAPI.defaults.headers.Authorization = `Bearer ${data.access_token}`;
          onRefreshed(data.access_token);

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axios(originalRequest);
        } else {
          console.warn("⚠️ No Refresh Token Found! Logging Out...");
          // window.location.href = "/login"; // Redirect to login page
        }
      } catch (refreshError) {
        console.error("❌ Token Refresh Failed! Logging Out...", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // window.location.href = "/login"; // Redirect user to login page
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default formAPI;
