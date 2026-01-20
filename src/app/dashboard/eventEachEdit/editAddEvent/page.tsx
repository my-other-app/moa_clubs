"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Sidebar from "@/app/components/sidebar";
import { ChevronLeft, ChevronDown, Circle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEvent } from "@/app/context/eventContext";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

interface Question {
  type: string;
  text: string;
  options: string[];
  required: boolean;
}

interface AdditionalDetail {
  field_type: string;
  label: string;
  options?: string[];
  required: boolean;
}

export default function EditEvent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId;
  const { eventData } = useEvent();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([""]);
  const [questionType, setQuestionType] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionRequired, setQuestionRequired] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Second question card state
  const [options2, setOptions2] = useState<string[]>([""]);
  const [questionType2, setQuestionType2] = useState<string>("");
  const [currentQuestion2, setCurrentQuestion2] = useState<string>("");
  const [questionRequired2, setQuestionRequired2] = useState<boolean>(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      const accessToken = localStorage.getItem("access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/info/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.data.additional_details) {
          const fetchedQuestions = response.data.additional_details.map(
            (item: AdditionalDetail) => ({
              type: item.field_type === "select" ? "multipleChoice" : "shortAnswer",
              text: item.label,
              options: item.options || [],
              required: item.required,
            })
          );
          setQuestions(fetchedQuestions);
        }
      } catch (error) {
        console.error("Error fetching event data", error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const addOption2 = () => {
    setOptions2([...options2, ""]);
  };

  const handleQuestionTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setQuestionType(selectedType);
    setCurrentQuestion("");
    setQuestionRequired(true);
    if (selectedType === "multipleChoice") {
      setOptions([""]);
    } else {
      setOptions([]);
    }
  };

  const handleQuestionTypeChange2 = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setQuestionType2(selectedType);
    setCurrentQuestion2("");
    setQuestionRequired2(true);
    if (selectedType === "multipleChoice") {
      setOptions2([""]);
    } else {
      setOptions2([]);
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.trim() === "") return;
    const newQuestion: Question = {
      type: questionType,
      text: currentQuestion,
      options: questionType === "multipleChoice" ? options : [],
      required: questionRequired,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setQuestionType("");
    setOptions([""]);
    setQuestionRequired(true);
  };

  const handleAddQuestion2 = () => {
    if (currentQuestion2.trim() === "") return;
    const newQuestion: Question = {
      type: questionType2,
      text: currentQuestion2,
      options: questionType2 === "multipleChoice" ? options2 : [],
      required: questionRequired2,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion2("");
    setQuestionType2("");
    setOptions2([""]);
    setQuestionRequired2(true);
  };

  const handleContinue = async () => {
    const additionalDetailsArray = questions.map((q) => ({
      key: uuidv4(),
      label: q.text,
      field_type: q.type === "multipleChoice" ? "select" : "text",
      options: q.type === "multipleChoice" ? q.options : [],
      required: q.required,
      question: q.text,
      answer: "",
    }));

    if (!eventData) {
      console.error("No event data found in context");
      return;
    }

    const updatedEventData = {
      ...eventData,
      additional_details: additionalDetailsArray,
    };

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/update/${eventId}`,
        updatedEventData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      router.push("/dashboard/events");
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-black mb-4 text-[14px]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          {/* Page Title */}
          <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black mb-1">
            EDIT REGISTRATION FORM
          </h1>
          <p className="text-[14px] text-gray-500 mb-8">
            Add questions for the registration Form
          </p>

          {/* Mandatory Information Section */}
          <div className="mb-10">
            <h2 className="bebas text-[18px] tracking-wide text-black mb-4">
              MANDATORY INFORMATION
            </h2>
            <div className="space-y-4 max-w-md">
              <div className="flex flex-col">
                <label className="text-[12px] text-gray-600 mb-1.5">
                  Participant Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Password"
                  className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[12px] text-gray-600 mb-1.5">
                  Participant Email
                </label>
                <div className="relative">
                  <select
                    className="h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    disabled
                  >
                    <option>Choose Event Type</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-[12px] text-gray-600 mb-1.5">
                  Participant Number
                </label>
                <div className="relative">
                  <select
                    className="h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    disabled
                  >
                    <option>Choose Event Type</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Question Cards - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* First Question Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="bebas text-[16px] tracking-wide text-black mb-4">
                CREATE A NEW QUESTION
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">
                    Question Type
                  </label>
                  <div className="relative">
                    <select
                      value={questionType}
                      onChange={handleQuestionTypeChange}
                      className="h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    >
                      <option value="">Choose Question Type</option>
                      <option value="multipleChoice">Multiple Choice</option>
                      <option value="shortAnswer">Short Answer</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {questionType && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-[12px] text-gray-600 mb-1.5">
                        Question
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Your Question"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {questionType === "multipleChoice" && (
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={option}
                              placeholder={`Option ${index + 1}`}
                              onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index] = e.target.value;
                                setOptions(newOptions);
                              }}
                              className="flex-1 h-[38px] px-3 py-2 text-[14px] bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={addOption}
                          className="text-[13px] text-gray-600 underline hover:text-black"
                        >
                          Add another option
                        </button>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={handleAddQuestion}
                  className="w-full max-w-[200px] h-[42px] bebas text-[16px] tracking-wide border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  ADD QUESTIONS
                </button>
              </div>
            </div>

            {/* Second Question Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="bebas text-[16px] tracking-wide text-black mb-4">
                CREATE A NEW QUESTION
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">
                    Question Type
                  </label>
                  <div className="relative">
                    <select
                      value={questionType2}
                      onChange={handleQuestionTypeChange2}
                      className="h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    >
                      <option value="">Choose Question Type</option>
                      <option value="multipleChoice">Multiple Choice</option>
                      <option value="shortAnswer">Short Answer</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {questionType2 && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-[12px] text-gray-600 mb-1.5">
                        Question
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Your Question"
                        value={currentQuestion2}
                        onChange={(e) => setCurrentQuestion2(e.target.value)}
                        className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {questionType2 === "multipleChoice" && (
                      <div className="space-y-2">
                        {options2.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={option}
                              placeholder={`Option ${index + 1}`}
                              onChange={(e) => {
                                const newOptions = [...options2];
                                newOptions[index] = e.target.value;
                                setOptions2(newOptions);
                              }}
                              className="flex-1 h-[38px] px-3 py-2 text-[14px] bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={addOption2}
                          className="text-[13px] text-gray-600 underline hover:text-black"
                        >
                          Add another option
                        </button>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={handleAddQuestion2}
                  className="w-full max-w-[200px] h-[42px] bebas text-[16px] tracking-wide border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  ADD QUESTIONS
                </button>
              </div>
            </div>
          </div>

          {/* Added Questions List */}
          {questions.length > 0 && (
            <div className="mb-10">
              <h3 className="bebas text-[16px] tracking-wide text-black mb-4">
                ADDED QUESTIONS ({questions.length})
              </h3>
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <p className="text-[14px] font-medium text-gray-800">{q.text}</p>
                      <p className="text-[12px] text-gray-500 mt-1">
                        Type: {q.type === "multipleChoice" ? "Multiple Choice" : "Short Answer"} •
                        {q.required ? " Required" : " Optional"}
                      </p>
                      {q.type === "multipleChoice" && q.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {q.options.map((opt, i) => (
                            <span key={i} className="text-[12px] bg-gray-100 px-2 py-1 rounded">
                              {opt || `Option ${i + 1}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                      className="text-[13px] text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="h-[48px] px-12 bg-[#2C333D] hover:bg-[#1F2937] text-white bebas text-[18px] tracking-wide rounded transition-colors disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : "CONTINUE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

