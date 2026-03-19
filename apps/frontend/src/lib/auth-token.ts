import {
  ACCESS_TOKEN_COOKIE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  USER_PROFILE_STORAGE_KEY
} from "./auth-constants";

export { ACCESS_TOKEN_COOKIE_KEY, ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL, USER_PROFILE_STORAGE_KEY };

export function getBrowserAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storageToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (storageToken) {
    return storageToken;
  }

  const cookieToken = readCookieValue(ACCESS_TOKEN_COOKIE_KEY);
  return cookieToken ?? null;
}

export function saveAccessToken(token: string, expiresInSeconds: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  const maxAge = Math.max(0, Math.floor(expiresInSeconds));
  document.cookie = `${ACCESS_TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

export function saveUserProfile(profile: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  document.cookie = `${ACCESS_TOKEN_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const cookies = document.cookie.split(";");
  for (const cookiePart of cookies) {
    const trimmed = cookiePart.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}
