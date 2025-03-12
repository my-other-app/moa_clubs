"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";

const EditClub: NextPage = () => {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Basic Club Information
  const [clubName, setClubName] = useState("");
  const [clubOrganization, setClubOrganization] = useState(0);
  const [clubLocation, setClubLocation] = useState("");
  const [clubDescription, setClubDescription] = useState("");

  // Social Links (disabled)
  const [instagramLink, setInstagramLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [linkedInLink, setLinkedInLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  // Contact Information
  const [contactPhone, setContactPhone] = useState("");
  // const [contactEmail, setContactEmail] = useState(""); // Uncomment if needed

  // Logo File & Preview
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  const [clubLogoPreview, setClubLogoPreview] = useState<string | null>("");

  // Interests (list of IDs)
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);

  const interestCategories = [
    {
      title: "Academic",
      options: [
        { id: 6, name: "💻 Coding" },
        { id: 7, name: "🎨 UI/UX" },
        { id: 8, name: "📊 Data Science" },
        { id: 9, name: "👨‍💼 Entrepreneurship" },
        { id: 10, name: "🏷️ Marketing" },
        { id: 11, name: "💰 Finance" },
        { id: 2, name: "🦾 AI/ML" },
        { id: 12, name: "📈 Analytics" },
        { id: 13, name: "🔒 Cybersecurity" },
        { id: 14, name: "🏭 Product Management" },
      ],
    },
    {
      title: "Creative",
      options: [
        { id: 15, name: "📸 Photography" },
        { id: 16, name: "🎵 Music" },
        { id: 17, name: "🎬 Film" },
        { id: 18, name: "🐰 Animation" },
        { id: 19, name: "✏️ Writing" },
        { id: 20, name: "👗 Fashion" },
        { id: 21, name: "🎮 Gaming" },
      ],
    },
    {
      title: "Emerging Trends",
      options: [
        { id: 22, name: "🔗 Blockchain" },
        { id: 23, name: "🥽 VR/AR" },
        { id: 24, name: "🎭 Memes & Internet Culture" },
        { id: 25, name: "🎥 Content Creation" },
        { id: 26, name: "🎮 E-Sports" },
        { id: 27, name: "🚀 Space Exploration" },
      ],
    },
  ];

  const [selected, setSelected] = useState<{ id: number; name: string }[]>([]);


  // Toggle selection with a max limit of 5 interests
  const toggleSelection = (option: { id: number; name: string }) => {
    setSelected((prev) => {
      if (prev.some((item) => item.id === option.id)) {
        return prev.filter((item) => item.id !== option.id);
      } else if (prev.length < 5) {
        return [...prev, option];
      }
      return prev;
    });
  };

  // Fetch club data on mount and pre-fill form
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        if (!API_BASE_URL || !token) {
          console.error("Missing API_BASE_URL or access token.");
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setClubName(data.name || "");
        // Set org_id as a string (will be converted on submit)
        setClubOrganization(data.org ? Number(data.org) : 0);
        setClubLocation(data.location_name || "");
        setClubDescription(data.about || "");
        if (data.logo && data.logo.medium) {
          setClubLogoPreview(data.logo.medium);
        }
        if (data.interests) {
          setSelectedInterests(data.interests.map((interest: { id: number }) => interest.id));
        }
        setInstagramLink(data.socials?.instagram || "");
        setYoutubeLink(data.socials?.youtube || "");
        setLinkedInLink(data.socials?.linkedin || "");
        setWebsiteLink(data.socials?.website || "");
        setContactPhone(data.contact_phone || "");
        // setContactEmail(data.contact_email || "");
      } catch (error) {
        console.error("Error fetching club data:", error);
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
      sessionStorage.setItem("clubLogo", previewURL);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not defined.");
      return;
    }

    // Build FormData according to the API documentation:
    // - name: string (3-20 chars)
    // - org_id: integer (clubOrganization converted to number)
    // - location_name: string
    // - location_link: string (we send empty if not available)
    // - about: string (clubDescription)
    // - logo: file (clubLogo)
    // - contact_phone: string
    // - contact_email: string (if needed)
    // - interest_ids: string (we send as JSON string)
    const formData = new FormData();
    formData.append("name", clubName);
formData.append("org_id", clubOrganization.toString());
    formData.append("location_name", clubLocation);
    formData.append("location_link", ""); // Send empty if no link provided
    formData.append("about", clubDescription);
    if (clubLogo) {
      formData.append("logo", clubLogo);
    }
    formData.append("contact_phone", contactPhone);
    // formData.append("contact_email", contactEmail); // Uncomment if needed
    formData.append("interest_ids", JSON.stringify(selectedInterests));

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No access token found in localStorage.");
        return;
      }

      const response = await axios.put(`${API_BASE_URL}/api/v1/clubs/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Club updated:", response.data);
      // Navigate after successful submit
      router.push("/dashboard/clubEdit");
    } catch (error) {
      console.error("Error updating club:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:mx-20">
      <Sidebar />
      {/* Page Title */}
      <h1 className="mb-6 mt-12 md:mt-0 text-4xl font-bold text-gray-800 bebas max-w-5xl space-y-8 mx-auto">EDIT CLUB PROFILE</h1>
      <form className="mx-auto max-w-5xl space-y-8" onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}
          <h2 className="mb-4 mt-12 text-2xl font-semibold text-gray-800 bebas">BASIC INFORMATION</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="grid grid-rows-2 gap-6 md:gap-0">
            {/* Club Name */}
            <div>
              <label htmlFor="clubName" className="mb-1 block text-sm font-medium text-gray-700">
                Club Name <span className="text-red-500">*</span>
              </label>
              <input
                id="clubName"
                name="clubName"
                placeholder="Enter Club Name (3-20 characters)"
                className="w-full rounded border text-gray-500 cursor-not-allowed border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 "
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                disabled
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
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 "
                value={clubLocation}
                onChange={(e) => setClubLocation(e.target.value)}
              />
            </div>
          </div>

          {/* <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"> */}
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
                className="w-full h-3/4 resize-none rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={clubDescription}
                onChange={(e) => setClubDescription(e.target.value)}
              />
            </div>
            
          {/* </div> */}
          {/* Logo Upload */}
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
                <input id="clubLogo" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <p className="text-sm text-gray-600 mt-2">Add Club Logo</p>
              </div>
            </div>
        </div>

        {/* LINKS TO CONNECT (disabled fields) */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 bebas">LINKS TO CONNECT</h2>
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
                className="w-full rounded border border-gray-300 p-2 text-sm text-gray-500"
                value={instagramLink}
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
                className="w-full rounded border border-gray-300 p-2 text-sm text-gray-500"
                value={youtubeLink}
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
                className="w-full rounded border border-gray-300 p-2 text-sm text-gray-500"
                value={linkedInLink}
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
                className="w-full rounded border border-gray-300 p-2 text-sm text-gray-500"
                value={websiteLink}
              />
            </div>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="mb-6">
          <h2 className="mb-4 mt-12 text-2xl font-semibold text-gray-800 bebas">CONTACT INFORMATION</h2>
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

        <h2 className="font-semibold mt-12 text-2xl bebas">SELECT AREA RELATED TO THE EVENT</h2>
          <div className="space-y-4 bg-gray-100 p-5 rounded-xl">
            {interestCategories.map(({ title, options }) => (
              <div key={title}>
                <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
                <div className="flex flex-wrap gap-4">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSelection(option);
                      }}
                      aria-pressed={selected.some((item) => item.id === option.id)}
                      disabled={
                        selected.length >= 5 && !selected.some((item) => item.id === option.id)
                      }
                      className={`px-3 py-1 rounded-full transition ${
                        selected.some((item) => item.id === option.id)
                          ? "border-green-600 border-2"
                          : "bg-white hover:bg-gray-300"
                      } ${
                        selected.length >= 5 && !selected.some((item) => item.id === option.id)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div> 

        {/* SUBMIT BUTTON */}
        <div className="pt-4">
          <button type="submit" className="text-2xl rounded bg-gray-700 px-6 py-2 text-white hover:bg-gray-800 bebas">
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClub;
