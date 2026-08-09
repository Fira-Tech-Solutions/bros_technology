import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put } from '../lib/api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await get('/api/settings');
      return res.data?.data || res.data?.settings || res.data || {};
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => put('/api/settings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
