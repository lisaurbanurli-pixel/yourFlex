const LOGIN_KEY = "aptia365-flow-login";
const TWO_FACTOR_KEY = "aptia365-flow-2fa";
const IDENTITY_KEY = "aptia365-flow-identity";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

export function setLoginComplete(): void {
  storage()?.setItem(LOGIN_KEY, "1");
}

export function setTwoFactorStepComplete(): void {
  storage()?.setItem(TWO_FACTOR_KEY, "1");
}

export function setIdentityStepComplete(): void {
  storage()?.setItem(IDENTITY_KEY, "1");
}

export function clearAuthFlow(): void {
  const s = storage();
  if (!s) return;
  s.removeItem(LOGIN_KEY);
  s.removeItem(TWO_FACTOR_KEY);
  s.removeItem(IDENTITY_KEY);
}

export function hasLoginComplete(): boolean {
  return storage()?.getItem(LOGIN_KEY) === "1";
}

export function hasTwoFactorStepComplete(): boolean {
  return storage()?.getItem(TWO_FACTOR_KEY) === "1";
}

export function hasIdentityStepComplete(): boolean {
  return storage()?.getItem(IDENTITY_KEY) === "1";
}
