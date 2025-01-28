i didnt get the path of files you said to update. you must tell me everything, as i am a complete beginner.
my current files are:

`src/pages/Dashboard.jsx`:
```
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/axios';
import CreateEventForm from '../components/events/CreateEventForm';

function Dashboard() {
  const { organization, logout } = useAuth();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [pendingResponse, myEventsResponse] = await Promise.all([
        api.get('/events/pending'),
        api.get('/events/my-events')
      ]);
      setPendingEvents(pendingResponse.data);
      setMyEvents(myEventsResponse.data);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (eventId, status) => {
    try {
      await api.put(`/events/${eventId}/review`, {
        status,
        comments: `${status} by ${organization.name}`
      });
      setPendingEvents(pendingEvents.filter(event => event._id !== eventId));
    } catch (err) {
      setError('Failed to update event');
    }
  };

  const handleEventCreated = (newEvent) => {
    setMyEvents([newEvent, ...myEvents]);
    setShowCreateForm(false);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Welcome, {organization.name}
          </h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded ${
                activeTab === 'pending'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Pending Approvals
            </button>
            <button
              onClick={() => setActiveTab('my-events')}
              className={`px-4 py-2 rounded ${
                activeTab === 'my-events'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              My Events
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Event
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === 'pending' ? (
          pendingEvents.length === 0 ? (
            <p className="text-gray-500">No pending events</p>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <h3 className="text-lg font-semibold">{event.name}</h3>
                  <p className="text-gray-600 mb-2">{event.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <p>
                      <span className="font-semibold">Date:</span>{' '}
                      {new Date(event.dateTime).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">Budget:</span> ₹{event.budget}
                    </p>
                    <p>
                      <span className="font-semibold">Participants:</span>{' '}
                      {event.expectedParticipants}
                    </p>
                    <p>
                      <span className="font-semibold">Created by:</span>{' '}
                      {event.createdBy.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(event._id, 'approved')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(event._id, 'rejected')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {myEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{event.name}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    event.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : event.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{event.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(event.dateTime).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Budget:</span> ₹{event.budget}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateForm && (
        <CreateEventForm
          onEventCreated={handleEventCreated}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
```

`src/components/CreateEventForm.jsx`:
```
import { useState, useEffect } from 'react';
import { api } from '../../lib/axios';

function CreateEventForm({ onEventCreated, onClose }) {
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dateTime: '',
    venue: '',
    budget: '',
    description: '',
    expectedParticipants: '',
    requiredResources: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available venues when component mounts
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      setVenues(response.data);
    } catch (err) {
      setError('Failed to fetch venues');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert requiredResources from comma-separated string to array
      const resources = formData.requiredResources
        ? formData.requiredResources.split(',').map(r => r.trim())
        : [];

      const response = await api.post('/events', {
        ...formData,
        requiredResources: resources,
        budget: Number(formData.budget),
        expectedParticipants: Number(formData.expectedParticipants)
      });

      onEventCreated(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              <label className="block text-gray-700 mb-2">Date & Time</label>
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
                {venues.map((venue) => (
                  <option key={venue._id} value={venue._id}>
                    {venue.name} (Capacity: {venue.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Budget (₹)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
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
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Required Resources (comma-separated)
              </label>
              <input
                type="text"
                name="requiredResources"
                value={formData.requiredResources}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="projector, audio system, chairs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventForm;
```.
help me quickly finish this project