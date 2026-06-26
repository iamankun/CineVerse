const COOKIE_NAME = "cineverse-live";

export interface LiveCookieData {
  channelId: string;
  channelName: string;
  streamKey: string;
  ingestUrl: string;
}

export function getLiveCookie(): LiveCookieData | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  );
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function setLiveCookie(data: LiveCookieData): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearLiveCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
