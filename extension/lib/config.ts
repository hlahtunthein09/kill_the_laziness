/**
 * FocusFlow AI — Shared configuration
 * Reads the web app URL from WXT environment variable at build time.
 * Falls back to localhost:3000 for development.
 */

interface WxtEnv {
  WXT_APP_URL?: string;
}

const env: WxtEnv =
  typeof import.meta !== "undefined"
    ? (import.meta as unknown as { env: WxtEnv }).env
    : ({} as WxtEnv);

export const APP_URL: string = env.WXT_APP_URL || "http://localhost:3000";
