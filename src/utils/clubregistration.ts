import formAPI from "@/api/formAPI";

interface ClubRegistrationData {
  email: string;
  phone: string;
  password: string;
  name: string;
  logo?: File | null;
  about?: string;
  org_id?: number | null;
  location_name?: string;
  location_link?: string;
  contact_phone?: string;
  contact_email?: string;
  interest_ids?: string; // Converted to a comma-separated string
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
}

// 🔹 Helper function to retrieve session storage values
const getSessionItem = (key: string) => sessionStorage.getItem(key) || "";

// 🔹 Retrieve Access Token
const getAccessToken = () => localStorage.getItem("accessToken") || "";

export const registerClub = async (): Promise<any> => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.warn("⚠️ No access token found! User might be logged out.");
      throw new Error("Authentication error: Access token missing");
    }

    // Retrieve stored Blob URL from sessionStorage for the logo
    const logoBlobURL = sessionStorage.getItem("clubLogo");
    let logoFile: File | null = null;

    if (logoBlobURL) {
      const response = await fetch(logoBlobURL);
      const blob = await response.blob();
      logoFile = new File([blob], "club_logo.png", { type: blob.type });
    }

    // Parse stored interests (ensure correct array format)
    const interestIds: number[] = JSON.parse(sessionStorage.getItem("selectedInterests") || "[]");

    // 🔹 Construct raw data object
    const rawData: ClubRegistrationData = {
      email: getSessionItem("email"),
      phone: getSessionItem("phone"),
      password: getSessionItem("password"),
      name: getSessionItem("clubLeadName"),
      logo: logoFile,
      about: getSessionItem("about"),
      org_id: getSessionItem("org_id") ? parseInt(getSessionItem("org_id")) || null : null,
      interest_ids: interestIds.length > 0 ? interestIds.join(",") : "",
      location_name: getSessionItem("college"),
      location_link: getSessionItem("location"),
      contact_phone: getSessionItem("clubLeadPhone"),
      contact_email: getSessionItem("email"),
      instagram: getSessionItem("instagram"),
      linkedin: getSessionItem("linkedin"),
      youtube: getSessionItem("youtube"),
      website: getSessionItem("website"),
    };

    console.log("📄 Raw Data Before FormData Conversion:", rawData);

    // 🔹 Convert to FormData
    const formData = new FormData();
    Object.entries(rawData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value) {
        formData.append(key, value.toString());
      }
    });

    console.log("📤 Final FormData Before Sending:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // 🔹 Make API Request
    const response = await formAPI.put("/api/v1/clubs/update", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("✅ Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ API Error:", error.response?.status, error.response?.data);
    throw error;
  }
};
