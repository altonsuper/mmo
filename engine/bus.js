const listeners = {};
export const Bus = {
  on(evt, fn) { (listeners[evt]??= []).push(fn); },
  emit(evt, data) { (listeners[evt] || []).forEach(fn => fn(data)); }
};
