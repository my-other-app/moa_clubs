import axios from "axios";
import { storage } from "@/app/services/auth.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FetchEventsOptions {
  limit?: number;
  isEnded?: boolean | null;  // null = fetch all, true = past, false = live
}

/**
 * Fetch events from API.
 * @param options Configuration options
 * @param options.limit Number of events to fetch (default: 10)
 * @param options.isEnded Filter by ended status (true = past, false = live, null = all)
 * @returns An array of events.
 */
export const fetchEvents = async (options: FetchEventsOptions = {}) => {
  const { limit = 10, isEnded = null } = options;

  try {
    const accessToken = storage.getAccessToken();
    if (!accessToken) {
      console.warn("No access token found");
      return [];
    }

    // Build query params
    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    // Add is_ended filter if specified
    if (isEnded !== null) {
      params.append("is_ended", isEnded.toString());
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/clubs/events/list?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (eventId: number | string) => {
  try {
    const accessToken = storage.getAccessToken();
    if (!accessToken) {
      console.warn("No access token found");
      return null;
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/events/info/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};
