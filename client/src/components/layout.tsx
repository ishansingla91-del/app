import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Brain, Timer, Trophy, Users, BarChart3, Settings, LogOut, Lock 
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Brain, label: "Dashboard" },
    { href: "/focus", icon: Timer, label: "Focus Mode", highlight: true },
    { href: "/challenges", icon: Trophy, label: "Challenges" },
    { href: "/rooms", icon: Users, label: "Focus Rooms" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col hidden md:flex z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide">DopamineLock</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? "bg-white/10 text-white shadow-inner border border-white/10" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"}
                ${item.highlight && !isActive ? "border border-primary/30 text-primary hover:bg-primary/10" : ""}
              `}>
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 flex justify-around p-3 z-50">
        {navItems.filter(i => !['/settings', '/leaderboard'].includes(i.href)).map(item => {
          const isActive = location === item.href;
          return (
             <Link key={item.href} href={item.href} className={`
               p-3 rounded-xl flex flex-col items-center gap-1 transition-all
               ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground"}
             `}>
               <item.icon className="w-6 h-6" />
             </Link>
          )
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Glow Effects in background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
