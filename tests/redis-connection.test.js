const redis = require('redis');

describe('Redis Connection', () => {
    let redisClient;

    beforeEach(() => {
        redisClient = redis.createClient();
    });

    afterEach(() => {
        redisClient.quit();
    });

    test('should connect to Redis successfully', (done) => {
        redisClient.on('connect', () => {
            expect(redisClient.connected).toBe(true);
            done();
        });
    });

    test('should handle Redis connection error', (done) => {
        redisClient.on('error', (err) => {
            expect(err).toBeDefined();
            done();
        });

        // Simulate error
        redisClient.emit('error', new Error('Redis connection failed'));
    });
});