const request = require('supertest');
const sharp = require('sharp');
const { app, setupTestEnv } = require('./setup');

describe('Image Processing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnv();
    });

    test('should process image with correct parameters', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
            .query({ quality: 90 })
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.status).toBe(200);
        expect(sharp).toHaveBeenCalled();
        expect(response.body).toHaveProperty('reduction');
        expect(response.body).toHaveProperty('processedImage');
    });

    test('should handle missing image file', async () => {
        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No image file uploaded');
    });

    test('should handle processing errors', async () => {
        // Mock sharp to throw an error
        sharp.mockImplementation(() => {
            throw new Error('Processing failed');
        });

        const response = await request(app)
            .post('/api/process-image')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
            .attach('image', Buffer.from('fake-image'), 'test.jpg');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to process image');
    });
});
