import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Zap, TrendingUp, ShieldAlert, ChevronRight, ChevronDown,
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Activity, Clock, Radio, RefreshCw, AlertTriangle, 
  BrainCircuit, Archive, Filter, Check, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Signal {
  id: number;
  type: string;
  category: string;
  time: string;
  content: string;
  domain: string;
  color: string;
  bgColor: string;
  value: string;
  sourceUrl: string;
  dimension?: string;
}

interface AIInsight {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  summary: string;
  keyInfo: string;
  impact: string;
  action: string;
  sources: string[];
  relatedSignals: Signal[];
  time: string;
  timeGroup: 'active' | 'today' | 'yesterday' | 'thisWeek' | 'earlier';
  category: 'strategy' | 'pricing' | 'growth' | 'competitive';
  isRead: boolean;
  isResolved: boolean;
}

interface ChannelConfig {
  id: string;
  name: string;
  icon: typeof Globe;
  color: string;
  enabled: boolean;
  signalCount: number;
}

const dimensionConfig: Record<string, { icon: typeof Globe; color: string; bgColor: string; label: string }> = {
  website: { icon: Globe, color: 'text-cyan-400', bgColor: 'bg-cyan-500', label: 'Website' },
  backlinks: { icon: LinkIcon, color: 'text-emerald-400', bgColor: 'bg-emerald-500', label: 'Backlinks' },
  seo: { icon: Search, color: 'text-blue-400', bgColor: 'bg-blue-500', label: 'SEO' },
  social: { icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500', label: 'Social' },
  news: { icon: FileText, color: 'text-rose-400', bgColor: 'bg-rose-500', label: 'News' },
  ads: { icon: Megaphone, color: 'text-amber-400', bgColor: 'bg-amber-500', label: 'Ads' },
  talent: { icon: Briefcase, color: 'text-pink-400', bgColor: 'bg-pink-500', label: 'Talent' },
};

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; borderColor: string; bgColor: string }> = {
  strategy: { icon: TrendingUp, color: 'text-emerald-400', borderColor: 'border-emerald-500/50', bgColor: 'bg-emerald-500/10' },
  pricing: { icon: ShieldAlert, color: 'text-red-400', borderColor: 'border-red-500/50', bgColor: 'bg-red-500/10' },
  growth: { icon: Zap, color: 'text-amber-400', borderColor: 'border-amber-500/50', bgColor: 'bg-amber-500/10' },
  competitive: { icon: AlertTriangle, color: 'text-blue-400', borderColor: 'border-blue-500/50', bgColor: 'bg-blue-500/10' },
};

const timeGroupLabels: Record<string, string> = {
  active: 'Active',
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  earlier: 'Earlier',
};

const LiveStatusBar = ({ channels, scanningChannel }: { channels: ChannelConfig[]; scanningChannel: string | null }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const enabledCount = channels.filter(c => c.enabled).length;
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio size={12} className="text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock size={11} />
          <span className="text-[10px] font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5 text-slate-400">
          <RefreshCw size={11} className={scanningChannel ? 'animate-spin text-brand-400' : ''} />
          <span className="text-[10px]">{scanningChannel ? `Scanning ${scanningChannel}...` : 'Next: 8m'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {channels.slice(0, 6).map(ch => {
            const Icon = ch.icon;
            return (
              <div 
                key={ch.id} 
                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                  ch.enabled 
                    ? scanningChannel === ch.id 
                      ? 'bg-brand-500/20 border border-brand-500/50' 
                      : 'bg-slate-800/80' 
                    : 'bg-slate-900/50 opacity-40'
                }`}
                title={ch.name}
              >
                <Icon size={10} className={ch.enabled ? ch.color : 'text-slate-600'} />
              </div>
            );
          })}
        </div>
        <span className="text-[10px] text-slate-500">{enabledCount} active</span>
      </div>
    </div>
  );
};

interface InsightTickerItemProps {
  insight: AIInsight;
  isSelected: boolean;
  onClick: () => void;
  onMarkRead: () => void;
  compact?: boolean;
}

const InsightTickerItem = ({ insight, isSelected, onClick, onMarkRead, compact = false }: InsightTickerItemProps) => {
  const catConfig = categoryConfig[insight.category];
  const CategoryIcon = catConfig.icon;
  
  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div 
      onClick={onClick}
      className={`relative p-2.5 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? `${catConfig.bgColor} border ${catConfig.borderColor}` 
          : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'
      }`}
      data-testid={`ticker-item-${insight.id}`}
    >
      {!insight.isRead && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
      )}
      <div className="flex items-start gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${catConfig.bgColor} border ${catConfig.borderColor}`}>
          <CategoryIcon size={12} className={catConfig.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider rounded border ${priorityStyles[insight.priority]}`}>
              {insight.priority === 'high' ? 'H' : insight.priority === 'medium' ? 'M' : 'L'}
            </span>
            <span className="text-[9px] text-slate-500">{insight.time}</span>
            {insight.isResolved && <Check size={10} className="text-emerald-500" />}
          </div>
          <h4 className={`text-[11px] font-bold text-white truncate ${compact ? '' : 'mb-0.5'}`}>{insight.title}</h4>
          {!compact && (
            <p className="text-[9px] text-slate-400 line-clamp-1 leading-relaxed">{insight.summary}</p>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            {insight.sources.slice(0, 3).map((source, idx) => {
              const dimConfig = dimensionConfig[source];
              if (!dimConfig) return null;
              const DimIcon = dimConfig.icon;
              return (
                <span key={idx} className="w-3.5 h-3.5 rounded bg-slate-800/80 flex items-center justify-center" title={dimConfig.label}>
                  <DimIcon size={8} className={dimConfig.color} />
                </span>
              );
            })}
            <span className="text-[8px] text-slate-600 ml-auto">{insight.relatedSignals.length}</span>
          </div>
        </div>
        <ChevronRight size={12} className={`shrink-0 transition-colors mt-0.5 ${isSelected ? catConfig.color : 'text-slate-600'}`} />
      </div>
    </div>
  );
};

interface InsightGroupProps {
  title: string;
  insights: AIInsight[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  defaultOpen?: boolean;
  isPinned?: boolean;
}

const InsightGroup = ({ title, insights, selectedId, onSelect, onMarkRead, defaultOpen = false, isPinned = false }: InsightGroupProps) => {
  const unreadCount = insights.filter(i => !i.isRead).length;
  
  if (insights.length === 0) return null;

  if (isPinned) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles size={10} className="text-brand-400" />
            <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider">{title}</span>
          </div>
          {unreadCount > 0 && (
            <span className="text-[9px] font-bold text-brand-400 bg-brand-500/20 px-1.5 py-0.5 rounded">{unreadCount} new</span>
          )}
        </div>
        {insights.map(insight => (
          <InsightTickerItem
            key={insight.id}
            insight={insight}
            isSelected={selectedId === insight.id}
            onClick={() => onSelect(insight.id)}
            onMarkRead={() => onMarkRead(insight.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between px-1 py-1.5 cursor-pointer hover:bg-slate-900/30 rounded transition-colors">
          <div className="flex items-center gap-1.5">
            <ChevronDown size={10} className="text-slate-500" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-600">{insights.length}</span>
            {unreadCount > 0 && (
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 mt-1">
          {insights.map(insight => (
            <InsightTickerItem
              key={insight.id}
              insight={insight}
              isSelected={selectedId === insight.id}
              onClick={() => onSelect(insight.id)}
              onMarkRead={() => onMarkRead(insight.id)}
              compact
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface EvidencePanelProps {
  insight: AIInsight | null;
  onMarkResolved: () => void;
}

const EvidencePanel = ({ insight, onMarkResolved }: EvidencePanelProps) => {
  const [expandedSection, setExpandedSection] = useState<'keyInfo' | 'impact' | 'action' | null>(null);
  const [signalLimit, setSignalLimit] = useState(5);

  if (!insight) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <Sparkles size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Select an insight</p>
          <p className="text-xs text-slate-600 mt-1">View AI analysis and supporting evidence</p>
        </div>
      </div>
    );
  }

  const catConfig = categoryConfig[insight.category];
  const CategoryIcon = catConfig.icon;
  const displayedSignals = insight.relatedSignals.slice(0, signalLimit);
  const hasMoreSignals = insight.relatedSignals.length > signalLimit;

  return (
    <div className="h-full flex flex-col">
      <div className={`p-3 border-b border-slate-800/50 ${catConfig.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded flex items-center justify-center ${catConfig.bgColor} border ${catConfig.borderColor}`}>
              <CategoryIcon size={14} className={catConfig.color} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{insight.title}</h3>
              <p className="text-[9px] text-slate-500">{insight.time}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkResolved}
            className={`h-6 px-2 text-[9px] ${insight.isResolved ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <Check size={10} className="mr-1" />
            {insight.isResolved ? 'Resolved' : 'Mark Done'}
          </Button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{insight.summary}</p>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {insight.sources.map((source, idx) => {
            const dimConfig = dimensionConfig[source];
            if (!dimConfig) return null;
            const DimIcon = dimConfig.icon;
            return (
              <span key={idx} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50 flex items-center gap-1">
                <DimIcon size={8} className={dimConfig.color} /> {dimConfig.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        <div 
          className={`p-2.5 rounded-lg cursor-pointer transition-all ${expandedSection === 'keyInfo' ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'}`}
          onClick={() => setExpandedSection(expandedSection === 'keyInfo' ? null : 'keyInfo')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit size={11} className={catConfig.color} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Key Info</span>
            </div>
            <ChevronDown size={10} className={`text-slate-500 transition-transform ${expandedSection === 'keyInfo' ? 'rotate-180' : ''}`} />
          </div>
          <p className={`text-[11px] text-slate-300 leading-relaxed mt-1.5 ${expandedSection === 'keyInfo' ? '' : 'line-clamp-2'}`}>{insight.keyInfo}</p>
        </div>

        <div 
          className={`p-2.5 rounded-lg cursor-pointer transition-all ${expandedSection === 'impact' ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'}`}
          onClick={() => setExpandedSection(expandedSection === 'impact' ? null : 'impact')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={11} className="text-brand-400" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Impact</span>
            </div>
            <ChevronDown size={10} className={`text-slate-500 transition-transform ${expandedSection === 'impact' ? 'rotate-180' : ''}`} />
          </div>
          <p className={`text-[11px] text-slate-300 leading-relaxed mt-1.5 ${expandedSection === 'impact' ? '' : 'line-clamp-2'}`}>{insight.impact}</p>
        </div>

        <div 
          className={`p-2.5 rounded-lg cursor-pointer transition-all ${expandedSection === 'action' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30'}`}
          onClick={() => setExpandedSection(expandedSection === 'action' ? null : 'action')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={11} className="text-amber-400" />
              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider">Suggested Action</span>
            </div>
            <ChevronDown size={10} className={`text-amber-500/50 transition-transform ${expandedSection === 'action' ? 'rotate-180' : ''}`} />
          </div>
          <p className={`text-[11px] text-amber-200/80 leading-relaxed mt-1.5 ${expandedSection === 'action' ? '' : 'line-clamp-2'}`}>{insight.action}</p>
        </div>

        <div className="pt-2 border-t border-slate-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Supporting Evidence</span>
            <span className="text-[9px] text-slate-600">{insight.relatedSignals.length} signals</span>
          </div>
          <div className="space-y-1.5">
            {displayedSignals.map(signal => {
              const dimConfig = signal.dimension ? dimensionConfig[signal.dimension] : null;
              const DimIcon = dimConfig?.icon || Globe;
              return (
                <div 
                  key={signal.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${dimConfig?.bgColor || 'bg-slate-700'}/20`}>
                    <DimIcon size={10} className={dimConfig?.color || 'text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${dimConfig?.color || 'text-slate-400'}`}>
                        {signal.type}
                      </span>
                      <span className="text-[8px] text-slate-600">{signal.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 line-clamp-1">{signal.content}</p>
                  </div>
                  <ExternalLink size={9} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </div>
              );
            })}
          </div>
          {hasMoreSignals && (
            <button 
              onClick={() => setSignalLimit(prev => prev + 10)}
              className="w-full mt-2 py-1.5 text-[9px] text-slate-500 hover:text-slate-300 bg-slate-900/50 hover:bg-slate-800/50 rounded border border-slate-800/50 transition-colors"
            >
              Load {Math.min(10, insight.relatedSignals.length - signalLimit)} more signals
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface TrackInsightPanelProps {
  targetName: string;
  targetDomain: string;
}

export const TrackInsightPanel = ({ targetName, targetDomain }: TrackInsightPanelProps) => {
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [scanningChannel, setScanningChannel] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [channels] = useState<ChannelConfig[]>([
    { id: 'website', name: 'Website', icon: Globe, color: 'text-cyan-400', enabled: true, signalCount: 6 },
    { id: 'backlinks', name: 'Backlinks', icon: LinkIcon, color: 'text-emerald-400', enabled: true, signalCount: 4 },
    { id: 'seo', name: 'SEO', icon: Search, color: 'text-blue-400', enabled: true, signalCount: 4 },
    { id: 'social', name: 'Social', icon: Users, color: 'text-purple-400', enabled: true, signalCount: 4 },
    { id: 'news', name: 'News', icon: FileText, color: 'text-rose-400', enabled: true, signalCount: 3 },
    { id: 'ads', name: 'Ads', icon: Megaphone, color: 'text-amber-400', enabled: false, signalCount: 0 },
    { id: 'talent', name: 'Talent', icon: Briefcase, color: 'text-pink-400', enabled: true, signalCount: 4 },
  ]);

  useEffect(() => {
    const channelList = ['website', 'backlinks', 'seo', 'social', 'news'];
    let idx = 0;
    const scanTimer = setInterval(() => {
      setScanningChannel(channelList[idx]);
      idx = (idx + 1) % channelList.length;
      setTimeout(() => setScanningChannel(null), 2000);
    }, 10000);
    return () => clearInterval(scanTimer);
  }, []);

  const sampleSignals: Signal[] = [
    { id: 1, type: 'Page Update', category: 'website', time: '2h ago', content: 'Enterprise pricing page redesigned with new tier structure', domain: targetDomain, color: 'text-cyan-400', bgColor: 'bg-cyan-500', value: 'high', sourceUrl: '#', dimension: 'website' },
    { id: 2, type: 'New Backlink', category: 'backlinks', time: '4h ago', content: 'Featured in TechCrunch article about AI tools', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: '#', dimension: 'backlinks' },
    { id: 3, type: 'Keyword Rank', category: 'seo', time: '6h ago', content: '"enterprise collaboration" moved from #8 to #3', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'medium', sourceUrl: '#', dimension: 'seo' },
    { id: 4, type: 'Social Mention', category: 'social', time: '8h ago', content: 'CEO announced new AI features on LinkedIn', domain: targetDomain, color: 'text-purple-400', bgColor: 'bg-purple-500', value: 'medium', sourceUrl: '#', dimension: 'social' },
    { id: 5, type: 'News Article', category: 'news', time: '12h ago', content: 'Series C funding announcement covered by Forbes', domain: targetDomain, color: 'text-rose-400', bgColor: 'bg-rose-500', value: 'high', sourceUrl: '#', dimension: 'news' },
    { id: 6, type: 'Job Posting', category: 'talent', time: '1d ago', content: 'Hiring 5 senior engineers for AI team expansion', domain: targetDomain, color: 'text-pink-400', bgColor: 'bg-pink-500', value: 'medium', sourceUrl: '#', dimension: 'talent' },
    { id: 7, type: 'Pricing Change', category: 'website', time: '3d ago', content: 'Added new enterprise tier at $199/mo', domain: targetDomain, color: 'text-cyan-400', bgColor: 'bg-cyan-500', value: 'high', sourceUrl: '#', dimension: 'website' },
    { id: 8, type: 'Blog Post', category: 'website', time: '5d ago', content: 'Published case study with Fortune 500 company', domain: targetDomain, color: 'text-cyan-400', bgColor: 'bg-cyan-500', value: 'medium', sourceUrl: '#', dimension: 'website' },
  ];

  useEffect(() => {
    const initialInsights: AIInsight[] = [
      {
        id: 'insight-1', title: 'Market Strategy Shift Detected', priority: 'high',
        summary: 'Detected 4 signals indicating shift toward Enterprise Infrastructure positioning.',
        keyInfo: '2 new Enterprise landing pages + 1 SSO technical doc update + pricing tier restructure',
        impact: 'High risk to mid-market accounts; increased competitive pressure on security compliance features',
        action: 'Brief sales team on new SOC2 comparison; update Enterprise security battle card immediately',
        sources: ['website', 'seo', 'backlinks'], relatedSignals: sampleSignals.filter(s => ['website', 'seo', 'backlinks'].includes(s.dimension || '')),
        time: '2h ago', timeGroup: 'active', category: 'strategy', isRead: false, isResolved: false,
      },
      {
        id: 'insight-2', title: 'Pricing Model Changes', priority: 'high',
        summary: 'Price model consolidation detected across multiple trackers.',
        keyInfo: 'New $49/mo flat rate identified; temporary promotional banner detected on ads',
        impact: 'Aggressive undercutting of your per-seat model in the 5-15 user segment',
        action: 'Launch "Total Cost of Ownership" calculator for prospects comparing flat vs per-seat',
        sources: ['website', 'ads'], relatedSignals: sampleSignals.filter(s => ['website'].includes(s.dimension || '')),
        time: '5h ago', timeGroup: 'active', category: 'pricing', isRead: false, isResolved: false,
      },
      {
        id: 'insight-3', title: 'Growth Momentum Spike', priority: 'medium',
        summary: 'Significant spike in external authority and social mentions.',
        keyInfo: '3 high-DA backlinks from tech news + 45% increase in X/Twitter mentions this week',
        impact: 'Domain authority likely to rise by +2 in next update; higher SEO visibility for core keywords',
        action: 'Boost budget on "alternatives to [competitor]" search ads; initiate outreach to shared media contacts',
        sources: ['backlinks', 'social', 'news'], relatedSignals: sampleSignals.filter(s => ['backlinks', 'social', 'news'].includes(s.dimension || '')),
        time: 'Yesterday', timeGroup: 'yesterday', category: 'growth', isRead: true, isResolved: false,
      },
      {
        id: 'insight-4', title: 'Talent Acquisition Pattern', priority: 'low',
        summary: 'Increased hiring activity suggests product expansion.',
        keyInfo: '5 new AI/ML engineering roles posted; 2 enterprise sales positions',
        impact: 'Likely launching AI features within 3-6 months; expanding enterprise sales push',
        action: 'Accelerate own AI roadmap communication; prepare competitive positioning on AI capabilities',
        sources: ['talent', 'news'], relatedSignals: sampleSignals.filter(s => ['talent', 'news'].includes(s.dimension || '')),
        time: '3 days ago', timeGroup: 'thisWeek', category: 'competitive', isRead: true, isResolved: false,
      },
      {
        id: 'insight-5', title: 'Content Strategy Update', priority: 'low',
        summary: 'New blog series targeting enterprise decision makers.',
        keyInfo: '4 new blog posts focused on ROI and enterprise security',
        impact: 'Strengthening thought leadership in enterprise segment',
        action: 'Monitor for lead gen offers and gate content strategies',
        sources: ['website', 'seo'], relatedSignals: sampleSignals.slice(0, 2),
        time: '1 week ago', timeGroup: 'earlier', category: 'strategy', isRead: true, isResolved: true,
      },
    ];
    setInsights(initialInsights);
    setSelectedInsightId('insight-1');
  }, [targetDomain]);

  const handleMarkRead = (id: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, isRead: true } : i));
  };

  const handleMarkResolved = () => {
    if (selectedInsightId) {
      setInsights(prev => prev.map(i => i.id === selectedInsightId ? { ...i, isResolved: !i.isResolved } : i));
    }
  };

  const handleSelectInsight = (id: string) => {
    setSelectedInsightId(id);
    handleMarkRead(id);
  };

  const groupedInsights = useMemo(() => {
    const activeInsights = insights.filter(i => !i.isResolved && (i.timeGroup === 'active' || (!i.isRead && i.priority === 'high')));
    const todayInsights = insights.filter(i => !i.isResolved && i.timeGroup === 'today' && !activeInsights.includes(i));
    const yesterdayInsights = insights.filter(i => !i.isResolved && i.timeGroup === 'yesterday' && !activeInsights.includes(i));
    const thisWeekInsights = insights.filter(i => !i.isResolved && i.timeGroup === 'thisWeek' && !activeInsights.includes(i));
    const earlierInsights = insights.filter(i => !i.isResolved && i.timeGroup === 'earlier' && !activeInsights.includes(i));
    const archivedInsights = insights.filter(i => i.isResolved);

    return { activeInsights, todayInsights, yesterdayInsights, thisWeekInsights, earlierInsights, archivedInsights };
  }, [insights]);

  const selectedInsight = insights.find(i => i.id === selectedInsightId) || null;

  return (
    <div className="flex flex-col h-full">
      <LiveStatusBar channels={channels} scanningChannel={scanningChannel} />
      
      <div className="flex-1 flex min-h-0">
        <div className="w-[300px] shrink-0 border-r border-slate-800/50 flex flex-col">
          <div className="p-2.5 border-b border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-brand-400" />
              <span className="text-xs font-bold text-white">Insights</span>
            </div>
            <button 
              onClick={() => setShowArchive(!showArchive)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] transition-colors ${showArchive ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Archive size={10} />
              <span>{groupedInsights.archivedInsights.length}</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
            {!showArchive ? (
              <>
                <InsightGroup
                  title="Active"
                  insights={groupedInsights.activeInsights}
                  selectedId={selectedInsightId}
                  onSelect={handleSelectInsight}
                  onMarkRead={handleMarkRead}
                  isPinned
                />
                <InsightGroup
                  title="Today"
                  insights={groupedInsights.todayInsights}
                  selectedId={selectedInsightId}
                  onSelect={handleSelectInsight}
                  onMarkRead={handleMarkRead}
                  defaultOpen
                />
                <InsightGroup
                  title="Yesterday"
                  insights={groupedInsights.yesterdayInsights}
                  selectedId={selectedInsightId}
                  onSelect={handleSelectInsight}
                  onMarkRead={handleMarkRead}
                />
                <InsightGroup
                  title="This Week"
                  insights={groupedInsights.thisWeekInsights}
                  selectedId={selectedInsightId}
                  onSelect={handleSelectInsight}
                  onMarkRead={handleMarkRead}
                />
                <InsightGroup
                  title="Earlier"
                  insights={groupedInsights.earlierInsights}
                  selectedId={selectedInsightId}
                  onSelect={handleSelectInsight}
                  onMarkRead={handleMarkRead}
                />
              </>
            ) : (
              <InsightGroup
                title="Archived"
                insights={groupedInsights.archivedInsights}
                selectedId={selectedInsightId}
                onSelect={handleSelectInsight}
                onMarkRead={handleMarkRead}
                defaultOpen
              />
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-950/30 overflow-hidden">
          <EvidencePanel insight={selectedInsight} onMarkResolved={handleMarkResolved} />
        </div>
      </div>
    </div>
  );
};

export default TrackInsightPanel;
