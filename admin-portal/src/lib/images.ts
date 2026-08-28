/**
 * Cloudinary image optimization utility for admin portal.
 * Applies automatic format (WebP/AVIF), quality compression, and optional resizing.
 */

type ImageVariant = 'thumb' | 'card' | 'detail' | 'avatar' | 'raw';

const TRANSFORMS: Record<ImageVariant, string> = {
  thumb: 'f_auto,q_auto,w_100,h_100,c_fill',
  card: 'f_auto,q_auto,w_400,h_300,c_fill',
  detail: 'f_auto,q_auto,w_800',
  avatar: 'f_auto,q_auto,w_80,h_80,c_fill,g_face',
  raw: 'f_auto,q_auto',
};

export function optimizeImageUrl(
  url?: string | null,
  variant: ImageVariant = 'raw',
  customTransform?: string
): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('res.cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transform = customTransform || TRANSFORMS[variant];
  return `${parts[0]}/upload/${transform}/${parts[1]}`;
}
