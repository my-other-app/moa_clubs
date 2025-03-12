"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Edit, Trash, Settings, Download, Search, Plus } from "lucide-react"
import Sidebar from "@/app/components/sidebar"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import VolunteerPopup from "./volunteer-popup"
import image from "./image.svg"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const getAccessToken = () => localStorage.getItem("accessToken")

// Sample data for demonstration
const registrations = Array(7).fill({
  id: "NEX25AA001",
  name: "Edwin Emmanuel Roy",
  email: "emmanuelroy162@gmail.com",
  phone: "8113859251",
  institution: "College of Engineering Trivandrum",
})

export default function DashScreen() {
  const [message, setMessage] = useState("")
  const [showVolunteerPopup, setShowVolunteerPopup] = useState(false)

  interface Event {
    id: number
    name: string
    poster?: {
      logo?: {
        medium: string
      }
      medium?: string
    }
  }

  const [events, setEvents] = useState<Event[]>([])
  const searchParams = useSearchParams()
  const event_id = searchParams.get("event_id")
  const parsedEventId = event_id ? Number.parseInt(event_id as string, 10) : 0

  // Function to fetch events from API
  const getEvents = async () => {
    try {
      const accessToken = getAccessToken()

      if (!accessToken) {
        console.warn("⚠️ No access token found! User might be logged out.")
        return []
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/events/list`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      // Set events state with items from the API response
      setEvents(response.data.items)
      return response.data.items
    } catch (error) {
      console.error("❌ Error fetching events:", error)
      return []
    }
  }

  // Fetch events once the component mounts
  useEffect(() => {
    getEvents()
  }, [event_id])

  // Find the event matching the event_id
  const currentEvent = events.find((event) => event.id === parsedEventId)

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add your message sending logic here
    console.log("Sending message:", message)

    // Reset message
    setMessage("")
  }

  const handleDownloadCSV = () => {
    // Add your CSV download logic here
    console.log("Downloading CSV for event ID:", parsedEventId)
  }

  return (
    <div className="flex min-h-screen md:px-12">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="bg-white rounded-tl-2xl rounded-bl-2xl p-8 min-h-[calc(100vh-3rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-5xl font-['Bebas_Neue'] tracking-wide">
              {currentEvent ? currentEvent.name : "SF SEA HACKATHON"}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <button className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center">
                <Edit className="w-6 h-6 text-[#979797]" />
              </button>
              <button className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center">
                <Trash className="w-6 h-6 text-[#979797]" />
              </button>
              <button className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center">
                <Settings className="w-6 h-6 text-[#979797]" />
              </button>
              <Button
                variant="default"
                className="h-12 px-4 py-2 bg-[#2c333d] rounded-lg flex items-center gap-2"
                onClick={() => setShowVolunteerPopup(true)}
              >
                <Plus className="w-5 h-5" />
                <span className="text-base font-medium font-['DM_Sans']">Add Volunteers</span>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Event Image */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <Image
                src={
                  image
                }
                alt="Event poster"
                width={600}
                height={600}
                className="rounded-lg w-full lg:w-[600px] h-auto object-cover"
              />
            </div>

            {/* Right Column - Stats and Announcements */}
            <div className="flex-1">
              {/* Stats Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <div className="h-[151px] px-4 sm:px-[60px] py-[29px] bg-[#b4e5bc] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="inline-flex justify-start items-center gap-2">
                      <div className="w-4 h-4 bg-[#096b5b] rounded-full" />
                      <div className="text-[#096b5b] text-[32px] font-medium font-['DM_Sans']">Live</div>
                    </div>
                    <div className="text-center text-[#096b5b] text-base font-light font-['DM_Sans']">
                      The event is live and registrations are open
                    </div>
                  </div>
                </div>
                <div className="h-[151px] px-4 sm:px-[60px] py-[27px] bg-[#ccc1f0] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="text-[#9747ff] text-4xl font-bold font-['DM_Sans']">24</div>
                    <div className="text-center text-[#9747ff] text-base font-light font-['DM_Sans']">
                      Total Registration Count
                    </div>
                  </div>
                </div>
                <div className="h-[151px] px-4 sm:px-[60px] py-10 bg-[#b8dff2] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="text-center text-[#0a4e6f] text-[32px] font-bold font-['DM_Sans']">234</div>
                    <div className="text-center text-[#0a4e6f] text-base font-light font-['DM_Sans']">
                      Event Visitors
                    </div>
                  </div>
                </div>
                <div className="h-[151px] px-4 sm:px-[60px] py-10 bg-[#f3aba7] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-between items-center">
                    <div className="text-[#cc0000] text-[32px] font-bold font-['DM_Sans']">2</div>
                    <div className="text-center text-[#cc0000] text-base font-light font-['DM_Sans']">Institutions</div>
                  </div>
                </div>
              </div>

              {/* Announcements Section */}
              <div className="w-full flex flex-col justify-start items-start gap-1 mb-8">
                <div className="text-black text-2xl font-normal font-['Bebas_Neue']">Make Announcements</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-1 w-full">
                  <div className="text-[#2c333d] text-xs font-normal font-['DM_Sans']">
                    Send message to the registered participants as notifications
                  </div>
                  <Textarea
                    placeholder="Enter the message send"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="self-stretch min-h-[160px] pl-2 pr-3.5 py-1.5 bg-white rounded-lg border border-[#2c333d] text-base font-medium w-full"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-60 h-[60px] px-[50px] py-[15px] bg-white rounded-lg border border-[#2c333d] mt-4"
                  onClick={handleSendMessage}
                >
                  <span className="text-center text-[#2c333d] text-2xl font-normal font-['Bebas_Neue']">
                    Send Message
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Registration Section */}
          <div className="mt-12">
            <div className="w-full flex flex-col justify-start items-start gap-4">
              <div className="self-stretch flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex justify-start items-start gap-9">
                  <div className="w-[145px] inline-flex flex-col justify-start items-center gap-1">
                    <div className="self-stretch text-center text-[#2c333d] text-xl font-medium font-['DM_Sans']">
                      Registration
                    </div>
                    <div className="w-[145px] h-0 border-b-[3px] border-[#2c333d]" />
                  </div>
                  <div className="text-[#b4b4b4] text-xl font-medium font-['DM_Sans']">Attendance</div>
                </div>
                <div className="flex flex-col sm:flex-row justify-start items-center gap-[18px] w-full md:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-3 w-6 h-6 text-[#979797]" />
                    <Input
                      placeholder="Search for events"
                      className="w-full sm:w-[401px] h-12 pl-12 bg-white rounded-lg border border-[#979797] text-base font-light"
                    />
                  </div>
                  <Button
                    variant="default"
                    className="h-12 px-4 py-2 bg-[#2c333d] rounded-lg flex items-center gap-4 w-full sm:w-auto"
                    onClick={handleDownloadCSV}
                  >
                    <Download className="w-4 h-5 text-white" />
                    <span className="text-white text-xs font-normal">Download CSV file</span>
                  </Button>
                </div>
              </div>

              {/* Registration Table */}
              <div className="w-full overflow-x-auto border border-[#979797] rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#b4e5bc]">
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        Registration ID
                      </th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        Participant Name
                      </th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">Email</th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">Number</th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        College Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg, index) => (
                      <tr key={index} className={index !== registrations.length - 1 ? "border-b border-[#979797]" : ""}>
                        <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">{reg.id}</td>
                        <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">{reg.name}</td>
                        <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">{reg.email}</td>
                        <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">{reg.phone}</td>
                        <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">
                          {reg.institution}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center w-full mt-4">
                <Button
                  variant="outline"
                  className="w-60 h-[60px] px-[50px] py-[15px] bg-white rounded-lg border border-[#2c333d]"
                >
                  <span className="text-center text-[#2c333d] text-2xl font-normal font-['Bebas_Neue']">Show All</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Volunteer Popup */}
          {showVolunteerPopup && (
            <VolunteerPopup event_id={parsedEventId} onClose={() => setShowVolunteerPopup(false)} />
          )}
        </div>
      </div>
    </div>
  )
}

