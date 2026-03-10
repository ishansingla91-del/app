import { useState, useCallback } from "react";

export interface YouTubeCheckResult {
  ok: boolean;
  isEducational: boolean;
  confidence: number;
  title?: string;
  reason?: string;
  videoId?: string;
  channelTitle?: string;
}

export function useYouTubeFilter() {
  const [isChecking, setIsChecking] = useState(false);

  const checkVideo = useCallback(async (urlOrId: string): Promise<YouTubeCheckResult> => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/youtube/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urlOrId }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          ok: false,
          isEducational: false,
          confidence: 0,
          reason: data?.reason || "Unable to verify video",
        };
      }

      return data;
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        isEducational: false,
        confidence: 0,
        reason: "Verification failed. Only study videos are allowed.",
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkVideo,
    isChecking,
  };
}
