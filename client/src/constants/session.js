export const LEADRIFT_TOKEN_KEY = "leadrift_token";
export const LEADRIFT_USER_KEY = "leadrift_user";

export function readStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LEADRIFT_TOKEN_KEY);
  } catch {
    return null;
  }
}
