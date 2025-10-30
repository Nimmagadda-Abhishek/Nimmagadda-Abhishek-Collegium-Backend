# Firebase Credentials for Authentication

The Firebase credentials required for authentication in this backend project are environment variables that need to be set in your `.env` file. These are used to initialize the Firebase Admin SDK for verifying ID tokens from Firebase Authentication.

Based on the code in `controllers/authController.js`, the required Firebase credentials (from a Firebase service account key JSON) are:

- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_AUTH_URI`
- `FIREBASE_TOKEN_URI`
- `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`
- `FIREBASE_CLIENT_X509_CERT_URL`

## How to Obtain These Credentials

1. Go to the Firebase Console.
2. Select your project.
3. Navigate to Project Settings > Service Accounts.
4. Generate a new private key (JSON file).
5. Copy the values from the JSON into your `.env` file as the above variables.

Ensure `FIREBASE_PRIVATE_KEY` is not set to a placeholder like 'your-private-key'; it must be the actual private key string.
