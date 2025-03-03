'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useNavigate } from '@/app/utils/navigation';

// Categories with unique IDs
const categories = [
  {
    title: "Academic",
    options: [
      { id: 6, name: "💻Coding" },
      { id: 7, name: "🎨UI/UX" },
      { id: 8, name: "📊Data Science" },
      { id: 9, name: "👨‍💼Entrepreneurship" },
      { id: 10, name: "🏷️Marketing" },
      { id: 11, name: "💰Finance" },
      { id: 2, name: "🦾AI/ML" },
      { id: 12, name: "📈Analytics" },
      { id: 13, name: "🔒Cybersecurity" },
      { id: 14, name: "🏭Product Management" },
    ],
  },
  {
    title: "Creative",
    options: [
      { id: 15, name: "📸Photography" },
      { id: 16, name: "🎵Music" },
      { id: 17, name: "🎬Film" },
      { id: 18, name: "🐰Animation" },
      { id: 19, name: "✏️Writing" },
      { id: 20, name: "👗Fashion" },
      { id: 21, name: "🎮Gaming" },
    ],
  },
  {
    title: "Emerging Trends",
    options: [
      { id: 22, name: "🔗Blockchain" },
      { id: 23, name: "🥽VR/AR" },
      { id: 24, name: "🎭Memes & Internet Culture" },
      { id: 25, name: "🎥Content Creation" },
      { id: 26, name: "🎮E-Sports" },
      { id: 27, name: "🚀Space Exploration" },
    ],
  },
];

export default function IntrestedArea() {
  const { navigateTo } = useNavigate();
  const [selected, setSelected] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();

  // Load saved interests from sessionStorage when the component mounts
  useEffect(() => {
    try {
      const savedInterests = sessionStorage.getItem("selectedInterests");
      if (savedInterests) {
        const interestIds: number[] = JSON.parse(savedInterests); // Retrieve stored IDs
        const selectedInterests = categories
          .flatMap((category) => category.options)
          .filter((option) => interestIds.includes(option.id)); // Map IDs back to full objects

        setSelected(selectedInterests);
      }
    } catch (error) {
      console.error("Error parsing saved interests:", error);
    }
  }, []);

  // Toggle selection with max limit of 5
  const toggleSelection = (option: { id: number; name: string }) => {
    setSelected((prev) => {
      if (prev.some((item) => item.id === option.id)) {
        return prev.filter((item) => item.id !== option.id); // Remove if already selected
      } else if (prev.length < 5) {
        return [...prev, option]; // Add new selection
      }
      return prev;
    });
  };

  // Function to handle form submission
  const handleSubmit = () => {
    if (selected.length === 0) {
      alert("Please select at least one interest before continuing.");
      return;
    }

    // Extract only the IDs from selected interests and store them
    const interestIds = selected.map((item) => item.id);
    sessionStorage.setItem("selectedInterests", JSON.stringify(interestIds));

    // Navigate to the next page
    navigateTo('/register/collegeDetails');
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Back Button */}
      <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-600 cursor-pointer">
        &larr; Back
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg w-[45%] border-2 border-gray-700">
        
        {/* Progress Bar */}
        <div className="flex justify-center mb-2">
          <div className="w-1/10 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/10 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/10 h-1 bg-teal-500 mx-1"></div>
          <div className="w-1/10 h-1 bg-gray-300 mx-1"></div>
          <div className="w-1/10 h-1 bg-gray-300 mx-1"></div>
        </div>

        <div className="space-y-4 p-5 rounded-xl flex flex-col items-center">
          <h2 className="text-xl font-bold text-center mb-4">
            SELECT AREAS RELATED TO YOUR CLUB
          </h2>

          <div className="space-y-4 bg-gray-100 p-5 rounded-xl">
            {categories.map(({ title, options }) => (
              <div key={title}>
                <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleSelection(option)}
                      aria-pressed={selected.some((item) => item.id === option.id)}
                      disabled={selected.length >= 5 && !selected.some((item) => item.id === option.id)}
                      className={`px-3 py-1 rounded-full transition ${
                        selected.some((item) => item.id === option.id)
                          ? "border-green-600 border-2"
                          : "bg-white hover:bg-gray-300"
                      } ${selected.length >= 5 && !selected.some((item) => item.id === option.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className={`w-64 h-15 text-2xl bg-gray-700 text-white p-2 rounded-lg font-semibold hover:bg-gray-800 mt-4 ${
              selected.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
