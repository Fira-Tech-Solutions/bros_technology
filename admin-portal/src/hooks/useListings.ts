import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';

const fetchAll = async (endpoint: string) => {
  const firstRes = await get(endpoint, { params: { page: 1, limit: 100 } });
  const firstChunk = firstRes.data?.data || firstRes.data?.listings || firstRes.data || [];
  const initialList = Array.isArray(firstChunk) ? firstChunk : [];
  const total = firstRes.data?.pagination?.total || initialList.length;
  const totalPages = Math.ceil(total / 100);

  if (totalPages <= 1 || initialList.length < 100) {
    return initialList;
  }

  const remainingPromises = [];
  for (let p = 2; p <= totalPages; p++) {
    remainingPromises.push(
      get(endpoint, { params: { page: p, limit: 100 } }).then((res) => {
        const chunk = res.data?.data || res.data?.listings || res.data || [];
        return Array.isArray(chunk) ? chunk : [];
      })
    );
  }

  const remainingResults = await Promise.all(remainingPromises);
  return [initialList, ...remainingResults].flat();
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
