const request = require('supertest');
const { app, setupTestEnv } = require('./setup');

describe('Image Size Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnv();
    });

    test('should apply correct dimensions for mobile device with small size', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
            .query({ size: 'small' })
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.body.dimensions).toEqual({
            width: 320,
            height: 240
        });
    });

    test('should use medium size as default when no size specified', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.body.dimensions).toEqual({
            width: 480,
            height: 360
        });
    });

    test('should handle invalid size parameter', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
            .query({ size: 'invalid' })
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid size parameter');
    });
});