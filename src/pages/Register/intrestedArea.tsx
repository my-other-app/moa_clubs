import { useState } from "react";

const categories = [
  {
    title: "Academic",
    options: [
      "⌨️Coding", "🎨UI/UX", "📊Data Science", "👨‍💻Entrepreneurship",
      "💰Marketing", "💸Finance", "🤖AI/ML", "📈Analytics",
      "🔐Cybersecurity", "💈Product Management"
    ],
  },
  {
    title: "Creative",
    options: ["📷Photography", "🎶Music", "📽️Film", "🐰Animation", "📖Writing", "👗Fashion", "🎮Gaming"],
  },
  {
    title: "Emerging Trends",
    options: ["⛓️‍💥Blockchain", "🚀Space Exploration", "🥽VR/AR", "⚽E-Sports", "🌐Memes & Internet Culture", "📽️Content Creation"],
  },
];

export default function ClubSelection() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[50%] border border-gray-300">
        {/* Progress Bar */}
        <div className="flex justify-between mb-4">
          <div className="w-1/4 h-1 bg-green-500" />
          <div className="w-1/4 h-1 bg-green-500" />
          <div className="w-1/4 h-1 bg-gray-300" />
          <div className="w-1/4 h-1 bg-gray-300" />
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
                      key={option}
                      onClick={() => toggleSelection(option)}
                      aria-pressed={selected.includes(option)}
                      className={`px-3 py-1 rounded-full transition ${
                        selected.includes(option)
                          ? "bg-gray-700 text-white"
                          : "bg-white hover:bg-gray-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white p-2 rounded-lg font-semibold hover:bg-gray-800 mt-4"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
