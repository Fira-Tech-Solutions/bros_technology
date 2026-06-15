-- CreateEnum
CREATE TYPE "SyndicationAction" AS ENUM ('NEW_POST', 'EDITED', 'DELETED');

-- AlterTable
ALTER TABLE "syndication_logs" ADD COLUMN     "action" "SyndicationAction" NOT NULL DEFAULT 'NEW_POST',
ADD COLUMN     "messageId" INTEGER;
