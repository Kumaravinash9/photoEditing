"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { CanvasEditor } from "@/components/canvas-editor";
import { PhotoGrid } from "@/components/photo-grid";
import { SpotifyPlayer } from "@/components/spotify-player";
import { Button } from "@/components/ui/button";
import { MAHIMA_PHOTOS } from "@/lib/mahima-media";
import type { DrivePhoto } from "@/lib/mock-data";

type LibraryResponse = {
  folderId: string;
  folderName: string;
  photos: DrivePhoto[];
  mode: string;
  message?: string;
  error?: string;
  needsAuth?: boolean;
};

type OauthStatus = {
  google: boolean;
  spotify: boolean;
  demoOnly: boolean;
};

export function EditorWorkspace() {
  const requestedPhoto = useSearchParams().get("photo");
  const { data: session, status } = useSession();
  const [oauth, setOauth] = useState<OauthStatus | null>(null);
  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DrivePhoto | null>(null);

  useEffect(() => {
    void fetch("/api/oauth-status")
      .then((r) => r.json())
      .then(setOauth)
      .catch(() => setOauth({ google: false, spotify: false, demoOnly: true }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetch("/api/drive/photos")
      .then((r) => r.json())
      .then((data: LibraryResponse) => {
        if (cancelled) return;
        const photos = [
          ...MAHIMA_PHOTOS,
          ...data.photos.filter(
            (photo) => !MAHIMA_PHOTOS.some((item) => item.id === photo.id),
          ),
        ];
        setLibrary({ ...data, photos });
        setSelected((prev) => {
          if (prev && photos.some((photo) => photo.id === prev.id)) return prev;
          return (
            photos.find((photo) => photo.id === requestedPhoto) ??
            photos[0] ??
            null
          );
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLibrary({
          folderId: "sample-folder",
          folderName: "Lumen Darkroom",
          photos: [],
          mode: "sample",
          error: "Failed to load photos.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestedPhoto, session?.googleConnected]);

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--ink)] text-[color:var(--paper)]">
      <header className="flex items-center justify-between border-b border-[color:var(--film-line)] px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[color:var(--amber)]"
          >
            Lumen
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.24em] text-[color:var(--fog)] sm:inline">
            Darkroom
          </span>
        </div>
        <div className="flex items-center gap-2">
          {oauth?.google && !session?.googleConnected && (
            <Button
              size="sm"
              className="bg-[color:var(--amber)] text-[color:var(--ink)] hover:bg-[color:var(--amber-bright)]"
              onClick={() => signIn("google", { callbackUrl: "/editor" })}
              disabled={status === "loading"}
            >
              Connect Drive
            </Button>
          )}
          {session?.user && (
            <Button
              size="sm"
              variant="outline"
              className="border-[color:var(--film-line)]"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          )}
          {oauth?.demoOnly && (
            <span className="hidden text-[11px] uppercase tracking-[0.16em] text-[color:var(--amber-dim)] md:inline">
              Demo mode
            </span>
          )}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_1fr]">
        <div className="max-h-[40vh] lg:max-h-none">
          <PhotoGrid
            photos={library?.photos ?? []}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            loading={loading}
            message={library?.message}
            error={library?.error}
            folderName={library?.folderName}
            mode={library?.mode}
          />
        </div>
        <main className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 p-4 md:p-6">
            <CanvasEditor
              imageUrl={selected?.url ?? null}
              imageName={selected?.name}
            />
          </div>
          <SpotifyPlayer
            spotifyAvailable={Boolean(oauth?.spotify)}
            connected={Boolean(session?.spotifyConnected)}
          />
        </main>
      </div>
    </div>
  );
}
