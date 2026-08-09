import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';

export function useAssetStats() {
  return useQuery({
    queryKey: ['assetStats'],
    queryFn: async () => {
      const res = await get('/api/commissions/asset-stats');
      return res.data?.data || res.data;
    },
  });
}
