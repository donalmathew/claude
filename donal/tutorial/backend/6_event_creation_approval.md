

Let's test this sequence:
1. Create an event as IEEE Computer Society
2. Check pending approvals for IEEE
3. Approve it as IEEE
4. Check pending approvals for College
5. Approve it as College

Here are the requests:

1. First, login as CS001 (IEEE Computer Society):
```bash
POST http://localhost:3000/api/organizations/login
{
    "orgId": "CS001",
    "password": "cs123"
}
```

2. Create an event (use the token you got from CS001 login):
```bash
POST http://localhost:3000/api/events
Headers: 
  Authorization: Bearer <CS001_TOKEN>

Body:
{
    "name": "Tech Workshop 2024",
    "dateTime": "2024-03-01T09:00:00Z",
    "venue": "<MAIN_AUDITORIUM_ID>",
    "budget": 5000,
    "description": "A workshop on emerging technologies",
    "expectedParticipants": 100,
    "requiredResources": ["projector", "audio_system"]
}
```

3. Login as IEEE and check pending approvals:
```bash
GET http://localhost:3000/api/events/pending
Headers:
  Authorization: Bearer <IEEE_TOKEN>
```

4. Approve as IEEE:
```bash
PUT http://localhost:3000/api/events/<EVENT_ID>/review
Headers:
  Authorization: Bearer <IEEE_TOKEN>
Body:
{
    "status": "approved",
    "comments": "Approved by IEEE"
}
```
