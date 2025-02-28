"use client";

import Sidebar from "@/components/sidebar";
import { ChevronLeft, ChevronDown, Circle } from "lucide-react";
import '@/styles/globals.css';
import { useState } from "react";

const EditRegistrationForm = () => {
  const [options, setOptions] = useState(["Option 1"]);

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  return (
    <>
    <Sidebar/>
    <div className="max-w-3xl mx-auto p-6">
      {/* Back Button */}
      <button className="flex items-center text-gray-600 hover:text-black mb-4">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold">EDIT REGISTRATION FORM</h1>
      <p className="text-gray-500">Add questions for the registration Form</p>

      {/* Form Section */}
      <div className="mt-6">
        <h2 className="font-bold text-lg">MANDATORY INFORMATION</h2>

        <div className="mt-4 space-y-4">
          {/* Participant Name */}
          <div>
            <label className="block font-medium">Participant Name</label>
            <input
              type="text"
              placeholder="Enter Your Name"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Participant Email */}
          <div>
            <label className="block font-medium">Participant Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Participant Number */}
          <div>
            <label className="block font-medium">Participant Number</label>
            <input
              type="tel"
              placeholder="Enter Your Number"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Question Section */}
      <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-bold">CREATE A NEW QUESTION</h2>

        <div className="mt-4 space-y-4">
          {/* Question Type */}
          <div>
            <label className="block font-medium">Question Type</label>
            <div className="relative">
              <select className="appearance-none mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400">
                <option>Choose Question Type</option>
                <option>Multiple Choice</option>
                <option>Short Answer</option>
              </select>
              <ChevronDown className="absolute top-3 right-3 text-gray-500" />
            </div>
          </div>

          {/* Question Input */}
          <div>
            <label className="block font-medium">Question</label>
            <input
              type="text"
              placeholder="Enter Your Question"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Options */}
          <div>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <Circle className="text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            ))}
            <button
              onClick={addOption}
              className="mt-2 text-gray-600 font-medium hover:underline"
            >
              Add another option
            </button>
          </div>

          {/* Add Volunteer Button */}
          <button className="w-full px-4 py-2 mt-4 text-lg font-bold border rounded-lg hover:bg-gray-100">
            ADD VOLUNTEER
          </button>
        </div>     
      </div>
      <button className="w-full self-end mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg">
          CONTINUE
        </button>
    </div>
  </>
  );
};

export default EditRegistrationForm;
