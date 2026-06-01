# Project Plan

## Step 1: Establish the Database & Media Engine

- Set up the backend database first.
- Use a unified `products` table rather than separate tables for every item type.
- Include common fields such as:
  - `title`
  - `price`
  - `description`
  - `images`
- Use a polymorphic layout or a JSON field like `specifications` for custom item data.
  - Example: `mileage` for cars, `bedrooms` for houses.

### Media engine

- Build an image processing utility early.
- When the admin app uploads an image:
  - compress it to WebP,
  - store it efficiently,
  - serve it quickly to public pages.
- This reduces cloud storage costs and improves page load times.

## Step 2: Build the Backend-to-Telegram Flow

- Before building UI screens, ensure the backend can send Telegram messages.

### Telegram setup

1. Create a Telegram bot via `@BotFather`.
2. Save the `BOT_TOKEN`.
3. Create a public channel.
4. Add the bot as an administrator with permission to post.

### Implementation

- Add a service method in `backend/src/modules/syndication/services/telegramBot.service.js`.
- The service should send a `POST` request to:
  - `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendPhoto`
- The request must include:
  - the image link,
  - the text caption.

## Step 3: Scaffold the Under-10MB Admin App

- Keep the admin app lightweight from day one.
- Avoid heavy UI libraries like NativeBase or large Material design toolkits.
- Prefer standard React Native components or a lightweight utility solution like Tailwind (NativeWind).

### Expo production configuration

- Configure build targets correctly for production.
- Use Android App Bundles (AAB) instead of a universal APK.
- AAB automatically splits the binary across screen densities and CPU architectures.
- This helps keep the actual download size closer to `6MB–8MB`.
