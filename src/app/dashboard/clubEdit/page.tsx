import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import axios from 'axios';
import Sidebar from '@/app/components/sidebar';

const EditClub: NextPage = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // Basic Club Information
  const [clubName, setClubName] = useState('');
  const [clubOrganization, setClubOrganization] = useState('');
  const [clubLocation, setClubLocation] = useState('');
  const [clubDescription, setClubDescription] = useState('');

  // Social Links (disabled)
  const [instagramLink, setInstagramLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [linkedInLink, setLinkedInLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');

  // Contact Information
  const [contactPhone, setContactPhone] = useState('');
  // const [contactEmail, setContactEmail] = useState('nexra'); // Uncomment if needed

  // Logo File & Preview
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  const [clubLogoPreview, setClubLogoPreview] = useState<string | null>('');

  // Interests (list of IDs)
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);

  // Fetch club data on mount and pre-fill form
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setClubName(data.name);
        // Use data.org if available; otherwise empty string
        setClubOrganization(data.org || '');
        setClubLocation(data.location_name || '');
        setClubDescription(data.about || '');
        // Use the medium logo URL if available
        if (data.logo && data.logo.medium) {
          setClubLogoPreview(data.logo.medium);
        }
        // Set interests (assuming data.interests is an array of interest objects)
        if (data.interests) {
          setSelectedInterests(data.interests.map((interest: { id: number }) => interest.id));
        }
        // Set social links from data.socials object
        if (data.socials) {
          setInstagramLink(data.socials.instagram || '');
          setYoutubeLink(data.socials.youtube || '');
          setLinkedInLink(data.socials.linkedin || '');
          setWebsiteLink(data.socials.website || '');
        }
        // Set contact information
        setContactPhone(data.contact_phone || '');
        // setContactEmail(data.contact_email || '');
      } catch (error) {
        console.error('Error fetching club data:', error);
      }
    };

    fetchClubData();
  }, [API_BASE_URL, token]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClubLogo(file);
      const previewURL = URL.createObjectURL(file);
      setClubLogoPreview(previewURL);
      sessionStorage.setItem('clubLogo', previewURL);
    }
  };

//   const handleInterestChange = (interestId: number) => {
//     setSelectedInterests((prev) =>
//       prev.includes(interestId)
//         ? prev.filter((id) => id !== interestId)
//         : [...prev, interestId]
//     );
//   };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData();

  formData.append('name', clubName);
  formData.append('org_id', clubOrganization); // Ensure this is an integer or convert it if needed
  formData.append('location_name', clubLocation);
  // Append location_link if available:
  // formData.append('location_link', clubLocationLink);
  formData.append('about', clubDescription);

  if (clubLogo) {
    formData.append('logo', clubLogo);
  }
  formData.append('interest_ids', JSON.stringify(selectedInterests));
  formData.append('contact_phone', contactPhone);
  // Append contact_email if needed:
  // formData.append('contact_email', contactEmail);

  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_BASE_URL}/api/v1/clubs/update`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Club updated:', response.data);
    // Optionally, redirect or show a success message.
  } catch (error) {
    console.error('Error updating club:', error);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-8 mx-">
    <Sidebar/>
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
                id="clubName"
                name="clubName"
                placeholder="Enter Club Name"
                className="w-full rounded border border-gray-300 p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                disabled
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
                value={clubOrganization}
                onChange={(e) => setClubOrganization(e.target.value)}
              />
            </div>

            {/* Club Location */}
            <div>
              <label htmlFor="clubLocation" className="mb-1 block text-sm font-medium text-gray-700">
                Club Location
              </label>
              <input
                type="text"
                id="clubLocation"
                name="clubLocation"
                placeholder="Enter Club Location"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={clubLocation}
                onChange={(e) => setClubLocation(e.target.value)}
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
                value={clubDescription}
                onChange={(e) => setClubDescription(e.target.value)}
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
                      className="rounded-full aspect-square"
                    />
                  ) : (
                    <div>
                      <svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" fill="#F3F3F3" />
                        <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" stroke="#979797" strokeWidth="0.5" />
                        <path
                          d="M51 32H41.6C38.2397 32 36.5595 32 35.2761 32.654C34.1471 33.2292 33.2292 34.1471 32.654 35.2761C32 36.5595 32 38.2397 32 41.6V58.4C32 61.7603 32 63.4405 32.654 64.7239C33.2292 65.8529 34.1471 66.7708 35.2761 67.346C36.5595 68 38.2397 68 41.6 68H60C61.8599 68 62.7899 68 63.5529 67.7956C65.6235 67.2408 67.2408 65.6235 67.7956 63.5529C68 62.7899 68 61.8599 68 58.912C68 57.9435 68 57.4593 67.8941 57.0083C67.7611 56.4416 67.5059 55.9107 67.1465 55.4528C66.8605 55.0884 66.4824 54.7859 65.7261 54.1809L60.1317 49.7053C59.3748 49.0998 58.9963 48.7971 58.5796 48.6902C58.2123 48.596 57.8257 48.6082 57.4651 48.7254C57.0559 48.8583 56.6973 49.1843 55.9801 49.8363Z"
                          stroke="#979797"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </label>
                <input
                  id="clubLogo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <p className="text-sm text-gray-600 mt-2">Add Club Logo</p>
              </div>
              {/* (Optional) Interests selection UI can be added here */}
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
                className="w-full rounded border border-gray-300 p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                value={instagramLink}
                disabled
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
                className="w-full rounded border border-gray-300 p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                value={youtubeLink}
                disabled
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
                className="w-full rounded border border-gray-300 p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                value={linkedInLink}
                disabled
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
                className="w-full rounded border border-gray-300 p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                value={websiteLink}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Additional Contact Information */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">CONTACT INFORMATION</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="contactPhone" className="mb-1 block text-sm font-medium text-gray-700">
                Contact Phone
              </label>
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                placeholder="Enter Contact Phone"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            {/* Uncomment if you wish to include Contact Email */}
            {/* <div>
              <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                placeholder="Enter Contact Email"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div> */}
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
