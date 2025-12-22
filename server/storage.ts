import { 
  users, targets, analysisReports, researchSessions, signals,
  type User, type UpsertUser,
  type Target, type InsertTarget,
  type AnalysisReport, type InsertAnalysisReport,
  type ResearchSession, type InsertResearchSession,
  type Signal, type InsertSignal,
  type ChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Targets
  getTargets(): Promise<Target[]>;
  getTarget(id: number): Promise<Target | undefined>;
  createTarget(target: InsertTarget): Promise<Target>;
  deleteTarget(id: number): Promise<void>;
  
  // Analysis Reports
  getReports(): Promise<AnalysisReport[]>;
  getReport(id: number): Promise<AnalysisReport | undefined>;
  createReport(report: InsertAnalysisReport): Promise<AnalysisReport>;
  deleteReport(id: number): Promise<void>;
  
  // Research Sessions
  getSessions(): Promise<ResearchSession[]>;
  getSession(id: number): Promise<ResearchSession | undefined>;
  createSession(session: InsertResearchSession): Promise<ResearchSession>;
  updateSessionMessages(id: number, messages: ChatMessage[]): Promise<ResearchSession | undefined>;
  updateSessionTitle(id: number, title: string): Promise<ResearchSession | undefined>;
  deleteSession(id: number): Promise<void>;
  
  // Signals
  getSignals(targetId?: number): Promise<Signal[]>;
  createSignal(signal: InsertSignal): Promise<Signal>;
}

export class DatabaseStorage implements IStorage {
  // Users (Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Targets
  async getTargets(): Promise<Target[]> {
    return db.select().from(targets).orderBy(desc(targets.createdAt));
  }

  async getTarget(id: number): Promise<Target | undefined> {
    const [target] = await db.select().from(targets).where(eq(targets.id, id));
    return target;
  }

  async createTarget(target: InsertTarget): Promise<Target> {
    const [created] = await db.insert(targets).values(target).returning();
    return created;
  }

  async deleteTarget(id: number): Promise<void> {
    await db.delete(targets).where(eq(targets.id, id));
  }

  // Analysis Reports
  async getReports(): Promise<AnalysisReport[]> {
    return db.select().from(analysisReports).orderBy(desc(analysisReports.createdAt));
  }

  async getReport(id: number): Promise<AnalysisReport | undefined> {
    const [report] = await db.select().from(analysisReports).where(eq(analysisReports.id, id));
    return report;
  }

  async createReport(report: InsertAnalysisReport): Promise<AnalysisReport> {
    const [created] = await db.insert(analysisReports).values(report).returning();
    return created;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(analysisReports).where(eq(analysisReports.id, id));
  }

  // Research Sessions
  async getSessions(): Promise<ResearchSession[]> {
    return db.select().from(researchSessions).orderBy(desc(researchSessions.createdAt));
  }

  async getSession(id: number): Promise<ResearchSession | undefined> {
    const [session] = await db.select().from(researchSessions).where(eq(researchSessions.id, id));
    return session;
  }

  async createSession(session: InsertResearchSession): Promise<ResearchSession> {
    const [created] = await db.insert(researchSessions).values({
      ...session,
      type: (session as any).type || "general"
    }).returning();
    return created;
  }

  async updateSessionMessages(id: number, messages: ChatMessage[]): Promise<ResearchSession | undefined> {
    const [updated] = await db
      .update(researchSessions)
      .set({ messages, updatedAt: new Date() })
      .where(eq(researchSessions.id, id))
      .returning();
    return updated;
  }

  async updateSessionTitle(id: number, title: string): Promise<ResearchSession | undefined> {
    const [updated] = await db
      .update(researchSessions)
      .set({ title, updatedAt: new Date() })
      .where(eq(researchSessions.id, id))
      .returning();
    return updated;
  }

  async deleteSession(id: number): Promise<void> {
    await db.delete(researchSessions).where(eq(researchSessions.id, id));
  }

  // Signals
  async getSignals(targetId?: number): Promise<Signal[]> {
    if (targetId) {
      return db.select().from(signals).where(eq(signals.targetId, targetId)).orderBy(desc(signals.createdAt));
    }
    return db.select().from(signals).orderBy(desc(signals.createdAt));
  }

  async createSignal(signal: InsertSignal): Promise<Signal> {
    const [created] = await db.insert(signals).values(signal).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
