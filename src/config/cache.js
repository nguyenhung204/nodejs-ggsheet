export const cache = {
    data: [],
    timestamp: null,
    ttl: 1000 // Time to live in milliseconds (e.g., 2 minutes)
};

export const addToCache = (mssvInput, formattedDate) => {
    cache.data.push({ mssvInput, formattedDate });
    cache.timestamp = Date.now();
};

export const clearCache = () => {
    cache.data = [];
    cache.timestamp = Date.now();
};

export const isCacheEmpty = () => {
    return cache.data.length === 0;
};

