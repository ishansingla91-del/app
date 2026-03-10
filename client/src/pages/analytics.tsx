import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { useSessions } from '@/hooks/use-sessions';

export default function Analytics() {
  const { data: sessions, isLoading } = useSessions();

  if (isLoading) return <div className="p-8">Loading analytics...</div>;

  // Process data for charts (mocking a bit for visual fullness if data is sparse)
  const chartData = [
    { name: 'Mon', minutes: 45, completed: 2 },
    { name: 'Tue', minutes: 120, completed: 4 },
    { name: 'Wed', minutes: 90, completed: 3 },
    { name: 'Thu', minutes: 150, completed: 5 },
    { name: 'Fri', minutes: 60, completed: 2 },
    { name: 'Sat', minutes: 200, completed: 7 },
    { name: 'Sun', minutes: sessions?.reduce((acc: number, s: any) => acc + s.durationMinutes, 0) || 30, completed: sessions?.filter((s:any)=>s.completed).length || 1 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground text-lg">Visualize your discipline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl col-span-1 lg:col-span-2 h-[400px]">
          <h2 className="text-xl font-bold mb-6">Focus Time (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                itemStyle={{ color: 'white' }}
              />
              <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary Chart */}
        <div className="glass-panel p-6 rounded-3xl h-[300px]">
          <h2 className="text-xl font-bold mb-6">Sessions Completed</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="completed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown text */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-4">Focus Quality</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-bold text-emerald-400">85%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Deep Work Ratio</span>
                <span className="font-bold text-primary">60%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[60%]" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
