export const cache = {
    data: [],
    timestamp: null,
    ttl: 60000 // 60 giây
};

export const addToCache = (mssvInput, formattedDate) => {
    
    const exists = cache.data.some(item => item.mssvInput === mssvInput);
    if (!exists) {
        cache.data.push({ mssvInput: mssvInput, formattedDate });
        cache.timestamp = Date.now();
    }
};

export const clearCache = () => {
    cache.data = [];
    cache.timestamp = Date.now();
};

export const isCacheEmpty = () => {
    return cache.data.length === 0;
};