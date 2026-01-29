"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, Trash2, UserPlus } from "lucide-react";

interface Volunteer {
  user_id: string;
  email: string;
  full_name: string;
  event_id: number;
}

interface VolunteerProps {
  event_id: number;
}

export default function Volunteer({ event_id }: VolunteerProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingVolunteer, setAddingVolunteer] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // Get access token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  // Define API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch volunteers for the current event
  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/volunteer/list/${event_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVolunteers(response.data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      toast.error("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, event_id, token]);

  useEffect(() => {
    if (event_id) {
      fetchVolunteers();
    }
  }, [event_id, fetchVolunteers]);

  // Add a volunteer using the POST endpoint
  const addVolunteer = async () => {
    if (!volunteerName.trim() || !volunteerEmail.trim()) {
      toast.error("Please enter name and email");
      return;
    }

    setAddingVolunteer(true);
    try {
      const payload = {
        event_id: event_id,
        full_name: volunteerName.trim(),
        email_id: volunteerEmail.trim(),
        phone: volunteerPhone.trim() || undefined,
      };

      await axios.post(
        `${API_BASE_URL}/api/v1/events/volunteer/add`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Volunteer added successfully");
      // Refresh the list after successful add
      fetchVolunteers();
      // Clear input fields
      setVolunteerName("");
      setVolunteerEmail("");
      setVolunteerPhone("");
    } catch (error: unknown) {
      console.error("Error adding volunteer:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add volunteer");
      }
    } finally {
      setAddingVolunteer(false);
    }
  };

  // Remove a volunteer using the DELETE endpoint
  const deleteVolunteer = async (email: string) => {
    setDeletingEmail(email);
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/events/volunteer/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { event_id: event_id, email_id: email },
      });
      toast.success("Volunteer removed successfully");
      // Refresh the volunteer list after removal
      fetchVolunteers();
    } catch (error: unknown) {
      console.error("Error removing volunteer:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to remove volunteer");
      }
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-2xl bebas font-semibold mb-4">MANAGE VOLUNTEERS</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Volunteer Form */}
        <div className="flex-1 bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Volunteer</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              placeholder="Full Name *"
              className="p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              disabled={addingVolunteer}
            />
            <input
              type="email"
              value={volunteerEmail}
              onChange={(e) => setVolunteerEmail(e.target.value)}
              placeholder="Email Address *"
              className="p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              disabled={addingVolunteer}
            />
            <input
              type="tel"
              value={volunteerPhone}
              onChange={(e) => setVolunteerPhone(e.target.value)}
              placeholder="Phone Number (optional)"
              className="p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              disabled={addingVolunteer}
            />
            <button
              onClick={addVolunteer}
              disabled={addingVolunteer || !volunteerName.trim() || !volunteerEmail.trim()}
              className="mt-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {addingVolunteer ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Volunteer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Volunteer List */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Current Volunteers ({volunteers.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : volunteers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No volunteers added yet
              </div>
            ) : (
              volunteers.map((v, index) => (
                <div
                  key={v.email || index}
                  className="p-4 bg-teal-600 rounded-lg flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="text-white font-medium truncate">
                      {v.full_name || "Unnamed"}
                    </div>
                    <div className="text-teal-100 text-sm truncate">
                      {v.email}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteVolunteer(v.email)}
                    disabled={deletingEmail === v.email}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                    aria-label="Remove volunteer"
                  >
                    {deletingEmail === v.email ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
