# User Events API Documentation

## Overview
This documentation details the API endpoints available for users to manage their event registrations.

## Endpoints

### 1. View My Registrations
Retrieve a list of all events the current user is registered for.

- **URL:** `/api/events/my-registrations`
- **Method:** `GET`
- **Headers:**
    - `Authorization`: `Bearer <jwt_token>`
- **Response Parameters:**
    - `registrations`: Array of registration objects.
        - `eventId`: ID of the event.
        - `title`: Title of the event.
        - `date`: Date of the event.
        - `location`: Location of the event.
        - `banner`: URL to the event banner image.
        - `status`: Status of the event (active, closed, postponed).
        - `registeredAt`: Timestamp when the user registered.

**Example Request:**
```bash
curl -X GET http://localhost:4000/api/events/my-registrations \
  -H "Authorization: Bearer <your_token>"
```

**Example Response:**
```json
{
  "registrations": [
    {
      "eventId": "651234567890abcdef123456",
      "title": "Annual Tech Symposium",
      "date": "2023-11-15T09:00:00.000Z",
      "location": "Auditorium A",
      "banner": "https://res.cloudinary.com/.../image.jpg",
      "status": "active",
      "registeredAt": "2023-10-01T14:30:00.000Z"
    }
  ]
}
```

### 2. Verify Registration Details
Verify if the user is registered for a specific event and get detailed registration info. This can be used for displaying a "Ticket" or confirmation screen.

- **URL:** `/api/events/my-registrations/:eventId`
- **Method:** `GET`
- **Headers:**
    - `Authorization`: `Bearer <jwt_token>`
- **URL Params:**
    - `eventId`: The ID of the event to verify.

- **Success Response:**
    - `isRegistered`: `true`.
    - `registeredAt`: Timestamp of registration.
    - `event`: Object containing event details.
        - `id`: Event ID.
        - `title`: Event title.
        - `date`: Event date.
        - `location`: Event location.
        - `banner`: Event banner URL.
        - `organizedBy`: Name of the organizer.

**Example Response:**
```json
{
  "isRegistered": true,
  "registeredAt": "2023-10-01T14:30:00.000Z",
  "event": {
    "id": "651234567890abcdef123456",
    "title": "Annual Tech Symposium",
    "date": "2023-11-15T09:00:00.000Z",
    "location": "Auditorium A",
    "banner": "https://res.cloudinary.com/.../image.jpg",
    "organizedBy": "Computer Science Dept"
  }
}
```

- **Error Response (Not Registered):**
    - Code: `404 Not Found`
```json
{
  "isRegistered": false,
  "message": "Registration not found for this event"
}
```
