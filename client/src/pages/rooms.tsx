import { useState } from "react";
import { Users, Plus, Radio, Play } from "lucide-react";
import { useRooms, useCreateRoom, useJoinRoom } from "@/hooks/use-rooms";

export default function Rooms() {
  const { data: rooms, isLoading } = useRooms();
  const createMutation = useCreateRoom();
  const joinMutation = useJoinRoom();
  
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    await createMutation.mutateAsync(newRoomName);
    setNewRoomName("");
    setIsCreating(false);
  };

  if (isLoading) return <div className="p-8">Loading rooms...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Focus Rooms</h1>
          <p className="text-muted-foreground text-lg">Co-working spaces for shared accountability.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="glass-button bg-primary/20 text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Room
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="glass-panel p-6 rounded-2xl flex gap-4 animate-in slide-in-from-top-4">
          <input 
            type="text" 
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room Name (e.g., Deep Work Elite)"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
            autoFocus
          />
          <button type="submit" disabled={createMutation.isPending} className="glass-button bg-white/10 px-8 rounded-xl font-semibold">
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map((room: any) => (
          <div key={room.id} className="glass-panel p-6 rounded-3xl flex flex-col group hover:shadow-primary/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Radio className="w-6 h-6 group-hover:animate-pulse" />
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{room.name}</h3>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mb-6">
              <Users className="w-4 h-4" /> {Math.floor(Math.random() * 10) + 1} online
            </p>

            <button 
              onClick={() => joinMutation.mutate(room.id)}
              disabled={joinMutation.isPending}
              className="mt-auto w-full glass-button py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:bg-primary/20 group-hover:text-primary"
            >
              <Play className="w-4 h-4 fill-current" /> Join Room
            </button>
          </div>
        ))}

        {rooms?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No active rooms. Create one to start co-working!
          </div>
        )}
      </div>
    </div>
  );
}
