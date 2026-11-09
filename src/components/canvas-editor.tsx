"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FlipHorizontal2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  FILTER_PRESETS,
  applyFilterToImageData,
  type FilterId,
} from "@/lib/filters";
import { cn } from "@/lib/utils";

type Snapshot = {
  before: string;
  after: string;
  filter: FilterId;
  intensity: number;
};

type Props = {
  imageUrl: string | null;
  imageName?: string;
};

export function CanvasEditor({ imageUrl, imageName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);
  const sourceDataRef = useRef<ImageData | null>(null);
  const [filter, setFilter] = useState<FilterId>("original");
  const [intensity, setIntensity] = useState(0.85);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      sourceRef.current = null;
      sourceDataRef.current = null;
      setSnapshot(null);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setFilter("original");
    setIntensity(0.85);
    setSnapshot(null);
    setCompare(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      sourceRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 1400;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      sourceDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setLoading(false);
    };
    img.onerror = () => {
      if (cancelled) return;
      setLoading(false);
      setError("Could not load this photo into the canvas.");
    };
    img.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceDataRef.current;
    if (!canvas || !source) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const next = applyFilterToImageData(source, filter, intensity);
    ctx.putImageData(next, 0, 0);
  }, [filter, intensity, imageUrl, loading]);

  function captureSnapshot() {
    const canvas = canvasRef.current;
    const source = sourceDataRef.current;
    if (!canvas || !source) return;
    const beforeCanvas = document.createElement("canvas");
    beforeCanvas.width = canvas.width;
    beforeCanvas.height = canvas.height;
    const bctx = beforeCanvas.getContext("2d");
    if (!bctx) return;
    bctx.putImageData(source, 0, 0);
    setSnapshot({
      before: beforeCanvas.toDataURL("image/png"),
      after: canvas.toDataURL("image/png"),
      filter,
      intensity,
    });
    setCompare(true);
  }

  function downloadResult() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    const base = (imageName ?? "lumen-edit").replace(/\.[^.]+$/, "");
    link.download = `${base}-${filter}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function reset() {
    setFilter("original");
    setIntensity(0.85);
    setSnapshot(null);
    setCompare(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-md border border-[color:var(--film-line)] bg-[color:var(--film-well)]">
        {!imageUrl && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--amber)]">
                Choose a frame
              </p>
              <p className="mt-2 max-w-sm text-sm text-[color:var(--fog)]">
                Select a photo from the strip to open it on the canvas.
              </p>
            </div>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-sm text-[color:var(--fog)]">
            Loading emulsion…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 px-6 text-center text-sm text-red-300">
            {error}
          </div>
        )}
        {compare && snapshot ? (
          <div className="grid h-full grid-cols-1 gap-px bg-[color:var(--film-line)] md:grid-cols-2">
            <figure className="relative bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshot.before}
                alt="Before"
                className="h-full w-full object-contain"
              />
              <figcaption className="absolute left-3 top-3 text-[11px] uppercase tracking-[0.2em] text-[color:var(--amber)]">
                Before
              </figcaption>
            </figure>
            <figure className="relative bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshot.after}
                alt="After"
                className="h-full w-full object-contain"
              />
              <figcaption className="absolute left-3 top-3 text-[11px] uppercase tracking-[0.2em] text-[color:var(--amber)]">
                After · {snapshot.filter}
              </figcaption>
            </figure>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className={cn(
              "mx-auto h-full max-h-[min(68vh,720px)] w-full object-contain transition-opacity duration-500",
              imageUrl ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setFilter(preset.id);
                setCompare(false);
              }}
              className={cn(
                "shrink-0 border px-3 py-2 text-left transition-colors duration-200",
                filter === preset.id
                  ? "border-[color:var(--amber)] bg-[color:var(--amber-soft)] text-[color:var(--amber)]"
                  : "border-[color:var(--film-line)] bg-transparent text-[color:var(--fog)] hover:border-[color:var(--amber-dim)] hover:text-[color:var(--paper)]",
              )}
            >
              <div className="text-xs font-medium tracking-wide">{preset.name}</div>
              <div className="text-[10px] opacity-70">{preset.description}</div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[color:var(--fog)]">
              <span>Intensity</span>
              <span>{Math.round(intensity * 100)}%</span>
            </div>
            <Slider
              value={[intensity]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value;
                setIntensity(typeof next === "number" ? next : 0.85);
                setCompare(false);
              }}
              disabled={filter === "original" || !imageUrl}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
              disabled={!imageUrl}
              className="border-[color:var(--film-line)] bg-transparent"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={captureSnapshot}
              disabled={!imageUrl || filter === "original"}
              className="border-[color:var(--film-line)] bg-transparent"
            >
              <FlipHorizontal2 className="size-3.5" />
              Before / After
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={downloadResult}
              disabled={!imageUrl}
              className="bg-[color:var(--amber)] text-[color:var(--ink)] hover:bg-[color:var(--amber-bright)]"
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </div>
        {snapshot && (
          <button
            type="button"
            className="text-left text-xs text-[color:var(--amber)] underline-offset-4 hover:underline"
            onClick={() => setCompare((v) => !v)}
          >
            {compare ? "Return to live canvas" : "Show saved before/after"}
          </button>
        )}
      </div>
    </div>
  );
}
