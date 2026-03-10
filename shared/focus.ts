export interface FocusSession {
  id: string;
  start: number;
  end: number | null;
  durationSeconds: number;
  completed: boolean;
  mode: "focus";
}

export interface AppUser {
  id: number;
  name: string;
  streak: number;
}

export interface AppStats {
  sessions: number;
  totalFocusSeconds: number;
  completedSessions: number;
  active: boolean;
}
