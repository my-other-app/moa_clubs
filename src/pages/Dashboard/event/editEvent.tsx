"use client";

import Sidebar from "@/components/sidebar";
import { ChevronLeft, ChevronDown, Circle } from "lucide-react";
import '@/styles/globals.css';
import { SetStateAction, useState } from "react";

const EditRegistrationForm = () => {
  const [options, setOptions] = useState(["Option 1"]);
  const [questionType, setQuestionType] = useState("");

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleQuestionTypeChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setQuestionType(e.target.value);
  };

  return (
    <>
      <Sidebar />
      <div className="px-32 mx-auto p-6">
        {/* Back Button */}
        <button className="flex items-center text-gray-600 hover:text-black mb-4">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold">EDIT REGISTRATION FORM</h1>
        <p className="text-gray-500">Add questions for the registration Form</p>

        <div className="flex flex-row gap-12">
          {/* Form Section */}
          <div className="mt-6 flex-1/2">
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
          <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md mt-6 flex-1/2">
            <h2 className="text-lg font-bold">CREATE A NEW QUESTION</h2>

            <div className="mt-4 space-y-4">
              {/* Question Type */}
              <div>
                <label className="block font-medium">Question Type</label>
                <div className="relative">
                  <select
                    value={questionType}
                    onChange={handleQuestionTypeChange}
                    className="appearance-none mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">Choose Question Type</option>
                    <option value="multipleChoice">Multiple Choice</option>
                    <option value="shortAnswer">Short Answer</option>
                  </select>
                  <ChevronDown className="absolute top-3 right-3 text-gray-500" />
                </div>
              </div>

              {/* Conditional Rendering based on Question Type */}
              {questionType === "multipleChoice" && (
                <div>
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
                </div>
              )}

              {questionType === "shortAnswer" && (
                <div>
                  {/* Question Input */}
                  <div>
                    <label className="block font-medium">Question</label>
                    <input
                      type="text"
                      placeholder="Enter Your Question"
                      className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Add Volunteer Button */}
              <button className="w-full px-4 py-2 mt-4 text-lg font-bold border rounded-lg hover:bg-gray-100">
                ADD QUESTION
              </button>
            </div>
          </div>
        </div>
        <button className="bottom-10 right-30 absolute w-48 bebas text-2xl self-end mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg">
          CONTINUE
        </button>
      </div>
    </>
  );
};

export default EditRegistrationForm;