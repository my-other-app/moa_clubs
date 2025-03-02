"use client"; // Remove if not needed for your routing setup

import React, { useState } from "react";
import Image from "next/image";
import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaGlobe,
  FaUniversity,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Sidebar from "@/components/sidebar";

interface ReadMoreProps {
  text: string;
  wordLimit?: number;
}

const ReadMore: React.FC<ReadMoreProps> = ({ text, wordLimit = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const words = text.split(" ").filter(Boolean);
  const isLongText = words.length > wordLimit;
  const displayText =
    isExpanded || !isLongText ? text : words.slice(0, wordLimit).join(" ") + "...";

  return (
    <div>
      <p className="text-gray-700 leading-relaxed">{displayText}</p>
      {isLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

export default function ClubProfile() {
  const clubDescription = `Innovation, Entrepreneurship, Disruption. That's what we stand for
at IEDC CET – the Innovation & Entrepreneurship Development
Centre of College of Engineering Trivandrum. We are a thriving
community of tinkerers, doers, and explorers who believe in
turning ideas into impact. Whether it’s startup bootcamps,
hackathons, investment meetups, or mentorship programs, we’ve got
the perfect launchpad for students to explore entrepreneurship. If
you’re ready to build, break, and innovate – come join us!

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
condimentum ligula vitae lacus fermentum, nec tincidunt dui
facilisis. Integer sit amet neque et lacus ultrices ultricies.
Vivamus ac sapien leo. Praesent nec magna sed odio varius sodales.
Mauris accumsan scelerisque felis, in feugiat sem aliquam eget.
Cras vitae mi ut velit commodo malesuada. Sed consequat,
turpis eget tincidunt faucibus, nibh massa tristique urna, eget
porta lacus nunc at urna. Nullam ac quam non eros feugiat
tincidunt. Donec vitae elit ac nisl commodo commodo. Curabitur
elementum volutpat mauris, vitae blandit dui imperdiet ac. Morbi
in odio velit. Phasellus vel vestibulum urna, ac condimentum diam.
Sed bibendum libero ut turpis aliquet, nec blandit lorem vestibulum.
Donec non elit sit amet diam suscipit faucibus. Cras quis justo sed
quam fermentum cursus quis ut nisl.`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
        <Sidebar />
      {/* Page Heading */}
      <h1 className="text-3xl font-bold mb-4">CLUB PROFILE</h1>

      {/* Outer Container/Card */}
      <div>
        {/* Top Row: Logo, Club Name/Tags, and Buttons */}
        <div className="flex flex-col sm:flex-row justify-between border bg-white rounded-lg p-4 items-start sm:items-center mb-4">
          {/* Left: Logo + Club Name + Tags */}
          <div className="flex items-start gap-4">
            {/* Logo (replace with your actual image path) */}
            <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-100">
              <Image
                src="data:image/png;base64,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"
                alt="IEDC Logo"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            {/* Club Name and Tags */}
            <div>
              <h2 className="text-xl font-semibold">IEDC CET</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 text-sm bg-green-400  rounded-full">
                  Engineering
                </span>
                <span className="px-3 py-1 text-sm bg-red-400  rounded-full">
                  App Development
                </span>
                <span className="px-3 py-1 text-sm bg-blue-400  rounded-full">
                  GDSC
                </span>
                <span className="px-3 py-1 text-sm bg-amber-400  rounded-full">
                  Web Designing
                </span>
                <span className="px-3 py-1 text-sm bg-purple-400  rounded-full">
                  AI/ML
                </span>
                <span className="px-3 py-1 text-sm bg-cyan-400  rounded-full">
                  EDA
                </span>
                <span className="px-3 py-1 text-sm bg-indigo-400 rounded-full">
                  Competitive Coding
                </span>
              </div>
            </div>
          </div>

          {/* Right: Buttons */}
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button className="border bg-gray-700 rounded px-8 py-1 text-sm text-amber-50 font-medium hover:bg-gray-800">
              EDIT PROFILE
            </button>
            <button className="border border-gray-700 rounded px-4 py-1 text-sm font-medium hover:bg-gray-100">
              CHANGE PASSWORD
            </button>
          </div>
        </div>

        {/* Content Row: Description on left, Info on right */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Left: Club Description with Read More */}
          <div className="border rounded-lg p-4 bg-white flex-3/5">
            {/* For testing, set wordLimit to 50 */}
            <ReadMore text={clubDescription} wordLimit={75} />
          </div>

          {/* Right: College, Location, Socials */}
          <div className="flex flex-col gap-3 flex-2/5">
            {/* College & Location */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <FaUniversity className="text-xl text-gray-700" />
                  <p className="font-semibold">College</p>
                </div>
                <p className="text-gray-700">COLLEGE OF ENGINEERING TRIVANDRUM</p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <FaMapMarkerAlt className="text-xl text-gray-700" />
                  <p className="font-semibold">Location</p>
                </div>
                <p className="text-gray-700">SREEKARYAM, TRIVANDRUM</p>
              </div>
            </div>
            {/* Social Links */}
            <div className="p-4 border rounded-lg bg-white space-y-2">
              <div className="flex items-center gap-2">
                <FaInstagram className="text-xl text-pink-500" />
                <span className="font-semibold">Instagram:</span>
                <a
                  href="https://instagram.com/iedccet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  instagram.com/iedccet
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaYoutube className="text-xl text-red-500" />
                <span className="font-semibold">Youtube:</span>
                <a
                  href="https://youtube.com/iedccet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  youtube.com/iedccet
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaLinkedin className="text-xl text-blue-700" />
                <span className="font-semibold">LinkedIn:</span>
                <a
                  href="https://linkedin.com/company/iedccet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  linkedin.com/company/iedccet
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-xl text-green-600" />
                <span className="font-semibold">Website:</span>
                <a
                  href="https://iedccet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  iedccet.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
