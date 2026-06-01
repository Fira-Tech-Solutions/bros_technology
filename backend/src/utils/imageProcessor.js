import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../../uploads');
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
]);

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/tiff': '.tiff',
};

function generateFilename(originalname) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const base = path.basename(originalname, path.extname(originalname))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 64);
  return `${timestamp}-${random}-${base}.webp`;
}

function resolveUploadDir() {
  return UPLOAD_DIR;
}

async function ensureUploadDir() {
  const dir = resolveUploadDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

function isAllowedMimeType(mimeType) {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

function getExtensionForMime(mimeType) {
  return MIME_TO_EXT[mimeType] || '.bin';
}

async function processSingleImage(file) {
  const uploadDir = await ensureUploadDir();
  const inputPath = file.path;

  const inputStat = await fs.stat(inputPath).catch(() => null);
  if (!inputStat || !inputStat.isFile()) {
    throw new Error(`Uploaded file not found: ${inputPath}`);
  }

  if (inputStat.size === 0) {
    await fs.unlink(inputPath).catch(() => {});
    throw new Error(`Uploaded file is empty: ${file.originalname}`);
  }

  const outputFilename = generateFilename(file.originalname);
  const outputPath = path.join(uploadDir, outputFilename);

  try {
    const metadata = await sharp(inputPath).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Could not read image dimensions — file may be corrupted');
    }

    await sharp(inputPath)
      .resize({
        width: MAX_WIDTH,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    await fs.unlink(inputPath).catch(() => {});

    const relativePath = `uploads/${outputFilename}`;
    return {
      path: relativePath,
      width: metadata.width,
      height: metadata.height,
      originalName: file.originalname,
      size: (await fs.stat(outputPath)).size,
    };
  } catch (err) {
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    if (err.message.includes('Input buffer contains unsupported image format')) {
      throw new Error(`Unsupported or corrupted image format: ${file.originalname}`);
    }
    throw new Error(`Failed to process image "${file.originalname}": ${err.message}`);
  }
}

export async function processListingImages(files) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  const results = [];
  const errors = [];

  const tasks = files.map(async (file) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      await fs.unlink(file.path).catch(() => {});
      errors.push({
        filename: file.originalname,
        error: `Invalid file type "${file.mimetype}". Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      });
      return null;
    }

    try {
      return await processSingleImage(file);
    } catch (err) {
      errors.push({
        filename: file.originalname,
        error: err.message,
      });
      return null;
    }
  });

  const outcomes = await Promise.allSettled(tasks);

  for (const outcome of outcomes) {
    if (outcome.status === 'fulfilled' && outcome.value) {
      results.push(outcome.value);
    }
  }

  if (errors.length > 0) {
    console.warn(`[ImageProcessor] ${errors.length}/${files.length} images failed:`, errors);
  }

  if (results.length === 0 && errors.length > 0) {
    throw new Error(`All image processing failed: ${errors.map((e) => e.error).join('; ')}`);
  }

  return results.map((r) => r.path);
}

export async function cleanupImages(filePaths) {
  if (!filePaths || !Array.isArray(filePaths)) return;

  const projectRoot = path.resolve(__dirname, '../..');

  await Promise.all(
    filePaths.map(async (relativePath) => {
      const fullPath = path.resolve(projectRoot, relativePath);
      try {
        await fs.unlink(fullPath);
      } catch {
        // file already removed or doesn't exist
      }
    }),
  );
}

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      const dir = await ensureUploadDir();
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const ext = getExtensionForMime(file.mimetype);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    cb(null, `temp-${timestamp}-${random}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" is not allowed. Accepted: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      ),
      false,
    );
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

export const processImages = uploadMiddleware.array('images', MAX_FILES);

export async function optimizeImages(req, res, next) {
  if (!req.files || req.files.length === 0) {
    req.images = [];
    return next();
  }

  try {
    req.images = await processListingImages(req.files);
    next();
  } catch (err) {
    next(err);
  }
}
