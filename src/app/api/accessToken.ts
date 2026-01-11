import { storage } from "@/app/services/auth.service";

// Note: This file is kept for backward compatibility
// Prefer using authService.login() directly from @/app/services/auth.service

interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * @deprecated Use authService.login() from @/app/services/auth.service instead
 */
export const accessToken = async (credentials: LoginCredentials): Promise<void> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const formdata = new FormData();
    formdata.append("username", credentials.username);
    formdata.append("password", credentials.password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token`, {
      method: "POST",
      body: formdata,
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    const { access_token, refresh_token } = data;

    // Save tokens using centralized storage
    storage.setTokens(access_token, refresh_token);
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
