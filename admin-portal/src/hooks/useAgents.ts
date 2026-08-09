import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '../lib/api';

export function useAgentCodes() {
  return useQuery({
    queryKey: ['agentCodes'],
    queryFn: async () => {
      const res = await get('/api/auth/agent-codes');
      const raw = res.data?.codes || res.data?.data || res.data || [];
      return Array.isArray(raw) ? raw : [];
    },
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await get('/api/auth/agents');
      const raw = res.data?.agents || res.data?.data || res.data || [];
      return Array.isArray(raw) ? raw : [];
    },
  });
}

export function useGenerateAgentCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; role: string; maxUses: number }) =>
      post('/api/auth/agent-codes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agentCodes'] });
    },
  });
}

export function useRevokeAgentCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/api/auth/agent-codes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agentCodes'] });
    },
  });
}
