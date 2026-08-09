# Image Processing

## Overview

The backend processes listing images through a pipeline that validates, resizes, and converts images to WebP format. Images can be stored locally or uploaded to Cloudinary.

## Pipeline

```
Client Upload (multipart/form-data)
    │
    ▼
┌─────────────────┐
│ Multer Storage   │ ── Temp file saved to uploads/
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ File Filter      │ ── Validate MIME type
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sharp Process    │ ── Resize + WebP conversion
└────────┬────────┘
         │
         ├── Local: Save to uploads/
         └── Cloudinary: Upload to cloud
              │
              ▼
         Return path/URL
```

## Implementation

**File:** `backend/src/utils/imageProcessor.js`

### Configuration

```javascript
// Lines 17-22
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../../uploads');
const MAX_WIDTH = 1200;           // Max image width in pixels
const WEBP_QUALITY = 80;         // WebP compression quality
const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10MB max
const MAX_FILES = 10;            // Max 10 images per request
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';
```

### Allowed MIME Types

```javascript
// Lines 24-30
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
]);
```

### Filename Generation

```javascript
// Lines 40-47
function generateFilename(originalname) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const base = path.basename(originalname, path.extname(originalname))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 64);
  return `${timestamp}-${random}-${base}.webp`;
}
```

Format: `{timestamp}-{random}-{sanitized_name}.webp`

### Local Storage Processing

**File:** `imageProcessor.js:67-119`

```javascript
async function processSingleImageLocal(file) {
  // 1. Verify file exists and is not empty
  // 2. Read image metadata with Sharp
  // 3. Resize to max 1200px width (without enlargement)
  // 4. Convert to WebP at quality 80
  // 5. Save to uploads directory
  // 6. Delete temp file
  // 7. Return file info
}
```

**Sharp Pipeline:**
```javascript
await sharp(inputPath)
  .resize({
    width: MAX_WIDTH,        // 1200px
    withoutEnlargement: true, // Don't upscale small images
    fit: 'inside',           // Maintain aspect ratio
  })
  .webp({ quality: WEBP_QUALITY })  // Quality 80
  .toFile(outputPath);
```

### Cloudinary Storage Processing

**File:** `imageProcessor.js:121-146`

```javascript
async function processSingleImageCloudinary(file) {
  // 1. Upload to Cloudinary
  // 2. Delete temp file
  // 3. Return Cloudinary URL and metadata
}
```

### Storage Selection

**File:** `imageProcessor.js:148-153`

```javascript
async function processSingleImage(file) {
  if (STORAGE_PROVIDER === 'cloudinary') {
    return processSingleImageCloudinary(file);
  }
  return processSingleImageLocal(file);
}
```

### Batch Processing

**File:** `imageProcessor.js:155-201`

```javascript
export async function processListingImages(files) {
  // Process all images in parallel
  const outcomes = await Promise.allSettled(tasks);

  // Collect successful results and errors
  // If all fail, throw error
  // Return array of file paths
}
```

---

## Middleware

### Upload Middleware

**File:** `imageProcessor.js:275-284`

```javascript
export const uploadMiddleware = multer({
  storage,           // Disk storage with temp filenames
  fileFilter,        // MIME type validation
  limits: {
    fileSize: MAX_FILE_SIZE,  // 10MB
    files: MAX_FILES,         // 10 files
  },
});

export const processImages = uploadMiddleware.array('images', MAX_FILES);
```

### Optimization Middleware

**File:** `imageProcessor.js:286-298`

```javascript
export async function optimizeImages(req, res, next) {
  if (!req.files || req.files.length === 0) {
    req.images = [];
    return next();
  }

  req.images = await processListingImages(req.files);
  next();
}
```

### Profile Image Processing

**File:** `imageProcessor.js:300-314`

```javascript
export async function processProfileImage(file) {
  // Single image processing for profile pictures
  // Same pipeline but returns single path
}
```

---

## Usage in Routes

### Listing Routes

**File:** `backend/src/modules/properties/listing.routes.js:18-23`

```javascript
const protectedWriteMiddleware = [
  authenticate(),
  processImages,           // Multer upload
  optimizeImages,          // Sharp processing
  validateListingAttributes(),
];

router.post('/', ...protectedWriteMiddleware, createListing);
router.patch('/:id', ...protectedWriteMiddleware, updateListing);
```

### User Routes

**File:** `backend/src/modules/users/user.routes.js:41`

```javascript
router.put('/me', authenticate(), upload.single('profileImage'), updateMe);
```

---

## Image Cleanup

### Listing Update

**File:** `backend/src/modules/properties/listing.controller.js:218-222`

```javascript
// Old images cleaned up when new images uploaded
if (req.images && req.images.length > 0 && existing.images.length > 0) {
  cleanupImages(existing.images).catch((err) => {
    console.error('[Listing] Failed to cleanup old images:', err.message);
  });
}
```

### Listing Delete

**File:** `listing.controller.js:276-280`

```javascript
// All images cleaned up on listing deletion
if (existing.images && existing.images.length > 0) {
  cleanupImages(existing.images).catch((err) => {
    console.error('[Listing] Failed to cleanup images:', err.message);
  });
}
```

### Cleanup Function

**File:** `imageProcessor.js:203-228`

```javascript
export async function cleanupImages(filePaths) {
  if (STORAGE_PROVIDER === 'cloudinary') {
    // Delete from Cloudinary in batch
    const publicIds = filePaths.map(extractPublicId).filter(Boolean);
    await deleteFromCloudinaryBatch(publicIds);
    return;
  }

  // Delete local files
  await Promise.all(
    filePaths.map(async (relativePath) => {
      const fullPath = path.resolve(projectRoot, relativePath);
      await fs.unlink(fullPath).catch(() => {});
    }),
  );
}
```

---

## Temp File Cleanup

**File:** `imageProcessor.js:230-243`

```javascript
async function cleanupTempFiles() {
  if (STORAGE_PROVIDER !== 'cloudinary') return;

  // Clean up temp files from failed uploads
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (file.startsWith('temp-')) {
      await fs.unlink(path.join(dir, file));
    }
  }
}

// Runs on startup
cleanupTempFiles();
```

---

## Error Handling

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Invalid MIME type | 400 | "File type not allowed" |
| File too large | 400 | "Upload error: File too large" |
| Too many files | 400 | "Upload error: Too many files" |
| Corrupted image | 400 | "Unsupported or corrupted image format" |
| Processing failed | 500 | "Failed to process image" |
| All images failed | 500 | "All image processing failed" |

---

## Configuration

### Environment Variables

```env
STORAGE_PROVIDER=local          # or "cloudinary"
UPLOAD_DIR=./uploads            # Local storage path
CLOUDINARY_CLOUD_NAME=xxx       # Cloudinary config
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_FOLDER=listings
```

### Storage Options

| Provider | Pros | Cons |
|----------|------|------|
| Local | Simple, no external dependency | Requires file serving setup |
| Cloudinary | CDN, transforms, backups | External dependency, cost |
