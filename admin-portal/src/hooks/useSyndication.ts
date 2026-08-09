import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../lib/api';

export function useSyndicationConfig() {
  return useQuery({
    queryKey: ['syndicationConfig'],
    queryFn: async () => {
      const res = await get('/api/syndication/config');
      const configs = res.data?.data || res.data || [];
      const cfg = Array.isArray(configs) ? configs.find((c: any) => c.platform === 'TELEGRAM') || configs[0] : configs;
      return cfg || null;
    },
  });
}

export function useSyndicationLogs() {
  return useQuery({
    queryKey: ['syndicationLogs'],
    queryFn: async () => {
      const res = await get('/api/syndication/logs', { params: { limit: 200 } });
      const raw = res.data?.data || res.data?.logs || res.data || [];
      return Array.isArray(raw) ? raw : [];
    },
  });
}

export function useWebhookInfo() {
  return useQuery({
    queryKey: ['webhookInfo'],
    queryFn: async () => {
      const res = await get('/api/syndication/telegram/webhook-info');
      return res.data?.data || res.data;
    },
    retry: false,
  });
}

export function useSaveSyndicationConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { platform: string; botToken: string; channelId: string; isActive: boolean }) =>
      post('/api/syndication/config', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['syndicationConfig'] });
      qc.invalidateQueries({ queryKey: ['webhookInfo'] });
    },
  });
}

export function useRetrySyndication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post(`/api/syndication/retry/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['syndicationLogs'] });
    },
  });
}

export function useDeleteSyndicationMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ msgId, logId }: { msgId: string; logId: string }) =>
      post(`/api/syndication/delete-message/${msgId}`, { logId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['syndicationLogs'] });
    },
  });
}

export function useEditSyndicationMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, caption }: { messageId: string; caption: string }) =>
      post(`/api/syndication/edit-message/${messageId}`, { caption }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['syndicationLogs'] });
    },
  });
}
