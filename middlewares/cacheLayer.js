const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 100 });

const storeCache = (key, value, ttl) => {
    cache.set(key, value, ttl);
};

const cacheMiddleware = (req, res, next) => {
    const { key } = req.params;
    const value = cache.get(key);
    res.send(value);
};

module.exports = { cacheMiddleware, storeCache };