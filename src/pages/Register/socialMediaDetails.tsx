'use client';
import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import { useNavigate } from '@/utils/navigation';

export default function SocialMediaDetails() {
  const { navigateTo } = useNavigate();
  const router = useRouter();
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');

  // Load saved values from sessionStorage when the component mounts
  useEffect(() => {
    const savedInstagram = sessionStorage.getItem('instagram');
    const savedLinkedin = sessionStorage.getItem('linkedin');
    const savedYoutube = sessionStorage.getItem('youtube');
    const savedWebsite = sessionStorage.getItem('website');

    if (savedInstagram) setInstagram(savedInstagram);
    if (savedLinkedin) setLinkedin(savedLinkedin);
    if (savedYoutube) setYoutube(savedYoutube);
    if (savedWebsite) setWebsite(savedWebsite);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save values to sessionStorage
    sessionStorage.setItem('instagram', instagram);
    sessionStorage.setItem('linkedin', linkedin);
    sessionStorage.setItem('youtube', youtube);
    sessionStorage.setItem('website', website);

    // Navigate to the next page
    navigateTo('/register/finalFill');
  };

  return (
    <div>
      {/* Back Button */}
      <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-600 cursor-pointer">
        &larr; Back
      </button>
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md border-2 border-gray-700 w-96">
          
          {/* Progress Bar */}
          <div className="flex justify-center mb-4">
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
            <div className="w-1/5 h-1 bg-teal-500 mx-1"></div>
          </div>

          {/* Form Header */}
          <h2 className="text-center text-xl font-bold mb-4">DROP YOUR DETAILS IN!</h2>

          <form onSubmit={handleSubmit}>
            <label className="block text-gray-700 font-medium">Instagram Link</label>
            <input
              type="url"
              placeholder="Enter the link"
              className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />

            <label className="block text-gray-700 font-medium">LinkedIn Link</label>
            <input
              type="url"
              placeholder="Enter the link"
              className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />

            <label className="block text-gray-700 font-medium">YouTube Link</label>
            <input
              type="url"
              placeholder="Enter the link"
              className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />

            <label className="block text-gray-700 font-medium">Website Link</label>
            <input
              type="url"
              placeholder="Enter the link"
              className="w-full p-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-gray-700 h-12 bebas text-2xl text-white p-2 rounded-lg font-semibold hover:bg-gray-800"
            >
              CONTINUE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
