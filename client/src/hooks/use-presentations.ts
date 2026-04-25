import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPresentation, type Presentation } from "@shared/schema";

// GET /api/presentations
export function usePresentations() {
  return useQuery({
    queryKey: [api.presentations.list.path],
    queryFn: async () => {
      const res = await fetch(api.presentations.list.path);
      if (!res.ok) throw new Error("Failed to fetch presentations");
      return api.presentations.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/presentations/:id
export function usePresentation(id: number) {
  return useQuery({
    queryKey: [api.presentations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.presentations.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch presentation");
      return api.presentations.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/presentations
export function useCreatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPresentation) => {
      const res = await fetch(api.presentations.create.path, {
        method: api.presentations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.presentations.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create presentation");
      }
      return api.presentations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.presentations.list.path] });
    },
  });
}
