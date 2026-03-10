import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

const USER_ID = 1; // Simulated authenticated user

export function useUser() {
  return useQuery({
    queryKey: [api.users.get.path, USER_ID],
    queryFn: async () => {
      const url = buildUrl(api.users.get.path, { id: USER_ID });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("User not found");
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.users.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: z.infer<typeof api.users.update.input>) => {
      const url = buildUrl(api.users.update.path, { id: USER_ID });
      const res = await fetch(url, {
        method: api.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user");
      return api.users.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, USER_ID] });
      queryClient.invalidateQueries({ queryKey: [api.users.leaderboard.path] });
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: [api.users.leaderboard.path],
    queryFn: async () => {
      const res = await fetch(api.users.leaderboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.users.leaderboard.responses[200].parse(await res.json());
    },
  });
}
