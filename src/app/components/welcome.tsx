'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/app/utils/navigation';
import authService, { storage } from '@/app/services/auth.service';

export default function Welcome() {
  const { navigateTo } = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved email from sessionStorage (NOT password for security)
  useEffect(() => {
    const savedEmail = storage.getSessionItem('email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Save email for convenience (NOT password)
    storage.setSessionItem('email', email);

    try {
      // Login using centralized auth service
      const token = await authService.login({ username: email, password });

      if (!token) {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
        return;
      }

      // Fetch club data
      const clubData = await authService.fetchClubInfo();

      // Navigate based on club profile completion
      if (clubData && clubData.logo) {
        navigateTo('/dashboard/events');
      } else {
        navigateTo('/register/uploadImage');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl w-auto border-gray-700 border border-solid">
        <h1 className="text-5xl text-black font-bold text-center mb-2 bebas">
          WELCOME TO MYOTHERAPP
        </h1>
        <p className="text-gray-700 text-center mb-8">
          We provide you with an end-to-end<br></br> solution for managing events
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-light text-sm text-gray-700">Username</label>
          <input
            type="text"
            placeholder="Enter Your username"
            className="w-full p-2 border rounded-lg mb-4 "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <label className="block mb-2 font-light text-sm text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-2 border rounded-lg mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#2C333D] h-15 text-2xl bebas text-white p-2 rounded-lg font-semibold hover:bg-gray-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isLoading ? 'SIGNING IN...' : 'START THE JOURNEY'}
          </button>
        </form>
      </div>
    </div>
  );
}
