import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const DEFAULT_FOCUS_SECONDS = 25 * 60;
const DEFAULT_USER_ID = 1;

interface UseFocusTimerOptions {
  onComplete?: () => void;
}

export function useFocusTimer(options: UseFocusTimerOptions = {}) {
  const { onComplete } = options;
  const queryClient = useQueryClient();
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const fallbackSessionIdRef = useRef<number | null>(null);
  const onCompleteRef = useRef<UseFocusTimerOptions["onComplete"]>(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const invalidateFocusQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["sessions"] }),
      queryClient.invalidateQueries({ queryKey: ["stats"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (part) => typeof part === "string" && part.includes("/sessions"),
          ),
      }),
    ]);
  }, [queryClient]);

  const endFallbackSession = useCallback(async (completed: boolean) => {
    if (!fallbackSessionIdRef.current) return;

    const res = await fetch(`/api/sessions/${fallbackSessionIdRef.current}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) {
      throw new Error("Failed to stop focus session");
    }

    fallbackSessionIdRef.current = null;
  }, []);

  const endFocusRequest = useCallback(
    async (completed: boolean) => {
      const res = await fetch("/api/focus/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed }),
      });

      if (res.ok) return;

      if (res.status !== 404) {
        throw new Error("Failed to stop focus session");
      }

      await endFallbackSession(completed);
    },
    [endFallbackSession],
  );

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);

          void (async () => {
            try {
              await endFocusRequest(true);
              await invalidateFocusQueries();
              onCompleteRef.current?.();
            } catch (error) {
              console.error(error);
            }
          })();

          return DEFAULT_FOCUS_SECONDS;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [running, endFocusRequest, invalidateFocusQueries]);

  const formatted = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }, [secondsLeft]);

  const startFocus = useCallback(
    async (customSeconds?: number) => {
      const durationSeconds =
        customSeconds ?? secondsLeft ?? DEFAULT_FOCUS_SECONDS;

      const res = await fetch("/api/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          durationSeconds,
        }),
      });

      if (!res.ok) {
        if (res.status !== 404) {
          throw new Error("Failed to start focus session");
        }

        const fallbackRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: DEFAULT_USER_ID,
            durationMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
            completed: false,
          }),
        });

        if (!fallbackRes.ok) {
          throw new Error("Failed to start focus session");
        }

        const session = (await fallbackRes.json()) as { id?: number };
        fallbackSessionIdRef.current =
          typeof session.id === "number" ? session.id : null;
      } else {
        fallbackSessionIdRef.current = null;
      }

      setRunning(true);
      setSecondsLeft(durationSeconds);
      await queryClient.invalidateQueries({ queryKey: ["stats"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    [queryClient, secondsLeft],
  );

  const stopFocus = useCallback(async () => {
    await endFocusRequest(false);
    setRunning(false);
    await invalidateFocusQueries();
  }, [endFocusRequest, invalidateFocusQueries]);

  const resetFocus = useCallback((newSeconds = DEFAULT_FOCUS_SECONDS) => {
    setRunning(false);
    setSecondsLeft(newSeconds);
    fallbackSessionIdRef.current = null;
  }, []);

  const pauseFocus = useCallback(() => {
    setRunning(false);
  }, []);

  const resumeFocus = useCallback(() => {
    setRunning(true);
  }, []);

  return {
    secondsLeft,
    formatted,
    running,
    startFocus,
    stopFocus,
    resetFocus,
    pauseFocus,
    resumeFocus,
    setSecondsLeft,
  };
}
