import { useQuery } from "@tanstack/react-query";

export function useFocusTip() {
  return useQuery<{ tip: string }>({
    queryKey: ["focus-tip"],
    queryFn: async () => {
      const res = await fetch("/api/ai/focus-tip", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch focus tip");
      }

      return res.json();
    },
    staleTime: 60_000,
  });
}
