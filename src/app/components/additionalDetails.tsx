"use client";

import React, { useState, useEffect } from "react";

interface AdditionalDetail {
  key: string;
  label: string;
  field_type: string; // "select" for multiple-choice, "text" for short answer
  required: boolean;
  options: string[];
}

interface EventData {
  additional_details: AdditionalDetail[];
  // ... other fields of your event data
}

interface AdditionalDetailsProps {
  eventData: EventData;
}

export default function AdditionalDetails({ eventData }: AdditionalDetailsProps) {
  // Local state for the questions array
  const [questions, setQuestions] = useState<AdditionalDetail[]>([]);

  // Prepopulate questions from additional_details when eventData changes
  useEffect(() => {
    if (eventData && eventData.additional_details) {
      setQuestions(eventData.additional_details);
    }
  }, [eventData]);

  // Delete handler (placeholder)
  const handleDelete = (questionKey: string) => {
    // Remove the question from local state
    const updatedQuestions = questions.filter((q) => q.key !== questionKey);
    setQuestions(updatedQuestions);
    console.log(`Deleted question with key: ${questionKey}`);
    // TODO: Add API call or additional deletion logic if needed.
  };
 
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Additional Details</h2>
      {questions.length === 0 ? (
        <p className="text-gray-500">No questions found.</p>
      ) : (
        <ul className="space-y-4 w-full">
          {questions.map((detail) => (
            <li key={detail.key} className="border p-4 rounded shadow">
              <p className="font-medium"> 
                <span className="font-bold">Question:</span> {detail.label}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-bold">Type:</span> {detail.field_type}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-bold">Required:</span>{" "}
                {detail.required ? "Yes" : "No"}
              </p>
              {detail.field_type === "select" && detail.options.length > 0 && (
                <div>
                  <p className="font-bold mt-2">Options:</p>
                  <ul className="ml-4 list-disc">
                    {detail.options.map((option, idx) => (
                      <li key={idx} className="text-gray-700">
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => handleDelete(detail.key)}
                className="mt-4 text-red-600 hover:text-red-800 underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
