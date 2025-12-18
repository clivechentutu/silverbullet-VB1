import { 
  Search, 
  BarChart3, 
  Radar, 
  ShieldAlert,
  Swords
} from 'lucide-react';

export const SCENARIOS = [
  {
    id: 'discover-competitors',
    title: 'Discover Competitors',
    description: 'Identify direct and indirect market rivals using AI graph analysis.',
    icon: Search
  },
  {
    id: 'full-analysis',
    title: 'Comprehensive Analysis',
    description: 'Deep dive into product features, pricing models, and market positioning.',
    icon: BarChart3
  },
  {
    id: '360-research',
    title: '360° Research',
    description: 'Holistic view including customer sentiment, reviews, and social presence.',
    icon: Radar
  },
  {
    id: 'dynamic-tracking',
    title: 'Dynamic Tracking & Alerts',
    description: 'Monitor website changes, pricing updates, and new feature launches.',
    icon: ShieldAlert
  },
  {
    id: 'battle-cards',
    title: 'Battle Cards',
    description: 'Generate sales enablement assets to win against specific competitors.',
    icon: Swords
  }
];
