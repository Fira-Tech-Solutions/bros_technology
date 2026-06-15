import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { generateToken } from './auth.middleware.js';
import { processProfileImage } from '../../utils/imageProcessor.js';

const SALT_ROUNDS = 12;

const USER_SELECT_SAFE = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  profileImage: true,
  facebook: true,
  twitter: true,
  instagram: true,
  linkedin: true,
  telegram: true,
  whatsapp: true,
  tiktok: true,
  youtube: true,
  website: true,
  telegramConnected: true,
  telegramUsername: true,
  telegramFirstName: true,
  telegramPhotoUrl: true,
  createdAt: true,
};

export async function register(req, res, next) {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, name, phone',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        phone: phone.trim(),
        role: role || 'AGENT',
      },
      select: USER_SELECT_SAFE,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: { user: safeUser, token },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: USER_SELECT_SAFE,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const { 
      name, phone, email,
      facebook, twitter, instagram, linkedin, 
      telegram, whatsapp, tiktok, youtube, website 
    } = req.body;
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
      }

      if (normalizedEmail !== req.user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            error: 'An account with this email already exists',
          });
        }
      }

      updateData.email = normalizedEmail;
    }

    // Social media fields
    const socialFields = { facebook, twitter, instagram, linkedin, telegram, whatsapp, tiktok, youtube, website };
    for (const [key, value] of Object.entries(socialFields)) {
      if (value !== undefined) {
        updateData[key] = value.trim() || null;
      }
    }

    // Handle profile image upload
    if (req.file) {
      try {
        const imageUrl = await processProfileImage(req.file);
        if (imageUrl) {
          updateData.profileImage = imageUrl;
        }
      } catch (err) {
        console.error('Profile image processing error:', err);
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: USER_SELECT_SAFE,
    });

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
