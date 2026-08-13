import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { generateToken } from './auth.middleware.js';
import { processProfileImage } from '../../utils/imageProcessor.js';
import { sendPasswordResetEmail } from '../../utils/brevo.js';

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
  whatsapp: true,
  tiktok: true,
  youtube: true,
  website: true,
  customSocials: true,
  createdAt: true,
};

export async function register(req, res, next) {
  try {
    const { email, password, name, phone, agentCode } = req.body;

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

    // Agent registration requires a valid code
    if (!agentCode || agentCode.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'A valid 6-digit agent code is required to register',
      });
    }

    const codeRecord = await prisma.agentCode.findUnique({
      where: { code: agentCode.trim() },
    });

    if (!codeRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid agent code',
      });
    }

    if (codeRecord.isUsed) {
      return res.status(400).json({
        success: false,
        error: 'This agent code has already been used',
      });
    }

    if (new Date() > codeRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'This agent code has expired. Please request a new one.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user and mark code as used in a transaction
    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: name.trim(),
          phone: phone.trim(),
          role: 'AGENT',
        },
        select: USER_SELECT_SAFE,
      }),
      prisma.agentCode.update({
        where: { id: codeRecord.id },
        data: { isUsed: true },
      }),
    ]);

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
      whatsapp, tiktok, youtube, website,
      customSocials
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
    const socialFields = { facebook, twitter, instagram, linkedin, whatsapp, tiktok, youtube, website };
    for (const [key, value] of Object.entries(socialFields)) {
      if (value !== undefined) {
        updateData[key] = value.trim() || null;
      }
    }

    // Custom social links (JSON array)
    if (customSocials !== undefined) {
      try {
        updateData.customSocials = typeof customSocials === 'string' 
          ? JSON.parse(customSocials) 
          : customSocials;
      } catch {
        updateData.customSocials = [];
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

// Forgot password - send reset email
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a reset code has been sent',
      });
    }

    // Generate reset token (UUID)
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      },
    });

    // Build reset link
    const resetLink = `https://admin.broslaptop.com/reset-password?email=${encodeURIComponent(user.email)}&token=${resetToken}`;

    // Send email with reset link via Brevo
    const emailResult = await sendPasswordResetEmail(user.email, resetLink);
    if (!emailResult.success) {
      console.error('[Password Reset] Failed to send email:', emailResult.error);
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a reset code has been sent',
    });
  } catch (error) {
    next(error);
  }
}

// Reset password with token
export async function resetPassword(req, res, next) {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, token, and new password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token',
      });
    }

    if (!user.passwordResetToken || user.passwordResetToken !== token) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token',
      });
    }

    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
}
