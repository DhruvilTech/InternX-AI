const cache = new Map();

const get = (key) => {
  // Caching system disabled to retrieve fresh data directly
  return null;
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
  // Caching system disabled to retrieve fresh data directly
  return await fn();
};

export { get, set, del, clear, wrap };

