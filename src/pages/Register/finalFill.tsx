import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import '@/styles/globals.css';
import { useNavigate } from '@/utils/navigation';
import { registerClub } from '@/api/clubregistration';

const FinalFill = () => {
  const { navigateTo } = useNavigate();
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Track API request status

  // State to store form data
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });

  // Load stored session data (only on the client-side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFormData({
        name: sessionStorage.getItem("clubLeadName") || "",
        phone: sessionStorage.getItem("clubLeadPhone") || ""
      });
    }
  }, []);

  // Update form state and sessionStorage when user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(e.target.name === "name" ? "clubLeadName" : "clubLeadPhone", e.target.value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true

    // Ensure form data is stored in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("clubLeadName", formData.name);
      sessionStorage.setItem("clubLeadPhone", formData.phone);
    }

    try {
      const response = await registerClub(); // Call API
      console.log("Club registered successfully:", response);

      // Clear sessionStorage for form-specific fields
      sessionStorage.removeItem("clubLeadName");
      sessionStorage.removeItem("clubLeadPhone");

      // Navigate to dashboard after successful registration
      navigateTo('/dashboard/events');
    } catch (error) {
      console.error("Failed to register club:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back Button */}
      <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-600 cursor-pointer">
        &larr; Back
      </button>

      {/* Centered Form */}
      <div className="flex flex-grow items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm border-2 border-gray-700">
          {/* Header */}
          <div className="flex justify-center mb-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-center mb-4">DROP YOUR DETAILS IN!</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Club Lead Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter Lead Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Club Lead Contact Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bebas text-2xl h-12 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
              disabled={loading} // Disable button when loading
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
