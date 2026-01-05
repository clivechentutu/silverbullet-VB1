import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Target, AnalysisReport, ResearchSession } from '@shared/schema';

export const useTargets = () => {
  return useQuery<Target[]>({
    queryKey: ['/api/targets'],
  });
};

export const useReports = () => {
  return useQuery<AnalysisReport[]>({
    queryKey: ['/api/reports'],
  });
};

export const useSessions = () => {
  return useQuery<ResearchSession[]>({
    queryKey: ['/api/sessions'],
  });
};

export const useAddTarget = () => {
  return useMutation({
    mutationFn: async (target: { name: string; url: string; icon: string }) => {
      const res = await apiRequest('POST', '/api/targets', target);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
    },
  });
};

export const useUpdateTarget = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Target> }) => {
      const res = await apiRequest('PATCH', `/api/targets/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
    },
  });
};

export const useDeleteTarget = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/targets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
    },
  });
};

export const useChatMutation = () => {
  return useMutation({
    mutationFn: async ({ sessionId, message, type }: { sessionId?: number; message: string; type?: string }) => {
      const res = await apiRequest('POST', '/api/chat', { sessionId, message, type });
      return res.json();
    },
    onSuccess: (data, variables) => {
      if (variables.sessionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/sessions', variables.sessionId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      }
    },
  });
};

export const useInitDemoData = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/init-demo-data', { method: 'POST' });
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
  });
};
