const store = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = store.get(ip);

  // Cleanup old entries randomly to avoid memory leak
  if (Math.random() < 0.01) {
    for (const [key, val] of store.entries()) {
      if (val.expiresAt < now) store.delete(key);
    }
  }

  if (record && record.expiresAt > now) {
    record.count++;
    if (record.count > limit) return false;
  } else {
    store.set(ip, { count: 1, expiresAt: now + windowMs });
  }
  return true;
}
