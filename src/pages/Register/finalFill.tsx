import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { registerClub } from "@/utils/clubregistration";
import postSocial from "@/utils/socialsRegistration";
import { AxiosError } from "axios";

interface FormData {
  name: string;
  phone: string;
}

const FinalFill = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
  });

  // 🔹 Load sessionStorage values
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = sessionStorage.getItem("clubLeadName") || "";
      const storedPhone = sessionStorage.getItem("clubLeadPhone") || "";
      console.log("🔹 Loaded sessionStorage values:", { storedName, storedPhone });
      setFormData({ name: storedName, phone: storedPhone });
    }
  }, []);

  // 🔹 Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        e.target.name === "name" ? "clubLeadName" : "clubLeadPhone",
        e.target.value
      );
      console.log(`ff✅ Updated sessionStorage: ${e.target.name} = ${e.target.value}`);
    }
  };

  // 🔹 Handle form submission concurrently
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    console.log("ff📤 Sending Data for Registration:", formData);

    try {
      // Run both API calls simultaneously
      const [clubResponse, socialResponse] = await Promise.all([
        registerClub(),
        postSocial(),
      ]);
      console.log("ff✅ Club registered successfully:", clubResponse);
      console.log("ff✅ Social media data saved successfully:", socialResponse);
      
      // Optionally clear sessionStorage if needed:
      // sessionStorage.clear();

      router.push("/dashboard/events");
    } catch (error: unknown) {
      console.error("ff❌ Failed to register club:", error);
      if (error instanceof AxiosError) {
        console.error("ff🔍 API Error Details:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        setErrorMessage(
          (error.response?.data as { message?: string })?.message ||
          "Registration failed. Please try again."
        );
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-gray-600 cursor-pointer"
      >
        &larr; Back
      </button>
      <div className="flex flex-grow items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm border-2 border-gray-700">
          <div className="flex justify-center mb-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-1/5 h-1 bg-teal-500 mx-1"></div>
              ))}
          </div>
          <h2 className="text-lg font-bold text-center mb-4">
            DROP YOUR DETAILS IN!
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Club Lead Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Lead Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Club Lead Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
                disabled={loading}
              />
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="w-full bebas text-2xl h-12 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : "FINISH"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinalFill;
