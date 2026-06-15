import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'retailment/listings';

export async function uploadToCloudinary(filePath, options = {}) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_FOLDER,
    resource_type: 'image',
    format: 'webp',
    quality: 'auto:good',
    width: 1200,
    crop: 'limit',
    ...options,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[Cloudinary] Failed to delete:', publicId, err.message);
  }
}

export async function deleteFromCloudinaryBatch(publicIds) {
  if (!publicIds || publicIds.length === 0) return;
  try {
    await cloudinary.api.delete_resources(publicIds);
  } catch (err) {
    console.error('[Cloudinary] Batch delete failed:', err.message);
  }
}

export function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts = url.split('/');
  const uploadIdx = parts.findIndex((p) => p === 'upload');
  if (uploadIdx === -1) return null;
  const afterUpload = parts.slice(uploadIdx + 1);
  if (afterUpload[0] && afterUpload[0].startsWith('v')) afterUpload.shift();
  const withFolder = afterUpload.join('/');
  return withFolder.replace(/\.[^.]+$/, '');
}

export default cloudinary;
