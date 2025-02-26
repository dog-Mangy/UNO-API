export function createCacheMiddleware(config) {
    const { max = 50, maxAge = 30000 } = config;
    const cache = new Map();
    const lruList = new Map(); 

    return (req, res, next) => {
        if (req.method !== 'GET') return next();

        const cacheKey = `${req.method}:${req.originalUrl}`;
        console.log(`Verificando cache para: ${cacheKey}`);

        if (cache.has(cacheKey)) {
            const cachedEntry = cache.get(cacheKey);

            if (Date.now() - cachedEntry.timestamp < maxAge) {
                console.log(`Cache válida encontrada para: ${cacheKey}`);

                cachedEntry.timestamp = Date.now();
                updateLRU(cacheKey);

                return res.json(cachedEntry.data);
            } else {
                console.log(`Cache expirada, eliminando: ${cacheKey}`);
                evictCache(cacheKey);
            }
        }

        const originalSend = res.json.bind(res);
        res.json = (body) => {
            if (cache.size >= max) {
                evictCache();
            }

            console.log(`🆕 Almacenando en cache: ${cacheKey}`);
            cache.set(cacheKey, { data: body, timestamp: Date.now() });
            updateLRU(cacheKey);

            return originalSend(body);
        };

        next();
    };

    function updateLRU(key) {
        lruList.delete(key);  
        lruList.set(key, null); 
    }

    function evictCache(key = null) {
        const oldestKey = key || lruList.keys().next().value;
        if (oldestKey) {
            cache.delete(oldestKey);
            lruList.delete(oldestKey);
            console.log(`Eliminando entrada LRU: ${oldestKey}`);
        }
    }
}
