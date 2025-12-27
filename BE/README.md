# Backend (BE)

Development backend for MedBlock.

## Run

1. Ensure `.env` contains `RPC_URL` and other env vars.
2. Place Firebase service account at `config/firebase.json`.

Run:

```bash
cd BE
go run ./cmd
```

Backend exposes API used by the frontend at `http://localhost:8080/api/medical-record`:

- POST `/api/medical-record/` - create medical record (requires `X-Message` and `X-Signature` headers)
- GET `/api/medical-record/` - list records

CORS is enabled for common local dev origins. Adjust in `cmd/main.go` for production.
