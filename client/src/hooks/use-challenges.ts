import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

const USER_ID = 1; // Simulated authenticated user

export function useAllChallenges() {
  return useQuery({
    queryKey: [api.challenges.list.path],
    queryFn: async () => {
      const res = await fetch(api.challenges.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return api.challenges.list.responses[200].parse(await res.json());
    },
  });
}

export function useUserChallenges() {
  return useQuery({
    queryKey: [api.userChallenges.list.path, USER_ID],
    queryFn: async () => {
      const url = buildUrl(api.userChallenges.list.path, { userId: USER_ID });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user challenges");
      return api.userChallenges.list.responses[200].parse(await res.json());
    },
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: number) => {
      const url = buildUrl(api.userChallenges.create.path, { userId: USER_ID });
      const payload = { challengeId, userId: USER_ID };
      const res = await fetch(url, {
        method: api.userChallenges.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to join challenge");
      return api.userChallenges.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.userChallenges.list.path, USER_ID] }),
  });
}

export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, progress, completed }: { id: number, progress: number, completed: boolean }) => {
      const url = buildUrl(api.userChallenges.update.path, { id });
      const payload = { progress, completed };
      const res = await fetch(url, {
        method: api.userChallenges.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update challenge");
      return api.userChallenges.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.userChallenges.list.path, USER_ID] }),
  });
}
