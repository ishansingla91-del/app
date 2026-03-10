import { Trophy, CheckCircle, Clock } from "lucide-react";
import { useAllChallenges, useUserChallenges, useJoinChallenge } from "@/hooks/use-challenges";

export default function Challenges() {
  const { data: allChallenges, isLoading: isLoadingAll } = useAllChallenges();
  const { data: userChallenges, isLoading: isLoadingUser } = useUserChallenges();
  const joinMutation = useJoinChallenge();

  if (isLoadingAll || isLoadingUser) {
    return <div className="p-8">Loading challenges...</div>;
  }

  // Combine data to see which ones the user has joined
  const joinedChallengeIds = new Set(userChallenges?.map((uc: any) => uc.challengeId) || []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Dopamine Detox</h1>
        <p className="text-muted-foreground text-lg">Push your limits. Earn badges. Rewire your brain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allChallenges?.map((challenge: any) => {
          const isJoined = joinedChallengeIds.has(challenge.id);
          const userProgress = userChallenges?.find((uc: any) => uc.challengeId === challenge.id);
          
          return (
            <div key={challenge.id} className="glass-panel p-6 rounded-3xl flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              {/* Decorative background shape */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center mb-4 text-primary relative z-10">
                <Trophy className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 relative z-10">{challenge.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1 relative z-10">{challenge.description}</p>
              
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-6 relative z-10">
                <Clock className="w-4 h-4" /> {challenge.durationDays} Days Duration
              </div>

              <div className="mt-auto relative z-10">
                {isJoined ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-primary">Progress</span>
                      <span>{userProgress?.progress} / {challenge.durationDays}</span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent" 
                        style={{ width: `${(userProgress?.progress / challenge.durationDays) * 100}%` }}
                      />
                    </div>
                    {userProgress?.completed && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold justify-center mt-2">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => joinMutation.mutate(challenge.id)}
                    disabled={joinMutation.isPending}
                    className="w-full glass-button py-3 rounded-xl font-semibold bg-white/5 hover:bg-primary/20 hover:text-primary transition-all"
                  >
                    {joinMutation.isPending ? "Joining..." : "Accept Challenge"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
