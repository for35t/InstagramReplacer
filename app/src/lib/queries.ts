import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { Category, CursorPage, Post } from './types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories/')).data,
  });
}

export function useMyCategories() {
  return useQuery({
    queryKey: ['myCategories'],
    queryFn: async () => (await api.get<{ categories: number[] }>('/me/categories/')).data.categories,
  });
}

export function useSaveMyCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categories: number[]) => api.put('/me/categories/', { categories }),
    onSuccess: (_response, categories) => {
      queryClient.setQueryData(['myCategories'], categories);
      queryClient.removeQueries({ queryKey: ['feed'] });
    },
  });
}

export function useFeed(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => (await api.get<CursorPage<Post>>(pageParam ?? '/feed/')).data,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next,
    enabled,
  });
}