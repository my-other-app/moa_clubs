import formAPI from "@/app/api/formAPI";
import axios from "axios";
import { storage } from "@/app/services/auth.service";

interface ClubRegistrationData {
  email: string;
  phone: string;
  name: string;
  logo?: File | null;
  about?: string;
  org_id?: number | null;
  location_name?: string;
  location_link?: string;
  contact_phone?: string;
  contact_email?: string;
  interest_ids?: string;
}

export const registerClub = async (): Promise<unknown> => {
  const accessToken = storage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication error: Access token missing");
  }

  // Retrieve stored Blob URL for the logo
  const logoBlobURL = storage.getSessionItem("clubLogo");
  let logoFile: File | null = null;
  if (logoBlobURL) {
    try {
      const response = await fetch(logoBlobURL);
      const blob = await response.blob();
      logoFile = new File([blob], "club_logo.png", { type: blob.type });
    } catch (error) {
      console.error("Failed to fetch logo:", error);
    }
  }

  // Parse stored interests
  const interestIdsRaw = storage.getSessionItem("selectedInterests");
  const interestIds: number[] = interestIdsRaw ? JSON.parse(interestIdsRaw) : [];

  // Construct data object for club update
  const rawData: ClubRegistrationData = {
    email: storage.getSessionItem("email"),
    phone: storage.getSessionItem("phone"),
    location_link: storage.getSessionItem("clubLeadName"),
    logo: logoFile,
    about: storage.getSessionItem("about"),
    org_id: storage.getSessionItem("org_id")
      ? parseInt(storage.getSessionItem("org_id")) || null
      : null,
    interest_ids: interestIds.length > 0 ? interestIds.join(",") : "",
    name: storage.getSessionItem("college"),
    location_name: storage.getSessionItem("location"),
    contact_phone: storage.getSessionItem("clubLeadPhone"),
    contact_email: storage.getSessionItem("email"),
  };

  // Convert to FormData
  const formData = new FormData();
  Object.entries(rawData).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value.toString());
    }
  });

  try {
    const response = await formAPI.put("/api/v1/clubs/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Club update failed:", error.response.status, error.response.data);
    } else {
      console.error("Club update failed:", error);
    }
    throw error;
  }
};
