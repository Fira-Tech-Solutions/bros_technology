-- CreateTable
CREATE TABLE "syndication_configs" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "botToken" TEXT,
    "channelId" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "extraConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "syndication_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "syndication_configs_platform_key" ON "syndication_configs"("platform");
