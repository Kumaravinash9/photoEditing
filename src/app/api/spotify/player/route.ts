import { auth } from "@/lib/auth";
import {
  getNowPlaying,
  getRecentlyPlayed,
  sampleSpotifyState,
  togglePlayback,
} from "@/lib/spotify";
import { spotifyConfigured } from "@/lib/mock-data";


export async function GET() {
  try {
    if (!spotifyConfigured()) {
      return Response.json({
        ...sampleSpotifyState(),
        message: "Sample player — add Spotify OAuth secrets to connect.",
      });
    }

    const session = await auth();
    if (!session?.spotifyAccessToken) {
      return Response.json({
        ...sampleSpotifyState(),
        mode: "disconnected",
        needsAuth: true,
        message: "Connect Spotify to control playback while you edit.",
      });
    }

    const track =
      (await getNowPlaying(session.spotifyAccessToken)) ??
      (await getRecentlyPlayed(session.spotifyAccessToken));

    return Response.json({
      mode: "live",
      track,
      message: track
        ? undefined
        : "No recent playback. Start a track in Spotify, then refresh.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spotify failed";
    return Response.json(
      {
        ...sampleSpotifyState(),
        error: message,
        message: "Could not reach Spotify — showing sample track.",
      },
      { status: 200 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const play = Boolean(body?.play);

    if (!spotifyConfigured()) {
      return Response.json({
        ok: true,
        mode: "sample",
        track: sampleSpotifyState().track
          ? { ...sampleSpotifyState().track, isPlaying: play }
          : null,
      });
    }

    const session = await auth();
    if (!session?.spotifyAccessToken) {
      return Response.json({ ok: false, needsAuth: true }, { status: 401 });
    }

    const result = await togglePlayback(session.spotifyAccessToken, play);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Playback failed";
    return Response.json({ ok: false, message }, { status: 500 });
  }
}
