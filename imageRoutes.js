const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const useragent = require('express-useragent');

// Add user agent middleware
router.use(useragent.express());


const devicePresets = {
    mobile: {
        small: { width: 320, height: 240 },
        medium: { width: 480, height: 360 },
        large: { width: 640, height: 480 }
    },
    tablet: {
        small: { width: 768, height: 576 },
        medium: { width: 1024, height: 768 },
        large: { width: 1280, height: 960 }
    },
    desktop: {
        small: { width: 1024, height: 768 },
        medium: { width: 1366, height: 1024 },
        large: { width: 1920, height: 1440 }
    }
};

// Device detection middleware
const deviceDetection = (req, res, next) => {
    if (req.useragent.isMobile) {
        req.deviceType = 'mobile';
    } else if (req.useragent.isTablet) {
        req.deviceType = 'tablet';
    } else {
        req.deviceType = 'desktop';
    }
    next();
};

// Image size middleware
const imageSizeMiddleware = async (req, res, next) => {
    try {
        // Get size preference from query parameter (small, medium, large)
        const preferredSize = req.query.size || 'medium';
        const deviceType = req.deviceType;

        // Get preset dimensions for device and size
        const preset = devicePresets[deviceType][preferredSize];

        // Add dimensions to request object
        req.imageDimensions = preset;

        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid size parameter' });
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //ensureUploadDirectoryExists();
        cb(null, path.resolve(__dirname, './uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

const createDirs = async () => {
    await fs.mkdir('uploads', { recursive: true });
    await fs.mkdir('processed', { recursive: true });
};
createDirs();



router.post('/uploadImage', (req, res) => {
    res.send('Hello World');
});

async function processImage(inputPath, outputPath, width, height, quality) {
    await sharp(inputPath)
        .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
        .jpeg({ quality: quality })
        .toFile(outputPath);
}

// Routes
router.post('/api/process-image', deviceDetection, imageSizeMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const width = parseInt(req.query.width) || 300;
        const height = parseInt(req.query.height) || 300;
        const quality = parseInt(req.query.quality) || 80;

        const outputFilename = `processed-${path.basename(req.file.filename)}`;
        const outputPath = path.join('processed', outputFilename);

        await processImage(
            req.file.path,
            outputPath,
            width,
            height,
            quality
        );

        // Get file sizes for comparison
        const originalSize = (await fs.stat(req.file.path)).size;
        const processedSize = (await fs.stat(outputPath)).size;
        const reduction = ((originalSize - processedSize) / originalSize * 100).toFixed(2);

        res.json({
            success: true,
            message: 'Image processed successfully',
            originalSize: originalSize,
            processedSize: processedSize,
            reduction: `${reduction}%`,
            processedImage: outputFilename
        });

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Route to get processed image
router.get('/api/images/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join('processed', filename);

        await fs.access(imagePath);
        res.sendFile(path.resolve(imagePath));
    } catch (error) {
        res.status(404).json({ error: 'Image not found' });
    }
});


module.exports = router;