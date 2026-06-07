import prisma from './config/prisma.js';
import { initializeListingListeners } from './modules/syndication/listeners/telegramListener.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('[Server] Database connected');

    initializeListingListeners();

    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();

export default app;
