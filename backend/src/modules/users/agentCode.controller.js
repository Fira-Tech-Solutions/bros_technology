import prisma from '../../config/prisma.js';

const CODE_EXPIRY_MINUTES = 30;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/agent-codes — Admin generates a code
export async function generateAgentCode(req, res, next) {
  try {
    const { agentName, agentPhone } = req.body;

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    const agentCode = await prisma.agentCode.create({
      data: {
        code,
        createdById: req.user.id,
        agentName: agentName?.trim() || null,
        agentPhone: agentPhone?.trim() || null,
        expiresAt,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: agentCode.id,
        code: agentCode.code,
        agentName: agentCode.agentName,
        agentPhone: agentCode.agentPhone,
        expiresAt: agentCode.expiresAt,
        createdAt: agentCode.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/agent-codes — Admin lists all codes
export async function listAgentCodes(req, res, next) {
  try {
    const codes = await prisma.agentCode.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        agentName: true,
        agentPhone: true,
        isUsed: true,
        usedById: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ success: true, data: codes });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/auth/agent-codes/:id — Admin revokes a code
export async function revokeAgentCode(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.agentCode.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Code revoked' });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/verify-agent-code — Public: verify a code during signup
export async function verifyAgentCode(req, res, next) {
  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'A valid 6-digit code is required',
      });
    }

    const agentCode = await prisma.agentCode.findUnique({
      where: { code: code.trim() },
    });

    if (!agentCode) {
      return res.status(404).json({
        success: false,
        error: 'Invalid code',
      });
    }

    if (agentCode.isUsed) {
      return res.status(400).json({
        success: false,
        error: 'This code has already been used',
      });
    }

    if (new Date() > agentCode.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'This code has expired. Please request a new one from the admin.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        agentName: agentCode.agentName,
        agentPhone: agentCode.agentPhone,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/agents — Admin lists all agents
export async function listAgents(req, res, next) {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
    });

    return res.status(200).json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/auth/agents/:id — Admin removes an agent
export async function removeAgent(req, res, next) {
  try {
    const { id } = req.params;

    const agent = await prisma.user.findUnique({ where: { id } });
    if (!agent || agent.role !== 'AGENT') {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Agent removed' });
  } catch (error) {
    next(error);
  }
}
