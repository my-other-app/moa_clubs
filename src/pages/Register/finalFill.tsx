import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import '@/styles/globals.css';
import { useNavigate } from '@/utils/navigation';

const FinalFill = () => {
  const { navigateTo } = useNavigate();
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", phone: "" });

  // Load saved values from sessionStorage when the component mounts
  useEffect(() => {
    const savedName = sessionStorage.getItem("clubLeadName");
    const savedPhone = sessionStorage.getItem("clubLeadPhone");
    
    if (savedName) setFormData((prev) => ({ ...prev, name: savedName }));
    if (savedPhone) setFormData((prev) => ({ ...prev, phone: savedPhone }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to sessionStorage
    sessionStorage.setItem("clubLeadName", formData.name);
    sessionStorage.setItem("clubLeadPhone", formData.phone);

    // Navigate to the next page
    navigateTo('/dashboard/events');
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
          
          {/* Progress Bar */}
          <div className="flex justify-center mb-4">
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
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
              className="w-full bebas text-2xl h-12 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800"
            >
              FINISH
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinalFill;
