'use client';

import { useState } from 'react';
import '@/styles/globals.css';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from '@/utils/navigation';

export default function UploadImage() {
    const { navigateTo } = useNavigate();
  const [clubLogo, setClubLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClubLogo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ clubLogo });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 border border-gray-300">
        <div className="flex justify-between mb-4">
          <div className="w-1/4 h-1 bg-green-500" />
          <div className="w-1/4 h-1 bg-gray-300" />
          <div className="w-1/4 h-1 bg-gray-300" />
          <div className="w-1/4 h-1 bg-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-center mb-4">DROP YOUR DETAILS IN!</h1>
        <div className="flex flex-col items-center mb-4">
          <label
            htmlFor="clubLogo"
            className="w-24 h-24 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-full cursor-pointer"
          >
            {clubLogo ? (
              <img src={clubLogo} alt="Club Logo" className="w-full h-full rounded-full object-cover" />
            ) : (
              <FiPlus className="text-gray-500 text-3xl" />
            )}
          </label>
          <input id="clubLogo" type="file" className="hidden" onChange={handleLogoUpload} />
          <p className="text-sm text-gray-600 mt-2">Add Club Logo</p>
        </div>
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            onClick={() => navigateTo('/register/intrestedArea')}
            className="w-full bg-gray-900 text-white p-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
}
