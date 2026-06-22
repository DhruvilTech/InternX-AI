const cache = new Map();

const get = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const set = (key, value, ttl = 30000) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
};

const del = (key) => cache.delete(key);

const clear = () => cache.clear();

const wrap = async (key, ttl, fn) => {
  const cached = get(key);
  if (cached !== null) {
    return cached;
  }
  const value = await fn();
  set(key, value, ttl);
  return value;
};

export { get, set, del, clear, wrap };
