import { Download, Chrome, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ExtensionPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
            <Chrome size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Chrome Extension</h1>
            <p className="text-muted-foreground">Block distractions during focus sessions</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel bg-blue-500/10 border-blue-500/20 rounded-2xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-2">Important Note</h3>
                <p className="text-muted-foreground">
                  The extension connects to your local app at <code className="bg-black/30 px-2 py-1 rounded">http://localhost:5000</code>. 
                  Make sure your app is running before using the extension.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
              Download Extension Files
            </h2>
            <p className="text-muted-foreground ml-10">
              The extension is located in the <code className="bg-black/30 px-2 py-1 rounded">focus-extension</code> folder 
              of your project directory.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
              Open Chrome Extensions
            </h2>
            <div className="ml-10 space-y-3">
              <p className="text-muted-foreground">Open Google Chrome and navigate to:</p>
              <div className="glass-panel bg-white/5 p-4 rounded-xl font-mono text-primary">
                chrome://extensions/
              </div>
              <p className="text-muted-foreground text-sm">Or click the three dots menu → Extensions → Manage Extensions</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</span>
              Enable Developer Mode
            </h2>
            <div className="ml-10 space-y-3">
              <p className="text-muted-foreground">Toggle the "Developer mode" switch in the top right corner</p>
              <div className="glass-panel bg-white/5 p-4 rounded-xl">
                <img 
                  src="https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/vOu7iPbaapkALed96rzN.png?auto=format&w=845" 
                  alt="Developer mode toggle"
                  className="rounded-lg border border-white/10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">4</span>
              Load Unpacked Extension
            </h2>
            <div className="ml-10 space-y-3">
              <p className="text-muted-foreground">Click "Load unpacked" button</p>
              <p className="text-muted-foreground">Navigate to your project folder and select the <code className="bg-black/30 px-2 py-1 rounded">focus-extension</code> folder</p>
              <div className="glass-panel bg-emerald-500/10 border-emerald-500/20 rounded-xl p-4 flex gap-3">
                <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                <p className="text-sm text-muted-foreground">
                  The extension should now appear in your extensions list with the name "Study Planner AI - Focus Mode"
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">5</span>
              Pin the Extension
            </h2>
            <div className="ml-10 space-y-3">
              <p className="text-muted-foreground">Click the puzzle piece icon in Chrome toolbar</p>
              <p className="text-muted-foreground">Find "Study Planner AI - Focus Mode" and click the pin icon</p>
            </div>
          </div>

          <div className="glass-panel bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 rounded-2xl p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">How It Works</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                <span>When you start a focus session in the app, the extension automatically activates</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                <span>Blocks distracting websites like social media, entertainment, and gaming sites</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                <span>Allows only educational YouTube videos (verified by AI)</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                <span>Shows remaining focus time in the extension popup</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/focus" className="glass-button bg-primary/20 text-primary border-primary/30 px-6 py-3 rounded-xl font-semibold hover:bg-primary/30 transition-all">
              Start Focus Session
            </Link>
            <Link href="/" className="glass-button bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold transition-all">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
