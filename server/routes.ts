import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { verifyYouTubeVideo } from "./services/youtube";
import path from "path";
import archiver from "archiver";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Users
  // Register the static leaderboard route before :id to avoid shadowing.
  app.get(api.users.leaderboard.path, async (_req, res) => {
    const users = await storage.getLeaderboard();
    res.json(users);
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.put(api.users.update.path, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), input);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // Sessions
  app.get(api.sessions.list.path, async (req, res) => {
    const sessions = await storage.getSessionsByUser(Number(req.params.userId));
    res.json(sessions);
  });

  app.post(api.sessions.create.path, async (req, res) => {
    try {
      const input = api.sessions.create.input.parse(req.body);
      const session = await storage.createSession(input);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.sessions.update.path, async (req, res) => {
    try {
      const input = api.sessions.update.input.parse(req.body);
      const session = await storage.updateSession(Number(req.params.id), input);
      if (!session) return res.status(404).json({ message: "Session not found" });
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // Challenges
  app.get(api.challenges.list.path, async (req, res) => {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  });

  // User Challenges
  app.get(api.userChallenges.list.path, async (req, res) => {
    const userChallenges = await storage.getUserChallenges(Number(req.params.userId));
    res.json(userChallenges);
  });

  app.post(api.userChallenges.create.path, async (req, res) => {
    try {
      const input = api.userChallenges.create.input.parse(req.body);
      const userChallenge = await storage.createUserChallenge(input);
      res.status(201).json(userChallenge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.userChallenges.update.path, async (req, res) => {
    try {
      const input = api.userChallenges.update.input.parse(req.body);
      const userChallenge = await storage.updateUserChallenge(Number(req.params.id), input);
      if (!userChallenge) return res.status(404).json({ message: "User challenge not found" });
      res.json(userChallenge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // Focus Rooms
  app.get(api.rooms.list.path, async (req, res) => {
    const rooms = await storage.getRooms();
    res.json(rooms);
  });

  app.post(api.rooms.create.path, async (req, res) => {
    try {
      const input = api.rooms.create.input.parse(req.body);
      const room = await storage.createRoom(input);
      res.status(201).json(room);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.post(api.rooms.join.path, async (req, res) => {
    try {
      const input = api.rooms.join.input.parse(req.body);
      // Ensure the room exists and is active
      const rooms = await storage.getRooms();
      const room = rooms.find(r => r.id === input.roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      const participant = await storage.joinRoom(input);
      res.status(201).json(participant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.post(api.rooms.leave.path, async (req, res) => {
    try {
      const input = api.rooms.leave.input.parse(req.body);
      const success = await storage.leaveRoom(Number(req.params.id), input.userId);
      if (!success) return res.status(404).json({ message: "Not in room" });
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings(Number(req.params.userId));
    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(Number(req.params.userId), input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // YouTube Verification
  app.post("/api/youtube/verify", async (req, res) => {
    try {
      const urlOrId = String(req.body?.urlOrId ?? "");
      
      const result = await verifyYouTubeVideo(urlOrId);
      
      if (!result.ok) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    } catch (error) {
      console.error("YouTube verify error:", error);
      
      return res.status(500).json({
        ok: false,
        isEducational: false,
        confidence: 0,
        reason: "Server error while verifying video",
      });
    }
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Using hardcoded user ID as per existing pattern
      const sessions = await storage.getSessionsByUser(userId);
      const completed = sessions.filter((s) => s.completed);
      const minutes = completed.reduce((sum, s) => sum + s.durationMinutes, 0);
      
      res.json({
        totalSessions: sessions.length,
        completedSessions: completed.length,
        focusMinutes: minutes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Focus Status - For Chrome Extension
  app.get("/api/focus/status/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const sessions = await storage.getSessionsByUser(userId);
      const now = new Date();
      
      // Find active session (created recently and not completed)
      const activeSession = sessions.find(s => {
        if (s.completed) return false;
        if (!s.createdAt) return false;
        
        const created = new Date(s.createdAt);
        const endsAt = new Date(created.getTime() + s.durationMinutes * 60000);
        
        return now < endsAt;
      });
      
      if (activeSession && activeSession.createdAt) {
        const created = new Date(activeSession.createdAt);
        const endsAt = new Date(created.getTime() + activeSession.durationMinutes * 60000);
        
        res.json({
          active: true,
          endsAt: endsAt.toISOString()
        });
      } else {
        res.json({
          active: false,
          endsAt: null
        });
      }
    } catch (error) {
      console.error("Focus status error:", error);
      res.status(500).json({
        active: false,
        endsAt: null
      });
    }
  });

  // Serve Chrome Extension as downloadable ZIP
  app.get("/extension-files", (req, res) => {
    const extensionPath = path.join(process.cwd(), "focus-extension");
    
    res.attachment("focus-extension.zip");
    
    const archive = archiver("zip", {
      zlib: { level: 9 }
    });
    
    archive.on("error", (err: Error) => {
      console.error("Archive error:", err);
      res.status(500).send("Error creating extension package");
    });
    
    archive.pipe(res);
    
    // Add all files from focus-extension folder
    archive.directory(extensionPath, "focus-extension");
    
    archive.finalize();
  });

  // Seed Data function
  async function seedDatabase() {
    // Check if we already have a user
    let user = await storage.getUser(1);
    if (!user) {
      user = await storage.createUser({
        username: "dopamine_hacker",
        password: "password123", // Note: In a real app we'd hash this
      });
      // Update with some realistic stats
      await storage.updateUser(user.id, {
        totalFocusMinutes: 1200,
        currentStreak: 5,
        longestStreak: 12,
        completedSessions: 42
      });

      // Create settings for user
      await storage.createSettings({
        userId: user.id,
        defaultDuration: 30,
        quotesEnabled: true,
        exitWarningEnabled: true
      });

      // Seed challenges
      const challengesList = await storage.getChallenges();
      if (challengesList.length === 0) {
        const c1 = await storage.createChallenge({
          title: "24 Hour No Social Media",
          description: "Disconnect from all social platforms for a full day.",
          durationDays: 1
        });
        const c2 = await storage.createChallenge({
          title: "7 Day Deep Focus",
          description: "Complete at least one 60-minute focus session every day for a week.",
          durationDays: 7
        });
        const c3 = await storage.createChallenge({
          title: "30 Day Monk Mode",
          description: "Eliminate all cheap dopamine and dedicate 30 days to pure productivity.",
          durationDays: 30
        });

        // Add an active challenge for the user
        await storage.createUserChallenge({
          userId: user.id,
          challengeId: c1.id,
          progress: 50,
          completed: false
        });
      }

      // Seed focus rooms
      const rooms = await storage.getRooms();
      if (rooms.length === 0) {
        await storage.createRoom({
          name: "Deep Work Cafe",
          active: true
        });
        await storage.createRoom({
          name: "Exam Prep (Silent)",
          active: true
        });
      }
    }
  }

  // Run seed function on startup
  seedDatabase().catch(console.error);

  return httpServer;
}
