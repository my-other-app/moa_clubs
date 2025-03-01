import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

import '@/styles/globals.css';
import Sidebar from "@/components/sidebar";

type Category = {
  id: string;
  name: string;
};

export default function CreateEvent() {
  const [eventPoster, setEventPoster] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_BASE_URL}/api/v1/events/categories/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data); // Assuming API returns an array of categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventPoster(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <Sidebar />
      <div className="max-w-4xl mx-auto p-6 rounded-lg font-sans">
        <h1 className="text-3xl font-bold mb-6">CREATE NEW EVENT</h1>

        <h2 className="text-lg font-semibold">BASIC INFORMATION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex flex-col">
              <h3>Event Title</h3>
              <input type="text" placeholder="Enter Your Event Title" className="p-2 border rounded" />
            </div>

            <div className="flex flex-col">
              <h3>Event Category</h3>
              <select
                className="p-2 border rounded"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Choose Event Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <h3>Event Seats</h3>
              <input type="text" placeholder="Enter the available seats for the event" className="p-2 border rounded" />
            </div>
          </div>

          <div>
            <div className="flex flex-col">
              <h3>Event Description</h3>
              <textarea placeholder="Enter Event Description" className="p-2 border rounded"></textarea>
            </div>

            <div className="flex flex-col items-center">
              <label htmlFor="eventPoster" className="p-2 rounded cursor-pointer flex items-center justify-center">
                {eventPoster ? (
                  <Image src={eventPoster} width={50} height={50} alt="Event Poster" className="w-full h-full object-cover rounded" />
                ) : (
                  <div>
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" fill="#F3F3F3" />
                      <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" stroke="#979797" strokeWidth="0.5" />
                      <path
                        d="M51 32H41.6C38.2397 32 36.5595 32 35.2761 32.654C34.1471 33.2292 33.2292 34.1471 32.654 35.2761C32 36.5595 32 38.2397 32 41.6V58.4C32 61.7603 32 63.4405 32.654 64.7239C33.2292 65.8529 34.1471 66.7708 35.2761 67.346C36.5595 68 38.2397 68 41.6 68H60C61.8599 68 62.7899 68 63.5529 67.7956C65.6235 67.2408 67.2408 65.6235 67.7956 63.5529C68 62.7899 68 61.8599 68 60M64 42V30M58 36H70M47 43C47 45.2091 45.2091 47 43 47C40.7909 47 39 45.2091 39 43C39 40.7909 40.7909 39 43 39C45.2091 39 47 40.7909 47 43ZM55.9801 49.8363L39.0623 65.2161C38.1107 66.0812 37.6349 66.5137 37.5929 66.8884C37.5564 67.2132 37.6809 67.5353 37.9264 67.7511C38.2096 68 38.8526 68 40.1386 68H58.912C61.7903 68 63.2295 68 64.3598 67.5164C65.7789 66.9094 66.9094 65.7789 67.5164 64.3598C68 63.2295 68 61.7903 68 58.912C68 57.9435 68 57.4593 67.8941 57.0083C67.7611 56.4416 67.5059 55.9107 67.1465 55.4528C66.8605 55.0884 66.4824 54.7859 65.7261 54.1809L60.1317 49.7053C59.3748 49.0998 58.9963 48.7971 58.5796 48.6902C58.2123 48.596 57.8257 48.6082 57.4651 48.7254C57.0559 48.8583 56.6973 49.1843 55.9801 49.8363Z"
                        stroke="#979797"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                <input id="eventPoster" type="file" className="hidden" onChange={handlePosterUpload} />
              </label>
              <h3>Add Event Poster</h3>
            </div>
          </div>
        </div>
  
        <h2 className="text-lg font-semibold mt-6">DATE AND TIME</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col ">
        <h3>Event date</h3>
        <input type="date" className="p-2 border rounded" placeholder="Choose Event Date" />
        </div>
        <div className="flex flex-col ">
        <h3>Event Start Time</h3>
        <input type="time" className="p-2 border rounded" placeholder="Choose Event Time" />
        </div>
        <div className="flex flex-col ">
        <h3>Event Duration</h3>
        <input type="number" placeholder="Choose Event Duration Hours" className="p-2 border rounded" />
        </div>
        <div className="flex flex-col ">
        <h3>Event Registration Closing Date</h3>
        <input type="date" className="p-2 border rounded" placeholder="Choose Event Date" />
        </div>
        <div className="flex flex-col ">
        <h3>Event Registrariont Closing Time</h3>
        <input type="time" className="p-2 border rounded" placeholder="Choose Event Time" />
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mt-6">LOCATION AND MODE</h2>
      <div className="grid grid-cols-3 gap-4">
        <select className="p-2 border rounded">
          <option>Online/Offline</option>
        </select>
        <input type="text" placeholder="Choose Event Location" className="p-2 border rounded" />
        <input type="url" placeholder="Enter Meet Link" className="p-2 border rounded" />
      </div>
      
      <h2 className="text-lg font-semibold mt-6">PERKS AND FEE</h2>
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="Enter The Fee" className="p-2 border rounded" />
        <input type="text" placeholder="Choose Event Location" className="p-2 border rounded" />
      </div>
      
      
      <textarea placeholder="Enter Event Guidelines" className="w-full p-2 border rounded mt-4"></textarea>




        <button className="mt-4 w-full py-2 bg-black text-white rounded">CONTINUE</button>
      </div>
    </>
  );
}
