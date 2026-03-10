import { useQuery } from "@tanstack/react-query";
import type { AppUser } from "@shared/focus";

export function useUser() {
  return useQuery<AppUser>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      return res.json();
    },
  });
}
