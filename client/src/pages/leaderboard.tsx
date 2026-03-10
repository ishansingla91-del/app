import { Crown, Medal, ArrowUp, ArrowDown } from "lucide-react";
import { useLeaderboard } from "@/hooks/use-users";

export default function Leaderboard() {
  const { data: users, isLoading } = useLeaderboard();

  if (isLoading) return <div className="p-8">Loading leaderboard...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display font-bold mb-4 inline-flex items-center gap-4">
          <Crown className="w-12 h-12 text-yellow-400" />
          Global Rankings
        </h1>
        <p className="text-muted-foreground text-lg">See how you stack up against the elite.</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-6 bg-white/5 border-b border-white/10 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-3 text-right">Total Focus</div>
          <div className="col-span-2 text-right">Streak</div>
        </div>

        {/* List */}
        <div className="divide-y divide-white/5">
          {users?.map((user: any, idx: number) => {
            const isTop3 = idx < 3;
            const rankColors = [
              "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
              "text-slate-300 bg-slate-300/10 border-slate-300/20",
              "text-amber-600 bg-amber-600/10 border-amber-600/20"
            ];

            return (
              <div key={user.id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors group">
                <div className="col-span-2 flex justify-center">
                  {isTop3 ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${rankColors[idx]} font-bold text-lg`}>
                      {idx + 1}
                    </div>
                  ) : (
                    <span className="font-display font-bold text-xl text-muted-foreground group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                  )}
                </div>
                
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-lg">{user.username}</span>
                  {idx === 0 && <Medal className="w-5 h-5 text-yellow-400" />}
                </div>

                <div className="col-span-3 text-right font-mono text-lg">
                  {Math.floor(user.totalFocusMinutes / 60)}h {user.totalFocusMinutes % 60}m
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1 font-bold text-orange-400">
                  {user.currentStreak} <span className="text-xl">🔥</span>
                </div>
              </div>
            );
          })}
          
          {(!users || users.length === 0) && (
            <div className="p-12 text-center text-muted-foreground">
              No data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
