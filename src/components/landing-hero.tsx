"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type OauthStatus = {
  google: boolean;
  spotify: boolean;
  demoOnly: boolean;
};

export function LandingHero() {
  const [oauth, setOauth] = useState<OauthStatus | null>(null);

  useEffect(() => {
    void fetch("/api/oauth-status")
      .then((r) => r.json())
      .then(setOauth)
      .catch(() => setOauth({ google: false, spotify: false, demoOnly: true }));
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[color:var(--ink)] text-[color:var(--paper)]">
      <div className="pointer-events-none absolute inset-0 film-grain" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hero-wash" aria-hidden />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--fog)]">
          Photo lab
        </p>
        <Link
          href="/editor"
          className="text-xs uppercase tracking-[0.2em] text-[color:var(--amber)] transition-colors hover:text-[color:var(--amber-bright)]"
        >
          Open editor
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-16 pt-10 md:justify-center md:px-10 md:pb-24">
        <div className="hero-rise max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(4.5rem,14vw,9rem)] leading-[0.85] tracking-tight text-[color:var(--amber)]">
            Lumen
          </h1>
          <p className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-2xl text-[color:var(--paper)] md:text-3xl">
            Develop Drive photos with film filters while Spotify keeps the room warm.
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[color:var(--fog)] md:text-base">
            One darkroom folder. Six emulsion presets. Before-and-after proofs you can download.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {oauth?.google ? (
              <Button
                size="lg"
                className="rounded-md bg-[color:var(--amber)] px-5 text-[color:var(--ink)] hover:bg-[color:var(--amber-bright)]"
                onClick={() => signIn("google", { callbackUrl: "/editor" })}
              >
                Connect Google Drive
              </Button>
            ) : (
              <Link
                href="/editor"
                className="inline-flex h-9 items-center justify-center rounded-md bg-[color:var(--amber)] px-5 text-sm font-medium text-[color:var(--ink)] transition-colors hover:bg-[color:var(--amber-bright)]"
              >
                Enter with sample photos
              </Link>
            )}

            {oauth?.spotify ? (
              <Button
                size="lg"
                variant="outline"
                className="rounded-md border-[color:var(--film-line)] bg-transparent text-[color:var(--paper)]"
                onClick={() => signIn("spotify", { callbackUrl: "/editor" })}
              >
                Connect Spotify
              </Button>
            ) : (
              <Link
                href="/editor"
                className="inline-flex h-9 items-center justify-center rounded-md border border-[color:var(--film-line)] bg-transparent px-5 text-sm font-medium text-[color:var(--paper)] transition-colors hover:bg-white/5"
              >
                Open the darkroom
              </Link>
            )}
          </div>

          {oauth?.demoOnly && (
            <p className="mt-5 text-xs text-[color:var(--amber-dim)]">
              Running on sample media until Google and Spotify secrets are configured.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
