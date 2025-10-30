# Profile Management API Specification

This document describes how the server expects data from the frontend for profile management operations. Users can create and update their profiles with additional information like bio, year, image, and social media links.

## Create/Update Profile Endpoint

- **Route**: `POST /profile`
- **Method**: `POST`
- **Authentication**: Required (JWT token in Authorization header)
- **Content-Type**: `multipart/form-data` (for image upload) or `application/json`
- **Expected Request Body** (multipart/form-data):

```
profileImage: [File] (image file)
bio: "A passionate software developer..."
branch: "Computer Science"
year: "3rd Year"
githubUsername: "johndoe"
linkedinUrl: "https://linkedin.com/in/johndoe"
```

- **Expected Request Body** (application/json, if not uploading image):

```json
{
  "profileImage": "https://example.com/profile-image.jpg",
  "bio": "A passionate software developer...",
  "branch": "Computer Science",
  "year": "3rd Year",
  "githubUsername": "johndoe",
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```

- **Required Fields**: `bio`, `branch`, `year` (profileImage is optional)
- **Field Descriptions**:
  - `profileImage`: URL or path to the user's profile image
  - `bio`: User's biography or description
  - `branch`: Academic branch/department (e.g., "Computer Science", "Mechanical Engineering")
  - `year`: Academic year (e.g., "1st Year", "2nd Year", "Final Year")
  - `githubUsername`: GitHub username (will fetch profile data automatically)
  - `linkedinUrl`: LinkedIn profile URL

- **Response (Success - 200)**:

```json
{
  "message": "Profile updated successfully",
  "profile": {
    "_id": "profile_id",
    "user": "user_id",
    "profileImage": "https://example.com/profile-image.jpg",
    "bio": "A passionate software developer...",
    "branch": "Computer Science",
    "year": "3rd Year",
    "githubProfile": {
      "username": "johndoe",
      "profileData": {
        "login": "johndoe",
        "name": "John Doe",
        "bio": "Software Developer",
        "public_repos": 25,
        // ... other GitHub API data
      }
    },
    "linkedinProfile": {
      "url": "https://linkedin.com/in/johndoe",
      "profileData": null
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

- **Response (Error - 404)**:

```json
{
  "error": "User not found"
}
```

## Get Profile Endpoint

- **Route**: `GET /profile`
- **Method**: `GET`
- **Authentication**: Required (JWT token in Authorization header)
- **Response (Success - 200)**:

```json
{
  "profile": {
    "_id": "profile_id",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "displayName": "johndoe",
      "fullName": "John Doe",
      "collegeName": "Example University",
      "photoURL": "https://example.com/photo.jpg"
    },
    "profileImage": "https://example.com/profile-image.jpg",
    "bio": "A passionate software developer...",
    "branch": "Computer Science",
    "year": "3rd Year",
    "githubProfile": {
      "username": "johndoe",
      "profileData": {
        "login": "johndoe",
        "name": "John Doe",
        "bio": "Software Developer",
        "public_repos": 25,
        // ... other GitHub API data
      }
    },
    "linkedinProfile": {
      "url": "https://linkedin.com/in/johndoe",
      "profileData": null
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

- **Response (Error - 404)**:

```json
{
  "error": "Profile not found"
}
```

## Additional Notes on Profile Management

- **GitHub Integration**: When a `githubUsername` is provided, the server automatically fetches the user's GitHub profile data from the GitHub API and stores it
- **LinkedIn Integration**: Currently stores the LinkedIn URL. Full profile data fetching requires OAuth integration
- **Profile Updates**: The endpoint handles both creating new profiles and updating existing ones
- **User Reference**: Profiles are linked to users via the `user` field (ObjectId reference)
- **Optional Fields**: All profile fields are optional, allowing users to update their profiles incrementally
- **Authentication Required**: All profile endpoints require a valid JWT token obtained from login/signup

## Example Frontend Profile Implementation

### Making Authenticated Requests Helper
```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
```

### Update Profile Example (with image upload)
```javascript
const updateProfile = async (formData) => {
  try {
    const response = await makeAuthenticatedRequest('/profile', {
      method: 'POST',
      body: formData, // FormData object
    });

    const data = await response.json();
    console.log('Profile updated:', data);
  } catch (error) {
    console.error('Profile update failed:', error);
  }
};

// Usage with image upload
const formData = new FormData();
formData.append('profileImage', imageFile); // File object
formData.append('bio', 'Passionate developer with 2 years of experience');
formData.append('branch', 'Computer Science');
formData.append('year', '3rd Year');
formData.append('githubUsername', 'mygithub');
formData.append('linkedinUrl', 'https://linkedin.com/in/myprofile');

updateProfile(formData);
```

### Update Profile Example (without image upload)
```javascript
const updateProfile = async (profileData) => {
  try {
    const response = await makeAuthenticatedRequest('/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    console.log('Profile updated:', data);
  } catch (error) {
    console.error('Profile update failed:', error);
  }
};

// Usage without image upload
const profileData = {
  profileImage: 'https://example.com/my-image.jpg',
  bio: 'Passionate developer with 2 years of experience',
  branch: 'Computer Science',
  year: '3rd Year',
  githubUsername: 'mygithub',
  linkedinUrl: 'https://linkedin.com/in/myprofile'
};

updateProfile(profileData);
```

### Get Profile Example
```javascript
const getUserProfile = async () => {
  try {
    const response = await makeAuthenticatedRequest('/profile');
    const data = await response.json();
    console.log('User profile:', data.profile);
    return data.profile;
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};
```

### Partial Profile Update Example
```javascript
// Update only bio and year
const partialUpdate = {
  bio: 'Updated bio with new information',
  year: '4th Year'
};

updateProfile(partialUpdate);
