// src/pages/CreateEventPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Navbar from '../components/layout/Navbar';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dateTime: '',
    venue: '',
    budget: '',
    description: '',
    expectedParticipants: '',
    requiredResources: ['projector', 'audio_system'] // Default resources
  });

  useEffect(() => {
    // Load venues when component mounts
    const loadVenues = async () => {
      try {
        const response = await api.get('/venues');
        setVenues(response.data);
      } catch (err) {
        setError('Failed to load venues');
      }
    };

    loadVenues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Check if venue is available
      const availabilityResponse = await api.get(
        `/venue-bookings/check-availability/${formData.venue}?date=${formData.dateTime}`
      );

      if (availabilityResponse.data.length > 0) {
        setError('Venue is not available at this time');
        return;
      }

      // Create event
      await api.post('/events', {
        ...formData,
        budget: Number(formData.budget),
        expectedParticipants: Number(formData.expectedParticipants)
      });

      navigate('/my-events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Create New Event</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Event Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date and Time</label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Venue</label>
              <select
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a venue</option>
                {venues.map(venue => (
                  <option key={venue._id} value={venue._id}>
                    {venue.name} (Capacity: {venue.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Budget (in Rs)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Expected Participants</label>
              <input
                type="number"
                name="expectedParticipants"
                value={formData.expectedParticipants}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="4"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}