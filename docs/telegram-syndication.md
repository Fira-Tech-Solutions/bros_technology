# Telegram Syndication

## Overview

The marketplace automatically syndicates listings to Telegram channels using an event-driven architecture. When a listing is created or updated, it's posted to the configured Telegram channel.

## Architecture

```
┌─────────────────┐
│ Listing Created/ │
│    Updated       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ listingEmitter  │ (EventEmitter singleton)
│ (core/)         │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ telegramListener    │ (Event listener)
│ (syndication/)      │
└────────┬────────────┘
         │
         ├── On update: Try edit existing message
         │
         └── Create new post
              │
              ▼
         ┌─────────────────────┐
         │ TelegramBotService  │ (API integration)
         │ (syndication/)      │
         └────────┬────────────┘
                  │
                  ├── 1 image → sendPhoto()
                  └── 2+ images → sendMediaGroup()
                       │
                       ▼
                  Telegram API
```

## Implementation

### Event Emitter

**File:** `backend/src/core/listingEmitter.js:1-7`

```javascript
import { EventEmitter } from 'events';
const listingEmitter = new EventEmitter();
listingEmitter.setMaxListeners(20);
export default listingEmitter;
```

### Event Listener

**File:** `backend/src/modules/syndication/listeners/telegramListener.js:125-143`

```javascript
export function initializeListingListeners() {
  if (listenersInitialized) return;

  listingEmitter.on('listing:created', (listingId) => {
    handleSyndication(listingId, 'listing:created');
  });

  listingEmitter.on('listing:updated', (listingId) => {
    handleSyndication(listingId, 'listing:updated');
  });

  listenersInitialized = true;
}
```

**Initialized in:** `backend/src/server.js:12`

```javascript
initializeListingListeners();
```

### Syndication Handler

**File:** `backend/src/modules/syndication/listeners/telegramListener.js:7-123`

Flow for `listing:updated`:

1. Fetch listing with category and agent
2. Check for existing successful syndication log with `messageId`
3. If found, attempt `editMessageCaption()`
4. If edit fails (message deleted, etc.), fall through to create new post
5. For `listing:created` or no existing message, create new post
6. Log result to `SyndicationLog` table

### Telegram Bot Service

**File:** `backend/src/modules/syndication/services/telegramBot.service.js`

#### Configuration

```javascript
// Lines 10-15
async function getTelegramConfig() {
  const config = await prisma.syndicationConfig.findUnique({
    where: { platform: 'TELEGRAM' },
  });
  return config;
}
```

#### Caption Generation

**File:** `telegramBot.service.js:54-104`

```javascript
function buildCaption(listing) {
  // Custom caption override
  if (listing.customTelegramCaption && listing.customTelegramCaption.trim()) {
    return listing.customTelegramCaption.trim();
  }

  // Auto-generated caption
  const sections = [
    `*${title}*`,
    '',
    `💰 *Price:* ${price}`,
    `📍 *Location:* ${location}`,
    `🏷 *Category:* ${category}`,
    `📋 *Status:* ${status}`,
  ];

  // Add dynamic attributes
  if (attrLines.length > 0) {
    sections.push('', '*Details:*');
    sections.push(...attrLines);
  }

  // Add agent info
  sections.push(
    '',
    '─────────────────',
    `👤 *Agent:* ${agentName}`,
    `📞 *Phone:* ${phone}`,
    '',
    'Listed on _BROS Technology_',
  );

  return sections.join('\n');
}
```

#### Image Handling

**File:** `telegramBot.service.js:158-247`

- **Single image:** `sendPhoto()` with caption
- **Multiple images:** `sendMediaGroup()` (max 10 images)
- Images read from local filesystem or fetched from URLs
- Converted to FormData blobs for Telegram API

```javascript
// Lines 186-247
async function sendMediaGroup(caption, imagePaths, telegramApi, channelId) {
  const validPaths = imagePaths.slice(0, MAX_IMAGES_IN_GROUP); // Max 10
  // ... read images, build FormData, send to Telegram API
}
```

#### Message Operations

```javascript
// Edit message caption (line 342-357)
static async editMessageCaption(messageId, newCaption) {
  await axios.post(`${telegramApi}/editMessageCaption`, {
    chat_id: channelId,
    message_id: messageId,
    caption: newCaption,
    parse_mode: 'Markdown',
  });
}

// Delete message (line 330-340)
static async deleteMessage(messageId) {
  await axios.post(`${telegramApi}/deleteMessage`, {
    chat_id: channelId,
    message_id: messageId,
  });
}
```

---

## Syndication Log

Every syndication attempt is logged to `SyndicationLog` table:

| Field | Description |
|-------|-------------|
| `listingId` | Related listing |
| `platform` | "TELEGRAM" |
| `status` | PENDING, SUCCESS, FAILED |
| `action` | NEW_POST, EDITED, DELETED |
| `channelInfo` | Channel ID |
| `messageId` | Telegram message_id (for edits) |
| `errorMessage` | Error details if failed |
| `runAt` | Execution timestamp |

---

## API Endpoints

### Configuration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/syndication/config` | 🔒 | List all configs |
| `GET` | `/api/syndication/config/:platform` | 🔒 | Get platform config |
| `POST` | `/api/syndication/config` | 🔒 (Admin) | Create/update config |
| `DELETE` | `/api/syndication/config/:platform` | 🔒 (Admin) | Delete config |

### Telegram Operations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/syndication/telegram/info` | 🔒 | Get bot + channel info |
| `POST` | `/api/syndication/delete-message/:messageId` | 🔒 (Admin) | Delete Telegram message |
| `POST` | `/api/syndication/edit-message/:messageId` | 🔒 (Admin) | Edit message caption |

### Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/syndication/logs` | 🔒 | List logs (paginated) |
| `POST` | `/api/syndication/retry/:id` | 🔒 | Retry failed syndication |

---

## Retry Logic

**File:** `syndication.routes.js:183-251`

Failed syndications can be retried:

```javascript
router.post('/retry/:id', authenticate(), async (req, res) => {
  // 1. Find existing log
  // 2. Verify ownership (AGENT can only retry own)
  // 3. Re-emit listing:created event
  // 4. Update log status to PENDING
});
```

---

## Configuration

### Bot Token

Get from [@BotFather](https://t.me/BotFather) on Telegram.

### Channel ID

1. Add bot to your channel as admin
2. Send a message to the channel
3. Use `https://api.telegram.org/bot<TOKEN>/getUpdates` to find the channel ID

### Setup via API

```bash
curl -X POST http://localhost:5000/api/syndication/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "TELEGRAM",
    "botToken": "123456:ABC-DEF...",
    "channelId": "@your_channel",
    "isActive": true
  }'
```

---

## Constants

**File:** `telegramBot.service.js:6-8`

```javascript
const MAX_IMAGES_IN_GROUP = 10;      // Telegram limit
const REQUEST_TIMEOUT_MS = 30_000;   // 30 second timeout
const MAX_CAPTION_LENGTH = 1024;     // Telegram caption limit
```
