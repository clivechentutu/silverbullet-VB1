import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeCompetitor } from "./gemini";
import { generateIntelligenceRequestSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = generateIntelligenceRequestSchema.parse(req.body);
      
      const result = await analyzeCompetitor(
        validatedData.url,
        validatedData.selectedScenarios
      );
      
      res.json(result);
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

  return httpServer;
}
