export const cache = {
    data: [],
    timestamp: null,
    ttl: 60000 // 1 phút 
};

export const addToCache = (mssvInput, formattedDate) => {
    // Loại bỏ khoảng trắng và dấu phẩy
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