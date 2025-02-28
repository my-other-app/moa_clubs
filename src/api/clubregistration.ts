import apiClient from "@/utils/api";

export const registerClub = async () => {
        const postData = {
          email: sessionStorage.getItem("email") || "",
          phone: sessionStorage.getItem("phone") || null,
          password: sessionStorage.getItem("password") || "",
          name: sessionStorage.getItem("clubLeadName") || "",
          logo: sessionStorage.getItem("clubLogo") || null,
          about: sessionStorage.getItem("about") || null,
          org_id: sessionStorage.getItem("org_id") ? parseInt(sessionStorage.getItem("org_id") as string) : null,
          location_name: sessionStorage.getItem("college") || null,
          location_link: sessionStorage.getItem("location") || null,
          contact_phone: sessionStorage.getItem("clubLeadPhone") || null,
          contact_email: sessionStorage.getItem("email") || null,
          interest_ids: sessionStorage.getItem("selectedInterests") || null,
          instagram: sessionStorage.getItem("instagram") || null,
          linkedin: sessionStorage.getItem("linkedin") || null,
          youtube: sessionStorage.getItem("youtube") || null,
          website: sessionStorage.getItem("website") || null,
        };
      
        console.log("🔹 Sending Data to API:", postData); // Debugging
      
        try {
          const response = await apiClient.post("/api/v1/clubs/create", postData);
          console.log("✅ Success:", response.data);
          return response.data;
        } catch (error) {
          if (error instanceof Error) {
            console.error("❌ API Error:", (error as any).response?.data || error.message);
          } else {
            console.error("❌ API Error:", error);
          }
          throw error;
        }
      };
      