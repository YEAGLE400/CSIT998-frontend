# CSIT998 Speak Backend

This folder contains the local voice assistant backend used by `/speak`.

## Start from the project root

```bash
npm run dev:speak
```

## Start this backend only

```bash
cd speak-backend
uv sync
uv run server.py
```

Then start the Next.js app from the project root:

```bash
npm run dev
```

Open `http://localhost:3000/speak`.

The backend listens on `http://localhost:8000` and exposes the WebSocket at `/ws`.
Set `NEXT_PUBLIC_SPEAK_WS_URL` in the frontend if the backend runs somewhere else.
