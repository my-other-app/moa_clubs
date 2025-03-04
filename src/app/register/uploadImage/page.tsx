'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from '@/app/utils/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function UploadImage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  const [clubLogoPreview, setClubLogoPreview] = useState<string | null>(null);
  console.log(clubLogo);
  // Load image from sessionStorage when the component mounts
  useEffect(() => {
    const savedLogo = sessionStorage.getItem('clubLogo');
    if (savedLogo) setClubLogoPreview(savedLogo);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClubLogo(file);

      // Create Object URL and save it
      const previewURL = URL.createObjectURL(file);
      setClubLogoPreview(previewURL);
      sessionStorage.setItem('clubLogo', previewURL);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigateTo('/register/intrestedArea');
  };

  const handleButtonClick = () => {
    handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-600 cursor-pointer">
        &larr; Back
      </button>
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
               <Image
               src={clubLogoPreview} 
                                    width={100}
                                    height={100}
                                    alt="Event Poster"
                                    className="aspect-square object-cover rounded-full"
                                  />
            ) : (
              <div>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" fill="#F3F3F3" />
                        <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" stroke="#979797" strokeWidth="0.5" />
                        <path
                          d="M51 32H41.6C38.2397 32 36.5595 32 35.2761 32.654C34.1471 33.2292 33.2292 34.1471 32.654 35.2761C32 36.5595 32 38.2397 32 41.6V58.4C32 61.7603 32 63.4405 32.654 64.7239C33.2292 65.8529 34.1471 66.7708 35.2761 67.346C36.5595 68 38.2397 68 41.6 68H60C61.8599 68 62.7899 68 63.5529 67.7956C65.6235 67.2408 67.2408 65.6235 67.7956 63.5529C68 62.7899 68 61.8599 68 60M64 42V30M58 36H70M47 43C47 45.2091 45.2091 47 43 47C40.7909 47 39 45.2091 39 43C39 40.7909 40.7909 39 43 39C45.2091 39 47 40.7909 47 43ZM55.9801 49.8363L39.0623 65.2161C38.1107 66.0812 37.6349 66.5137 37.5929 66.8884C37.5564 67.2132 37.6809 67.5353 37.9264 67.7511C38.2096 68 38.8526 68 40.1386 68H58.912C61.7903 68 63.2295 68 64.3598 67.5164C65.7789 66.9094 66.9094 65.7789 67.5164 64.3598C68 63.2295 68 61.7903 68 58.912C68 57.9435 68 57.4593 67.8941 57.0083C67.7611 56.4416 67.5059 55.9107 67.1465 55.4528C66.8605 55.0884 66.4824 54.7859 65.7261 54.1809L60.1317 49.7053C59.3748 49.0998 58.9963 48.7971 58.5796 48.6902C58.2123 48.596 57.8257 48.6082 57.4651 48.7254C57.0559 48.8583 56.6973 49.1843 55.9801 49.8363Z"
                          stroke="#979797"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
              </div>
            )}
          </label>
          <input id="clubLogo" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <p className="text-sm text-gray-600 mt-2">Add Club Logo</p>
        </div>

        {/* Form Submission */}
        <form onSubmit={handleSubmit} className="justify-center items-center flex">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={!clubLogoPreview}
            className={`w-64 h-15 text-2xl bg-gray-700 text-white p-2 rounded-lg font-semibold hover:bg-gray-800 mt-4 ${
              !clubLogoPreview ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
}
