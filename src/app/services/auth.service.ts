'use client';

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// SSR-safe storage helpers
const isClient = typeof window !== 'undefined';

const storage = {
    getAccessToken: (): string | null => {
        if (!isClient) return null;
        return localStorage.getItem('accessToken');
    },

    getRefreshToken: (): string | null => {
        if (!isClient) return null;
        return localStorage.getItem('refreshToken');
    },

    setTokens: (accessToken: string, refreshToken: string): void => {
        if (!isClient) return;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    clearTokens: (): void => {
        if (!isClient) return;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    getSessionItem: (key: string): string => {
        if (!isClient) return '';
        return sessionStorage.getItem(key) || '';
    },

    setSessionItem: (key: string, value: string): void => {
        if (!isClient) return;
        sessionStorage.setItem(key, value);
    },

    clearSessionItem: (key: string): void => {
        if (!isClient) return;
        sessionStorage.removeItem(key);
    },
};

// Auth types
interface LoginCredentials {
    username: string;
    password: string;
}

interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

interface ClubInfo {
    id: number;
    name: string;
    logo: string | null;
    about: string | null;
    [key: string]: unknown;
}

// Auth service
const authService = {
    /**
     * Login with username and password
     * Returns access token on success, null on failure
     */
    login: async (credentials: LoginCredentials): Promise<string | null> => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);

            const response = await axios.post<AuthTokens>(
                `${API_BASE_URL}/api/v1/auth/token`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token, refresh_token } = response.data;
            storage.setTokens(access_token, refresh_token);

            return access_token;
        } catch (error) {
            console.error('Login failed:', error);
            return null;
        }
    },

    /**
     * Refresh the access token using refresh token
     */
    refreshToken: async (): Promise<string | null> => {
        try {
            const refreshToken = storage.getRefreshToken();
            if (!refreshToken) {
                return null;
            }

            const formData = new FormData();
            formData.append('token', refreshToken);

            const response = await axios.post<AuthTokens>(
                `${API_BASE_URL}/api/v1/auth/refresh`,
                formData
            );

            const { access_token, refresh_token } = response.data;
            storage.setTokens(access_token, refresh_token);

            return access_token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            storage.clearTokens();
            return null;
        }
    },

    /**
     * Logout - clear all stored tokens
     */
    logout: (): void => {
        storage.clearTokens();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!storage.getAccessToken();
    },

    /**
     * Get current access token
     */
    getToken: (): string | null => {
        return storage.getAccessToken();
    },

    /**
     * Fetch club info for authenticated user
     */
    fetchClubInfo: async (): Promise<ClubInfo | null> => {
        try {
            const token = storage.getAccessToken();
            if (!token) return null;

            const response = await axios.get<ClubInfo>(
                `${API_BASE_URL}/api/v1/clubs/info`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching club info:', error);
            return null;
        }
    },
};

// Export storage helpers for other parts of the app
export { storage };
export default authService;
