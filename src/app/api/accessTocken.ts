import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Define the expected structure of the API response
interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

// Define the expected structure of user credentials
interface LoginCredentials {
  username: string;
  password: string;
}

export const accessToken = async (credentials: LoginCredentials): Promise<void> => {
  try {
    const formdata = new FormData();
    formdata.append("username", credentials.username);
    formdata.append("password", credentials.password)
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/v1/auth/token`, formdata);

    const { access_token, refresh_token } = response.data;

    // Save tokens to localStorage
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    console.log("Tokens saved successfully!");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Login failed:", error.response?.data || error.message);
    } else {
      console.error("Login failed:", (error as Error).message);
    }
  }
};



