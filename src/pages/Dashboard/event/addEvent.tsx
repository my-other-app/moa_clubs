// pages/edit-event.tsx
"use client";

import { useState, ChangeEvent } from "react";
import axios from "axios";
import Sidebar from "@/components/sidebar"; // adjust path as needed
import { ChevronLeft, ChevronDown, Circle } from "lucide-react";
import { useRouter } from "next/router";
import { useEvent } from "@/context/eventContext";
import { v4 as uuidv4 } from 'uuid';

interface Question {
  type: string;
  text: string;
  options: string[];
}

export default function EditEvent() {
  const router = useRouter();
  const { eventData } = useEvent();
  const [loading, setLoading] = useState<boolean>(false);
  const uniqueEventKey = uuidv4();
  const [options, setOptions] = useState<string[]>([""]);
  const [questionType, setQuestionType] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleQuestionTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setQuestionType(e.target.value);
    setCurrentQuestion("");
    if (e.target.value === "multipleChoice") {
      setOptions([""]);
    } else {
      setOptions([]);
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.trim() === "") return;
    const newQuestion: Question = {
      type: questionType,
      text: currentQuestion,
      options: questionType === "multipleChoice" ? options : [],
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setQuestionType("");
    setOptions([""]);
  };

  const handleContinue = async () => {
    const formData = new FormData();
    if (eventData) {
      Object.entries(eventData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }
    // const additionalDetails = questions.length > 0 ? JSON.stringify(questions) : "";
    // formData.append("additional_details", additionalDetails);
    // if (eventData) {
    //   Object.entries(eventData).forEach(([key, value]) => {
    //     formData.append(key, value as string);
    //   });
    // }
    
    const generateUniqueKey = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const uniqueEventKey = generateUniqueKey();
    formData.append("key", uniqueEventKey);

    const accessToken = localStorage.getItem("accessToken") || "";
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/events/create`,formData, {
        headers: { Authorization: `Bearer ${accessToken}`,
          "content-type": "multipart/form-data",
         },
      });
      console.log("Event created successfully:", response.data);
      router.push("/dashboard/events");
    } catch (error: unknown) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="px-32 mx-auto p-6">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-black mb-4">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold">EDIT REGISTRATION FORM</h1>
        <p className="text-gray-500">Add questions for the registration Form</p>
        <div className="flex flex-row gap-12 items-start">
          <div className="mt-6 flex-1/2">
            <h2 className="font-bold text-lg">MANDATORY INFORMATION</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-medium">Participant Name</label>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block font-medium">Participant Email</label>
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block font-medium">Participant Number</label>
                <input
                  type="tel"
                  placeholder="Enter Your Number"
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
            <div className="mt-6">
              <h2 className="font-bold text-lg">QUESTIONS</h2>
              {questions.length === 0 ? (
                <p className="text-gray-500 mt-2">No questions added yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {questions.map((q, index) => (
                    <li key={index} className="p-2 border rounded">
                      <div className="font-medium">{q.text}</div>
                      <div className="text-sm text-gray-500">Type: {q.type}</div>
                      {q.type === "multipleChoice" && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {q.options.map((opt, i) => (
                            <li key={i} className="text-gray-600">
                              {opt || `Option ${i + 1}`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md mt-6 min-h-[300px] flex-col flex-1/2">
            <h2 className="text-lg font-bold">CREATE A NEW QUESTION</h2>
            <div className="mt-4 space-y-4">
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
              {questionType && (
                <div>
                  <div>
                    <label className="block font-medium">Question</label>
                    <input
                      type="text"
                      placeholder="Enter Your Question"
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                  {questionType === "multipleChoice" && (
                    <div>
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mt-2">
                          <Circle className="text-gray-500 w-5 h-5" />
                          <input
                            type="text"
                            value={option}
                            placeholder={`Option ${index + 1}`}
                            onChange={(e) => {
                              const newOptions = [...options];
                              newOptions[index] = e.target.value;
                              setOptions(newOptions);
                            }}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          />
                        </div>
                      ))}
                      <button onClick={addOption} className="mt-2 text-gray-600 font-medium hover:underline">
                        Add another option
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button onClick={handleAddQuestion} className="w-full px-4 py-2 mt-4 text-lg font-bold border rounded-lg hover:bg-gray-100">
                ADD QUESTION
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleContinue}
          disabled={loading}
          className="bottom-10 right-30 absolute w-48 bebas text-2xl self-end mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          {loading ? "Processing..." : "FINISH"}
        </button>
      </div>
    </>
  );
}
