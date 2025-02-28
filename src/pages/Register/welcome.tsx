'use client';

import { useState } from 'react';
import '@/styles/globals.css';
import { useNavigate } from '@/utils/navigation';

export default function Welcome() {
  const { navigateTo } = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
      <div className="bg-white p-10 rounded-lg shadow-lg w-auto border-gray-700 border-2 border-solid">
        <h1 className="text-5xl text-black font-bold text-center mb-2 bebas">WELCOME TO MYOTHERAPP</h1>
        <p className="text-gray-700 text-center mb-8">
          We provide you with the end-to-end<br></br> solution for managing events
        </p>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium text-gray-900">Email</label>
          <input
            type="email"
            placeholder="Enter Your Email"
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
            onClick={() => navigateTo('/register/uploadImage')}
            className="w-full bg-gray-700 h-15 text-2xl bebas text-white p-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            START THE JOURNEY
          </button>
        </form>
      </div>
    </div>
  );
}
