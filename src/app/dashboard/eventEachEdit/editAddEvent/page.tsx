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

export default function EditEvent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId; // expects route param, e.g. /events/edit/10
  const { eventData, setEventData } = useEvent();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([""]);
  const [questionType, setQuestionType] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionRequired, setQuestionRequired] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Initial render debugging
  console.debug("EditEvent rendered with eventId:", eventId);
  console.debug("Initial eventData:", eventData);

  // Fetch event data including additional_details on mount (or when eventId changes)
  useEffect(() => {
    const fetchEventDetails = async () => {
      console.debug("Fetching event details for eventId:", eventId);
      if (!eventId) return;
      const accessToken = localStorage.getItem("access_token");
      console.debug("Access token found:", accessToken);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/info/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("Fetched event data:", response.data);
        // Process additional_details if available
        if (response.data.additional_details) {
          const fetchedQuestions = response.data.additional_details.map((item: any) => ({
            type: item.field_type === "select" ? "multipleChoice" : "shortAnswer",
            text: item.label,
            options: item.options || [],
            required: item.required,
          }));
          console.debug("Setting fetched questions:", fetchedQuestions);
          setQuestions(fetchedQuestions);
        }
      } catch (error) {
        console.error("Error fetching event data", error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const addOption = () => {
    const newOptions = [...options, ""];
    console.debug("Adding new option. Options before:", options, "Options after:", newOptions);
    setOptions(newOptions);
  };

  const handleQuestionTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    console.debug("Question type changed to:", selectedType);
    setQuestionType(selectedType);
    setCurrentQuestion("");
    setQuestionRequired(true);
    if (selectedType === "multipleChoice") {
      console.debug("Resetting options for multiple choice.");
      setOptions([""]);
    } else {
      console.debug("Clearing options for short answer.");
      setOptions([]);
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.trim() === "") {
      console.debug("Empty question text, not adding question.");
      return;
    }
    const newQuestion: Question = {
      type: questionType,
      text: currentQuestion,
      options: questionType === "multipleChoice" ? options : [],
      required: questionRequired,
    };
    console.debug("Adding new question:", newQuestion);
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    console.debug("Questions state after addition:", updatedQuestions);
    // Reset input fields
    setCurrentQuestion("");
    setQuestionType("");
    setOptions([""]);
    setQuestionRequired(true);
  };

  // Delete a question based on its index
  const handleDeleteQuestion = (index: number) => {
    console.debug("Deleting question at index:", index);
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    console.debug("Questions state after deletion:", updatedQuestions);
  };

  const handleContinue = async () => {
    console.debug("Handle continue clicked. Current questions:", questions);
    // Map questions to the required additional_details format with unique keys
    const additionalDetailsArray = questions.map((q) => ({
      key: uuidv4(),
      label: q.text,
      field_type: q.type === "multipleChoice" ? "select" : "text",
      options: q.type === "multipleChoice" ? q.options : [],
      required: q.required,
      question: q.text,
      answer: ""
    }));

    console.debug("Additional Details Array to be sent:", additionalDetailsArray);

    if (!eventData) {
      console.error("No event data found in context");
      return;
    }

    // Create an updated event data object with additional_details as an array.
    const updatedEventData = {
      ...eventData,
      additional_details: additionalDetailsArray,
    };

    console.debug("Updated Event Data:", updatedEventData);

    // Get access token from localStorage
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    setLoading(true);
    try {
      console.debug("Sending PUT request to update event...");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/update/${eventId}`,
        updatedEventData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Event updated successfully:", response.data);
      router.push("/dashboard/events");
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setLoading(false);
      console.debug("Loading state set to false");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="px-32 mx-auto p-6">
        <button
          onClick={() => {
            console.debug("Back button clicked");
            router.back();
          }}
          className="flex items-center text-gray-600 hover:text-black mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold">Edit Additional Details</h1>
        <p className="text-gray-500">Manage questions for the registration form</p>
        <div className="flex flex-row gap-12 items-start">
          <div className="mt-6 flex-1/2">
            <div className="mt-6">
              <h2 className="font-bold text-lg">QUESTIONS</h2>
              {questions.length === 0 ? (
                <p className="text-gray-500 mt-2">No questions available.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {questions.map((q, index) => (
                    <li
                      key={index}
                      className="p-2 border rounded flex justify-between items-start"
                    >
                      <div>
                        <div className="font-medium">{q.text}</div>
                        <div className="text-sm text-gray-500">Type: {q.type}</div>
                        <div className="text-sm text-gray-500">
                          Required: {q.required ? "Yes" : "No"}
                        </div>
                        {q.type === "multipleChoice" && (
                          <ul className="ml-4 mt-1 space-y-1">
                            {q.options.map((opt, i) => (
                              <li key={i} className="text-gray-600">
                                {opt || `Option ${i + 1}`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(index)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
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
                <>
                  <div>
                    <label className="block font-medium">Question</label>
                    <input
                      type="text"
                      placeholder="Enter Your Question"
                      value={currentQuestion}
                      onChange={(e) => {
                        console.debug("Question input changed:", e.target.value);
                        setCurrentQuestion(e.target.value);
                      }}
                      className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={questionRequired}
                      onChange={(e) => {
                        console.debug("Question required toggled to:", e.target.checked);
                        setQuestionRequired(e.target.checked);
                      }}
                      className="mr-2"
                    />
                    <label className="font-medium">Is this question required?</label>
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
                              console.debug(`Option ${index + 1} changed to:`, e.target.value);
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
                  )}
                </>
              )}
              <button
                onClick={handleAddQuestion}
                className="w-full px-4 py-2 mt-4 text-lg font-bold border rounded-lg hover:bg-gray-100"
              >
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
