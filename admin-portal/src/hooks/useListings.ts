import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';
import { toast } from '../contexts/ToastContext';

const getErrorMessage = (err: any) => {
  const data = err?.response?.data;
  if (data?.details && Array.isArray(data.details)) {
    const msgs = data.details.map((d: any) => d.message).filter(Boolean).join(', ');
    return msgs || data?.error || 'Something went wrong';
  }
  return data?.error || err?.message || 'Something went wrong';
};

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
    // Keep the optimistic entry visible while the background upload completes
    // and avoid an unnecessary refetch+spinner when navigating back.
    staleTime: 30_000,
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

const optimisticListing = (fd: FormData) => {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let attributes: any = {};
  try {
    attributes = JSON.parse((fd.get('attributes') as string) || '{}');
  } catch {}
  return {
    id: tempId,
    tempId,
    title: (fd.get('title') as string) || 'Untitled Product',
    description: (fd.get('description') as string) || '',
    price: parseFloat(fd.get('price') as string) || 0,
    categoryId: fd.get('categoryId') as string,
    agentId: fd.get('agentId') as string,
    status: 'AVAILABLE',
    stockQuantity: parseInt(fd.get('stockQuantity') as string) || 1,
    attributes,
    images: [],
    category: null,
    agent: { name: '' },
    createdAt: new Date().toISOString(),
    _optimistic: true,
  };
};

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => post('/api/listings', fd, { timeout: 120000 }),
    onMutate: async (fd) => {
      await qc.cancelQueries({ queryKey: ['listings'] });
      const prev = qc.getQueryData<any[]>(['listings']);
      const optimistic = optimisticListing(fd);
      qc.setQueryData<any[]>(['listings'], (old: any[] | undefined) => [optimistic, ...(old || [])]);
      return { tempId: optimistic.tempId, prev };
    },
    onSuccess: (data, _fd, ctx) => {
      const created = data?.data?.data || data?.data?.listing || data?.data;
      qc.setQueryData<any[]>(['listings'], (old: any[] | undefined) =>
        (old || []).map((l) => (l.tempId === ctx?.tempId ? created : l))
      );
      toast('Product created successfully', 'success');
    },
    onError: (err, _fd, ctx) => {
      if (ctx?.prev) qc.setQueryData<any[]>(['listings'], ctx.prev);
      toast(getErrorMessage(err), 'error');
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
