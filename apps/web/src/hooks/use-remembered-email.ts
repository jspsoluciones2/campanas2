import { useSyncExternalStore } from "react";

export const REMEMBER_EMAIL_KEY = "login_remember_email";

function getRememberedEmail() {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function useRememberedEmail() {
  return useSyncExternalStore(() => () => {}, getRememberedEmail, () => "");
}
