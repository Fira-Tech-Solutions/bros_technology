-- Add customSocials JSON field to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "customSocials" JSONB NOT NULL DEFAULT '[]';
