import axios from 'axios';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';

const REQUEST_TIMEOUT_MS = 10_000;

async function getBotToken() {
  const config = await prisma.syndicationConfig.findUnique({
    where: { platform: 'TELEGRAM' },
  });
  return config?.botToken;
}

function generateConnectionCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function getTelegramUserInfo(chatId, botToken) {
  try {
    const { data } = await axios.get(
      `https://api.telegram.org/bot${botToken}/getChat`,
      { params: { chat_id: chatId }, timeout: REQUEST_TIMEOUT_MS }
    );
    if (data.ok) {
      const chat = data.result;
      let photoUrl = null;
      if (chat.photo?.big_file_id) {
        try {
          const { data: fileData } = await axios.get(
            `https://api.telegram.org/bot${botToken}/getFile`,
            { params: { file_id: chat.photo.big_file_id }, timeout: 5000 }
          );
          if (fileData.ok && fileData.result.file_path) {
            photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          }
        } catch {}
      }
      return {
        username: chat.username || null,
        firstName: chat.first_name || null,
        photoUrl,
      };
    }
  } catch {}
  return null;
}

async function sendMessage(chatId, text, botToken, extra = {}) {
  try {
    const { data } = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        ...extra,
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    return data.ok;
  } catch {
    return false;
  }
}

async function sendMenu(chatId, botToken, firstName) {
  const welcome = [
    `👋 Hello${firstName ? `, ${firstName}` : ''}!`,
    '',
    'Welcome to *Retailment Properties Bot*.',
    '',
    '🔗 *Connect Account*',
    'Send your 8-character connection code to link your app account.',
    '',
    '📌 *Commands:*',
    '/start - Show this menu',
    '/help - Get help',
    '/status - Check connection status',
    '/disconnect - Disconnect your account',
  ].join('\n');

  return sendMessage(chatId, welcome, botToken, {
    reply_markup: {
      keyboard: [
        [{ text: '/start' }, { text: '/help' }],
        [{ text: '/status' }, { text: '/disconnect' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
}

async function sendHelp(chatId, botToken) {
  const help = [
    '📖 *How to Connect:*',
    '',
    '1️⃣ Open the *Retailment app*',
    '2️⃣ Go to *Profile* → *Telegram Notifications*',
    '3️⃣ Tap *Connect Telegram*',
    '4️⃣ Copy the 8-character code',
    '5️⃣ Paste the code here',
    '',
    '✅ Once connected, you will receive:',
    '• 📢 Listing notifications',
    '• 🔐 OTP codes for password recovery',
    '• 📬 Important updates',
    '',
    '📌 *Commands:*',
    '/start - Show main menu',
    '/status - Check your connection',
    '/disconnect - Disconnect your account',
  ].join('\n');

  return sendMessage(chatId, help, botToken);
}

async function sendStatus(chatId, botToken, user) {
  if (!user || !user.telegramConnected) {
    return sendMessage(chatId, '❌ *Not Connected*\n\nSend your connection code to link your account.', botToken);
  }

  const status = [
    '✅ *Connected!*',
    '',
    `👤 *Name:* ${user.name || 'N/A'}`,
    `📧 *Email:* ${user.email || 'N/A'}`,
    '',
    'You will receive notifications and OTP codes here.',
  ].join('\n');

  return sendMessage(chatId, status, botToken);
}

async function handleDisconnect(chatId, botToken, user) {
  if (!user || !user.telegramConnected) {
    return sendMessage(chatId, '❌ *Not Connected*\n\nYour account is not linked.', botToken);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramChatId: null,
      telegramConnected: false,
      telegramUsername: null,
      telegramFirstName: null,
      telegramPhotoUrl: null,
    },
  });

  return sendMessage(chatId, '✅ *Disconnected*\n\nYour account has been unlinked. Send a code to reconnect.', botToken);
}

export default class TelegramNotificationService {
  /**
   * Set webhook URL with Telegram API.
   */
  static async setWebhook(webhookUrl) {
    const botToken = await getBotToken();
    if (!botToken) return false;

    try {
      const { data } = await axios.post(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          url: webhookUrl,
          allowed_updates: ['message'],
          drop_pending_updates: true,
        },
        { timeout: REQUEST_TIMEOUT_MS }
      );
      console.log('[TelegramBot] Webhook set:', data.ok, data.description || '');
      return data.ok;
    } catch (err) {
      console.error('[TelegramBot] Failed to set webhook:', err.message);
      return false;
    }
  }

  /**
   * Get current webhook info from Telegram.
   */
  static async getWebhookInfo() {
    const botToken = await getBotToken();
    if (!botToken) return null;

    try {
      const { data } = await axios.get(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
        { timeout: REQUEST_TIMEOUT_MS }
      );
      return data.ok ? data.result : null;
    } catch {
      return null;
    }
  }

  /**
   * Set up bot commands menu via Telegram API.
   */
  static async configureBotCommands() {
    const botToken = await getBotToken();
    if (!botToken) return false;

    try {
      await axios.post(
        `https://api.telegram.org/bot${botToken}/setMyCommands`,
        {
          commands: [
            { command: 'start', description: 'Start the bot / Show menu' },
            { command: 'help', description: 'Get help with connection' },
            { command: 'status', description: 'Check connection status' },
            { command: 'disconnect', description: 'Disconnect your account' },
          ],
        },
        { timeout: REQUEST_TIMEOUT_MS }
      );

      // Set bot description
      await axios.post(
        `https://api.telegram.org/bot${botToken}/setMyDescription`,
        {
          description: 'Retailment Properties Bot - Receive notifications, OTP codes, and property updates. Send your connection code to link your account.',
        },
        { timeout: REQUEST_TIMEOUT_MS }
      );

      // Set bot short description
      await axios.post(
        `https://api.telegram.org/bot${botToken}/setMyShortDescription`,
        {
          short_description: 'Connect your Retailment account for notifications',
        },
        { timeout: REQUEST_TIMEOUT_MS }
      );

      console.log('[TelegramBot] Bot commands configured successfully');
      return true;
    } catch (err) {
      console.error('[TelegramBot] Failed to configure commands:', err.message);
      return false;
    }
  }

  /**
   * Handle incoming bot updates (messages).
   */
  static async handleBotUpdate(update) {
    const botToken = await getBotToken();
    if (!botToken) return;

    const message = update.message;
    if (!message || !message.text || !message.chat) return;

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || '';
    const username = message.from?.username || '';

    // Find if this chat is linked to a user
    const user = await prisma.user.findFirst({
      where: { telegramChatId: String(chatId) },
    });

    // Handle /start command
    if (text.startsWith('/start')) {
      const payload = text.split(' ')[1];
      
      if (payload && /^[A-F0-9]{8}$/i.test(payload)) {
        // Connection code provided
        const result = await this.verifyConnectionCode(payload.toUpperCase(), chatId);
        if (result.success) {
          await sendMessage(chatId, [
            '✅ *Account Connected!*',
            '',
            'Your Telegram account is now linked to Retailment.',
            'You will receive notifications and OTP codes here.',
            '',
            'Type /help for more info.',
          ].join('\n'), botToken);
        } else {
          await sendMessage(chatId, [
            '❌ *Invalid Code*',
            '',
            'The code you entered is invalid or has expired.',
            'Please generate a new code from the app.',
          ].join('\n'), botToken);
        }
      } else {
        // No code - show menu
        await sendMenu(chatId, botToken, firstName);
      }
      return;
    }

    // Handle /help
    if (text === '/help') {
      await sendHelp(chatId, botToken);
      return;
    }

    // Handle /status
    if (text === '/status') {
      await sendStatus(chatId, botToken, user);
      return;
    }

    // Handle /disconnect
    if (text === '/disconnect') {
      await handleDisconnect(chatId, botToken, user);
      return;
    }

    // Handle potential connection code (8 hex characters)
    if (/^[A-F0-9]{8}$/i.test(text)) {
      const result = await this.verifyConnectionCode(text.toUpperCase(), chatId);
      if (result.success) {
        await sendMessage(chatId, [
          '✅ *Account Connected!*',
          '',
          'Your Telegram account is now linked to Retailment.',
          'You will receive notifications and OTP codes here.',
        ].join('\n'), botToken);
      } else {
        await sendMessage(chatId, '❌ *Invalid Code*\n\nThe code is invalid or expired. Open the app and generate a new one.', botToken);
      }
      return;
    }

    // Unknown message
    await sendMessage(chatId, '🤔 I don\'t understand that. Type /help for available commands.', botToken);
  }

  /**
   * Generate a unique connection code for a user.
   */
  static async generateConnectionCode(userId) {
    const code = generateConnectionCode();

    await prisma.user.update({
      where: { id: userId },
      data: {
        telegram: `PENDING:${code}`,
      },
    });

    return { code };
  }

  /**
   * Verify a connection code when user messages the bot.
   */
  static async verifyConnectionCode(code, chatId) {
    const user = await prisma.user.findFirst({
      where: {
        telegram: `PENDING:${code}`,
      },
    });

    if (!user) {
      return { success: false, error: 'Invalid or expired code' };
    }

    const botToken = await getBotToken();
    const tgUserInfo = botToken ? await getTelegramUserInfo(chatId, botToken) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: String(chatId),
        telegramConnected: true,
        telegram: null,
        telegramUsername: tgUserInfo?.username || null,
        telegramFirstName: tgUserInfo?.firstName || null,
        telegramPhotoUrl: tgUserInfo?.photoUrl || null,
      },
    });

    return { success: true, user };
  }

  /**
   * Disconnect Telegram from a user account.
   */
  static async disconnect(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        telegramChatId: null,
        telegramConnected: false,
        telegramUsername: null,
        telegramFirstName: null,
        telegramPhotoUrl: null,
      },
    });
    return true;
  }

  /**
   * Send a direct message to a connected user.
   */
  static async sendMessageToUser(chatId, message) {
    const botToken = await getBotToken();
    if (!botToken) {
      throw new Error('Telegram bot not configured');
    }
    return sendMessage(chatId, message, botToken);
  }

  /**
   * Send OTP to a user via Telegram.
   */
  static async sendOTP(chatId, otp, purpose = 'password reset') {
    const message = [
      '🔐 *Verification Code*',
      '',
      `Your ${purpose} code is:`,
      `\`${otp}\``,
      '',
      'This code expires in 10 minutes.',
      'Do not share this code with anyone.',
    ].join('\n');

    return this.sendMessageToUser(chatId, message);
  }

  /**
   * Send a notification to a user.
   */
  static async sendNotification(chatId, title, body) {
    const message = [
      `📢 *${title}*`,
      '',
      body,
    ].join('\n');

    return this.sendMessageToUser(chatId, message);
  }

  /**
   * Get connection status for a user.
   */
  static async getConnectionStatus(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramConnected: true,
        telegramChatId: true,
        telegram: true,
        telegramUsername: true,
        telegramFirstName: true,
        telegramPhotoUrl: true,
      },
    });

    return {
      connected: user?.telegramConnected || false,
      hasPendingCode: user?.telegram?.startsWith('PENDING:') || false,
      pendingCode: user?.telegram?.replace('PENDING:', '') || null,
      telegramUsername: user?.telegramUsername || null,
      telegramFirstName: user?.telegramFirstName || null,
      telegramPhotoUrl: user?.telegramPhotoUrl || null,
    };
  }
}
