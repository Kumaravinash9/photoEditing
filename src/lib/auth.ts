import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";
import type { JWT } from "next-auth/jwt";
import type { Provider } from "next-auth/providers";
import {
  authSecretConfigured,
  googleConfigured,
  spotifyConfigured,
} from "@/lib/mock-data";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
].join(" ");

async function refreshGoogleToken(token: JWT): Promise<JWT> {
  if (!token.googleRefreshToken) return token;
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.googleRefreshToken as string,
    });
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return {
      ...token,
      googleAccessToken: data.access_token,
      googleExpiresAt: Date.now() + data.expires_in * 1000,
      googleRefreshToken: data.refresh_token ?? token.googleRefreshToken,
    };
  } catch {
    return { ...token, error: "GoogleRefreshAccessTokenError" };
  }
}

async function refreshSpotifyToken(token: JWT): Promise<JWT> {
  if (!token.spotifyRefreshToken) return token;
  try {
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString("base64");
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.spotifyRefreshToken as string,
    });
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: params,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return {
      ...token,
      spotifyAccessToken: data.access_token,
      spotifyExpiresAt: Date.now() + data.expires_in * 1000,
      spotifyRefreshToken: data.refresh_token ?? token.spotifyRefreshToken,
    };
  } catch {
    return { ...token, error: "SpotifyRefreshAccessTokenError" };
  }
}

const providers: Provider[] = [];

if (googleConfigured()) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  );
}

if (spotifyConfigured()) {
  providers.push(
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: { scope: SPOTIFY_SCOPES },
      },
    }),
  );
}

if (providers.length === 0) {
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo",
      credentials: {},
      authorize: async () => ({
        id: "demo-user",
        name: "Demo Editor",
        email: "demo@lumen.local",
      }),
    }),
  );
}

const secret =
  process.env.AUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "lumen-darkroom-dev-secret" : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret,
  trustHost: true,
  providers,
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token;
        token.googleExpiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600_000;
        token.googleConnected = true;
      }
      if (account?.provider === "spotify") {
        token.spotifyAccessToken = account.access_token;
        token.spotifyRefreshToken = account.refresh_token;
        token.spotifyExpiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600_000;
        token.spotifyConnected = true;
      }

      if (
        token.googleExpiresAt &&
        Date.now() > (token.googleExpiresAt as number) - 60_000
      ) {
        Object.assign(token, await refreshGoogleToken(token));
      }
      if (
        token.spotifyExpiresAt &&
        Date.now() > (token.spotifyExpiresAt as number) - 60_000
      ) {
        Object.assign(token, await refreshSpotifyToken(token));
      }
      return token;
    },
    async session({ session, token }) {
      session.googleConnected = Boolean(token.googleConnected);
      session.spotifyConnected = Boolean(token.spotifyConnected);
      session.googleAccessToken = token.googleAccessToken as string | undefined;
      session.spotifyAccessToken = token.spotifyAccessToken as string | undefined;
      session.error = token.error as string | undefined;
      session.demoMode = !googleConfigured() && !spotifyConfigured();
      session.providersAvailable = {
        google: googleConfigured(),
        spotify: spotifyConfigured(),
        authSecret: authSecretConfigured() || process.env.NODE_ENV !== "production",
      };
      return session;
    },
  },
});

export function oauthStatus() {
  return {
    google: googleConfigured(),
    spotify: spotifyConfigured(),
    authSecret: authSecretConfigured() || process.env.NODE_ENV !== "production",
    demoOnly: !googleConfigured() && !spotifyConfigured(),
  };
}
