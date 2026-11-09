export type DrivePhoto = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl: string;
  url: string;
  source: "drive" | "sample";
};

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: string;
  albumArt: string | null;
  uri: string;
  externalUrl: string;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
};

export const APP_FOLDER_NAME = "Lumen Darkroom";

export const SAMPLE_PHOTOS: DrivePhoto[] = [
  {
    id: "sample-harbor",
    name: "harbor-morning.jpg",
    mimeType: "image/svg+xml",
    thumbnailUrl: "/samples/harbor.svg",
    url: "/samples/harbor.svg",
    source: "sample",
  },
  {
    id: "sample-forest",
    name: "pine-ridge.jpg",
    mimeType: "image/svg+xml",
    thumbnailUrl: "/samples/forest.svg",
    url: "/samples/forest.svg",
    source: "sample",
  },
  {
    id: "sample-portrait",
    name: "studio-window.jpg",
    mimeType: "image/svg+xml",
    thumbnailUrl: "/samples/portrait.svg",
    url: "/samples/portrait.svg",
    source: "sample",
  },
  {
    id: "sample-street",
    name: "neon-alley.jpg",
    mimeType: "image/svg+xml",
    thumbnailUrl: "/samples/street.svg",
    url: "/samples/street.svg",
    source: "sample",
  },
  {
    id: "sample-desert",
    name: "dune-hour.jpg",
    mimeType: "image/svg+xml",
    thumbnailUrl: "/samples/desert.svg",
    url: "/samples/desert.svg",
    source: "sample",
  },
  {
    id: "sample-flower",
    name: "glasshouse.jpg",
    mimeType: "image/svg+xml",
    thumbnailUrl: "/samples/flower.svg",
    url: "/samples/flower.svg",
    source: "sample",
  },
];

export const SAMPLE_TRACK: SpotifyTrack = {
  id: "sample-track",
  name: "Amber Exposure",
  artists: "Darkroom Ensemble",
  albumArt: "/samples/album.svg",
  uri: "spotify:track:sample",
  externalUrl: "https://open.spotify.com",
  isPlaying: false,
  progressMs: 42000,
  durationMs: 214000,
};

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function spotifyConfigured(): boolean {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export function authSecretConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET);
}
