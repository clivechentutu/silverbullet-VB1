import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Frontend-only types for the application
export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AnalysisResult {
  summary: string;
  competitors: string[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  battleCard?: {
    killPoints: string[];
    objectionHandling: string[];
  };
}

export enum AppState {
  IDLE = 'IDLE',
  SCENARIO_SELECTION = 'SCENARIO_SELECTION',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export enum WorkbenchView {
  RADAR = 'RADAR',
  TARGETS = 'TARGETS',
  RESEARCH = 'RESEARCH',
  LIBRARY = 'LIBRARY',
  ACTS_TEMPLATE = 'ACTS_TEMPLATE',
  LINK_WORKSPACE = 'LINK_WORKSPACE'
}

export interface TargetCompany {
  id: number;
  name: string;
  url: string;
  icon: string;
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  date: string;
}

export interface TrackerConfig {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
  signals: Signal[];
}

export interface ExtractionRecord {
  id: string;
  type: 'Web Change' | 'Social' | 'Job Board' | 'Legal' | 'News';
  source: string;
  timestamp: string;
  summary: string;
  details: string;
  relevance: number;
}

export interface ReasoningStep {
  id: string;
  desc: string;
  status: 'pending' | 'active' | 'done';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  reasoning?: ReasoningStep[];
  isThinking?: boolean;
}

export interface ResearchSession {
  id: string;
  title: string;
  agent: string;
  date: string;
  group: 'Today' | 'Yesterday' | 'Previous';
  status: 'active' | 'completed';
  messages: ChatMessage[];
}

// API request/response schemas
export const generateIntelligenceRequestSchema = z.object({
  url: z.string().url(),
  selectedScenarios: z.array(z.string()),
});

export type GenerateIntelligenceRequest = z.infer<typeof generateIntelligenceRequestSchema>;
