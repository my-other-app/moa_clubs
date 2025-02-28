'use client';

import { useState, useEffect } from 'react';
import '@/styles/globals.css';
import { useNavigate } from '@/utils/navigation';

export default function UploadImage() {
  const { navigateTo } = useNavigate();
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  const [clubLogoPreview, setClubLogoPreview] = useState<string | null>(null);

  // Load image from sessionStorage when the component mounts
  useEffect(() => {
    const savedLogo = sessionStorage.getItem('clubLogo');
    if (savedLogo) setClubLogoPreview(savedLogo);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClubLogo(file);
      const previewURL = URL.createObjectURL(file);
      setClubLogoPreview(previewURL);

      // Save base64 version of the file to sessionStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        sessionStorage.setItem('clubLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Navigate to the next page
    navigateTo('/register/intrestedArea');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 border-gray-700 border-2">
        
        {/* Progress Indicator */}
        <div className="flex justify-center mb-4">
          <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/5 h-1 bg-gray-300 mx-1"></div>
          <div className="w-1/5 h-1 bg-gray-300 mx-1"></div>
          <div className="w-1/5 h-1 bg-gray-300 mx-1"></div>
        </div>

        <h1 className="text-xl font-bold text-center mb-4">DROP YOUR DETAILS IN!</h1>

        {/* Image Upload */}
        <div className="flex flex-col items-center mb-4">
          <label
            htmlFor="clubLogo"
            className="w-24 h-24 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-full cursor-pointer"
          >
            {clubLogoPreview ? (
              <img src={clubLogoPreview} alt="Club Logo" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">Upload</span>
            )}
          </label>
          <input id="clubLogo" type="file" className="hidden" onChange={handleLogoUpload} />
          <p className="text-sm text-gray-600 mt-2">Add Club Logo</p>
        </div>

        {/* Form Submission */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="w-full bebas bg-gray-700 h-15 text-2xl text-white p-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
}
