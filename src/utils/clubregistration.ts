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
  interest_ids?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
}

export const registerClub = async (): Promise<any> => {
  try {
    const getSessionItem = (key: string) => sessionStorage.getItem(key) || "";

    // Retrieve the stored Blob URL from sessionStorage
    const logoBlobURL = sessionStorage.getItem("clubLogo");

    let logoFile: File | null = null;
    if (logoBlobURL) {
      // Convert Blob URL back to File object
      const response = await fetch(logoBlobURL);
      const blob = await response.blob();
      logoFile = new File([blob], "club_logo.png", { type: blob.type });
    }

    const rawData: ClubRegistrationData = {
      email: getSessionItem("email"),
      phone: getSessionItem("phone"),
      password: getSessionItem("password"),
      name: getSessionItem("clubLeadName"),
      logo: logoFile, // Attach File object
      about: getSessionItem("about"),
      org_id: sessionStorage.getItem("org_id") ? parseInt(getSessionItem("org_id")) : null,
      location_name: getSessionItem("college"),
      location_link: getSessionItem("location"),
      contact_phone: getSessionItem("clubLeadPhone"),
      contact_email: getSessionItem("email"),
      instagram: getSessionItem("instagram"),
      linkedin: getSessionItem("linkedin"),
      youtube: getSessionItem("youtube"),
      website: getSessionItem("website"),
    };

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

    const response = await formAPI.put("/api/v1/clubs/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ API Error:", error.response?.status, error.response?.data);
    throw error;
  }
};
