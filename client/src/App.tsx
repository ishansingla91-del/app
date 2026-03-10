import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import FocusMode from "@/pages/focus";
import Challenges from "@/pages/challenges";
import Rooms from "@/pages/rooms";
import Analytics from "@/pages/analytics";
import Leaderboard from "@/pages/leaderboard";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/focus" component={FocusMode}/>
        <Route path="/challenges" component={Challenges}/>
        <Route path="/rooms" component={Rooms}/>
        <Route path="/analytics" component={Analytics}/>
        <Route path="/leaderboard" component={Leaderboard}/>
        <Route path="/settings" component={SettingsPage}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
