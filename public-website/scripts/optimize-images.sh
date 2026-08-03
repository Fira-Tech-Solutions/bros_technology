#!/usr/bin/env bash
# Generates the responsive hero + brand image set consumed by the site.
# Re-run after replacing any source art in public/images/.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC=public/images
OUT=$SRC/hero
mkdir -p "$OUT" "$SRC/brands/opt"

# ── Hero art ─────────────────────────────────────────────────────────────────
# Desktop sources are landscape 2752x1536, mobile sources portrait 1536x2752.
for theme in dark light; do
  desktop="$SRC/bros_desktop_${theme}_HD.jpg"
  mobile="$SRC/bros_mobile_${theme}_HD.png"

  for w in 1280 1920 2560; do
    magick "$desktop" -resize "${w}x" -strip \
      -quality 45 -define heic:speed=6 "$OUT/desktop-${theme}-${w}.avif"
    magick "$desktop" -resize "${w}x" -strip \
      -quality 72 -define webp:method=6 "$OUT/desktop-${theme}-${w}.webp"
  done
  # Baseline JPEG fallback for browsers without webp/avif.
  magick "$desktop" -resize 1600x -strip -interlace Plane -quality 76 \
    "$OUT/desktop-${theme}-1600.jpg"

  for w in 640 828 1080; do
    magick "$mobile" -resize "${w}x" -strip \
      -quality 45 -define heic:speed=6 "$OUT/mobile-${theme}-${w}.avif"
    magick "$mobile" -resize "${w}x" -strip \
      -quality 72 -define webp:method=6 "$OUT/mobile-${theme}-${w}.webp"
  done
  magick "$mobile" -resize 828x -strip -interlace Plane -quality 76 \
    "$OUT/mobile-${theme}-828.jpg"

  # LQIP: a ~24px blurred thumb, small enough to inline as a data URI.
  magick "$mobile" -resize 24x -strip -quality 40 "$OUT/lqip-mobile-${theme}.jpg"
  magick "$desktop" -resize 32x -strip -quality 40 "$OUT/lqip-desktop-${theme}.jpg"
done

# ── Brand marquee logos ──────────────────────────────────────────────────────
for f in "$SRC"/brands/*.{jpg,jpeg,png,webp}; do
  [ -e "$f" ] || continue
  base=$(basename "${f%.*}")
  magick "$f" -resize 384x -strip -quality 72 -define webp:method=6 \
    "$SRC/brands/opt/${base}.webp"
  magick "$f" -resize 384x -strip -quality 48 "$SRC/brands/opt/${base}.avif"
done

echo "── generated ──"
du -sh "$OUT" "$SRC/brands/opt"
