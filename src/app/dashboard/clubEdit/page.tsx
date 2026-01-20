"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import { ChevronDown, ImagePlus } from "lucide-react";

export default function EditClub() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Basic Club Information
  const [clubName, setClubName] = useState("");
  const [clubOrganization, setClubOrganization] = useState(0);
  const [clubLocation, setClubLocation] = useState("");
  const [clubDescription, setClubDescription] = useState("");

  // Social Links
  const [instagramLink, setInstagramLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [linkedInLink, setLinkedInLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  // Logo File & Preview
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  const [clubLogoPreview, setClubLogoPreview] = useState<string | null>("");

  // Interests
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);

  const interestCategories = [
    {
      title: "Academic",
      options: [
        { id: 6, name: "Coding", emoji: "💻" },
        { id: 7, name: "UI/UX", emoji: "🎨" },
        { id: 8, name: "Data Science", emoji: "📊" },
        { id: 9, name: "Entrepreneurship", emoji: "👨‍💼" },
        { id: 10, name: "Marketing", emoji: "🏷️" },
        { id: 11, name: "Finance", emoji: "💰" },
        { id: 2, name: "AI/ML", emoji: "🦾" },
        { id: 12, name: "Analytics", emoji: "📈" },
        { id: 13, name: "Cybersecurity", emoji: "🔒" },
        { id: 14, name: "Product Management", emoji: "🏭" },
      ],
    },
    {
      title: "Creative",
      options: [
        { id: 15, name: "Photography", emoji: "📸" },
        { id: 16, name: "Music", emoji: "🎵" },
        { id: 17, name: "Film", emoji: "🎬" },
        { id: 18, name: "Animation", emoji: "🐰" },
        { id: 19, name: "Writing", emoji: "✏️" },
        { id: 20, name: "Fashion", emoji: "👗" },
        { id: 21, name: "Gaming", emoji: "🎮" },
      ],
    },
    {
      title: "Emerging Trends",
      options: [
        { id: 22, name: "Blockchain", emoji: "🔗" },
        { id: 27, name: "Space Exploration", emoji: "🚀" },
        { id: 23, name: "VR/AR", emoji: "🥽" },
        { id: 26, name: "E-Sports", emoji: "🎮" },
        { id: 24, name: "Memes & Internet Culture", emoji: "🌐" },
        { id: 25, name: "Content Creation", emoji: "🎥" },
      ],
    },
  ];

  const [selected, setSelected] = useState<{ id: number; name: string; emoji: string }[]>([]);

  const toggleSelection = (option: { id: number; name: string; emoji: string }) => {
    setSelected((prev) => {
      if (prev.some((item) => item.id === option.id)) {
        return prev.filter((item) => item.id !== option.id);
      } else if (prev.length < 5) {
        return [...prev, option];
      }
      return prev;
    });
  };

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        if (!API_BASE_URL || !token) return;
        const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setClubName(data.name || "");
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE_URL) return;

    const formData = new FormData();
    formData.append("name", clubName);
    formData.append("org_id", clubOrganization.toString());
    formData.append("location_name", clubLocation);
    formData.append("location_link", "");
    formData.append("about", clubDescription);
    if (clubLogo) {
      formData.append("logo", clubLogo);
    }
    formData.append("interest_ids", JSON.stringify(selectedInterests));

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      await axios.put(`${API_BASE_URL}/api/v1/clubs/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      router.push("/dashboard/clubProfile");
    } catch (error) {
      console.error("Error updating club:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          {/* Page Title */}
          <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black mb-8">
            EDIT CLUB PROFILE
          </h1>

          <form onSubmit={handleSubmit}>
            {/* BASIC INFORMATION */}
            <div className="mb-10">
              <h2 className="bebas text-[18px] tracking-wide text-black mb-4">
                BASIC INFORMATION
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Name, Org, Location */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-[12px] text-gray-600 mb-1.5">Club Name</label>
                    <input
                      type="text"
                      placeholder="Enter Club Name"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] text-gray-600 mb-1.5">Club Organization</label>
                    <div className="relative">
                      <select
                        value={clubOrganization}
                        onChange={(e) => setClubOrganization(Number(e.target.value))}
                        className="h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                      >
                        <option value={0}>Choose Organization</option>
                        <option value={1}>College of Engineering Trivandrum</option>
                        <option value={2}>Other Organization</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] text-gray-600 mb-1.5">Club Location</label>
                    <input
                      type="text"
                      placeholder="Choose Club Location"
                      value={clubLocation}
                      onChange={(e) => setClubLocation(e.target.value)}
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Middle Column - Description */}
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Club Description</label>
                  <textarea
                    placeholder="Enter Club Description"
                    value={clubDescription}
                    onChange={(e) => setClubDescription(e.target.value)}
                    className="flex-1 min-h-[160px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Right Column - Logo Upload */}
                <div className="flex flex-col items-center justify-center">
                  <label
                    htmlFor="clubLogo"
                    className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {clubLogoPreview ? (
                      <Image
                        src={clubLogoPreview}
                        width={96}
                        height={96}
                        alt="Club Logo"
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <ImagePlus className="w-10 h-10 text-gray-400" />
                    )}
                  </label>
                  <input
                    id="clubLogo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-[12px] text-gray-600 mt-2">Add Club Logo</p>
                  <p className="text-[10px] text-gray-400">(1:1 ration posters)</p>
                </div>
              </div>
            </div>

            {/* LINKS TO CONNECT */}
            <div className="mb-10">
              <h2 className="bebas text-[18px] tracking-wide text-black mb-4">
                LINKS TO CONNECT
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Instagram Link</label>
                  <input
                    type="text"
                    placeholder="Enter The Instagram Link"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Youtube Link</label>
                  <input
                    type="text"
                    placeholder="Youtube link"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Linkedin Link</label>
                  <input
                    type="text"
                    placeholder="Linkedin Link"
                    value={linkedInLink}
                    onChange={(e) => setLinkedInLink(e.target.value)}
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Website Link</label>
                  <input
                    type="text"
                    placeholder="Website Link"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SELECT AREAS RELATED TO THE CLUB */}
            <div className="mb-10">
              <h2 className="bebas text-[18px] tracking-wide text-black mb-4">
                SELECT AREAS RELATED TO THE CLUB
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                {interestCategories.map(({ title, options }) => (
                  <div key={title}>
                    <h3 className="text-[14px] font-semibold text-gray-800 mb-3">{title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => {
                        const isSelected = selected.some((item) => item.id === option.id);
                        const isDisabled = selected.length >= 5 && !isSelected;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleSelection(option)}
                            disabled={isDisabled}
                            className={`px-3 py-1.5 rounded-full text-[13px] transition-all ${isSelected
                                ? "border-2 border-green-500 bg-white"
                                : "bg-white border border-gray-200 hover:border-gray-300"
                              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {option.emoji} {option.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="h-[48px] px-12 bg-[#2C333D] hover:bg-[#1F2937] text-white bebas text-[18px] tracking-wide rounded transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

