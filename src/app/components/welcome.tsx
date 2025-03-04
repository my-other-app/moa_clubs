'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from '@/app/utils/navigation';

//
// 1) Set your API base URL. You can hardcode this or load it from .env
//
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

//
// 2) accessToken function: logs in with username/password and returns the access token.
//    Note the use of URLSearchParams for x-www-form-urlencoded.
//
export async function accessToken({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<string> {
  // Construct form data for "application/x-www-form-urlencoded"
  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', username);
  formData.append('password', password);

  try {
    // POST to /api/v1/oauth/token with the correct headers
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Assuming the token is returned as { "access_token": "..." }
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    // Decide how you want to handle the error. For now, return an empty string.
    return '';
  }
}

//
// 3) fetchClub function: uses the token to fetch the club info
//
async function fetchClub(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Adjust as needed if the club data is nested
    return response.data;
  } catch (error) {
    console.error('Error fetching club:', error);
    return null;
  }
}

//
// 4) The main Welcome component with the form
//    - Saves username/password in sessionStorage
//    - Retrieves an access token
//    - Fetches the club
//    - Navigates based on whether club has a "name"
//
export default function Welcome() {
  const { navigateTo } = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Load saved values from sessionStorage on mount
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('email');
    const savedPassword = sessionStorage.getItem('password');
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save form data to sessionStorage
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('password', password);

    // 1) Get the access token
    const token = await accessToken({ username: email, password });

    // 2) Fetch club data using the token
    const clubData = await fetchClub(token);

    // 3) Navigate based on whether the club data has a name
    if (clubData && clubData.name) {
      navigateTo('/dashboard/events');
    } else {
      navigateTo('/register/uploadImage');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg w-auto border-gray-700 border-2 border-solid">
        <h1 className="text-5xl text-black font-bold text-center mb-2 bebas">
          WELCOME TO MYOTHERAPP
        </h1>
        <p className="text-gray-700 text-center mb-8">
          We provide you with an end-to-end solution for managing events
        </p>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium text-gray-900">Username</label>
          <input
            type="text"
            placeholder="Enter Your username"
            className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="block mb-2 font-medium text-gray-900">Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-gray-700 h-15 text-2xl bebas text-white p-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            START THE JOURNEY
          </button>
        </form>
      </div>
    </div>
  );
}
