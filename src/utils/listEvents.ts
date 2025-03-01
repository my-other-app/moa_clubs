import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 🔹 Function to get the access token from localStorage
const getAccessToken = () => localStorage.getItem("accessToken");

export const fetchEvents = async () => {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      console.warn("⚠️ No access token found! User might be logged out.");
      return [];
    }

    const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/events/list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // ✅ Attach token in headers
      },
    });

    return response.data; // Assuming API returns an array of events
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return [];
  }
};
