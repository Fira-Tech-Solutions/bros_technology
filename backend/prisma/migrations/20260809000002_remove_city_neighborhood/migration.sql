-- DropIndex
DROP INDEX "listings_city_neighborhood_idx";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "city",
DROP COLUMN "neighborhood";
