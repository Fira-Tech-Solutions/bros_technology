#!/bin/bash
# Upload client handover PDF to Supabase Storage
# Usage: ./upload_to_supabase.sh <SUPABASE_SERVICE_ROLE_KEY>

set -e

SUPABASE_URL="https://tstdnxkoqrfwfmlpbcma.supabase.co"
BUCKET_NAME="project-docs"
PDF_FILE="BROS_Technology_Handover.pdf"
FILE_PATH="$(dirname "$0")/$PDF_FILE"

# Check if service role key is provided
if [ -z "$1" ]; then
    echo "Error: Please provide your Supabase service role key"
    echo "Usage: $0 <SUPABASE_SERVICE_ROLE_KEY>"
    echo ""
    echo "To get the service role key:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings > API"
    echo "4. Copy the 'service_role' key"
    exit 1
fi

SERVICE_ROLE_KEY="$1"

# Check if PDF file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "Error: PDF file not found at $FILE_PATH"
    exit 1
fi

echo "Uploading $PDF_FILE to Supabase Storage..."

# Create bucket if it doesn't exist
echo "Creating bucket '$BUCKET_NAME' (if not exists)..."
curl -s -X POST "$SUPABASE_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"id\": \"$BUCKET_NAME\", \"name\": \"$BUCKET_NAME\", \"public\": true}" \
    > /dev/null 2>&1 || true

# Upload file
echo "Uploading file..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/$PDF_FILE" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/pdf" \
    --data-binary "@$FILE_PATH")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Upload successful!"
    echo ""
    echo "📎 Public URL:"
    echo "$SUPABASE_URL/storage/v1/object/public/$BUCKET_NAME/$PDF_FILE"
    echo ""
    echo "Save this URL - you'll need it for the admin dashboard links."
else
    echo "❌ Upload failed (HTTP $HTTP_CODE)"
    echo "$BODY"
    exit 1
fi
