"use client";

import { useState, ChangeEvent } from "react";
import Sidebar from "@/app/components/sidebar";
import { ChevronLeft, ChevronDown, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/app/context/eventContext";
import { v4 as uuidv4 } from "uuid";

interface Question {
  type: string;
  text: string;
  options: string[];
  required: boolean;
}

export default function EditEvent() {
  const router = useRouter();
  const { eventData, setEventData, submitEvent } = useEvent();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([""]);
  const [questionType, setQuestionType] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionRequired, setQuestionRequired] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [warningMessage, setWarningMessage] = useState<string>("");

  const addOption = () => {
    setOptions([...options, ""]);
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

  const handleAddQuestion = () => {
    if (currentQuestion.trim() === "") return;
    const newQuestion: Question = {
      type: questionType,
      text: currentQuestion,
      options: questionType === "multipleChoice" ? options : [],
      required: questionRequired,
    };
    setQuestions([...questions, newQuestion]);
    console.log("Added Question:", newQuestion);
    // Reset input fields
    setCurrentQuestion("");
    setQuestionType("");
    setOptions([""]);
    setQuestionRequired(true);
  };

  const handleContinue = async () => {
    // Check if at least one question is added; if not, display a warning message.
    if (questions.length === 0) {
      setWarningMessage("Please add at least one question.");
      return;
    }
    // Clear warning message if validation passes.
    setWarningMessage("");

    // Map questions to the required format with unique keys
    const additionalDetailsArray = questions.map((q) => ({
      key: uuidv4(),
      label: q.text,
      field_type: q.type === "multipleChoice" ? "select" : "text",
      options: q.type === "multipleChoice" ? q.options : [],
      required: q.required,
      question: q.text,
      answer: ""
    }));

    console.log("Questions Array:", questions);
    console.log("Additional Details Array:", additionalDetailsArray);

    if (!eventData) {
      console.error("No event data found in context");
      return;
    }

    // Create an updated event data object with additional_details as an array.
    const updatedEventData = {
      ...eventData,
      additional_details: additionalDetailsArray,
    };

    console.log("Updated Event Data:", updatedEventData);

    // Update context and submit the event
    setEventData(updatedEventData);
    setLoading(true);
    try {
      const result = await submitEvent(updatedEventData);
      console.log("Event created:", result);
      router.push("/dashboard/events");
    } catch (error) {
      console.error("Error submitting event:", error);
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
        <h1 className="text-3xl font-bold">Add Additional Details</h1>
        <p className="text-gray-500">Add questions for the registration form</p>
        <div className="flex flex-row gap-12 items-start">
          <div className="mt-6 flex-1/2">
            <h2 className="font-bold text-lg">MANDATORY INFORMATION</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-medium">Participant Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Enter Your Name"
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block font-medium">Participant Email<span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block font-medium">Participant Number<span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="Enter Your Number"
                  required
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
                      <div className="text-sm text-gray-500">Required: {q.required ? "Yes" : "No"}</div>
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
                <>
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
                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={questionRequired}
                      onChange={(e) => setQuestionRequired(e.target.checked)}
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
        {warningMessage && (
          <div className="text-red-500 mt-4 text-center">{warningMessage}</div>
        )}
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
