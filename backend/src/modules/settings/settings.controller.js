import prisma from '../../config/prisma.js';

const DEFAULT_SETTINGS = {
  siteName: 'BROS Technology',
  whatsappNumber: '+251972195934',
  callNumber1: '+251972195934',
  callNumber2: '+251980564814',
  telegramHandle: 'brostechnology',
  adminTelegramUsername: '',
  miniAppUrl: '',
  contactEmail: 'girmasamuel200@gmail.com',
  facebookUrl: 'https://facebook.com/brostechnology',
  instagramUrl: 'https://instagram.com/brostechnology',
  tiktokUrl: 'https://tiktok.com/@brostechnology',
  youtubeUrl: 'https://youtube.com/@brostechnology',
  location: 'Addis Ababa, Ethiopia',
  businessHours: 'Mon – Sat, 9:00 AM – 7:00 PM',
  shopGoogleMapUrl: '',
  shopMapAddress: '',
};

export async function getSettings(_req, res) {
  try {
    const rows = await prisma.setting.findMany();
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return res.json({ success: true, data: settings });
  } catch (err) {
    console.error('[Settings] Fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req, res) {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid request body' });
    }

    const upserts = Object.entries(updates).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await Promise.all(upserts);

    const rows = await prisma.setting.findMany();
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return res.json({ success: true, data: settings });
  } catch (err) {
    console.error('[Settings] Update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
}
