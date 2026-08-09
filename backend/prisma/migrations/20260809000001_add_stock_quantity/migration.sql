-- AlterTable: Add stockQuantity field for inventory tracking
ALTER TABLE "listings" ADD COLUMN "stockQuantity" INTEGER NOT NULL DEFAULT 0;
