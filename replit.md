# CompetiScope - AI-Powered Competitive Intelligence Platform

## Overview
CompetiScope is an enterprise-grade market intelligence platform powered by Google's Gemini 2.5 Flash AI. It analyzes competitor websites and generates comprehensive market intelligence reports including SWOT analysis, battle cards, and competitor discovery.

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: Vite + React with TypeScript
- **Styling**: Tailwind CSS with custom dark theme (slate-950 base)
- **State Management**: TanStack Query for server state
- **Routing**: Wouter
- **UI Components**: shadcn/ui (Radix primitives)

### Backend (Express + TypeScript)
- **Server**: Express.js
- **AI Integration**: Google Gemini 2.5 Flash via @google/genai
- **Database**: PostgreSQL (Drizzle ORM) - available but currently using in-memory storage

### Key Files
```
client/
  src/
    components/
      Header.tsx         - Main navigation header
      ScenarioSelector.tsx - Intelligence module selector
      LandingPage.tsx    - Home page with URL input
      Workbench.tsx      - Main dashboard with 6 views
    lib/
      constants.ts       - Scenario definitions
      queryClient.ts     - TanStack Query setup
    App.tsx              - Main app with routing
    
server/
  routes.ts              - API endpoints
  gemini.ts              - Gemini AI integration
  storage.ts             - Data storage interface
  
shared/
  schema.ts              - TypeScript types and Zod schemas
```

## Features

### Landing Page (/)
- Hero section with brand messaging
- URL input for competitor analysis
- Scenario selection (5 intelligence modules)
- Real-time analysis with Gemini AI
- Results dashboard with SWOT, competitors, battle cards

### Workbench (/workbench)
1. **Radar View** - Market discovery with AI scanning
2. **Track View** - Monitor specific competitors
3. **Research View** - AI chat agent for deep analysis
4. **Library View** - Archive of research reports
5. **Acts Template** - Battle card and report templates
6. **Link Workspace** - Integration connections

## Design System
- **Primary Brand Color**: Teal-500 (#14b8a6)
- **Background**: Slate-950 (#020617)
- **Font**: Inter (sans-serif)
- **Border Radius**: Small (rounded-md)
- **Theme**: Dark mode by default

## Running the Application
The application runs on port 5000. The backend serves both the API and the Vite-built frontend.

```bash
npm run dev
```

## API Endpoints

### POST /api/analyze
Analyzes a competitor website using Gemini AI.

**Request Body:**
```json
{
  "url": "https://competitor.com",
  "selectedScenarios": ["discover-competitors", "full-analysis", "battle-cards"]
}
```

**Response:**
```json
{
  "summary": "Executive summary...",
  "competitors": ["Comp A", "Comp B"],
  "swot": {...},
  "battleCard": {...}
}
```

## Recent Changes
- December 2024: Initial build of CompetiScope platform
- Implemented Gemini AI integration for competitive analysis
- Created Workbench with 6 intelligence views
- Built responsive dark-themed UI
- December 2024: Enhanced returning user experience
  - Added "Welcome Back" banner showing new insights since last visit
  - Priority breakdown display (Focus/Notable/Update counts)
  - Enhanced "Past Sessions" browser for historical summaries
  - Session Catch-Up feature with AI-generated channel summaries
- December 2024: Email notification system
  - Single email with 3-stage Magic Link verification
  - Tab-based dialog for target creation/editing
  - Inline validation alerts

## User Preferences
- Dark theme required
- No emojis in UI
- Inter font for all text
- Brand color: Teal (#14b8a6)
