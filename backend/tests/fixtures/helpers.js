import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = __dirname;

export async function createTestPng(filename = 'test-image.png') {
  const outputPath = path.join(FIXTURES_DIR, filename);
  await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 255, g: 128, b: 0 },
    },
  })
    .png()
    .toFile(outputPath);
  return outputPath;
}

export async function createTestJpeg(filename = 'test-image.jpg') {
  const outputPath = path.join(FIXTURES_DIR, filename);
  await sharp({
    create: {
      width: 640,
      height: 480,
      channels: 3,
      background: { r: 0, g: 200, b: 100 },
    },
  })
    .jpeg({ quality: 90 })
    .toFile(outputPath);
  return outputPath;
}

export async function createTestWebP(filename = 'test-image.webp') {
  const outputPath = path.join(FIXTURES_DIR, filename);
  await sharp({
    create: {
      width: 1920,
      height: 1080,
      channels: 3,
      background: { r: 100, g: 100, b: 255 },
    },
  })
    .webp({ quality: 80 })
    .toFile(outputPath);
  return outputPath;
}

export async function createCorruptedFile(filename = 'corrupted.png') {
  const outputPath = path.join(FIXTURES_DIR, filename);
  await fs.writeFile(outputPath, Buffer.from('NOT_A_REAL_IMAGE_FILE'));
  return outputPath;
}

export async function createEmptyFile(filename = 'empty.png') {
  const outputPath = path.join(FIXTURES_DIR, filename);
  await fs.writeFile(outputPath, Buffer.alloc(0));
  return outputPath;
}

export function buildMockFile(overrides = {}) {
  return {
    fieldname: 'images',
    originalname: 'test-image.png',
    encoding: '7bit',
    mimetype: 'image/png',
    destination: '',
    filename: '',
    path: '',
    size: 1024,
    ...overrides,
  };
}

export async function cleanupFixtures(filenames) {
  for (const name of filenames) {
    const filePath = path.join(FIXTURES_DIR, name);
    await fs.unlink(filePath).catch(() => {});
  }
}
