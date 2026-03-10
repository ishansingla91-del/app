import { Flame, Target, Trophy, Clock, Play, Timer } from "lucide-react";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-users";
import { useSessions } from "@/hooks/use-sessions";
import { useFocusTip } from "@/hooks/useFocusTip";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/stats-card";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: focusTip } = useFocusTip();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (userLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const recentSessions = sessions?.slice(0, 3) || [];
  const hoursFocused = Math.floor((user?.totalFocusMinutes || 0) / 60);
  const minutesFocused = (user?.totalFocusMinutes || 0) % 60;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl mb-2">Welcome back, {user?.username}</h1>
          <p className="text-muted-foreground text-lg">Ready to lock in and conquer your goals today?</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/focus" className="glass-button bg-primary/20 text-primary border-primary/30 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 animate-pulse-glow">
            <Play className="w-6 h-6 fill-current" />
            Start Focus Session
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Focus Sessions" value={stats?.totalSessions ?? 0} />
        <StatsCard title="Completed Sessions" value={stats?.completedSessions ?? 0} />
        <StatsCard title="Focus Minutes" value={stats?.focusMinutes ?? 0} />
        <StatsCard title="Study Streak" value={user?.streak ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Focus Time" 
          value={`${hoursFocused}h ${minutesFocused}m`}
          icon={Clock} 
          color="text-blue-400" 
          bg="bg-blue-400/10" 
        />
        <StatCard 
          title="Current Streak" 
          value={`${user?.streak || 0} Days`}
          icon={Flame} 
          color="text-orange-500" 
          bg="bg-orange-500/10" 
        />
        <StatCard 
          title="Longest Streak" 
          value={`${user?.longestStreak || 0} Days`}
          icon={Trophy} 
          color="text-yellow-400" 
          bg="bg-yellow-400/10" 
        />
        <StatCard 
          title="Sessions Completed" 
          value={user?.completedSessions?.toString() || "0"}
          icon={Target} 
          color="text-emerald-400" 
          bg="bg-emerald-400/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Recent Activity</h2>
            <Link href="/analytics" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          
          {recentSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-2xl bg-white/5">
              <Timer className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sessions recorded yet.</p>
              <p className="text-sm mt-1">Start a focus session to see activity here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}`}>
                      {session.completed ? <Target className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{session.durationMinutes} Minutes Focus</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${session.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}`}>
                    {session.completed ? 'Completed' : 'Abandoned'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Quick Challenge Widget */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/5 to-primary/5 border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
            
            <h2 className="text-2xl mb-2 relative z-10">Daily Challenge</h2>
            <p className="text-muted-foreground mb-6 relative z-10">Complete 60 mins of focus today</p>
            
            <div className="relative pt-4 pb-8 z-10">
              <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-primary to-accent w-[45%] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              </div>
              <div className="flex justify-between mt-2 text-sm font-medium">
                <span className="text-white">27 mins</span>
                <span className="text-muted-foreground">60 mins</span>
              </div>
            </div>

            <Link href="/focus" className="w-full block text-center glass-button bg-white/10 py-3 rounded-xl font-semibold relative z-10">
              Continue Progress
            </Link>
          </div>

          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
            <h3 className="text-2xl mb-3">AI Focus Coach</h3>
            <p className="text-muted-foreground leading-relaxed">
              {focusTip?.tip ?? "Stay consistent and protect your attention."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="glass-panel p-6 rounded-3xl hover:bg-white/10 transition-colors duration-300 group">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-display font-bold mt-1">{value}</h3>
        </div>
      </div>
    </div>
  );
}
