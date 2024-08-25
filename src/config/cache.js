export const cache = {
    data: [],
    timestamp: null,
    ttl: 120000 
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

