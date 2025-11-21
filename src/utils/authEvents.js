// authEvents.js
const listeners = new Set();

export function subscribeAuth(fn) {
  
  listeners.add(fn);
  return () => {
   
    listeners.delete(fn);
  };
}

export function emitAuthChange(isLoggedIn) {
  
  
  // Buat copy of listeners untuk avoid modification during iteration
  const listenersCopy = new Set(listeners);
  
  listenersCopy.forEach(fn => {
    try {
      fn(isLoggedIn);
    } catch (error) {
      console.error('🔐 Error in auth listener:', error);
    }
  });
}