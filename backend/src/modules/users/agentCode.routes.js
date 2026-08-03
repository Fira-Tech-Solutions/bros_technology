import { Router } from 'express';
import { authenticate, authorize } from './auth.middleware.js';
import {
  generateAgentCode,
  listAgentCodes,
  revokeAgentCode,
  verifyAgentCode,
  listAgents,
  removeAgent,
} from './agentCode.controller.js';

const router = Router();

// Admin: generate a code
router.post('/agent-codes', authenticate(), authorize('SUPER_ADMIN'), generateAgentCode);

// Admin: list all codes
router.get('/agent-codes', authenticate(), authorize('SUPER_ADMIN'), listAgentCodes);

// Admin: revoke a code
router.delete('/agent-codes/:id', authenticate(), authorize('SUPER_ADMIN'), revokeAgentCode);

// Public: verify a code during signup
router.post('/verify-agent-code', verifyAgentCode);

// Admin: list all agents
router.get('/agents', authenticate(), authorize('SUPER_ADMIN'), listAgents);

// Admin: remove an agent
router.delete('/agents/:id', authenticate(), authorize('SUPER_ADMIN'), removeAgent);

export default router;
