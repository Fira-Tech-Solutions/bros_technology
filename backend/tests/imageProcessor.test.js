import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import {
  createTestPng,
  createTestJpeg,
  createTestWebP,
  createCorruptedFile,
  createEmptyFile,
  buildMockFile,
  cleanupFixtures,
} from './fixtures/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

const { processListingImages, cleanupImages } = await import(
  '../src/utils/imageProcessor.js'
);

async function copyFixture(srcName, destName) {
  const src = path.join(FIXTURES_DIR, srcName);
  const dest = path.join(FIXTURES_DIR, destName);
  await fs.copyFile(src, dest);
  return dest;
}

describe('processListingImages', () => {
  const cleanup = [];

  beforeAll(async () => {
    await createTestPng('base.png');
    await createTestJpeg('base.jpg');
    await createTestWebP('base.webp');
    await createCorruptedFile('corrupted.png');
    await createEmptyFile('empty.png');
  });

  afterAll(async () => {
    await cleanupFixtures(['base.png', 'base.jpg', 'base.webp', 'corrupted.png', 'empty.png', ...cleanup]);
  });

  beforeEach(() => {
    cleanup.length = 0;
  });

  it('should return an empty array when given no files', async () => {
    const result = await processListingImages([]);
    expect(result).toEqual([]);
  });

  it('should return an empty array when given null or undefined', async () => {
    expect(await processListingImages(null)).toEqual([]);
    expect(await processListingImages(undefined)).toEqual([]);
  });

  it('should process a single PNG and return a path string', async () => {
    const inputPath = await copyFixture('base.png', 't1.png');
    cleanup.push('t1.png');

    const result = await processListingImages([
      buildMockFile({ originalname: 'photo.png', mimetype: 'image/png', path: inputPath }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(/^uploads\/.*\.webp$/);
  });

  it('should process multiple files concurrently', async () => {
    const p1 = await copyFixture('base.png', 't2a.png');
    const p2 = await copyFixture('base.jpg', 't2b.jpg');
    const p3 = await copyFixture('base.webp', 't2c.webp');
    cleanup.push('t2a.png', 't2b.jpg', 't2c.webp');

    const result = await processListingImages([
      buildMockFile({ originalname: 'a.png', mimetype: 'image/png', path: p1 }),
      buildMockFile({ originalname: 'b.jpg', mimetype: 'image/jpeg', path: p2 }),
      buildMockFile({ originalname: 'c.webp', mimetype: 'image/webp', path: p3 }),
    ]);

    expect(result).toHaveLength(3);
    for (const p of result) {
      expect(p).toMatch(/^uploads\/.*\.webp$/);
    }
  });

  it('should skip invalid mime types and process valid ones', async () => {
    const inputPath = await copyFixture('base.png', 't3.png');
    cleanup.push('t3.png');

    const result = await processListingImages([
      buildMockFile({ originalname: 'bad.exe', mimetype: 'application/x-executable', path: '/tmp/fake.exe' }),
      buildMockFile({ originalname: 'good.png', mimetype: 'image/png', path: inputPath }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(/^uploads\/.*\.webp$/);
  });

  it('should throw when all files are invalid mime types', async () => {
    await expect(
      processListingImages([
        buildMockFile({ originalname: 'a.exe', mimetype: 'application/x-executable', path: '/tmp/x' }),
        buildMockFile({ originalname: 'b.txt', mimetype: 'text/plain', path: '/tmp/y' }),
      ]),
    ).rejects.toThrow('All image processing failed');
  });

  it('should handle corrupted images gracefully', async () => {
    await expect(
      processListingImages([
        buildMockFile({ originalname: 'corrupted.png', mimetype: 'image/png', path: path.join(FIXTURES_DIR, 'corrupted.png') }),
      ]),
    ).rejects.toThrow('All image processing failed');
  });

  it('should handle empty files gracefully', async () => {
    await expect(
      processListingImages([
        buildMockFile({ originalname: 'empty.png', mimetype: 'image/png', path: path.join(FIXTURES_DIR, 'empty.png') }),
      ]),
    ).rejects.toThrow('All image processing failed');
  });

  it('should handle mix of valid and corrupted files', async () => {
    const inputPath = await copyFixture('base.png', 't7.png');
    cleanup.push('t7.png');

    const result = await processListingImages([
      buildMockFile({ originalname: 'good.png', mimetype: 'image/png', path: inputPath }),
      buildMockFile({ originalname: 'bad.png', mimetype: 'image/png', path: path.join(FIXTURES_DIR, 'corrupted.png') }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(/^uploads\/.*\.webp$/);
  });
});

describe('cleanupImages', () => {
  it('should remove files at the given paths', async () => {
    const uploadsDir = path.resolve(__dirname, '../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const testPath = path.join(uploadsDir, 'cleanup-target.webp');
    await createTestPng('cleanup-target.png');
    await fs.copyFile(path.join(FIXTURES_DIR, 'cleanup-target.png'), testPath);
    await cleanupFixtures(['cleanup-target.png']);

    const statBefore = await fs.stat(testPath);
    expect(statBefore.isFile()).toBe(true);

    await cleanupImages(['uploads/cleanup-target.webp']);

    const statAfter = await fs.stat(testPath).catch(() => null);
    expect(statAfter).toBeNull();
  });

  it('should not throw when paths are invalid', async () => {
    await expect(
      cleanupImages(['uploads/nonexistent-file-xyz.webp']),
    ).resolves.toBeUndefined();
  });

  it('should not throw when given null or non-array', async () => {
    await expect(cleanupImages(null)).resolves.toBeUndefined();
    await expect(cleanupImages('not-an-array')).resolves.toBeUndefined();
  });
});
