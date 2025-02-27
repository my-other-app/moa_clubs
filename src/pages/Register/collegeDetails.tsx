'use client';

import { useState } from 'react';
import '@/styles/globals.css';

export default function CollegeDetails() {
  const [college, setCollege] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ college, location });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
         <button className="self-start text-gray-600">&larr; Back</button>
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 w-96">
        {/* Progress Bar */}
        <div className="flex justify-between mb-4">
          <div className="w-1/5 h-1 bg-green-500"></div>
          <div className="w-1/5 h-1 bg-green-500"></div>
          <div className="w-1/5 h-1 bg-green-500"></div>
          <div className="w-1/5 h-1 bg-gray-300"></div>
          <div className="w-1/5 h-1 bg-gray-300"></div>
        </div>

        {/* Form Header */}
        <h2 className="text-center text-xl font-bold mb-4">DROP YOUR DETAILS IN!</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-medium">College Name</label>
          <input
            type="text"
            placeholder="Enter Your College"
            className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />

          <label className="block text-gray-700 font-medium">Location</label>
          <input
            type="text"
            placeholder="Enter Your Location"
            className="w-full p-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
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
  );
}