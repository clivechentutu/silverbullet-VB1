import { LucideIcon } from 'lucide-react';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
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