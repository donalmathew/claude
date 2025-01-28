// src/components/events/VenueAvailabilityChecker.jsx
import { useState } from 'react';
import api from '../../lib/axios';

export default function VenueAvailabilityChecker({ venueId, selectedDate, onAvailabilityCheck }) {
  const [isChecking, setIsChecking] = useState(false);
  const [bookings, setBookings] = useState([]);

  const checkAvailability = async () => {
    if (!venueId || !selectedDate) return;
    
    setIsChecking(true);
    try {
      const response = await api.get(
        `/venue-bookings/check-availability/${venueId}?date=${selectedDate}`
      );
      setBookings(response.data);
      onAvailabilityCheck(response.data.length === 0);
    } catch (error) {
      console.error('Error checking availability:', error);
      onAvailabilityCheck(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={checkAvailability}
        disabled={isChecking || !venueId || !selectedDate}
        className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isChecking ? 'Checking...' : 'Check Availability'}
      </button>
      
      {bookings.length > 0 && (
        <div className="mt-2 text-red-600">
          <p>Venue is already booked during this time:</p>
          <ul className="list-disc ml-5">
            {bookings.map((booking, index) => (
              <li key={index}>
                {new Date(booking.startDateTime).toLocaleString()} - 
                {new Date(booking.endDateTime).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}