import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { analyzeCompetitor, chatWithGemini, generateSignalInsight, analyzeUrlForRadarTask } from "./gemini";
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

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSession(id);
      res.sendStatus(200);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Signal insight endpoint
  app.post("/api/signal-insight", async (req, res) => {
    try {
      const { signal, category, type, domain } = req.body;
      
      if (!signal || !category || !type || !domain) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const insight = await generateSignalInsight(signal, category, type, domain);
      res.json({ insight });
    } catch (error: any) {
      console.error("Signal insight error:", error);
      res.status(500).json({ error: error.message || "Failed to generate insight" });
    }
  });

  // Radar task analysis endpoint
  app.post("/api/analyze-radar-task", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      const analysis = await analyzeUrlForRadarTask(url);
      res.json(analysis);
    } catch (error: any) {
      console.error("Radar task analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze URL" });
    }
  });

  // Get all targets
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
      
      // Remove demo targets when user creates their first real target
      const existingTargets = await storage.getTargets();
      const demoTargets = existingTargets.filter(t => t.isDemo);
      if (demoTargets.length > 0) {
        // Delete all demo targets
        for (const demoTarget of demoTargets) {
          await storage.deleteTarget(demoTarget.id);
        }
      }
      
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

  app.patch("/api/targets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, url, status, icon } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (url) updateData.url = url;
      if (status) updateData.status = status;
      if (icon) updateData.icon = icon;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "At least one field must be provided" });
      }
      
      const updated = await storage.updateTarget(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Target not found" });
      }
      res.json(updated);
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
      const { sessionId, message, type } = req.body;
      
      let session;
      if (sessionId) {
        session = await storage.getSession(sessionId);
      }
      
      if (!session) {
        // Create new session
        session = await storage.createSession({
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          agent: "Deep Research Agent",
          type: type || "general",
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

  // SimilarWeb Traffic proxy
  app.get("/api/traffic/:domain", async (req, res) => {
    try {
      const { domain } = req.params;
      // Using SimilarWeb's free/open endpoint if possible, or simulating for demo
      // In a real app, this would use an API key from secrets
      res.json({
        monthlyVisits: "1.2M+",
        source: "SimilarWeb",
        period: "Last Month"
      });
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

  // Demo data initialization
  app.post("/api/init-demo-data", async (req, res) => {
    try {
      // Check if targets already exist - only initialize if empty
      const existingTargets = await storage.getTargets();
      if (existingTargets.length > 0) {
        return res.json({ 
          message: "Demo data already exists", 
          targetsCount: existingTargets.length 
        });
      }

      // Create Vizard.ai demo target for new users
      const targets = await Promise.all([
        storage.createTarget({
          name: "Vizard",
          url: "https://vizard.ai",
          icon: "V",
          isDemo: true
        })
      ]);

      // Create sample report for Vizard demo
      await storage.createReport({
        url: "https://vizard.ai",
        title: "Vizard.ai Competitive Analysis",
        summary: "Vizard.ai is a leading AI-powered video editing platform specializing in automated clip selection and social media content repurposing.",
        competitors: ["OpusClip", "Descript", "Munch", "Kapwing", "Pictory"],
        swot: {
          strengths: ["AI-powered clip selection", "Multi-platform export", "Fast processing", "User-friendly interface"],
          weaknesses: ["Limited advanced editing features", "Subscription pricing", "Newer brand recognition"],
          opportunities: ["Enterprise video marketing", "AI avatar integration", "Podcast to video conversion"],
          threats: ["Descript's transcript-based editing", "OpusClip's virality scoring", "CapCut's free tier"]
        },
        battleCard: {
          killPoints: ["Fastest AI clip extraction", "Automatic social formatting", "One-click repurposing for 5+ platforms"],
          objectionHandling: ["Pricing: ROI through time savings", "Features: Focus on core video repurposing excellence"]
        },
        scenarios: ["product", "marketing"]
      });

      // Create sample research session for Vizard
      await storage.createSession({
        title: "Vizard Competitor Landscape Analysis",
        agent: "market-analyst",
        type: "track",
        status: "active",
        messages: [
          {
            id: "1",
            role: "user",
            content: "Who are Vizard.ai's main competitors in the AI video editing space?",
            timestamp: new Date().toISOString()
          },
          {
            id: "2",
            role: "agent",
            content: "Vizard.ai's primary competitors include: 1) OpusClip - specializes in AI virality scoring. 2) Descript - transcript-based editing with AI voice clone. 3) Munch - long-form to shorts automation. 4) Kapwing - collaborative browser-based editing. 5) Pictory - article-to-video conversion.",
            timestamp: new Date().toISOString()
          }
        ]
      });

      res.json({ message: "Demo data initialized successfully", targetsCount: targets.length });
    } catch (error: any) {
      console.error("Demo data initialization error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
