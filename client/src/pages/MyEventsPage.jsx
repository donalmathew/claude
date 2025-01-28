// Add Event Modification functionality
// src/pages/MyEventsPage.jsx
import { useState, useEffect } from 'react';
import api from '../lib/axios';
import Navbar from '../components/layout/Navbar';

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events/my-events');
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  const handleCancel = async (eventId) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    
    try {
      await api.put(`/events/${eventId}/cancel`);
      loadEvents();
    } catch (err) {
      setError('Failed to cancel event');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-xl mb-4">My Events</h2>
        
        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        <div className="space-y-4">
          {events.map(event => (
            <div key={event._id} className="border p-4">
              <h3 className="font-bold">{event.name}</h3>
              <div>Status: {event.status}</div>
              <div>Date: {new Date(event.dateTime).toLocaleString()}</div>
              <div>Venue: {event.venue.name}</div>
              
              <div className="mt-2">
                <h4 className="font-semibold">Approval Status:</h4>
                {event.approvalChain.map((approval, index) => (
                  <div key={index} className="ml-4">
                    • {approval.organization.name}: {approval.status}
                    {approval.comments && ` - ${approval.comments}`}
                  </div>
                ))}
              </div>

              {event.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancel(event._id)}
                  className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
                >
                  Cancel Event
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}