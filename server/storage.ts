import { db } from "./db";
import crypto from "crypto";
import {
  users, focusSessions, challenges, userChallenges, focusRooms, roomParticipants, settings,
  type InsertUser, type InsertFocusSession, type InsertChallenge, type InsertUserChallenge,
  type InsertFocusRoom, type InsertRoomParticipant, type InsertSettings,
  type User, type FocusSession, type Challenge, type UserChallenge,
  type FocusRoom, type RoomParticipant, type Settings
} from "@shared/schema";
import type { FocusSession as SharedFocusSession } from "@shared/focus";
import { and, eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getLeaderboard(): Promise<User[]>;

  // Focus Sessions
  getSessionsByUser(userId: number): Promise<FocusSession[]>;
  createSession(session: InsertFocusSession): Promise<FocusSession>;
  updateSession(id: number, updates: Partial<InsertFocusSession>): Promise<FocusSession>;

  // Challenges
  getChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;

  // User Challenges
  getUserChallenges(userId: number): Promise<UserChallenge[]>;
  createUserChallenge(challenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallenge(id: number, updates: Partial<InsertUserChallenge>): Promise<UserChallenge>;

  // Focus Rooms
  getRooms(): Promise<FocusRoom[]>;
  createRoom(room: InsertFocusRoom): Promise<FocusRoom>;
  
  // Room Participants
  joinRoom(participant: InsertRoomParticipant): Promise<RoomParticipant>;
  leaveRoom(roomId: number, userId: number): Promise<boolean>;
  getRoomParticipants(roomId: number): Promise<RoomParticipant[]>;

  // Settings
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getLeaderboard(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.totalFocusMinutes)).limit(10);
  }

  // Sessions
  async getSessionsByUser(userId: number): Promise<FocusSession[]> {
    return await db.select().from(focusSessions).where(eq(focusSessions.userId, userId));
  }

  async createSession(session: InsertFocusSession): Promise<FocusSession> {
    const [newSession] = await db.insert(focusSessions).values(session).returning();
    
    // Update streak if session is completed
    if (session.completed) {
      const user = await this.getUser(session.userId);
      if (user) {
        const today = new Date();
        let streak = user.streak;

        if (!user.lastFocusDate) {
          streak = 1;
        } else {
          const diff = Math.floor(
            (today.getTime() - user.lastFocusDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diff === 1) streak = user.streak + 1;
          else if (diff > 1) streak = 1;
        }

        await this.updateUser(session.userId, {
          streak,
          lastFocusDate: today,
        });
      }
    }
    
    return newSession;
  }

  async updateSession(id: number, updates: Partial<InsertFocusSession>): Promise<FocusSession> {
    const [session] = await db.update(focusSessions).set(updates).where(eq(focusSessions.id, id)).returning();
    return session;
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  // User Challenges
  async getUserChallenges(userId: number): Promise<UserChallenge[]> {
    return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
  }

  async createUserChallenge(challenge: InsertUserChallenge): Promise<UserChallenge> {
    const [newChallenge] = await db.insert(userChallenges).values(challenge).returning();
    return newChallenge;
  }

  async updateUserChallenge(id: number, updates: Partial<InsertUserChallenge>): Promise<UserChallenge> {
    const [challenge] = await db.update(userChallenges).set(updates).where(eq(userChallenges.id, id)).returning();
    return challenge;
  }

  // Focus Rooms
  async getRooms(): Promise<FocusRoom[]> {
    return await db.select().from(focusRooms).where(eq(focusRooms.active, true));
  }

  async createRoom(room: InsertFocusRoom): Promise<FocusRoom> {
    const [newRoom] = await db.insert(focusRooms).values(room).returning();
    return newRoom;
  }

  async joinRoom(participant: InsertRoomParticipant): Promise<RoomParticipant> {
    const [newParticipant] = await db.insert(roomParticipants).values(participant).returning();
    return newParticipant;
  }

  async leaveRoom(roomId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(roomParticipants)
      .where(and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getRoomParticipants(roomId: number): Promise<RoomParticipant[]> {
    return await db.select().from(roomParticipants).where(eq(roomParticipants.roomId, roomId));
  }

  // Settings
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
    return userSettings;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [newSettings] = await db.insert(settings).values(insertSettings).returning();
    return newSettings;
  }

  async updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings> {
    const [updatedSettings] = await db.update(settings).set(updates).where(eq(settings.userId, userId)).returning();
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();

class InMemoryFocusStore {
  private sessions: SharedFocusSession[] = [];
  private activeSessionId: string | null = null;

  getUser() {
    return {
      id: 1,
      name: "Focus User",
      streak: this.getStreak(),
    };
  }

  getSessions() {
    return this.sessions.slice().sort((a, b) => b.start - a.start);
  }

  getStats() {
    const sessions = this.getSessions();
    const totalFocusSeconds = sessions.reduce(
      (sum, session) => sum + session.durationSeconds,
      0,
    );
    const completedSessions = sessions.filter((s) => s.completed).length;

    return {
      sessions: sessions.length,
      totalFocusSeconds,
      completedSessions,
      active: Boolean(this.activeSessionId),
    };
  }

  startSession(durationSeconds: number) {
    if (this.activeSessionId) {
      const existing = this.sessions.find((s) => s.id === this.activeSessionId);
      if (existing) return existing;
    }

    const session: SharedFocusSession = {
      id: crypto.randomUUID(),
      start: Date.now(),
      end: null,
      durationSeconds,
      completed: false,
      mode: "focus",
    };

    this.sessions.push(session);
    this.activeSessionId = session.id;
    return session;
  }

  endSession() {
    if (!this.activeSessionId) return null;

    const session = this.sessions.find((s) => s.id === this.activeSessionId);
    if (!session) {
      this.activeSessionId = null;
      return null;
    }

    session.end = Date.now();
    session.completed = true;
    this.activeSessionId = null;
    return session;
  }

  getFocusStatus() {
    return {
      active: Boolean(this.activeSessionId),
      activeSessionId: this.activeSessionId,
    };
  }

  private getStreak() {
    const completed = this.sessions.filter((s) => s.completed);
    return completed.length;
  }
}

export const focusStore = new InMemoryFocusStore();
