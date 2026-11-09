# Lumen — Darkroom photo editor

Web photo editor that connects to one Google Drive folder, applies Instagram-style film filters with before/after snapshots, and keeps Spotify playing while you edit.

## Features

- **Google Drive**: OAuth sign-in, creates/uses a `Lumen Darkroom` folder, grid of images
- **Canvas filters**: Clarendon, Juno, Lark, Valencia, Ludwig, Sierra + intensity + reset
- **Snapshots**: before/after compare and PNG download
- **Spotify**: compact player chrome (Premium for Web Playback; otherwise connect + open in Spotify)
- **Demo mode**: sample photos and a sample track when OAuth secrets are missing

## Run locally

```bash
npm install
npm run dev
```

Dev server: [http://127.0.0.1:3457](http://127.0.0.1:3457)

## Environment variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Auth.js session encryption secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |

### Redirect URIs

Configure these in the Google Cloud Console and Spotify Developer Dashboard (replace the host for production):

- Auth.js callback: `http://127.0.0.1:3457/api/auth/callback/google`
- Auth.js callback: `http://127.0.0.1:3457/api/auth/callback/spotify`

Google OAuth scope used: Drive file access for the app-created folder (`drive.file`).

Spotify scopes used: playback state, modify playback, streaming, profile.

Without Google/Spotify secrets the UI still runs on sample media so you can explore the editor.

## Scripts

- `npm run dev` — development on port **3457**
- `npm run build` — production build
- `npm run start` — start production server on port **3457**
- `npm run lint` — ESLint
