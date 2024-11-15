const request = require('supertest');
const { app, setupTestEnv } = require('./setup');

describe('Device Detection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnv();
    });

    test('should detect mobile device', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
            .field('someField', 'someValue')
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.body.deviceType).toBe('mobile');
    });

    test('should detect tablet device', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')
            .field('someField', 'someValue')
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.body.deviceType).toBe('tablet');
    });

    test('should default to desktop for unknown devices', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
            .field('someField', 'someValue')
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.body.deviceType).toBe('desktop');
    });
});