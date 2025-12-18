import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { analyzeCompetitor, chatWithGemini } from "./gemini";
import { generateIntelligenceRequestSchema, chatRequestSchema, insertTargetSchema, insertResearchSessionSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication
  await setupAuth(app);
  
  // Auth routes - public endpoint to check auth status
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = generateIntelligenceRequestSchema.parse(req.body);
      
      const result = await analyzeCompetitor(
        validatedData.url,
        validatedData.selectedScenarios
      );
      
      // Save the report to database
      const report = await storage.createReport({
        url: validatedData.url,
        title: `Analysis of ${new URL(validatedData.url).hostname}`,
        summary: result.summary,
        competitors: result.competitors,
        swot: result.swot,
        battleCard: result.battleCard,
        scenarios: validatedData.selectedScenarios,
      });
      
      res.json({ ...result, reportId: report.id });
    } catch (error: any) {
      console.error("Analysis error:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      
      res.status(500).json({
        error: "Failed to analyze competitor",
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Targets CRUD
  app.get("/api/targets", async (req, res) => {
    try {
      const targets = await storage.getTargets();
      res.json(targets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/targets", async (req, res) => {
    try {
      const validatedData = insertTargetSchema.parse(req.body);
      const target = await storage.createTarget(validatedData);
      res.json(target);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid target data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/targets/:id", async (req, res) => {
    try {
      await storage.deleteTarget(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reports CRUD
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(parseInt(req.params.id));
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      await storage.deleteReport(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Research Sessions CRUD
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(parseInt(req.params.id));
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertResearchSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.json(session);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      await storage.deleteSession(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat endpoint - real Gemini integration
  app.post("/api/chat", async (req, res) => {
    try {
      const { sessionId, message } = chatRequestSchema.parse(req.body);
      
      let session;
      if (sessionId) {
        session = await storage.getSession(sessionId);
      }
      
      if (!session) {
        // Create new session
        session = await storage.createSession({
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          agent: "Deep Research Agent",
          messages: [],
          status: "active"
        });
      }
      
      // Add user message
      const userMessage = {
        id: `msg_${Date.now()}`,
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...(session.messages || []), userMessage];
      
      // Get AI response
      const aiResponse = await chatWithGemini(message, updatedMessages);
      
      // Add AI response
      const agentMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'agent' as const,
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      const finalMessages = [...updatedMessages, agentMessage];
      await storage.updateSessionMessages(session.id, finalMessages);
      
      res.json({
        sessionId: session.id,
        message: agentMessage
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid chat data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Signals endpoint
  app.get("/api/signals", async (req, res) => {
    try {
      const targetId = req.query.targetId ? parseInt(req.query.targetId as string) : undefined;
      const signals = await storage.getSignals(targetId);
      res.json(signals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export report as CSV
  app.get("/api/reports/:id/export/csv", async (req, res) => {
    try {
      const report = await storage.getReport(parseInt(req.params.id));
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      const csvRows = [
        ["Report Export"],
        ["Title", report.title],
        ["URL", report.url],
        ["Created", new Date(report.createdAt).toISOString()],
        [""],
        ["Executive Summary"],
        [report.summary],
        [""],
        ["Competitors"],
        ...report.competitors.map(c => [c]),
      ];

      if (report.swot) {
        csvRows.push([""], ["SWOT Analysis"]);
        csvRows.push(["Strengths"]);
        report.swot.strengths.forEach(s => csvRows.push(["", s]));
        csvRows.push(["Weaknesses"]);
        report.swot.weaknesses.forEach(w => csvRows.push(["", w]));
        csvRows.push(["Opportunities"]);
        report.swot.opportunities.forEach(o => csvRows.push(["", o]));
        csvRows.push(["Threats"]);
        report.swot.threats.forEach(t => csvRows.push(["", t]));
      }

      if (report.battleCard) {
        csvRows.push([""], ["Battle Card"]);
        csvRows.push(["Kill Points"]);
        report.battleCard.killPoints.forEach(k => csvRows.push(["", k]));
        csvRows.push(["Objection Handling"]);
        report.battleCard.objectionHandling.forEach(o => csvRows.push(["", o]));
      }

      const csvContent = csvRows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ).join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.csv"`);
      res.send(csvContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export report as plain text (PDF-ready format)
  app.get("/api/reports/:id/export/text", async (req, res) => {
    try {
      const report = await storage.getReport(parseInt(req.params.id));
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      let textContent = `
================================================================================
                         COMPETITIVE INTELLIGENCE REPORT
================================================================================

Title: ${report.title}
Source: ${report.url}
Generated: ${new Date(report.createdAt).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}

--------------------------------------------------------------------------------
                              EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

${report.summary}

--------------------------------------------------------------------------------
                              IDENTIFIED COMPETITORS
--------------------------------------------------------------------------------

${report.competitors.map((c, i) => `${i + 1}. ${c}`).join('\n')}
`;

      if (report.swot) {
        textContent += `
--------------------------------------------------------------------------------
                                SWOT ANALYSIS
--------------------------------------------------------------------------------

STRENGTHS:
${report.swot.strengths.map(s => `  * ${s}`).join('\n')}

WEAKNESSES:
${report.swot.weaknesses.map(w => `  * ${w}`).join('\n')}

OPPORTUNITIES:
${report.swot.opportunities.map(o => `  * ${o}`).join('\n')}

THREATS:
${report.swot.threats.map(t => `  * ${t}`).join('\n')}
`;
      }

      if (report.battleCard) {
        textContent += `
--------------------------------------------------------------------------------
                                 BATTLE CARD
--------------------------------------------------------------------------------

KILL POINTS (Competitive Advantages):
${report.battleCard.killPoints.map(k => `  * ${k}`).join('\n')}

OBJECTION HANDLING:
${report.battleCard.objectionHandling.map(o => `  * ${o}`).join('\n')}
`;
      }

      textContent += `
================================================================================
                    Generated by CompetiScope - AI Intelligence Platform
================================================================================
`;

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.txt"`);
      res.send(textContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
