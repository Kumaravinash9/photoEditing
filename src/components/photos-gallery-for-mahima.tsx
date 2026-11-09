"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAHIMA_PHOTOS, MAHIMA_VIDEOS, type MahimaPhoto } from "@/lib/mahima-media";
import { TOOLS_ENABLED } from "@/lib/features";
import { cn } from "@/lib/utils";

type Slide = MahimaPhoto & {
  caption: string;
  notes: readonly [string, string];
  turn?: boolean;
};

const SLIDES: Slide[] = [
  {
    ...MAHIMA_PHOTOS[0],
    caption: "Soft, quiet, stunning.",
    notes: ["Graceful without even trying.", "Soft blue, and still the brightest thing here."],
  },
  {
    ...MAHIMA_PHOTOS[1],
    caption: "Stay just like this.",
    notes: ["Eyes closed, and still radiant.", "Calm, and quietly beautiful."],
  },
  {
    ...MAHIMA_PHOTOS[3],
    caption: "Hands up. The fairy lights stayed on.",
    turn: true,
    notes: ["Hands up, and effortlessly lovely.", "The lights shine. She shines more."],
  },
  {
    ...MAHIMA_PHOTOS[4],
    caption: "That little clap between songs.",
    turn: true,
    notes: ["Mid-clap, and still elegant.", "Joyful without even trying."],
  },
  {
    ...MAHIMA_PHOTOS[5],
    caption: "Laughing, and not stopping.",
    turn: true,
    notes: ["Laughing, and still glowing.", "Beautiful in every unguarded moment."],
  },
  {
    ...MAHIMA_PHOTOS[6],
    caption: "That face in the car.",
    turn: true,
    notes: ["Silly faces, and still adorable.", "Charming without even trying."],
  },
  {
    ...MAHIMA_PHOTOS[7],
    caption: "Closer. Mask down.",
    turn: true,
    notes: ["Up close, and still flawless.", "Sweet without even meaning to be."],
  },
  {
    ...MAHIMA_PHOTOS[2],
    caption: "Diyas on the floor, and that smile.",
    notes: ["Among the diyas, and still the warmest light.", "Radiant without even trying."],
  },
];

const NOTE_STYLE = [
  { rot: "-6deg", delay: "140ms" },
  { rot: "5deg", delay: "320ms" },
] as const;

const INTERVAL_MS = 5500;

const BALLOONS = [
  { shape: "heart", className: "left-[4%] w-14 md:left-[6%] md:w-16", fill: "#e7a0ab", duration: "16s", delay: "0s" },
  { shape: "oval", className: "left-[78%] w-12 md:left-[80%] md:w-16", fill: "#e8a44a", duration: "19s", delay: "-6s" },
  { shape: "heart", className: "left-[20%] w-10 md:left-[16%] md:w-14", fill: "#c45468", duration: "14s", delay: "-10s" },
  { shape: "heart", className: "left-[86%] w-12 md:left-[90%] md:w-12", fill: "#7a2840", duration: "21s", delay: "-3s" },
  { shape: "oval", className: "left-[58%] w-10 md:left-[76%] md:w-14", fill: "#f0c2c4", duration: "17s", delay: "-12s" },
  { shape: "heart", className: "left-[40%] w-8 md:left-[22%] md:w-10", fill: "#e7a0ab", duration: "23s", delay: "-16s" },
] as const;

function Rose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} aria-hidden>
      <path d="M40 58c2 18 1 36 0 52" stroke="#2f6a45" strokeWidth="2.2" fill="none" />
      <ellipse cx="24" cy="86" rx="12" ry="6" fill="#3f7a52" transform="rotate(-28 24 86)" />
      <ellipse cx="56" cy="96" rx="12" ry="6" fill="#2f6a45" transform="rotate(24 56 96)" />
      <ellipse cx="40" cy="46" rx="16" ry="11" fill="#c45468" />
      <ellipse cx="26" cy="36" rx="13" ry="10" fill="#f0c2c4" transform="rotate(-24 26 36)" />
      <ellipse cx="54" cy="34" rx="13" ry="10" fill="#e7a0ab" transform="rotate(22 54 34)" />
      <ellipse cx="40" cy="24" rx="11" ry="14" fill="#d46b7c" />
      <circle cx="40" cy="36" r="7" fill="#7a2840" />
    </svg>
  );
}

function Sunflower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 130" className={className} aria-hidden>
      <path d="M48 62c1 20 2 40 0 58" stroke="#3f7a52" strokeWidth="2.4" fill="none" />
      <ellipse cx="30" cy="96" rx="14" ry="7" fill="#6ea36a" transform="rotate(-32 30 96)" />
      <ellipse cx="66" cy="104" rx="14" ry="7" fill="#2f6a45" transform="rotate(28 66 104)" />
      {Array.from({ length: 12 }, (_, petal) => (
        <ellipse
          key={petal}
          cx="48"
          cy="22"
          rx="7"
          ry="14"
          fill={petal % 2 ? "#e8a44a" : "#f2c14e"}
          transform={`rotate(${petal * 30} 48 40)`}
        />
      ))}
      <circle cx="48" cy="40" r="12" fill="#6b3a16" />
      <circle cx="48" cy="40" r="7" fill="#8a4b18" />
    </svg>
  );
}

const BLOOMS = [
  {
    kind: "rose",
    className: "left-[-4%] top-[18%] w-24 md:left-[4%] md:top-[26%] md:w-24",
    delay: "0s",
    tilt: "-12deg",
  },
  {
    kind: "sunflower",
    className: "right-[-6%] top-[8%] w-28 md:right-[4%] md:top-[14%] md:w-28",
    delay: "-3s",
    tilt: "8deg",
  },
  {
    kind: "sunflower",
    className: "bottom-[6%] left-[-8%] w-32 md:bottom-[13%] md:left-[2%] md:w-32",
    delay: "-6s",
    tilt: "-6deg",
  },
  {
    kind: "rose",
    className: "right-[-3%] bottom-[8%] w-28 md:right-[14%] md:bottom-[14%] md:w-24",
    delay: "-2s",
    tilt: "10deg",
  },
  {
    kind: "rose",
    className: "left-[18%] bottom-[-4%] w-16 md:left-[15%] md:bottom-[14%] md:w-24",
    delay: "-8s",
    tilt: "4deg",
  },
  {
    kind: "sunflower",
    className: "left-[-2%] top-[-2%] w-16 md:left-auto md:right-[2%] md:top-auto md:bottom-[13%] md:w-32",
    delay: "-5s",
    tilt: "-8deg",
  },
] as const;

function Balloon({
  shape,
  className,
  fill,
  duration,
  delay,
}: {
  shape: "heart" | "oval";
  className: string;
  fill: string;
  duration: string;
  delay: string;
}) {
  return (
    <svg
      viewBox="0 0 80 168"
      className={cn("love-rise", className)}
      style={{ animationDuration: duration, animationDelay: delay, color: fill }}
      aria-hidden
    >
      {shape === "heart" ? (
        <>
          <path
            d="M40 80C12 60 4 38 14 24c8-11 22-10 26 2 4-12 18-13 26-2 10 14 2 36-26 56z"
            fill="currentColor"
          />
          <ellipse cx="25" cy="30" rx="6" ry="9" fill="#fff6ef" opacity="0.35" transform="rotate(-30 25 30)" />
        </>
      ) : (
        <>
          <ellipse cx="40" cy="46" rx="27" ry="36" fill="currentColor" />
          <ellipse cx="30" cy="32" rx="8" ry="13" fill="#fff6ef" opacity="0.35" />
        </>
      )}
      <path d="M32 78c5 7 11 7 16 0" fill="currentColor" />
      <path
        d="M40 86c8 18-10 28 0 46s-8 24 1 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.8"
      />
    </svg>
  );
}

type OauthStatus = {
  google: boolean;
  spotify: boolean;
  demoOnly: boolean;
};

export function PhotosGalleryForMahima() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [started, setStarted] = useState(false);
  const [oauth, setOauth] = useState<OauthStatus | null>(null);
  const { data: session } = useSession();
  const linked = {
    google: Boolean(session?.googleConnected),
    spotify: Boolean(session?.spotifyConnected),
  };
  const [editId, setEditId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const show = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    setActiveVideoId(null);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    void fetch("/api/oauth-status")
      .then((response) => response.json())
      .then(setOauth)
      .catch(() => setOauth({ google: false, spotify: false, demoOnly: true }));
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || activeVideoId) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeVideoId, paused, reducedMotion]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !activeVideoId) return;
    void node.play().catch(() => undefined);
  }, [activeVideoId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (event.key === "ArrowRight") show(index + 1);
      if (event.key === "ArrowLeft") show(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, show]);

  const editPhoto = SLIDES.find((photo) => photo.id === editId) ?? null;
  const activeVideo = MAHIMA_VIDEOS.find((video) => video.id === activeVideoId) ?? null;
  const notes = activeVideo ? activeVideo.notes : SLIDES[index].notes;

  function connect(provider: "google" | "spotify") {
    if (linked[provider]) {
      router.push("/editor");
      return;
    }
    if (oauth?.[provider]) {
      void signIn(provider, { callbackUrl: "/" });
    }
  }

  return (
    <section
      className="love-stage relative flex min-h-dvh flex-col overflow-hidden bg-[var(--love-night)] text-[var(--love-paper)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
      aria-roledescription="carousel"
      aria-label="Photos for Mahima"
    >
      {!activeVideo &&
        SLIDES.map((photo, photoIndex) => (
          <div
            key={photo.url}
            className={cn(
              "pointer-events-none fixed inset-0 z-0 transition-opacity duration-700",
              photoIndex === index ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={photoIndex !== index}
          >
            <div className={cn("absolute inset-0", !photo.turn && "hidden md:block")}>
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="240px"
                className="scale-110 object-cover blur-2xl brightness-[0.55] saturate-[1.2]"
              />
            </div>
            <div
              className={cn(
                "absolute inset-0 overflow-hidden",
                !photo.turn &&
                  "md:inset-y-0 md:left-1/2 md:right-auto md:aspect-[3/4] md:h-full md:-translate-x-1/2 md:shadow-[0_0_80px_rgba(20,8,12,0.55)]",
              )}
            >
              <div
                className={cn(
                  photo.turn
                    ? "absolute left-1/2 top-1/2 h-[100vw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 -rotate-90"
                    : "absolute inset-0",
                )}
              >
                <Image
                  src={photo.url}
                  alt={photoIndex === index ? photo.alt : ""}
                  fill
                  priority={photoIndex === 0}
                  sizes={photo.turn ? "100vh" : "(max-width: 768px) 100vw, 75vh"}
                  className={cn(
                    "love-photo",
                    photo.turn
                      ? "object-contain md:object-cover"
                      : "object-cover object-[center_38%] md:object-center",
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      {!activeVideo && (
        <div
          className="pointer-events-none fixed inset-0 z-[1]"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 32% 26% at 0% 0%, rgba(240,194,196,0.55), transparent 70%), radial-gradient(ellipse 34% 28% at 100% 0%, rgba(232,164,74,0.5), transparent 72%), radial-gradient(ellipse 36% 30% at 0% 100%, rgba(232,164,74,0.55), transparent 70%), radial-gradient(ellipse 34% 28% at 100% 100%, rgba(196,84,104,0.5), transparent 72%)",
          }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        aria-hidden
      >
          {BLOOMS.map((bloom) => (
            <span
              key={bloom.className}
              className={cn("love-balloon absolute block", bloom.className)}
              style={{ animationDelay: bloom.delay, rotate: bloom.tilt }}
            >
              {bloom.kind === "rose" ? (
                <Rose className="h-auto w-full" />
              ) : (
                <Sunflower className="h-auto w-full" />
              )}
            </span>
          ))}
          {BALLOONS.map((balloon) => (
            <Balloon key={balloon.className} {...balloon} />
          ))}
      </div>
      {activeVideo ? (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[100vw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 -rotate-90">
            <video
              key={activeVideo.src}
              ref={videoRef}
              src={activeVideo.src}
              autoPlay
              loop
              playsInline
              className="size-full object-contain md:object-cover"
              aria-label={activeVideo.label}
            />
          </div>
        </div>
      ) : null}
      <header
        className={cn(
          "relative z-20 flex shrink-0 items-start justify-between gap-4 bg-gradient-to-b from-[rgba(36,16,24,0.78)] via-[rgba(36,16,24,0.35)] to-transparent px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-8 md:px-10 md:pt-6",
        )}
      >
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-[2.35rem] leading-none tracking-tight text-[var(--love-paper)] sm:text-5xl md:text-6xl">
            Mahima
          </h1>
          <p
            key={activeVideo?.id ?? index}
            className="love-caption mt-1 max-w-[16rem] font-[family-name:var(--font-note)] text-[1.65rem] leading-tight text-[var(--love-paper)] sm:text-3xl"
          >
            {activeVideo ? activeVideo.caption : SLIDES[index].caption}
          </p>
        </div>
        {TOOLS_ENABLED && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/editor"
              className="font-[family-name:var(--font-note)] text-xl text-[var(--love-paper)] underline decoration-[var(--love-rose)] underline-offset-4 transition-colors hover:text-[var(--love-rose)] sm:text-2xl"
            >
              Open editor
            </Link>
            <button
              type="button"
              className="bg-[var(--love-wine)] px-3 py-1.5 font-[family-name:var(--font-note)] text-xl leading-none text-[var(--love-paper)] shadow-[0_10px_20px_rgba(20,8,12,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--love-paper)] sm:px-4 sm:text-2xl"
              aria-expanded={started}
              onClick={() => setStarted((open) => !open)}
            >
              Get started
            </button>
          </div>
          {started && (
            <div className="hero-rise flex w-52 flex-col gap-2 sm:w-60">
              <button
                type="button"
                className="bg-[var(--love-wine)] px-3 py-2 font-[family-name:var(--font-note)] text-xl leading-none text-[var(--love-paper)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--love-paper)] disabled:opacity-60 sm:text-2xl"
                disabled={oauth === null || (!oauth.google && !linked.google)}
                onClick={() => connect("google")}
              >
                {linked.google ? "Open Drive photos" : "Connect Google Drive"}
              </button>
              <button
                type="button"
                className="border-2 border-[var(--love-wine)] bg-[var(--love-paper)] px-3 py-2 font-[family-name:var(--font-note)] text-xl leading-none text-[var(--love-wine)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--love-paper)] disabled:opacity-60 sm:text-2xl"
                disabled={oauth === null || (!oauth.spotify && !linked.spotify)}
                onClick={() => connect("spotify")}
              >
                {linked.spotify ? "Spotify connected" : "Connect Spotify"}
              </button>
              {oauth && (!oauth.google || !oauth.spotify) && (
                <p className="text-right text-xs leading-snug text-[var(--love-paper)]">
                  {!oauth.google && !oauth.spotify
                    ? "Google Drive and Spotify aren't set up yet."
                    : !oauth.google
                      ? "Google Drive isn't set up yet."
                      : "Spotify isn't set up yet."}
                </p>
              )}
            </div>
          )}
        </div>
        )}
      </header>

      <div
        className={cn(
          "relative z-10 grid min-h-0 flex-1 grid-cols-1 items-center md:grid-cols-[minmax(0,1fr)_calc(100dvh*0.75)_minmax(0,1fr)]",
        )}
      >
        {notes.map((text, noteIndex) => (
          <p
            key={`${activeVideo?.id ?? index}-${noteIndex}`}
            className={cn(
              "love-note pointer-events-none hidden max-w-[15rem] justify-self-center px-3 text-center font-[family-name:var(--font-note)] text-[1.9rem] leading-tight text-[var(--love-paper)] [text-shadow:0_2px_14px_rgba(20,8,12,0.85)] md:block",
              noteIndex === 1 && "md:col-start-3",
            )}
            style={{
              ["--note-rot" as string]: NOTE_STYLE[noteIndex].rot,
              animationDelay: NOTE_STYLE[noteIndex].delay,
              transform: `rotate(${NOTE_STYLE[noteIndex].rot})`,
            }}
          >
            {text}
          </p>
        ))}
        <div className="md:col-start-2 md:row-start-1" />
      </div>

      <div
        className={cn(
          "relative z-20 shrink-0 bg-gradient-to-t from-[rgba(36,16,24,0.82)] via-[rgba(36,16,24,0.4)] to-transparent px-3 pt-8 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8",
        )}
      >
        <p
          key={`mobile-${activeVideo?.id ?? index}`}
          className="love-caption mb-3 px-1 text-center font-[family-name:var(--font-note)] text-[1.6rem] leading-snug text-[var(--love-paper)] [text-shadow:0_2px_12px_rgba(20,8,12,0.9)] md:hidden"
        >
          {notes[0]} {notes[1]}
        </p>
        {TOOLS_ENABLED && editPhoto && (
          <div className="mb-3 flex flex-col items-start gap-2 bg-[var(--love-paper)] px-4 py-3 text-[var(--love-wine)] shadow-[0_14px_28px_rgba(20,8,12,0.28)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-note)] text-3xl leading-none">
                Edit this photo
              </p>
              <p className="mt-1 text-sm">Spotify stays on while you edit.</p>
            </div>
            <button
              type="button"
              className="bg-[var(--love-wine)] px-4 py-2 font-[family-name:var(--font-note)] text-2xl text-[var(--love-paper)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--love-wine)]"
              onClick={() => router.push(`/editor?photo=${editPhoto.id}`)}
            >
              Edit
            </button>
          </div>
        )}
        <div className="flex items-end gap-3">
          <button
            type="button"
            className="mb-3 flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--love-rose)] bg-[var(--love-night)]/55 text-[var(--love-paper)] transition-colors hover:bg-[var(--love-night)]/80"
            aria-label="Previous photo"
            onClick={() => show(index - 1)}
          >
            <ChevronLeft />
          </button>
          <div
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1"
            aria-label="Browse photos and videos"
          >
            {SLIDES.map((photo, photoIndex) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Show ${photo.alt}`}
                aria-pressed={!activeVideoId && photoIndex === index}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border transition-colors md:h-20 md:w-20",
                  !activeVideoId && photoIndex === index
                    ? "border-[var(--love-paper)]"
                    : "border-transparent",
                )}
                onClick={() => {
                  show(photoIndex);
                  setEditId(photo.id);
                }}
              >
                <span
                  className={cn(
                    "absolute inset-0",
                    photo.turn && "-rotate-90",
                  )}
                >
                  <Image
                    src={photo.thumbnailUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </span>
              </button>
            ))}
            {MAHIMA_VIDEOS.map((video) => (
              <button
                key={video.id}
                type="button"
                aria-label={video.label}
                aria-pressed={activeVideoId === video.id}
                className={cn(
                  "relative h-14 w-24 shrink-0 overflow-hidden rounded-md border bg-black transition-colors md:h-20 md:w-28",
                  activeVideoId === video.id ? "border-[var(--love-paper)]" : "border-transparent",
                )}
                onClick={() => {
                  setEditId(null);
                  setActiveVideoId((current) => (current === video.id ? null : video.id));
                }}
              >
                <video
                  src={`${video.src}#t=0.4`}
                  muted
                  playsInline
                  preload="metadata"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-14 -translate-x-1/2 -translate-y-1/2 -rotate-90 object-cover md:h-28 md:w-20"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <Play className="size-4 fill-[color:var(--paper)] text-[color:var(--paper)]" />
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mb-3 flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--love-rose)] bg-[var(--love-night)]/55 text-[var(--love-paper)] transition-colors hover:bg-[var(--love-night)]/80"
            aria-label="Next photo"
            onClick={() => show(index + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
