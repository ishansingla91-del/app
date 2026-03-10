import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

const USER_ID = 1; // Simulated authenticated user

export function useSessions() {
  return useQuery({
    queryKey: [api.sessions.list.path, USER_ID],
    queryFn: async () => {
      const url = buildUrl(api.sessions.list.path, { userId: USER_ID });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      // JSON dates come as strings, zod coerce handles it if schema is setup, 
      // but let's parse safely.
      const data = await res.json();
      return api.sessions.list.responses[200].parse(data);
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<z.infer<typeof api.sessions.create.input>, 'userId'>) => {
      const payload = { ...data, userId: USER_ID };
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create session");
      return api.sessions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path, USER_ID] });
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, USER_ID] }); // Total stats might update
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & z.infer<typeof api.sessions.update.input>) => {
      const url = buildUrl(api.sessions.update.path, { id });
      const res = await fetch(url, {
        method: api.sessions.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update session");
      return api.sessions.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sessions.list.path, USER_ID] }),
  });
}
