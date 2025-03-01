import jsonAPI from "@/api/jsonAPI";

interface SocialRegistrationData {
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
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

const postSocial = async (): Promise<any> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication error: Access token missing");
  }

  const socialMediaData: SocialRegistrationData = {
    instagram: getSessionItem("instagram"),
    linkedin: getSessionItem("linkedin"),
    youtube: getSessionItem("youtube"),
    website: getSessionItem("website"),
  };

  // Prepare FormData for social media data
  const socialFormData = new FormData();
  Object.entries(socialMediaData).forEach(([key, value]) => {
    if (value) {
      socialFormData.append(key, value);
    }
  });

  try {
    const response = await jsonAPI.post("/api/v1/clubs/socials", socialFormData, {
      headers: {
        // Let the browser set the Content-Type header for FormData
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("✅ Social Media Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Social Media API Error:", error.response?.status, error.response?.data);
    throw error;
  }
};

export default postSocial;
