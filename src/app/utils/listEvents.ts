import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to get the access token from localStorage
const getAccessToken = () => localStorage.getItem("accessToken");

/**
 * Fetch events from API.
 * @param limit Number of events to fetch (default: 10)
 * @returns An array of events.
 */
export const fetchEvents = async (limit = 10) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.warn("⚠️ No access token found! User might be logged out.");
      return [];
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/clubs/events/list?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Return the items array directly
    return response.data.items;
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return [];
  }
};
