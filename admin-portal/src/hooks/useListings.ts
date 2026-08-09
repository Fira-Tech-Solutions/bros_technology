import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';

const fetchAll = async (endpoint: string) => {
  let all: any[] = [];
  let page = 1;
  while (true) {
    const res = await get(endpoint, { params: { page, limit: 100 } });
    const chunk = res.data?.data || res.data?.listings || res.data || [];
    const arr = Array.isArray(chunk) ? chunk : [];
    all = [...all, ...arr];
    const total = res.data?.pagination?.total || 0;
    if (all.length >= total || arr.length < 100) break;
    page++;
  }
  return all;
};

export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: () => fetchAll('/api/listings'),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const res = await get(`/api/listings/${id}`);
      return res.data?.data || res.data?.listing || res.data || {};
    },
    enabled: !!id,
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/api/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['assetStats'] });
    },
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => post('/api/listings', fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => patch(`/api/listings/${id}`, fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
