
---
### **Flow of the Entire Implementation**
---

#### **1. Organization Registration/Login**
- **Purpose**: Organizations register themselves or log in to access the system.
- **Flow**:
  1. **Register**:
      - Endpoint: `POST /api/organizations/register`.
      - Input: Organization details (e.g., name, orgId, password).
      >`POST: http://localhost:3000/api/organizations/register`
      ```js
        {
            "name": "iedc",
            "orgId": "IEDC001",
            "password": "iedc123",
            "level": 1,
            "isVenueManager": false,
            "parentOrganization": null
        }
      ```
      - Steps:
        - Hash the password using `bcrypt.js`.
        - Save the organization in MongoDB.
        - Generate a JWT token for authentication.
      - Response: Token and organization details.
  2. **Login**:
      - Endpoint: `POST /api/organizations/login`.
      - Input: `orgId` and `password`.
      >`POST: http://localhost:3000/api/organizations/login`
      ```js
        {
            "orgId": "IEDC001",
            "password": "iedc123"
        }
      ```
      - Steps:
        - Verify credentials.
        - Generate and return a JWT token.

---

#### **2. Event Creation**
- **Purpose**: Organizations create events that must pass through the approval workflow.
- **Flow**:
  1. Endpoint: `POST /api/events`.
  2. Input:
        >`POST: http://localhost:3000/api/venues`
        ##### Headers:
        - Key: `Authorization`
        - Value: `Bearer YOUR_CGPU_TOKEN`
     ```json
     {
       "name": "MERN Workshop 2025",
       "dateTime": "2024-03-01T09:00:00Z",
       "venue": "MAIN_AUDITORIUM_ID",
       "budget": 5000,
       "description": "Workshop on MERN stack",
       "expectedParticipants": 100,
       "requiredResources": ["projector", "audio_system"]
     }
     ```
  3. Steps:
      - Use `auth.js` middleware to verify the organization’s token.
      - Create the event in the `Event` collection.
      - Build the **approval chain**:
         - Start with the event creator and traverse up the hierarchy to the college level.
         - Each organization in the chain is assigned a `pending` status.
      - Create a temporary venue booking for the event.

---

#### **3. Approval Workflow**
- **Purpose**: Organizations approve/reject events as they progress through the hierarchy.
- **Flow**:
  1. Endpoint: `PUT /api/events/:eventId/review`.
  2. Input:
     ```json
     {
       "status": "approved", // or 'rejected', 'needs_modification'
       "comments": "Approved by IEEE"
     }
     ```
  3. Steps:
      - Verify the token with `auth.js`.
      - Find the event and update the approval status for the organization.
      - If rejected:
         - Update the event’s status to `rejected`.
         - Cancel the venue booking.
      - If approved:
         - Check if all organizations in the chain have approved.
         - If yes, mark the event as `approved` and confirm the venue booking.

---

#### **4. Venue Management**
- **Purpose**: Handle venue details and availability.
- **Flow**:
  1. **Venue Creation**:
      - Endpoint: `POST /api/venues` (accessible only by the venue manager).
      - Input: Venue details (e.g., name, capacity, features).
      - Save venue data in the `Venue` collection.
  2. **Venue Booking**:
      - Temporary bookings are created when an event is submitted.
      - Confirmed bookings happen after final approval.


---

#### **5. Fetching Pending Approvals**
- **Purpose**: Organizations can view events waiting for their approval.
- **Flow**:
  1. Endpoint: `GET /api/events/pending`.
  2. Steps:
      - Verify the token with `auth.js`.
      - Fetch events where the current organization’s status in the approval chain is `pending`.
      - Return the event details.

---

### **High-Level Flow Diagram**

1. **Registration/Login**:
   - Organization → `/api/organizations/register` or `/api/organizations/login` → MongoDB.

2. **Event Creation**:
   - Organization → `/api/events` → Create Event, Approval Chain, and Temporary Venue Booking.

3. **Approval Workflow**:
   - Organization → `/api/events/:eventId/review` → Update Approval Status → Finalize Event or Cancel.

4. **Venue Management**:
   - Venue Manager → `/api/venues` → MongoDB.
   - Organizations → `/api/venue-bookings/check-availability/:venueId`.

5. **Fetch Pending Approvals**:
   - Organization → `/api/events/pending` → MongoDB → Response.

---
