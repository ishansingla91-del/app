import { useState, useEffect } from "react";
import { Save, Bell, Shield, Clock } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState({
    defaultDuration: 30,
    quotesEnabled: true,
    exitWarningEnabled: true
  });

  useEffect(() => {
    if (settings) {
      setForm({
        defaultDuration: settings.defaultDuration,
        quotesEnabled: settings.quotesEnabled,
        exitWarningEnabled: settings.exitWarningEnabled
      });
    }
  }, [settings]);

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">Configure your focus environment.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Timer Defaults */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Timer Defaults</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-muted-foreground">Default Duration (minutes)</label>
              <input 
                type="number" 
                value={form.defaultDuration}
                onChange={e => setForm({...form, defaultDuration: Number(e.target.value)})}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary max-w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Experience & Protection</h2>
          </div>
          
          <div className="space-y-6">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-semibold text-lg group-hover:text-primary transition-colors">Strict Exit Warning</p>
                <p className="text-sm text-muted-foreground">Show shame screen if session is abandoned early.</p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input 
                  type="checkbox" 
                  checked={form.exitWarningEnabled}
                  onChange={e => setForm({...form, exitWarningEnabled: e.target.checked})}
                  className="peer sr-only"
                />
                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-semibold text-lg group-hover:text-primary transition-colors">Motivational Quotes</p>
                <p className="text-sm text-muted-foreground">Display quotes on the dashboard.</p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input 
                  type="checkbox" 
                  checked={form.quotesEnabled}
                  onChange={e => setForm({...form, quotesEnabled: e.target.checked})}
                  className="peer sr-only"
                />
                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="glass-button bg-primary/20 text-primary border-primary/30 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
