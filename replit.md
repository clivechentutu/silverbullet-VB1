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
      Header.tsx              - Main navigation header
      ScenarioSelector.tsx    - Intelligence module selector
      LandingPage.tsx         - Home page with URL input
      Workbench.tsx           - Main dashboard with 6 views
      TrackInsightPanel.tsx   - Track view insight panel with feedback system
    features/
      workbench/
        hooks/
          useWorkbenchData.ts - Centralized data fetching hooks
        constants/
          channelConfig.ts    - Shared channel configuration
        components/
          StatCard.tsx        - Reusable stat card component
          EmptyState.tsx      - Empty state display component
        utils/
          helpers.ts          - Utility functions
        index.ts              - Feature exports
    lib/
      constants.ts            - Scenario definitions
      queryClient.ts          - TanStack Query setup
    App.tsx                   - Main app with routing
    
server/
  routes.ts                   - API endpoints
  gemini.ts                   - Gemini AI integration
  storage.ts                  - Data storage interface
  
shared/
  schema.ts                   - TypeScript types, Zod schemas, and UI types
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
- January 2025: Code architecture improvements
  - Added shared types to schema.ts (RadarCompetitor, PromptConfiguration, NotificationSettings, etc.)
  - Created features/workbench module with hooks, constants, components, and utilities
  - Added tabbed feedback dialog with AI auto-optimization and prompt configuration
  - Improved code maintainability with reusable components and hooks
- December 2024: Initial build of CompetiScope platform
- Implemented Gemini AI integration for competitive analysis
- Created Workbench with 6 intelligence views
- Built responsive dark-themed UI

## Code Architecture

### Features Module Pattern
The project uses a features-based architecture for better code organization:
- `client/src/features/workbench/` - Workbench dashboard feature
  - `hooks/` - Custom React hooks for data fetching
  - `constants/` - Shared configuration (channelConfig, etc.)
  - `components/` - Reusable UI components
  - `utils/` - Utility functions

### Shared Types
All shared types are defined in `shared/schema.ts`:
- Database models (Target, AnalysisReport, ResearchSession, Signal)
- UI types (RadarCompetitor, PromptConfiguration, NotificationSettings, etc.)
- Zod validation schemas for API requests

## User Preferences
- Dark theme required
- No emojis in UI
- Inter font for all text
- Brand color: Teal (#14b8a6)
