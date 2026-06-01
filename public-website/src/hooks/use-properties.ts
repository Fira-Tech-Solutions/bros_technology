import { useQuery } from "@tanstack/react-query";
import { fetchProperties, fetchProperty, type PropertyFilters } from "@/lib/api/properties";

export const useProperties = (params?: PropertyFilters) =>
  useQuery({
    queryKey: ["properties", params ?? {}],
    queryFn: () => fetchProperties(params),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

export const useProperty = (id: string) =>
  useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
    staleTime: 60_000,
  });
