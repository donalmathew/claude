// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';

export default function DashboardPage() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const loadPendingEvents = async () => {
    try {
      const response = await api.get('/events/pending');
      setPendingEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleEventAction = async (eventId, status, comments = '') => {
    try {
      await api.put(`/events/${eventId}/review`, { status, comments });
      loadPendingEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-2xl mb-4">Pending Events</h2>
        <div className="grid gap-4">
          {pendingEvents.map((event) => (
            <div key={event._id} className="border p-4 rounded">
              <h3 className="font-bold">{event.name}</h3>
              <p>Created by: {event.createdBy.name}</p>
              <p>Date: {new Date(event.dateTime).toLocaleDateString()}</p>
              <p>Venue: {event.venue.name}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEventAction(event._id, 'approved')}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleEventAction(event._id, 'rejected')}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}