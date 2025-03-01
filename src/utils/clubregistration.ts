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
}

// 🔹 Helper function to retrieve sessionStorage values
const getSessionItem = (key: string): string => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(key) || "";
  }
  return "";
};

// 🔹 Retrieve Access Token with SSR check
const getAccessToken = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || "";
  }
  return "";
};

export const registerClub = async (): Promise<any> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.warn("⚠️ No access token found! User might be logged out.");
    throw new Error("Authentication error: Access token missing");
  }

  // Retrieve stored Blob URL for the logo
  const logoBlobURL = getSessionItem("clubLogo");
  let logoFile: File | null = null;
  if (logoBlobURL) {
    const response = await fetch(logoBlobURL);
    const blob = await response.blob();
    logoFile = new File([blob], "club_logo.png", { type: blob.type });
  }

  // Parse stored interests (ensuring correct array format)
  const interestIds: number[] = JSON.parse(getSessionItem("selectedInterests") || "[]");

  // Construct raw data object for club update
  const rawData: ClubRegistrationData = {
    email: getSessionItem("email"),
    phone: getSessionItem("phone"),
    password: getSessionItem("password"),
    location_link: getSessionItem("clubLeadName"),
    logo: logoFile,
    about: getSessionItem("about"),
    org_id: getSessionItem("org_id") ? parseInt(getSessionItem("org_id")) || null : null,
    interest_ids: interestIds.length > 0 ? interestIds.join(",") : "",
    name: getSessionItem("college"),
    location_name: getSessionItem("location"),
    contact_phone: getSessionItem("clubLeadPhone"),
    contact_email: getSessionItem("email"),
  };

  // Convert rawData to FormData for club update
  const formData = new FormData();
  Object.entries(rawData).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value) {
      formData.append(key, value.toString());
    }
  });

  console.log("📤 Final FormData Before Sending (Club Update):");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await formAPI.put("/api/v1/clubs/update", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("✅ Club Update Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Club Update API Error:", error.response?.status, error.response?.data);
    throw error;
  }
};
