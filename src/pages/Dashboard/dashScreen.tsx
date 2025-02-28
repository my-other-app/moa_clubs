'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash, FaCog, FaDownload, FaClipboardList } from 'react-icons/fa';
import Sidebar from '@/components/sidebar';


const registrations = Array(7).fill({
  id: 'NEX25AA001',
  name: 'Edwin Emmanuel Roy',
  email: 'emmanuelroy162@gmail.com',
  phone: '8113859251',
  institution: 'College of Engineering Tr',
});

export default function DashScreen() {


  const [message, setMessage] = useState('');

  return (
    <>
    <Sidebar/>
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="p-4 sm:p-6 w-full max-w-5xl space-y-6 bg-white rounded-lg">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
            SF SEA HACKATHON
          </h1>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button className="p-2 bg-gray-200 rounded-full"><FaEdit /></button>
            <button className="p-2 bg-gray-200 rounded-full"><FaTrash /></button>
            <button className="p-2 bg-gray-200 rounded-full"><FaCog /></button>
          </div>
        </div>

        {/* Event Info */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center justify-center text-center">
          <Image 
            src="https://images.pexels.com/photos/3680219/pexels-photo-3680219.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" 
            alt="logo" 
            width={300} 
            height={300} 
            className="rounded-lg"
          />
          <div className='mt-5'>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-center">
              <div className="p-4 bg-green-200 text-green-800 rounded flex flex-col items-center justify-center">
                🔵 Live
                <span className="font-semibold">The event is live and registrations are open</span>
              </div>
              <div className="p-4 bg-purple-200 text-purple-800 rounded flex flex-col items-center justify-center">
                <span className="text-xl font-bold">24</span>
                <span>Total Registration Count</span>
              </div>
              <div className="p-4 bg-blue-200 text-blue-800 rounded flex flex-col items-center justify-center">
                <span className="text-xl font-bold">234</span>
                <span>Event Visitors</span>
              </div>
              <div className="p-4 bg-red-200 text-red-800 rounded flex flex-col items-center justify-center">
                <span className="text-xl font-bold">2</span>
                <span>Institutions</span>
              </div>
            </div>

            {/* Announcement Section */}
            <div className="text-center space-y-2 mt-4">
              <h2 className="text-lg font-semibold">Make Announcements</h2>
              <textarea
                placeholder="Enter the message to send"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded text-center"
              />
              <button className="mt-2 p-2 border-black border-2 text-black rounded">Send Message</button>
            </div>
          </div>
        </div>

        {/* Registration Table */}
        <div>
          <h2 className="text-lg font-semibold text-center">Registration</h2>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <button className="p-2 flex items-center gap-2 bg-gray-300 rounded">
              <FaClipboardList /> Attendance
            </button>
            <button className="p-2 flex items-center gap-2 bg-gray-300 rounded">
              <FaDownload /> Download CSV File
            </button>
          </div>

          {/* Table with Scroll Support */}
          <div className="overflow-x-auto text-gray-600 mt-4">
            <table className="min-w-full border rounded text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Institution</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{reg.id}</td>
                    <td className="p-2">{reg.name}</td>
                    <td className="p-2">{reg.email}</td>
                    <td className="p-2">{reg.phone}</td>
                    <td className="p-2">{reg.institution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <button className="mt-2 p-2 border-black border-2 text-black rounded">Show All</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
