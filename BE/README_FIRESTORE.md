# Firestore Setup for MedBlock Backend

This document explains how to enable Firestore persistence for the backend, how data is structured, and how to run the migration script.

## Overview
- The backend uses a service account to connect to Firestore. The service account JSON should be placed at `BE/config/firebase.json` or you can set `GOOGLE_APPLICATION_CREDENTIALS` pointing to the file.
- Firestore is optional — the backend falls back to an in-memory store when Firestore is not configured.

## Steps to enable
1. Create a Firebase project and enable Firestore (Native mode).
2. In Firebase Console → Project Settings → Service accounts → Generate new private key. Save the JSON file.
3. Place the JSON at `BE/config/firebase.json` (recommended) OR set environment variable:

```powershell
setx GOOGLE_APPLICATION_CREDENTIALS "D:\path\to\service-account.json"
```

4. Ensure the service account has Firestore access (roles/datastore.user or Firestore Owner).
5. Set `JWT_SECRET` env var for token signing in production.

## Firestore collections
- `users` (document id = wallet address in lowercase)
  - `wallet`: string
  - `name`: string
  - `role`: string ("patient" | "doctor")
  - `created_at`: timestamp
  - `last_login`: timestamp
  - `nonce`: string (challenge nonce)

- `medical_records`
  - `patient_wallet`, `doctor_wallet`, `hash`, `ipfs_cid`, `data_preview`, `created_at`

## Security rules
A recommended approach is to deny client direct writes and let the backend (service account) handle all writes. See `BE/config/firestore.rules` for a sample.

## Migration script
- Place a JSON array of users in `BE/data/users_seed.json` and run the migration tool to persist them to Firestore.

### Example users_seed.json
```
[
  {
    "wallet": "0xAbC...",
    "name": "John Doe",
    "role": "patient"
  }
]
```

### Run migration
From `BE` folder:

```powershell
cd d:\Project\Medblock\BE
go run ./migrations/migrate_users.go
```

## Notes
- Do NOT commit `config/firebase.json` to source control. Add it to `.gitignore`.
- The backend will log Firestore operations to `logs/medblock.log`.

If you want, I can implement automatic nonce generation and a "request nonce" endpoint for more secure login flows.