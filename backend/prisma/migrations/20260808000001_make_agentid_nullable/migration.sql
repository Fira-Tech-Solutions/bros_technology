-- AlterTable: Make agentId nullable and change onDelete to SetNull
ALTER TABLE "listings" DROP CONSTRAINT "listings_agentId_fkey";

ALTER TABLE "listings" ALTER COLUMN "agentId" DROP NOT NULL;

ALTER TABLE "listings" ADD CONSTRAINT "listings_agentId_fkey"
  FOREIGN KEY ("agentId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex: Add index on agentId for faster agent-filtered queries
CREATE INDEX "listings_agentId_idx" ON "listings"("agentId");
