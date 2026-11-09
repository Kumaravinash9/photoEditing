import { SAMPLE_TRACK, type SpotifyTrack } from "@/lib/mock-data";

export async function getNowPlaying(accessToken: string): Promise<SpotifyTrack | null> {
  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify now-playing failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const item = data.item;
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    artists: (item.artists ?? []).map((a: { name: string }) => a.name).join(", "),
    albumArt: item.album?.images?.[0]?.url ?? null,
    uri: item.uri,
    externalUrl: item.external_urls?.spotify ?? "https://open.spotify.com",
    isPlaying: Boolean(data.is_playing),
    progressMs: data.progress_ms ?? 0,
    durationMs: item.duration_ms ?? 0,
  };
}

export async function getRecentlyPlayed(accessToken: string): Promise<SpotifyTrack | null> {
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0]?.track;
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    artists: (item.artists ?? []).map((a: { name: string }) => a.name).join(", "),
    albumArt: item.album?.images?.[0]?.url ?? null,
    uri: item.uri,
    externalUrl: item.external_urls?.spotify ?? "https://open.spotify.com",
    isPlaying: false,
    progressMs: 0,
    durationMs: item.duration_ms ?? 0,
  };
}

export async function togglePlayback(
  accessToken: string,
  play: boolean,
): Promise<{ ok: boolean; premiumRequired?: boolean; message?: string }> {
  const endpoint = play
    ? "https://api.spotify.com/v1/me/player/play"
    : "https://api.spotify.com/v1/me/player/pause";
  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 204 || res.ok) return { ok: true };
  if (res.status === 403 || res.status === 404) {
    return {
      ok: false,
      premiumRequired: true,
      message:
        "Spotify Premium and an active device are required for in-app playback. Open Spotify instead.",
    };
  }
  const text = await res.text();
  return { ok: false, message: text || `Playback failed (${res.status})` };
}

export function sampleSpotifyState() {
  return {
    mode: "sample" as const,
    track: SAMPLE_TRACK,
    premiumHint: true,
  };
}
