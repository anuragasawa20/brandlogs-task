const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const imageRouter = require('../routes/image');


const redis = require('redis-mock');
const axios = require('axios');
const express = require('express');
const request = require('supertest');

// Mock redis client
jest.mock('redis', () => redis);

// Mock axios
jest.mock('axios');
// Create Express app for testing
const app = express();

// Setup test environment
const setupTestEnv = () => {
    // Mock fs.mkdir to prevent actual directory creation
    fs.mkdir = jest.fn().mockResolvedValue(undefined);

    // Mock sharp functions
    sharp.mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({ width: 100, height: 100 })
    }));

    // Mock file system stats
    fs.stat = jest.fn().mockResolvedValue({ size: 1000 });
    fs.access = jest.fn().mockResolvedValue(undefined);
};

module.exports = {
    app,
    setupTestEnv, redis,
    axios,
    request
};

