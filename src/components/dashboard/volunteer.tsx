import React, { useState } from 'react'

interface Volunteer {
  name: string;
  email: string;
  phone: string;
}

export default function Volunteer() {
        const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // State for volunteer form input
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");

  const dltVolunteer = (index: number) => {
    setVolunteers(volunteers.filter((_, i) => i !== index));
  };
  

  const addVolunteer = () => {
    if (volunteerName && volunteerEmail && volunteerPhone) {
      setVolunteers([...volunteers, { name: volunteerName, email: volunteerEmail, phone: volunteerPhone }]);
      setVolunteerName(""); // Clear input fields
      setVolunteerEmail("");
      setVolunteerPhone("");
    }
  };



        const removeVolunteer = (index: number) => {
                setVolunteers(volunteers.filter((_, i) => i !== index));
              };
  return (
    <div>
        <h2 className="text-lg font-semibold mt-6">VOLUNTEERS AND GUIDELINES</h2>
      <div className="flex justify-between">
      <div className="flex flex-col gap-4 items-center w-full p-3">
        <input type="text" value={volunteerName} 
              onChange={(e) => setVolunteerName(e.target.value)}  placeholder="Enter The Name" className="p-2 border rounded w-full" />
        <input type="email" value={volunteerEmail} 
              onChange={(e) => setVolunteerEmail(e.target.value)} placeholder="Enter Email" className="p-2 border rounded w-full" />
        <input type="tel" value={volunteerPhone} 
              onChange={(e) => setVolunteerPhone(e.target.value)}  placeholder="Enter Phone Number" className="p-2 border rounded w-full" />
        <button onClick={addVolunteer}  className="mt-2 px-4 py-2 hover:text-white hover:bg-black border-black text-black border bebas text-2xl rounded">ADD VOLUNTEER</button>
      </div>
      <div className="mt-4 flex flex-col gap-1 overflow-y-auto max-h-52">
      {volunteers.map((v, index) => (

          <div data-layer="Frame 293" className="Frame293 h-24 p-4 bg-teal-600 rounded-lg justify-start items-center gap-3.5 inline-flex">
          <div data-layer="Frame 290" className="Frame290 w-64 flex-col justify-start items-start gap-1 inline-flex">
            <div  className=" self-stretch text-white text-base font-light font-['DM Sans']">{v.name}</div>
            <div  className="self-stretch text-white text-base font-light font-['DM Sans']">{v.email}</div>
            <div className="self-stretch text-white text-base font-light font-['DM Sans']">{v.phone}</div>
          </div>
          <div onClick={() => dltVolunteer(index)} data-svg-wrapper data-layer="Frame 291" className="Frame291">
          <svg width="48" height="48" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="0.5" width="48" height="48" rx="16" fill="#F3F3F3"/>
          <path d="M21 15.5H27M15 18.5H33M31 18.5L30.2987 29.0193C30.1935 30.5975 30.1409 31.3867 29.8 31.985C29.4999 32.5118 29.0472 32.9353 28.5017 33.1997C27.882 33.5 27.0911 33.5 25.5093 33.5H22.4907C20.9089 33.5 20.118 33.5 19.4983 33.1997C18.9528 32.9353 18.5001 32.5118 18.2 31.985C17.8591 31.3867 17.8065 30.5975 17.7013 29.0193L17 18.5M22 23V28M26 23V28" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          </div>
        </div>
        ))}
      </div>
      </div>
    </div>
  )
}
