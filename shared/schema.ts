import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for basic auth (keeping existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  timePerQuestion: integer("time_per_question").notNull().default(30), // seconds
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c"),
  optionD: text("option_d"),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(), // A, B, C, or D
  order: integer("order").notNull(),
});

// Quiz sessions table
export const quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  pin: varchar("pin", { length: 6 }).notNull().unique(),
  hostId: varchar("host_id").references(() => users.id),
  status: varchar("status").notNull().default("waiting"), // waiting, active, completed
  currentQuestionIndex: integer("current_question_index").default(0),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

// Players table
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => quizSessions.id),
  name: text("name").notNull(),
  score: integer("score").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Player responses table
export const playerResponses = pgTable("player_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  questionId: varchar("question_id").notNull().references(() => questions.id),
  selectedAnswer: varchar("selected_answer", { length: 1 }), // A, B, C, or D
  isCorrect: boolean("is_correct").notNull(),
  responseTime: integer("response_time"), // milliseconds
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
  description: true,
  timePerQuestion: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  questionText: true,
  optionA: true,
  optionB: true,
  optionC: true,
  optionD: true,
  correctAnswer: true,
  order: true,
});

export const insertSessionSchema = createInsertSchema(quizSessions).pick({
  quizId: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  sessionId: true,
  name: true,
});

export const insertResponseSchema = createInsertSchema(playerResponses).pick({
  playerId: true,
  questionId: true,
  selectedAnswer: true,
  isCorrect: true,
  responseTime: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type PlayerResponse = typeof playerResponses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
