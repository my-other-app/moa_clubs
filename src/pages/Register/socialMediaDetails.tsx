'use client';

import { useState } from 'react';
import '@/styles/globals.css';

export default function SocialMediaDetails() {
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ instagram, linkedin, youtube, website });
  };

  return (
    <div>
    <button className="text-gray-600 mt-4 ml-4">&larr; Back</button>
    <div className="min-h-screen flex justify-center items-center">
      
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 w-96">
        {/* Back Button */}
        

        {/* Progress Bar */}
        <div className="flex justify-between mb-4">
          <div className="w-1/5 h-1 bg-green-500"></div>
          <div className="w-1/5 h-1 bg-green-500"></div>
          <div className="w-1/5 h-1 bg-green-500"></div>
          <div className="w-1/5 h-1 bg-green-500"></div>
          <div className="w-1/5 h-1 bg-gray-300"></div>
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
            className="w-full bg-gray-900 text-white p-2 rounded-lg font-semibold hover:bg-gray-700"
          >
            CONTINUE
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
