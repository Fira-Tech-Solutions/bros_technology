-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramConnected" BOOLEAN NOT NULL DEFAULT false;
