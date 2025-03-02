import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';

const EditClub: NextPage = () => {
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  const [clubLogoPreview, setClubLogoPreview] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);



  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClubLogo(file);
      const previewURL = URL.createObjectURL(file);
      setClubLogoPreview(previewURL);
      sessionStorage.setItem('clubLogo', previewURL);
    }
  };

  const handleInterestChange = (interestId: number) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build your club object here including selectedInterests array
    console.log('Selected Interests:', selectedInterests);
    // Submit your form data...
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Title */}
      <h1 className="mb-6 text-2xl font-bold text-gray-800">EDIT CLUB PROFILE</h1>

      <form className="mx-auto max-w-5xl space-y-8" onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">BASIC INFORMATION</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Club Name */}
            <div>
              <label htmlFor="clubName" className="mb-1 block text-sm font-medium text-gray-700">
                Club Name
              </label>
              <input
                type="text"
                id="clubName"
                name="clubName"
                placeholder="Enter Club Name"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Club Organization */}
            <div>
              <label htmlFor="clubOrganization" className="mb-1 block text-sm font-medium text-gray-700">
                Club Organization
              </label>
              <input
                type="text"
                id="clubOrganization"
                name="clubOrganization"
                placeholder="Enter Organization"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Club Location */}
            <div>
              <label htmlFor="clubLocation" className="mb-1 block text-sm font-medium text-gray-700">
                Choose Club Location
              </label>
              <input
                type="text"
                id="clubLocation"
                name="clubLocation"
                placeholder="Choose Club Location"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Club Description & Logo */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Description */}
            <div>
              <label htmlFor="clubDescription" className="mb-1 block text-sm font-medium text-gray-700">
                Club Description
              </label>
              <textarea
                id="clubDescription"
                name="clubDescription"
                placeholder="Enter Club Description"
                rows={5}
                className="w-full resize-none rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Logo Upload and Interests Section */}
            <div className="flex flex-col items-center justify-center">
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
                      alt="Club Logo"
                      className="rounded-full aspect-square "
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
            </div>
          </div>
        </div>

        {/* LINKS TO CONNECT */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">LINKS TO CONNECT</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="instagramLink" className="mb-1 block text-sm font-medium text-gray-700">
                Instagram Link
              </label>
              <input
                type="text"
                id="instagramLink"
                name="instagramLink"
                placeholder="Instagram Link"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="youtubeLink" className="mb-1 block text-sm font-medium text-gray-700">
                Youtube Link
              </label>
              <input
                type="text"
                id="youtubeLink"
                name="youtubeLink"
                placeholder="Youtube Link"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="linkedInLink" className="mb-1 block text-sm font-medium text-gray-700">
                LinkedIn Link
              </label>
              <input
                type="text"
                id="linkedInLink"
                name="linkedInLink"
                placeholder="LinkedIn Link"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="websiteLink" className="mb-1 block text-sm font-medium text-gray-700">
                Website Link
              </label>
              <input
                type="text"
                id="websiteLink"
                name="websiteLink"
                placeholder="Website Link"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        <div className="pt-4">
          <button
            type="submit"
            className="rounded bg-gray-700 px-6 py-2 text-white hover:bg-gray-80"
          >
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClub;
