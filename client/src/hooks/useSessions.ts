import { useQuery } from "@tanstack/react-query";
import type { FocusSession } from "@shared/focus";

export function useSessions() {
  return useQuery<FocusSession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch sessions");
      }

      return res.json();
    },
  });
}
