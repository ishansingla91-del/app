import { useQuery } from "@tanstack/react-query";
import type { AppStats } from "@shared/focus";

export function useStats() {
  return useQuery<AppStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      return res.json();
    },
    refetchInterval: 5000,
  });
}
