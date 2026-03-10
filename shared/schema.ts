import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  totalFocusMinutes: integer("total_focus_minutes").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  completedSessions: integer("completed_sessions").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastFocusDate: integer("last_focus_date", { mode: "timestamp" }),
});

export const focusSessions = sqliteTable("focus_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationDays: integer("duration_days").notNull(),
});

export const userChallenges = sqliteTable("user_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
});

export const focusRooms = sqliteTable("focus_rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const roomParticipants = sqliteTable("room_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique(),
  defaultDuration: integer("default_duration").default(30).notNull(),
  quotesEnabled: integer("quotes_enabled", { mode: "boolean" }).default(true).notNull(),
  exitWarningEnabled: integer("exit_warning_enabled", { mode: "boolean" }).default(true).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({ id: true, createdAt: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true });
export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({ id: true });
export const insertFocusRoomSchema = createInsertSchema(focusRooms).omit({ id: true, createdAt: true });
export const insertRoomParticipantSchema = createInsertSchema(roomParticipants).omit({ id: true, joinedAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;

export type FocusRoom = typeof focusRooms.$inferSelect;
export type InsertFocusRoom = z.infer<typeof insertFocusRoomSchema>;

export type RoomParticipant = typeof roomParticipants.$inferSelect;
export type InsertRoomParticipant = z.infer<typeof insertRoomParticipantSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
