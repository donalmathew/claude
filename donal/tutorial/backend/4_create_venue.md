#### create venue (CGPU only):
1. `POST: http://localhost:3000/api/venues`

2. ##### Headers:
    - Key: `Authorization`
    - Value: `Bearer YOUR_CGPU_TOKEN` (use the token you got when logging in as CGPU)

3. ##### Body(raw)(JSON):
```json
{
    "name": "Main Auditorium",
    "capacity": 500,
    "features": ["projector", "audio_system", "air_conditioning"]
}
```

##### another venue:
```json
{
    "name": "Seminar Hall",
    "capacity": 100,
    "features": ["projector", "whiteboard"]
}
```
