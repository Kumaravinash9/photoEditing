"use client";

import { cn } from "@/lib/utils";
import type { DrivePhoto } from "@/lib/mock-data";

type Props = {
  photos: DrivePhoto[];
  selectedId: string | null;
  onSelect: (photo: DrivePhoto) => void;
  loading?: boolean;
  message?: string | null;
  error?: string | null;
  folderName?: string;
  mode?: string;
};

export function PhotoGrid({
  photos,
  selectedId,
  onSelect,
  loading,
  message,
  error,
  folderName,
  mode,
}: Props) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-[color:var(--film-line)] bg-[color:var(--film-panel)]">
      <div className="border-b border-[color:var(--film-line)] px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--amber)]">
          Film roll
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[color:var(--paper)]">
          {folderName ?? "Lumen Darkroom"}
        </h2>
        <p className="mt-1 text-xs text-[color:var(--fog)]">
          {mode === "sample" ? "Sample gallery" : "Drive folder"}
          {photos.length ? ` · ${photos.length} frames` : ""}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse bg-[color:var(--film-well)]"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="rounded-md border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        {!loading && message && (
          <p className="mb-3 text-xs leading-relaxed text-[color:var(--fog)]">{message}</p>
        )}

        {!loading && photos.length === 0 && (
          <div className="rounded-md border border-dashed border-[color:var(--film-line)] px-3 py-8 text-center">
            <p className="text-sm text-[color:var(--paper)]">No photos yet</p>
            <p className="mt-2 text-xs text-[color:var(--fog)]">
              Drop images into the Lumen Darkroom folder in Google Drive, then refresh.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelect(photo)}
              className={cn(
                "group relative overflow-hidden border text-left transition-all duration-300",
                selectedId === photo.id
                  ? "border-[color:var(--amber)] ring-1 ring-[color:var(--amber)]"
                  : "border-[color:var(--film-line)] hover:border-[color:var(--amber-dim)]",
              )}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6 text-[10px] text-[color:var(--paper)]">
                {photo.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
