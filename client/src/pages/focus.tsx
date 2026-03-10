import { useEffect, useState } from "react";
import YouTube from "react-youtube";
import { useLocation } from "wouter";
import {
  Play,
  Pause,
  X,
  CheckCircle,
  Home,
  Clock,
  Video,
  Download,
  Chrome,
  Info,
} from "lucide-react";
import { useYouTubeFilter } from "@/hooks/use-youtube";
import { useSettings } from "@/hooks/use-settings";
import { useFocusTimer } from "@/hooks/useFocusTimer";

type TimerState = "idle" | "running" | "paused" | "blocked" | "success";

export default function FocusMode() {
  const [, setLocation] = useLocation();
  const { checkVideo, isChecking } = useYouTubeFilter();
  const { data: settings } = useSettings();
  const {
    secondsLeft: timeLeft,
    formatted,
    startFocus,
    stopFocus,
    resetFocus,
    pauseFocus,
    resumeFocus,
  } = useFocusTimer({
    onComplete: () => {
      setTimerState("success");
    },
  });

  const [duration, setDuration] = useState(30);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [customHours, setCustomHours] = useState(0);

  const [timerState, setTimerState] = useState<TimerState>("idle");

  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showExtensionInfo, setShowExtensionInfo] = useState(true);

  useEffect(() => {
    if (settings?.defaultDuration) {
      setDuration(settings.defaultDuration);
      setCustomMinutes(settings.defaultDuration);
      resetFocus(settings.defaultDuration * 60);
    }
  }, [settings, resetFocus]);

  async function startTimer() {
    const totalMinutes = customHours * 60 + customMinutes;
    const safeMinutes = Math.max(5, Math.min(24 * 60, totalMinutes || duration));
    setDuration(safeMinutes);
    setError("");

    try {
      await startFocus(safeMinutes * 60);
      setTimerState("running");
    } catch (err) {
      console.error(err);
      setError("Could not start focus session");
      setTimerState("blocked");
    }
  }

  function pauseTimer() {
    pauseFocus();
    setTimerState("paused");
  }

  function resumeTimer() {
    resumeFocus();
    setTimerState("running");
  }

  async function stopTimer() {
    try {
      await stopFocus();
    } catch (err) {
      console.error(err);
    }
    setTimerState("blocked");
    setError("Focus session stopped early");
  }

  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = videoUrl.trim();
    if (!trimmed) return;

    const result = await checkVideo(trimmed);

    if (result.isEducational && result.videoId) {
      setVideoId(result.videoId);
      setError("");
    } else {
      setTimerState("blocked");
      setError(result.reason || "Video blocked");
    }
  }

  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  if (timerState === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/20 via-destructive/30 to-destructive/40">
        <div className="text-center space-y-6 p-8 glass-panel rounded-3xl max-w-md">
          <div className="animate-bounce">
            <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <X size={60} className="text-destructive" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">Focus Broken</h1>
          <p className="text-xl text-muted-foreground">{error || "Distraction detected"}</p>
          <button
            className="glass-button bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-2 mx-auto"
            onClick={() => setLocation("/")}
          >
            <Home size={24} />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (timerState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-emerald-600/30 to-teal-600/40">
        <div className="text-center space-y-6 p-8 glass-panel rounded-3xl max-w-md">
          <div className="animate-bounce">
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={60} className="text-emerald-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">Amazing Work!</h1>
          <p className="text-xl text-muted-foreground">Focus session completed successfully</p>
          <button
            onClick={() => setLocation("/")}
            className="glass-button bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Home size={24} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="glass-panel rounded-3xl p-8 text-center space-y-6 border border-white/10 bg-gradient-to-br from-white/5 to-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700" />
        
        <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
          <Clock className="text-primary" size={28} />
          <h2 className="text-xl font-semibold">Time Remaining</h2>
        </div>

        <div className="relative z-10">
          <div className="text-6xl md:text-7xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">
            {formatted}
          </div>
          <div className="w-full max-w-md mx-auto mt-6 h-3 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-end gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Hours</label>
            <input
              type="number"
              min={0}
              max={23}
              value={customHours}
              onChange={(e) => setCustomHours(Number(e.target.value) || 0)}
              className="w-24 border border-white/10 bg-black/30 p-3 rounded-xl text-center"
              disabled={timerState === "running" || timerState === "paused"}
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Minutes</label>
            <input
              type="number"
              min={0}
              max={59}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value) || 0)}
              className="w-24 border border-white/10 bg-black/30 p-3 rounded-xl text-center"
              disabled={timerState === "running" || timerState === "paused"}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 relative z-10">
          {timerState === "idle" && (
            <button
              onClick={startTimer}
              className="glass-button bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2"
            >
              <Play size={20} />
              Start
            </button>
          )}
          {timerState === "running" && (
            <button
              onClick={pauseTimer}
              className="glass-button bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2"
            >
              <Pause size={20} />
              Pause
            </button>
          )}
          {timerState === "paused" && (
            <button
              onClick={resumeTimer}
              className="glass-button bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2"
            >
              <Play size={20} />
              Resume
            </button>
          )}
          {(timerState === "running" || timerState === "paused" || timerState === "idle") && (
            <button
              onClick={stopTimer}
              className="glass-button bg-destructive/20 text-destructive border-destructive/30 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2"
            >
              <X size={20} />
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Video className="text-primary" size={24} />
          <h2 className="text-2xl font-bold">Study Video Verification</h2>
        </div>
        <form onSubmit={handleVideoSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Paste YouTube link"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1 border border-white/10 bg-black/30 p-4 rounded-2xl"
          />
          <button
            type="submit"
            disabled={isChecking}
            className="glass-button bg-primary/20 text-primary border-primary/30 px-6 py-4 rounded-2xl font-semibold disabled:opacity-60"
          >
            {isChecking ? "Checking..." : "Verify"}
          </button>
        </form>
        {videoId && (
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <YouTube
              videoId={videoId}
              opts={{
                width: "100%",
                height: "420",
                playerVars: { rel: 0, modestbranding: 1 },
              }}
            />
          </div>
        )}
      </div>

      {showExtensionInfo && (
        <div className="glass-panel rounded-3xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <Chrome className="text-primary mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Chrome Extension
                <Info size={18} className="text-muted-foreground" />
              </h3>
              <p className="text-muted-foreground mt-2">
                Install the extension from the <code>focus-extension</code> folder to block distracting sites during active sessions.
              </p>
            </div>
            <button
              onClick={() => setShowExtensionInfo(false)}
              className="text-muted-foreground hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
