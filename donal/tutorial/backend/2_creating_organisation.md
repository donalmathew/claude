#### creating organisation:
1. `POST: http://localhost:3000/api/organizations/register`

2. ##### Body(raw)(JSON):
```json
{
    "name": "College",
    "orgId": "COLLEGE001",
    "password": "college123",
    "level": 0,
    "isVenueManager": false,
    "parentOrganization": null
}
```
3. Click "Send"

4. You should get a response like:
```json
{
    "organization": {
        "id": "...",
        "name": "College",
        "orgId": "COLLEGE001",
        "level": 0,
        "isVenueManager": false
    },
    "token": "..."
}
```

Other orgs:
```json
{
    "name": "CGPU",
    "orgId": "CGPU001",
    "password": "cgpu123",
    "level": 1,
    "isVenueManager": true,
    "parentOrganization": null
}
```
```json
{
    "name": "IEEE",
    "orgId": "IEEE001",
    "password": "ieee123",
    "level": 1,
    "isVenueManager": false,
    "parentOrganization": null
}
```
```json
{
    "name": "IEEE Computer Society",
    "orgId": "CS001",
    "password": "cs123",
    "level": 2,
    "isVenueManager": false,
    "parentOrganization": "PASTE_IEEE_ID_HERE" //Note: Replace "PASTE_IEEE_ID_HERE" with the actual ID you received when creating IEEE.
}
```