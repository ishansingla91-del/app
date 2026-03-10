import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

const USER_ID = 1; // Simulated authenticated user

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path, USER_ID],
    queryFn: async () => {
      const url = buildUrl(api.settings.get.path, { userId: USER_ID });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: z.infer<typeof api.settings.update.input>) => {
      const url = buildUrl(api.settings.update.path, { userId: USER_ID });
      const res = await fetch(url, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.settings.get.path, USER_ID] }),
  });
}
