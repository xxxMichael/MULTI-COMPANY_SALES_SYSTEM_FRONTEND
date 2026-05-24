const KEY = "mcms_auth";

export function setAuth({ token, user }) {
  localStorage.setItem(KEY, JSON.stringify({ token, user }));
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  const a = getAuth();
  return !!(a?.token);
}
