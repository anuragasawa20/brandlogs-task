const express = require('express');
const { cacheMiddleware, storeCache } = require('./middlewares/cacheLayer');
const redis = require('redis');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');
const imageRoutes = require('./imageRoutes');

app.use(express.json());
app.use(bodyParser.json());

const port = 3000;
const redisClient = redis.createClient();

redisClient.on('error', err => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

app.use('/images', imageRoutes);

// Task 2
async function fetchUserFromAPI(userId) {
    const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
    return response.data;
}

app.get('/api/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Try to get data from cache
        const cachedData = await redisClient.get(`user:${userId}`);

        if (cachedData) {
            // If data is in cache, return it
            console.log('Data from cache');
            return res.json(JSON.parse(cachedData));
        }

        // If not in cache, fetch from API
        const userData = await fetchUserFromAPI(userId);

        // Store in cache for 1 hour
        await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(userData));

        console.log('Data from API');
        res.json(userData);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
});

// Connect to Redis and start server
async function startServer() {
    try {
        await redisClient.connect();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
}

startServer();

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Task 1
app.post('/store-cache', (req, res) => {
    const { key, value, ttl } = req.body;
    storeCache(key, value, ttl);
    res.send('Value set in cache');
});

app.get('/:key', cacheMiddleware, (req, res) => {
    res.send('Value fetched from cache');
});

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });

