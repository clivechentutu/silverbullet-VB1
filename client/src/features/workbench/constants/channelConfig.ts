import { 
  Globe, LinkIcon, Search, Users, FileText, Megaphone, Briefcase, 
  Radio, AlertTriangle, Code2
} from 'lucide-react';
import { SiX, SiYoutube } from 'react-icons/si';

export interface ChannelConfig {
  id: string;
  name: string;
  icon: typeof Globe;
  color: string;
  bgColor: string;
  borderColor: string;
  description?: string;
}

export const channelConfig: Record<string, ChannelConfig> = {
  website: { 
    id: 'website', 
    name: 'Website', 
    icon: Globe, 
    color: 'text-cyan-400', 
    bgColor: 'bg-cyan-500/10', 
    borderColor: 'border-cyan-500/30',
    description: 'Detecting pricing changes, new product pages, and messaging shifts.'
  },
  backlinks: { 
    id: 'backlinks', 
    name: 'Backlinks', 
    icon: LinkIcon, 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-500/10', 
    borderColor: 'border-emerald-500/30',
    description: 'Tracking new high-authority links and PR impact.'
  },
  seo: { 
    id: 'seo', 
    name: 'SEO', 
    icon: Search, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-500/30',
    description: 'Monitoring keyword ranking movements and organic visibility.'
  },
  social: { 
    id: 'social', 
    name: 'Social', 
    icon: Users, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/10', 
    borderColor: 'border-purple-500/30',
    description: 'Monitoring executive social media activity and brand mentions.'
  },
  news: { 
    id: 'news', 
    name: 'News', 
    icon: FileText, 
    color: 'text-rose-400', 
    bgColor: 'bg-rose-500/10', 
    borderColor: 'border-rose-500/30',
    description: 'Tracking press releases, funding news, and industry coverage.'
  },
  ads: { 
    id: 'ads', 
    name: 'Ads', 
    icon: Megaphone, 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10', 
    borderColor: 'border-amber-500/30',
    description: 'Monitoring competitor ad campaigns and creative strategies.'
  },
  talent: { 
    id: 'talent', 
    name: 'Talent', 
    icon: Briefcase, 
    color: 'text-pink-400', 
    bgColor: 'bg-pink-500/10', 
    borderColor: 'border-pink-500/30',
    description: 'Analyzing job postings and key leadership hiring patterns.'
  },
  twitter: { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: SiX as any, 
    color: 'text-slate-300', 
    bgColor: 'bg-slate-500/10', 
    borderColor: 'border-slate-500/30',
    description: 'Tracking X/Twitter mentions and discussions.'
  },
  youtube: { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: SiYoutube as any, 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/10', 
    borderColor: 'border-red-500/30',
    description: 'Monitoring YouTube channel activity and content.'
  },
};

export const trackerTypes = ['Website', 'Backlinks', 'SEO', 'Social', 'News', 'Ads'] as const;
export type TrackerType = typeof trackerTypes[number];

export const timezones = [
  'UTC', 
  'America/New_York', 
  'America/Los_Angeles', 
  'America/Chicago', 
  'Europe/London', 
  'Europe/Paris', 
  'Europe/Berlin', 
  'Asia/Tokyo', 
  'Asia/Shanghai', 
  'Asia/Singapore', 
  'Australia/Sydney'
] as const;

export const weekDays = [
  'monday', 
  'tuesday', 
  'wednesday', 
  'thursday', 
  'friday', 
  'saturday', 
  'sunday'
] as const;

export const notificationTimes = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00'
] as const;
