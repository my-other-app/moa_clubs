import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EventData {
  name: string;
  poster?: File | null; // Optional file upload
  event_datetime: string;
  has_fee: boolean;
  reg_fee?: number | null;
  duration: number;
  location_name?: string | null;
  has_prize: boolean;
  prize_amount?: number | null;
  is_online: boolean;
  reg_startdate: string;
  reg_enddate?: string | null;
  about?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  url?: string | null;
  category_id: number;
  club_id?: number | null;
  interest_ids?: string | null;
  max_participants?: number | null;
  additional_details?: string | null;
}

export const createEvent = async (eventData: EventData): Promise<unknown> => {
  try {
    const formData = new FormData();

    formData.append('name', eventData.name);
    if (eventData.poster) {
      formData.append('poster', eventData.poster);
    }
    formData.append('event_datetime', eventData.event_datetime);
    formData.append('has_fee', String(eventData.has_fee));
    if (eventData.reg_fee !== undefined && eventData.reg_fee !== null) {
      formData.append('reg_fee', String(eventData.reg_fee));
    }
    formData.append('duration', String(eventData.duration));
    if (eventData.location_name) {
      formData.append('location_name', eventData.location_name);
    }
    formData.append('has_prize', String(eventData.has_prize));
    if (eventData.prize_amount !== undefined && eventData.prize_amount !== null) {
      formData.append('prize_amount', String(eventData.prize_amount));
    }
    formData.append('is_online', String(eventData.is_online));
    formData.append('reg_startdate', eventData.reg_startdate);
    if (eventData.reg_enddate) {
      formData.append('reg_enddate', eventData.reg_enddate);
    }
    if (eventData.about) {
      formData.append('about', eventData.about);
    }
    if (eventData.contact_phone) {
      formData.append('contact_phone', eventData.contact_phone);
    }
    if (eventData.contact_email) {
      formData.append('contact_email', eventData.contact_email);
    }
    if (eventData.url) {
      formData.append('url', eventData.url);
    }
    formData.append('category_id', String(eventData.category_id));
    if (eventData.club_id !== undefined && eventData.club_id !== null) {
      formData.append('club_id', String(eventData.club_id));
    }
    if (eventData.interest_ids) {
      formData.append('interest_ids', eventData.interest_ids);
    }
    if (eventData.max_participants !== undefined && eventData.max_participants !== null) {
      formData.append('max_participants', String(eventData.max_participants));
    }
    if (eventData.additional_details) {
      formData.append('additional_details', eventData.additional_details);
    }

    // Get access token from local storage
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.post(`${API_BASE_URL}/api/v1/events/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};
