import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    googleConnected?: boolean;
    spotifyConnected?: boolean;
    googleAccessToken?: string;
    spotifyAccessToken?: string;
    error?: string;
    demoMode?: boolean;
    providersAvailable?: {
      google: boolean;
      spotify: boolean;
      authSecret: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleExpiresAt?: number;
    googleConnected?: boolean;
    spotifyAccessToken?: string;
    spotifyRefreshToken?: string;
    spotifyExpiresAt?: number;
    spotifyConnected?: boolean;
    error?: string;
  }
}
