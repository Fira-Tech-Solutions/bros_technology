-- Create notifications table
CREATE TABLE "notifications" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "type" TEXT NOT NULL,
  "data" JSONB,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
