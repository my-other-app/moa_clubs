import React, { useEffect, useState } from "react";
import axios from "axios";

interface Volunteer {
  event_id: number;
  name: string;
  email_id: string;
  phone: string;
}

interface VolunteerProps {
  eventId: number;
}

export default function Volunteer({ eventId }: VolunteerProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");

  // Get access token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  // Define API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch volunteer list from API
  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/volunteer/list/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Assume response.data is an array of volunteers
      setVolunteers(response.data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchVolunteers();
    }
  }, [eventId]);

  // Add a volunteer using the POST endpoint
  const addVolunteer = async () => {
    if (volunteerName && volunteerEmail && volunteerPhone) {
      try {
        const payload = {
          event_id: eventId,
          name: volunteerName,
          email_id: volunteerEmail,
          phone: volunteerPhone,
        };

        await axios.post(`${API_BASE_URL}/api/v1/events/volunteer/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Refresh the list after successful add
        fetchVolunteers();
        // Clear input fields
        setVolunteerName("");
        setVolunteerEmail("");
        setVolunteerPhone("");
      } catch (error) {
        console.error("Error adding volunteer:", error);
      }
    }
  };

  // Remove a volunteer using the DELETE endpoint
  const deleteVolunteer = async (volunteerId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/events/volunteer/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { event_id: eventId, volunteer_id: volunteerId },
      });
      // Refresh the volunteer list after removal
      fetchVolunteers();
    } catch (error) {
      console.error("Error removing volunteer:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mt-6">VOLUNTEERS AND GUIDELINES</h2>
      <div className="flex justify-between">
        {/* Volunteer Form */}
        <div className="flex flex-col gap-4 items-center w-full p-3">
          <input
            type="text"
            value={volunteerName}
            onChange={(e) => setVolunteerName(e.target.value)}
            placeholder="Enter The Name"
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="email"
            value={volunteerEmail}
            onChange={(e) => setVolunteerEmail(e.target.value)}
            placeholder="Enter Email"
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="tel"
            value={volunteerPhone}
            onChange={(e) => setVolunteerPhone(e.target.value)}
            placeholder="Enter Phone Number"
            className="p-2 border rounded w-full"
            required
          />
          <button
            onClick={addVolunteer}
            className="mt-2 px-4 py-2 border border-black text-black hover:bg-black hover:text-white rounded text-2xl bebas"
          >
            ADD VOLUNTEER
          </button>
        </div>
        {/* Volunteer List (scrollable) */}
        <div className="mt-4 flex flex-col gap-1 overflow-y-auto max-h-52">
          {volunteers.map((v) => (
            <div
              key={v.event_id}
              className="h-24 p-4 bg-teal-600 rounded-lg flex items-center gap-3.5"
            >
              <div className="w-64 flex flex-col gap-1">
                <div className="text-white text-base font-light font-['DM Sans']">
                  {v.name}
                </div>
                <div className="text-white text-base font-light font-['DM Sans']">
                  {v.email_id}
                </div>
                <div className="text-white text-base font-light font-['DM Sans']">
                  {v.phone}
                </div>
              </div>
              <div
                onClick={() => deleteVolunteer(v.event_id)}
                className="cursor-pointer"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 49"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect y="0.5" width="48" height="48" rx="16" fill="#F3F3F3" />
                  <path
                    d="M21 15.5H27M15 18.5H33M31 18.5L30.2987 29.0193C30.1935 30.5975 30.1409 31.3867 29.8 31.985C29.4999 32.5118 29.0472 32.9353 28.5017 33.1997C27.882 33.5 27.0911 33.5 25.5093 33.5H22.4907C20.9089 33.5 20.118 33.5 19.4983 33.1997C18.9528 32.9353 18.5001 32.5118 18.2 31.985C17.8591 31.3867 17.8065 30.5975 17.7013 29.0193L17 18.5M22 23V28M26 23V28"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
