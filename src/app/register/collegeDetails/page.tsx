'use client';
import { useRouter } from "next/navigation";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/app/utils/navigation';

export default function CollegeDetails() {
  const { navigateTo } = useNavigate();
  const router = useRouter();
  const [college, setCollege] = useState('');
  const [location, setLocation] = useState('');

  // Load saved values from sessionStorage when the component mounts
  useEffect(() => {
    const savedCollege = sessionStorage.getItem('college');
    const savedLocation = sessionStorage.getItem('location');
    if (savedCollege) setCollege(savedCollege);
    if (savedLocation) setLocation(savedLocation);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save values to sessionStorage
    sessionStorage.setItem('college', college);
    sessionStorage.setItem('location', location);

    // Navigate to the next page
    navigateTo('/register/socialMediaDetails');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white relative">
      {/* Back Button */}
      
      <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-600 cursor-pointer">
        &larr; Back
      </button>

      <div className="bg-white p-8 rounded-xl border border-gray-700 w-96">
        {/* Progress Bar */}
        <div className="flex justify-center mb-4">
          <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/5 h-1 bg-gray-300 mx-1"></div>
          <div className="w-1/5 h-1 bg-gray-300 mx-1"></div>
        </div>

        {/* Form Header */}
        <h2 className="text-center text-3xl font-bold mb-4 bebas">DROP YOUR DETAILS IN!</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-light">
          Organization Name</label>
          <input
            type="text"
            placeholder="Enter Your Organization"
            className="w-full p-2 border rounded-lg mb-4"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />

          <label className="block text-gray-700 font-light">Location</label>
          <input
            type="text"
            placeholder="Enter Your Location"
            className="w-full p-2 border rounded-lg mb-6 "
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-[#2C333D] h-12 text-2xl bebas text-white p-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
}
