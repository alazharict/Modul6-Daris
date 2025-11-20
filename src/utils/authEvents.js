const listeners = new Set();

export function subscribeAuth(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitAuthChange(isLoggedIn) {
  for (const fn of listeners) {
    try { fn(isLoggedIn); } catch (e) { /* ignore subscriber errors */ }
  }
}
