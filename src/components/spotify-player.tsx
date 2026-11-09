"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { ExternalLink, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SpotifyTrack } from "@/lib/mock-data";

type PlayerResponse = {
  mode?: string;
  track?: SpotifyTrack | null;
  message?: string;
  needsAuth?: boolean;
  error?: string;
  premiumHint?: boolean;
};

type Props = {
  spotifyAvailable: boolean;
  connected: boolean;
};

export function SpotifyPlayer({ spotifyAvailable, connected }: Props) {
  const [data, setData] = useState<PlayerResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/player");
      const json = (await res.json()) as PlayerResponse;
      setData(json);
      setLocalPlaying(Boolean(json.track?.isPlaying));
    } catch {
      setData({
        message: "Could not load Spotify status.",
        error: "network",
      });
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(id);
  }, [load]);

  async function toggle() {
    setBusy(true);
    const next = !localPlaying;
    try {
      const res = await fetch("/api/spotify/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ play: next }),
      });
      const json = await res.json();
      if (json.ok) {
        setLocalPlaying(next);
      } else if (json.premiumRequired || json.message) {
        setData((prev) => ({
          ...prev,
          message: json.message ?? prev?.message,
          premiumHint: true,
        }));
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const track = data?.track;

  return (
    <div className="flex items-center gap-3 border-t border-[color:var(--film-line)] bg-[color:var(--film-panel)] px-4 py-3">
      <div className="relative size-12 shrink-0 overflow-hidden border border-[color:var(--film-line)] bg-[color:var(--film-well)]">
        {track?.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-[10px] text-[color:var(--fog)]">
            SP
          </div>
        )}
        {localPlaying && (
          <span className="absolute inset-x-1 bottom-1 flex h-1 gap-0.5">
            <span className="eq-bar flex-1 bg-[color:var(--amber)]" />
            <span className="eq-bar flex-1 bg-[color:var(--amber)] [animation-delay:120ms]" />
            <span className="eq-bar flex-1 bg-[color:var(--amber)] [animation-delay:240ms]" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[color:var(--paper)]">
          {track?.name ?? "No track"}
        </p>
        <p className="truncate text-xs text-[color:var(--fog)]">
          {track?.artists ?? "Connect Spotify to score your edit"}
        </p>
        {data?.message && (
          <p className="mt-0.5 truncate text-[11px] text-[color:var(--amber-dim)]">
            {data.message}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {spotifyAvailable && !connected ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-[color:var(--film-line)]"
            onClick={() => signIn("spotify", { callbackUrl: "/editor" })}
          >
            Connect
          </Button>
        ) : (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="border-[color:var(--film-line)]"
            disabled={busy || !track}
            onClick={() => void toggle()}
            aria-label={localPlaying ? "Pause" : "Play"}
          >
            {localPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </Button>
        )}
        {track?.externalUrl && (
          <a
            href={track.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-7 items-center justify-center border border-[color:var(--film-line)] text-[color:var(--fog)] transition-colors hover:text-[color:var(--amber)]"
            aria-label="Open in Spotify"
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
