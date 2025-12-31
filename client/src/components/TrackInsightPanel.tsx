import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Zap, ChevronRight, ChevronDown,
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Clock, Radio, RefreshCw, AlertTriangle, 
  BrainCircuit, Archive, Check, Eye, TrendingUp, History, X,
  Calendar, LayoutList, Rows3, Info, Database, Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Signal {
  id: number;
  type: string;
  time: string;
  content: string;
  sourceUrl: string;
  channel: string;
}

interface ChannelInsight {
  id: string;
  channel: string;
  title: string;
  tier: 'highlight' | 'notable' | 'update';
  confidence: 'high' | 'medium' | 'low';
  userOverride?: 'highlight' | 'notable' | 'update' | null;
  summary: string;
  keyInfo: string;
  impact: string;
  action: string;
  signals: Signal[];
  time: string;
  isRead: boolean;
  isResolved: boolean;
}

// Confidence display configuration
const confidenceConfig = {
  high: { label: 'AI High Confidence', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  medium: { label: 'AI Medium Confidence', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  low: { label: 'AI Low Confidence', color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
};

interface ChannelConfig {
  id: string;
  name: string;
  icon: typeof Globe;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const channelConfig: Record<string, ChannelConfig> = {
  website: { id: 'website', name: 'Website', icon: Globe, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Detecting pricing changes, new product pages, and messaging shifts.' },
  backlinks: { id: 'backlinks', name: 'Backlinks', icon: LinkIcon, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Tracking new high-authority links and PR impact.' },
  seo: { id: 'seo', name: 'SEO', icon: Search, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Monitoring keyword ranking movements and organic visibility.' },
  social: { id: 'social', name: 'Social', icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', description: 'Monitoring executive social media activity and brand mentions.' },
  news: { id: 'news', name: 'News', icon: FileText, color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30', description: 'Tracking press releases, funding news, and industry coverage.' },
  ads: { id: 'ads', name: 'Ads', icon: Megaphone, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', description: 'Monitoring competitor ad campaigns and creative strategies.' },
  talent: { id: 'talent', name: 'Talent', icon: Briefcase, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30', description: 'Analyzing job postings and key leadership hiring patterns.' },
};

const tierConfig = {
  highlight: { 
    label: 'Focus', 
    order: 0, 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/20',
    icon: Sparkles,
    urgent: true
  },
  notable: { 
    label: 'Notable', 
    order: 1,
    color: 'text-brand-400',
    bgColor: 'bg-brand-500/10',
    borderColor: 'border-brand-500/30',
    glowColor: 'shadow-brand-500/10',
    icon: Zap,
    urgent: false
  },
  update: { 
    label: 'Update', 
    order: 2,
    color: 'text-slate-400',
    bgColor: 'bg-slate-800/30',
    borderColor: 'border-slate-700/50',
    glowColor: '',
    icon: Eye,
    urgent: false
  },
};

interface ChannelSummary {
  channel: string;
  signalCount: number;
  summary: string;
  keyPoints: string[];
}

interface HistoricalSummary {
  id: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  totalSignals: number;
  summaries: ChannelSummary[];
}

interface TopAction {
  id: string;
  channel: string;
  title: string;
  tier: 'highlight' | 'notable' | 'update';
  action: string;
}

interface SinceLastVisitStats {
  totalInsights: number;
  highlights: number;
  notable: number;
  lastVisitDays: number;
}

interface SessionCatchUpProps {
  lastLoginTime: string;
  isGenerating: boolean;
  summaries: ChannelSummary[] | null;
  onGenerate: () => void;
  availableChannels: string[];
  totalSignals: number;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  historicalSummaries: HistoricalSummary[];
  onViewHistorical: (summary: HistoricalSummary) => void;
  viewingHistorical: HistoricalSummary | null;
  onClearHistoricalView: () => void;
  topActions?: TopAction[];
  onActionClick?: (id: string) => void;
  sinceLastVisit?: SinceLastVisitStats;
}

const SessionCatchUp = ({ 
  lastLoginTime, isGenerating, summaries, onGenerate, availableChannels, totalSignals, 
  isExpanded, setIsExpanded, historicalSummaries, onViewHistorical, viewingHistorical, onClearHistoricalView,
  topActions, onActionClick, sinceLastVisit
}: SessionCatchUpProps) => {
  const [showHistory, setShowHistory] = useState(false);
  
  const displaySummaries = viewingHistorical ? viewingHistorical.summaries : summaries;
  const displayExpanded = viewingHistorical ? true : isExpanded;

  return (
    <div className="border-b border-brand-500/20 bg-brand-500/5">
      {/* Since Last Visit Summary - for infrequent users */}
      {sinceLastVisit && sinceLastVisit.lastVisitDays > 3 && !viewingHistorical && (
        <div className="px-4 py-2 border-b border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-2">
            <History size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Since Your Last Visit</span>
            <span className="text-[9px] text-slate-500">{sinceLastVisit.lastVisitDays} days ago</span>
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-white">{sinceLastVisit.totalInsights}</span>
              <span className="text-[9px] text-slate-400">new insights</span>
            </div>
            {sinceLastVisit.highlights > 0 && (
              <div className="flex items-center gap-1">
                <Sparkles size={10} className="text-amber-400" />
                <span className="text-[10px] text-amber-400 font-medium">{sinceLastVisit.highlights} focus</span>
              </div>
            )}
            {sinceLastVisit.notable > 0 && (
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-brand-400" />
                <span className="text-[10px] text-brand-400 font-medium">{sinceLastVisit.notable} notable</span>
              </div>
            )}
          </div>
          <p className="text-[9px] text-slate-500 mt-1">Use Focus Now filter to see priority items from this period</p>
        </div>
      )}
      
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="default"
                onClick={onGenerate}
                disabled={isGenerating || !!summaries}
                className={`text-xs font-bold px-4 h-9 shadow-lg transition-all ${
                  summaries 
                    ? 'border-slate-700 bg-slate-900/50 text-slate-500 cursor-default shadow-none' 
                    : 'border-brand-500/40 hover:bg-brand-500/20 text-brand-400 shadow-brand-500/10'
                }`}
                data-testid="button-generate-summary"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : summaries ? (
                  <>
                    <Check size={14} className="mr-2 text-emerald-500" />
                    Summarized
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
              {summaries && !isGenerating && (
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <div className="p-1.5 rounded-full bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-help">
                        <Info size={14} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-900 border-slate-700 p-2 max-w-[200px]">
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        Full analysis for this session is complete. You can generate a new comprehensive summary across all signals when you return for your next session.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

          <div className="flex items-center gap-4 min-w-0 cursor-pointer group flex-1 justify-end" onClick={() => {
            if (viewingHistorical) return;
            if (summaries) setIsExpanded(!isExpanded);
          }}>
            <div className="min-w-0 text-right">
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <span className="text-sm font-bold text-brand-400 group-hover:text-brand-300 transition-colors">
                  {viewingHistorical ? 'Historical Summary' : 'Session Catch-Up'}
                </span>
                {viewingHistorical ? (
                  <span className="text-[10px] text-slate-500">Generated: {viewingHistorical.generatedAt}</span>
                ) : (
                  <span className="text-[10px] text-slate-500">Last visit: {lastLoginTime}</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {viewingHistorical 
                  ? `${viewingHistorical.totalSignals} signals from ${viewingHistorical.periodStart} to ${viewingHistorical.periodEnd}`
                  : `${totalSignals} signals collected across ${availableChannels.length} channels`
                }
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0 group-hover:bg-brand-500/30 transition-colors shadow-inner">
              <BrainCircuit size={20} className="text-brand-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 border-l border-brand-500/20 pl-4 ml-2">
            {viewingHistorical ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistoricalView}
                className="text-xs text-slate-400 hover:bg-brand-500/10"
                data-testid="button-close-historical"
              >
                <X size={14} className="mr-1.5" />
                Close
              </Button>
            ) : (
              <>
                {historicalSummaries.length > 0 && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-xs text-slate-400 hover:bg-brand-500/10"
                      data-testid="button-show-history"
                    >
                      <History size={14} className="mr-1.5" />
                      History
                      <Badge variant="secondary" className="ml-2 text-[9px] px-1.5 py-0">
                        {historicalSummaries.length}
                      </Badge>
                    </Button>
                    
                    {showHistory && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/80">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Past Summaries</span>
                        </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {historicalSummaries.map(hist => (
              <div 
                key={hist.id}
                onClick={() => {
                  onViewHistorical(hist);
                  setShowHistory(false);
                }}
                className="px-3 py-2.5 hover:bg-slate-800/50 cursor-pointer border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{hist.generatedAt}</span>
                  <span className="text-[10px] text-slate-500">{hist.totalSignals} signals</span>
                </div>
                <span className="text-[10px] text-slate-500">{hist.periodStart} - {hist.periodEnd}</span>
              </div>
            ))}
          </div>
                      </div>
                    )}
                  </div>
                )}
                {summaries && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-slate-400 hover:bg-brand-500/10"
                    data-testid="button-toggle-summary"
                  >
                    {isExpanded ? 'Hide' : 'Show'}
                    <ChevronDown size={14} className={`ml-1.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {displayExpanded && displaySummaries && (
          <div className="mt-4 grid gap-2">
            {displaySummaries.map(summary => {
              const config = channelConfig[summary.channel];
              if (!config) return null;
              const Icon = config.icon;
              
              return (
                <div 
                  key={summary.channel}
                  className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className={config.color} />
                    <span className={`text-xs font-bold ${config.color}`}>{config.name}</span>
                    <span className="text-[9px] text-slate-500 ml-auto">{summary.signalCount} signals</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{summary.summary}</p>
                  {summary.keyPoints.length > 0 && (
                    <ul className="space-y-1">
                      {summary.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-400">
                          <span className="text-slate-600 mt-0.5">-</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Raw Signal Feed - Collapsible section showing all raw signals organized by channel cards
interface RawSignalFeedProps {
  insights: ChannelInsight[];
  availableChannels: string[];
}

interface RawSignalFeedPropsExtended extends RawSignalFeedProps {
  scanningChannel?: string | null;
}

const RawSignalFeed = ({ insights, availableChannels, scanningChannel }: RawSignalFeedPropsExtended) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set(availableChannels));
  const [channelLimits, setChannelLimits] = useState<Record<string, number>>({});
  
  // When main section expands, expand all channels by default
  useEffect(() => {
    if (isExpanded) {
      setExpandedChannels(new Set(availableChannels));
    }
  }, [isExpanded, availableChannels]);

  // Collect all signals from all insights, grouped by channel
  const signalsByChannel = useMemo(() => {
    const grouped: Record<string, Signal[]> = {};
    availableChannels.forEach(ch => {
      grouped[ch] = [];
    });
    
    insights.forEach(insight => {
      insight.signals.forEach(signal => {
        const ch = signal.channel || insight.channel;
        if (grouped[ch]) {
          grouped[ch].push(signal);
        }
      });
    });
    
    return grouped;
  }, [insights, availableChannels]);

  const totalSignals = useMemo(() => {
    return Object.values(signalsByChannel).reduce((sum, signals) => sum + signals.length, 0);
  }, [signalsByChannel]);

  const toggleChannel = (channelId: string) => {
    setExpandedChannels(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  };

  const loadMoreSignals = (channelId: string) => {
    setChannelLimits(prev => ({
      ...prev,
      [channelId]: (prev[channelId] || 5) + 5
    }));
  };

  return (
    <div className="border-t border-slate-800/50 bg-slate-900/50 shrink-0">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/50 transition-colors bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Activity Stream & Signals</span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-1 bg-slate-800 text-slate-400 border-slate-700">
                {totalSignals}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-medium bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                Monitoring {availableChannels.length} Channels
              </span>
              <div className="flex items-center gap-1 text-brand-400 group-hover:text-brand-300 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">{isExpanded ? 'Collapse' : 'Expand View'}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableChannels.map(channelId => {
                const config = channelConfig[channelId];
                if (!config) return null;
                const Icon = config.icon;
                const signals = signalsByChannel[channelId] || [];
                const isChannelExpanded = expandedChannels.has(channelId);
                const limit = channelLimits[channelId] || 5;
                const displayedSignals = signals.slice(0, limit);
                const hasMore = signals.length > limit;
                const isScanning = scanningChannel === channelId;
                
                return (
                  <div 
                    key={channelId}
                    className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden flex flex-col`}
                    data-testid={`raw-feed-card-${channelId}`}
                  >
                    {/* Channel Header */}
                    <div 
                      onClick={() => toggleChannel(channelId)}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-black/10 transition-colors shrink-0"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={config.color} />
                        <span className={`text-xs font-bold ${config.color}`}>{config.name}</span>
                        {/* Channel active/scanning indicator */}
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                          <Zap size={9} className="text-emerald-400 animate-pulse" />
                          <span className="text-[8px] text-emerald-400 font-medium">Monitoring</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500">{signals.length}</span>
                        <ChevronDown size={12} className={`text-slate-500 transition-transform ${isChannelExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Signal List with scroll */}
                    {isChannelExpanded && (
                      <div className="border-t border-slate-800/30 p-2 space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar flex-1">
                        {signals.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-[10px] text-slate-600">No signals yet</p>
                          </div>
                        ) : (
                          <>
                            {displayedSignals.map((signal, idx) => (
                              <div 
                                key={`${signal.id}-${idx}`}
                                className="flex items-start gap-2 p-2 rounded bg-slate-900/50 border border-slate-800/30 hover:border-slate-700/50 transition-colors group"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className={`text-[8px] font-bold uppercase tracking-wider ${config.color}`}>
                                      {signal.type}
                                    </span>
                                    <span className="text-[8px] text-slate-600">{signal.time}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-2">{signal.content}</p>
                                </div>
                                <ExternalLink size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 cursor-pointer hover:text-slate-400" />
                              </div>
                            ))}
                            
                            {hasMore && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadMoreSignals(channelId);
                                }}
                                className="w-full py-1.5 text-[9px] text-slate-500 hover:text-slate-300 bg-slate-900/30 hover:bg-slate-800/30 rounded transition-colors"
                              >
                                +{signals.length - limit} more
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const LiveStatusBar = ({ scanningChannel, totalInsights, unreadCount }: { scanningChannel: string | null; totalInsights: number; unreadCount: number }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
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
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Monitoring Active</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock size={11} />
          <span className="text-[10px] font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-500">{totalInsights} insights</span>
        {unreadCount > 0 && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-500/20 border border-brand-500/30">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-medium text-brand-400">{unreadCount} new</span>
          </span>
        )}
      </div>
    </div>
  );
};

interface InsightCardProps {
  insight: ChannelInsight;
  isSelected: boolean;
  onClick: () => void;
  onDemote?: (id: string) => void;
}

const InsightCard = ({ insight, isSelected, onClick, onDemote }: InsightCardProps) => {
  const chConfig = channelConfig[insight.channel];
  const ChIcon = chConfig?.icon || Globe;
  const effectiveTier = insight.userOverride || insight.tier;
  const tier = tierConfig[effectiveTier];
  const TierIcon = tier.icon;
  const isHighlight = effectiveTier === 'highlight';
  const confConfig = confidenceConfig[insight.confidence];

  const handleDemote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDemote?.(insight.id);
  };

  return (
    <div 
      onClick={onClick}
      className={`relative p-2.5 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? `${chConfig?.bgColor} border ${chConfig?.borderColor}` 
          : isHighlight && !insight.isRead
            ? `bg-amber-500/5 border border-amber-500/30 shadow-lg ${tier.glowColor}`
            : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'
      }`}
      data-testid={`insight-card-${insight.id}`}
    >
      {/* Tier indicator strip on the left */}
      {isHighlight && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-amber-500 rounded-full" />
      )}
      
      {/* Unread indicator */}
      {!insight.isRead && (
        <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${isHighlight ? 'bg-amber-500 animate-pulse' : 'bg-brand-500'}`} />
      )}
      
      <div className="flex items-start gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${chConfig?.bgColor} border ${chConfig?.borderColor}`}>
          <ChIcon size={14} className={chConfig?.color} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {/* Tier badge for highlight items */}
            {isHighlight && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                <TierIcon size={8} className="text-amber-400" />
                <span className="text-[8px] font-bold text-amber-400 uppercase">{tier.label}</span>
              </span>
            )}
            <span className={`text-[9px] font-medium ${chConfig?.color}`}>{chConfig?.name}</span>
            <span className="text-[8px] text-slate-600">|</span>
            <span className="text-[8px] text-slate-500">{insight.time}</span>
            {/* AI Confidence indicator */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] ${confConfig.bgColor} ${confConfig.color}`}>
                    <BrainCircuit size={7} />
                    {insight.confidence === 'high' ? 'H' : insight.confidence === 'medium' ? 'M' : 'L'}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 border-slate-700 p-2 max-w-[200px]">
                  <p className="text-[10px] text-slate-300 font-medium">{confConfig.label}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">AI-assigned priority. Not certain? Demote it.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {insight.userOverride && (
              <span className="text-[7px] text-slate-500 italic">adjusted</span>
            )}
          </div>
          
          <h4 className={`text-[11px] font-bold mb-0.5 leading-snug ${isHighlight && !insight.isRead ? 'text-white' : 'text-white'}`}>{insight.title}</h4>
          <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">{insight.summary}</p>
          
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-slate-600">{insight.signals.length} signals</span>
              {effectiveTier === 'notable' && (
                <span className="flex items-center gap-0.5 text-[8px] text-brand-400">
                  <Zap size={8} />
                  Notable
                </span>
              )}
              {/* Demote button - show until item reaches update tier */}
              {effectiveTier !== 'update' && (
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleDemote}
                        className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
                        data-testid={`demote-${insight.id}`}
                        aria-label="Demote this insight to lower priority"
                      >
                        <ChevronDown size={8} />
                        demote
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-900 border-slate-700 p-2 max-w-[180px]">
                      <p className="text-[9px] text-slate-400">AI got it wrong? Click to lower priority.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <ChevronRight size={12} className={isSelected ? chConfig?.color : 'text-slate-600'} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChannelFilterProps {
  channels: string[];
  activeFilter: string | null;
  onFilterChange: (channel: string | null) => void;
  insightCounts: Record<string, number>;
}

const ChannelFilter = ({ channels, activeFilter, onFilterChange, insightCounts }: ChannelFilterProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onFilterChange(null)}
              className={`px-2 py-1 rounded-md text-[9px] font-medium transition-colors ${
                activeFilter === null 
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-slate-700'
              }`}
              data-testid="filter-all"
            >
              All
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-slate-900 border-slate-700 p-2">
            <p className="text-[10px] text-slate-400">Show all intelligence channels</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {channels.map(channelId => {
        const config = channelConfig[channelId];
        if (!config) return null;
        const Icon = config.icon;
        const count = insightCounts[channelId] || 0;
        const isActive = activeFilter === channelId;
        
        return (
          <TooltipProvider key={channelId}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onFilterChange(channelId)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium transition-colors ${
                    isActive 
                      ? `${config.bgColor} ${config.color} border ${config.borderColor}` 
                      : 'bg-slate-900/50 text-slate-500 border border-slate-800/50 hover:border-slate-700'
                  }`}
                  data-testid={`filter-${channelId}`}
                >
                  <Icon size={10} className={isActive ? config.color : 'text-slate-500'} />
                  {count > 0 && <span>{count}</span>}
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="bg-slate-900 border-slate-700 p-2 max-w-[200px] z-[100]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Icon size={12} className={config.color} />
                    <span className="text-xs font-bold text-white uppercase">{config.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {config.description}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

type TimeRange = '7d' | '14d' | '30d' | 'all';
type ViewMode = 'default' | 'compact';
type TimeGroup = 'today' | 'yesterday' | 'thisWeek' | 'older';
type ValueFilter = 'all' | 'high' | 'medium' | 'low';

const valueFilterConfig: Record<ValueFilter, { label: string; shortLabel: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  all: { label: 'All', shortLabel: 'All', color: 'text-slate-400', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700', description: 'Show all insights' },
  high: { label: 'High Value', shortLabel: 'H', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/40', description: 'Critical insights requiring immediate attention' },
  medium: { label: 'Medium Value', shortLabel: 'M', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40', description: 'Notable insights worth reviewing' },
  low: { label: 'Low Value', shortLabel: 'L', color: 'text-slate-500', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700', description: 'General updates and minor changes' },
};

const timeRangeLabels: Record<TimeRange, string> = {
  '7d': 'Last 7 days',
  '14d': 'Last 14 days',
  '30d': 'Last 30 days',
  'all': 'All time'
};

const timeGroupLabels: Record<TimeGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  older: 'Older'
};

const getTimeGroup = (time: string): TimeGroup => {
  if (time.includes('h ago') || time.includes('min ago')) return 'today';
  if (time.includes('1d ago')) return 'yesterday';
  if (time.includes('2d ago') || time.includes('3d ago') || time.includes('4d ago') || time.includes('5d ago') || time.includes('6d ago')) return 'thisWeek';
  return 'older';
};

// Check if insight is within last 72 hours (3 days)
const isWithin72Hours = (time: string): boolean => {
  if (time.includes('min ago') || time.includes('h ago')) return true;
  if (time.includes('1d ago') || time.includes('2d ago') || time.includes('3d ago')) return true;
  return false;
};

interface InsightFeedProps {
  insights: ChannelInsight[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDemote: (id: string) => void;
  channelFilter: string | null;
  onChannelFilterChange: (channel: string | null) => void;
  availableChannels: string[];
  lastVisitDays: number;
}

const InsightFeed = ({ insights, selectedId, onSelect, onMarkRead, onDemote, channelFilter, onChannelFilterChange, availableChannels, lastVisitDays }: InsightFeedProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('14d');
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [showTimeRangeMenu, setShowTimeRangeMenu] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<TimeGroup>>(new Set());
  const [displayLimit, setDisplayLimit] = useState(50);
  const [valueFilter, setValueFilter] = useState<ValueFilter>('high');
  const [isValueFilterExpanded, setIsValueFilterExpanded] = useState(false);

  const activeInsights = insights.filter(i => !i.isResolved);
  const resolvedInsights = insights.filter(i => i.isResolved);

  // Adaptive window based on last visit - use userOverride for effective tier
  const isWithinAdaptiveWindow = (time: string): boolean => {
    const parseTimeAgo = (t: string): number => {
      if (t.includes('min ago')) return 0;
      if (t.includes('h ago')) return 0;
      const match = t.match(/(\d+)d ago/);
      if (match) return parseInt(match[1]);
      if (t.includes('w ago')) {
        const wMatch = t.match(/(\d+)w ago/);
        return wMatch ? parseInt(wMatch[1]) * 7 : 30;
      }
      return 30;
    };
    const daysAgo = parseTimeAgo(time);
    // Use lastVisitDays or default to 3 days (72h) for frequent users
    const windowDays = Math.max(lastVisitDays, 3);
    return daysAgo <= windowDays;
  };

  // Count items by value tier
  const tierCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    activeInsights.forEach(i => {
      const effectiveTier = i.userOverride || i.tier;
      if (effectiveTier === 'highlight') counts.high++;
      else if (effectiveTier === 'notable') counts.medium++;
      else counts.low++;
    });
    return counts;
  }, [activeInsights]);

  const filteredInsights = useMemo(() => {
    let result = activeInsights;
    
    // Apply channel filter
    if (channelFilter !== null) {
      result = result.filter(i => i.channel === channelFilter);
    }
    
    // Apply value filter
    if (valueFilter !== 'all') {
      result = result.filter(i => {
        const effectiveTier = i.userOverride || i.tier;
        const mappedTier = 
          effectiveTier === 'highlight' ? 'high' : 
          effectiveTier === 'notable' ? 'medium' : 'low';
        return mappedTier === valueFilter;
      });
    }
    
    return result;
  }, [activeInsights, channelFilter, valueFilter]);

  const sortedInsights = useMemo(() => {
    return [...filteredInsights].sort((a, b) => {
      // 1. First sort by tier order (value)
      const aTier = a.userOverride || a.tier;
      const bTier = b.userOverride || b.tier;
      const tDiff = tierConfig[aTier].order - tierConfig[bTier].order;
      if (tDiff !== 0) return tDiff;
      
      // 2. Finally by time (newest first)
      return 0;
    });
  }, [filteredInsights]);

  const groupedInsights = useMemo(() => {
    const groups: Record<TimeGroup, ChannelInsight[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };
    sortedInsights.forEach(insight => {
      const group = getTimeGroup(insight.time);
      groups[group].push(insight);
    });
    return groups;
  }, [sortedInsights]);

  const insightCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableChannels.forEach(ch => {
      counts[ch] = activeInsights.filter(i => i.channel === ch).length;
    });
    return counts;
  }, [activeInsights, availableChannels]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onMarkRead(id);
  };

  const toggleGroup = (group: TimeGroup) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const filteredResolved = useMemo(() => {
    if (channelFilter === null) return resolvedInsights;
    return resolvedInsights.filter(i => i.channel === channelFilter);
  }, [resolvedInsights, channelFilter]);

  const hasMoreInsights = sortedInsights.length > displayLimit;
  const displayedCount = Math.min(displayLimit, sortedInsights.length);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={12} className="text-brand-400" />
          <span className="text-xs font-bold text-white">AI Insights</span>
          <div className="flex items-center gap-1 ml-auto">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTimeRangeMenu(!showTimeRangeMenu)}
                className="h-6 px-2 text-[9px] text-slate-400 hover:bg-slate-800"
                data-testid="button-time-range"
              >
                <Calendar size={10} className="mr-1" />
                {timeRangeLabels[timeRange]}
              </Button>
              {showTimeRangeMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {(Object.keys(timeRangeLabels) as TimeRange[]).map(range => (
                    <div 
                      key={range}
                      onClick={() => { setTimeRange(range); setShowTimeRangeMenu(false); }}
                      className={`px-3 py-1.5 text-[10px] cursor-pointer transition-colors ${
                        timeRange === range ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {timeRangeLabels[range]}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'default' ? 'compact' : 'default')}
              className={`h-6 w-6 ${viewMode === 'compact' ? 'text-brand-400' : 'text-slate-500'}`}
              data-testid="button-view-mode"
            >
              {viewMode === 'compact' ? <Rows3 size={12} /> : <LayoutList size={12} />}
            </Button>
          </div>
        </div>
        {/* Value tier info */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] text-slate-500">{filteredInsights.length} {valueFilter !== 'all' ? 'matching' : 'active'}</span>
        </div>
        <ChannelFilter 
          channels={availableChannels}
          activeFilter={channelFilter}
          onFilterChange={onChannelFilterChange}
          insightCounts={insightCounts}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Vertical value tier filter tabs */}
        <div className="flex flex-col border-r border-slate-800/50 bg-slate-950/50">
          {/* All option */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setValueFilter('all')}
                  className={`flex flex-col items-center justify-center px-2 py-3 border-b border-slate-800/50 transition-all ${
                    valueFilter === 'all' 
                      ? 'bg-slate-800/50 border-r-2 border-r-slate-600'
                      : 'hover:bg-slate-900/50'
                  }`}
                  data-testid="filter-value-all"
                >
                  <span className={`text-[9px] ${valueFilter === 'all' ? 'text-slate-300' : 'text-slate-600'}`}>
                    All
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 border-slate-700 p-2">
                <p className="text-[10px] text-slate-400">Show all insights</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {(['high', 'medium', 'low'] as const).map(tier => {
            const config = valueFilterConfig[tier];
            const count = tierCounts[tier];
            const isActive = valueFilter === tier;
            
            return (
              <TooltipProvider key={tier}>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setValueFilter(isActive ? 'all' : tier)}
                      className={`relative flex flex-col items-center justify-center px-2 py-3 transition-all ${
                        isActive 
                          ? `${config.bgColor} border-r-2 ${config.borderColor.replace('border-', 'border-r-')}`
                          : 'hover:bg-slate-900/50'
                      }`}
                      data-testid={`filter-value-${tier}`}
                    >
                      <span className={`text-[10px] font-bold ${isActive ? config.color : 'text-slate-500'}`}>
                        {config.shortLabel}
                      </span>
                      {count > 0 && (
                        <span className={`text-[8px] mt-0.5 ${isActive ? config.color : 'text-slate-600'}`}>
                          {count}
                        </span>
                      )}
                      {isActive && (
                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-l ${config.bgColor.replace('bg-', 'bg-').replace('/20', '')}`} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-900 border-slate-700 p-2 max-w-[180px]">
                    <p className="text-[10px] font-medium text-white">{config.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
        {/* Insight list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
          {sortedInsights.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">No insights found</p>
              <p className="text-xs text-slate-600 mt-1">Try a different filter</p>
            </div>
          ) : viewMode === 'compact' ? (
          (Object.keys(groupedInsights) as TimeGroup[]).map(group => {
            const groupInsights = groupedInsights[group];
            if (groupInsights.length === 0) return null;
            const isCollapsed = collapsedGroups.has(group);
            
            return (
              <div key={group} className="mb-3">
                <div 
                  onClick={() => toggleGroup(group)}
                  className="flex items-center justify-between px-1 py-1.5 cursor-pointer hover:bg-slate-900/30 rounded transition-colors"
                >
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{timeGroupLabels[group]}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-600">{groupInsights.length}</span>
                    <ChevronDown size={10} className={`text-slate-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="space-y-1 mt-1">
                    {groupInsights.map(insight => {
                      const chConfig = channelConfig[insight.channel];
                      const ChIcon = chConfig?.icon || Globe;
                      const effectiveTier = insight.userOverride || insight.tier;
                      const tier = tierConfig[effectiveTier];
                      const isHighlight = effectiveTier === 'highlight';
                      const isNotable = effectiveTier === 'notable';
                      
                      return (
                        <div 
                          key={insight.id}
                          onClick={() => handleSelect(insight.id)}
                          className={`relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedId === insight.id 
                              ? `${chConfig?.bgColor} border ${chConfig?.borderColor}` 
                              : isHighlight && !insight.isRead
                                ? 'bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40'
                                : 'bg-slate-900/30 border border-slate-800/30 hover:border-slate-700'
                          }`}
                        >
                          {/* Tier color strip */}
                          {isHighlight && (
                            <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-amber-500 rounded-full" />
                          )}
                          {isNotable && (
                            <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-brand-500 rounded-full" />
                          )}
                          
                          {/* Unread indicator */}
                          {!insight.isRead && (
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHighlight ? 'bg-amber-500 animate-pulse' : 'bg-brand-500'}`} />
                          )}
                          
                          {/* Tier icon for highlight */}
                          {isHighlight && (
                            <Sparkles size={10} className="text-amber-400 shrink-0" />
                          )}
                          
                          <ChIcon size={12} className={chConfig?.color} />
                          <span className={`text-[10px] line-clamp-1 flex-1 ${isHighlight && !insight.isRead ? 'text-white font-medium' : 'text-white'}`}>
                            {insight.title}
                          </span>
                          <span className="text-[8px] text-slate-600 shrink-0">{insight.time}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="space-y-2">
            {sortedInsights.slice(0, displayLimit).map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                isSelected={selectedId === insight.id}
                onClick={() => handleSelect(insight.id)}
                onDemote={onDemote}
              />
            ))}
          </div>
        )}
        
        {viewMode === 'default' && hasMoreInsights && (
          <button 
            onClick={() => setDisplayLimit(prev => prev + 20)}
            className="w-full py-2 text-[10px] text-slate-500 hover:text-slate-300 bg-slate-900/50 hover:bg-slate-800/50 rounded border border-slate-800/50 transition-colors"
          >
            Load more ({sortedInsights.length - displayLimit} remaining)
          </button>
        )}

        {filteredResolved.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between px-1 py-2 cursor-pointer hover:bg-slate-900/30 rounded transition-colors mt-3 border-t border-slate-800/50 pt-4">
                <div className="flex items-center gap-1.5">
                  <Archive size={10} className="text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-600">{filteredResolved.length}</span>
                  <ChevronDown size={10} className="text-slate-500" />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1.5 mt-2">
                {filteredResolved.map(insight => {
                  const chConfig = channelConfig[insight.channel];
                  const ChIcon = chConfig?.icon || Globe;
                  return (
                    <div 
                      key={insight.id}
                      onClick={() => onSelect(insight.id)}
                      className={`p-2 rounded-lg cursor-pointer transition-all opacity-60 ${
                        selectedId === insight.id 
                          ? 'bg-slate-800/50 border border-slate-700' 
                          : 'bg-slate-900/30 border border-slate-800/30 hover:border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Check size={10} className="text-emerald-500 shrink-0" />
                        <ChIcon size={10} className={chConfig?.color} />
                        <span className="text-[10px] text-slate-400 line-clamp-1 flex-1">{insight.title}</span>
                        <span className="text-[8px] text-slate-600">{insight.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        </div>
      </div>
    </div>
  );
};

interface EvidencePanelProps {
  insight: ChannelInsight | null;
  onMarkResolved: () => void;
}

const EvidencePanel = ({ insight, onMarkResolved }: EvidencePanelProps) => {
  const [expandedSection, setExpandedSection] = useState<'keyInfo' | 'impact' | 'action' | null>(null);
  const [signalLimit, setSignalLimit] = useState(5);

  useEffect(() => {
    setSignalLimit(5);
    setExpandedSection(null);
  }, [insight?.id]);

  if (!insight) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <Eye size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Select an insight</p>
          <p className="text-xs text-slate-600 mt-1">View analysis and supporting signals</p>
        </div>
      </div>
    );
  }

  const chConfig = channelConfig[insight.channel];
  const ChIcon = chConfig?.icon || Globe;
  const displayedSignals = insight.signals.slice(0, signalLimit);
  const hasMoreSignals = insight.signals.length > signalLimit;

  return (
    <div className="h-full flex flex-col">
      <div className={`p-4 border-b border-slate-800/50 ${chConfig?.bgColor}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${chConfig?.bgColor} border ${chConfig?.borderColor}`}>
              <ChIcon size={18} className={chConfig?.color} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-medium ${chConfig?.color}`}>{chConfig?.name}</span>
                <span className="text-[9px] text-slate-500">{insight.time}</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{insight.title}</h3>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkResolved}
            className={`h-7 px-2 text-[10px] ${insight.isResolved ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <Check size={12} className="mr-1" />
            {insight.isResolved ? 'Resolved' : 'Mark Done'}
          </Button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{insight.summary}</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <div 
          className={`p-3 rounded-lg cursor-pointer transition-all ${expandedSection === 'keyInfo' ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'}`}
          onClick={() => setExpandedSection(expandedSection === 'keyInfo' ? null : 'keyInfo')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit size={12} className={chConfig?.color} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Finding</span>
            </div>
            <ChevronDown size={12} className={`text-slate-500 transition-transform ${expandedSection === 'keyInfo' ? 'rotate-180' : ''}`} />
          </div>
          <p className={`text-xs text-slate-300 leading-relaxed mt-2 ${expandedSection === 'keyInfo' ? '' : 'line-clamp-2'}`}>{insight.keyInfo}</p>
        </div>

        <div 
          className={`p-3 rounded-lg cursor-pointer transition-all ${expandedSection === 'impact' ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'}`}
          onClick={() => setExpandedSection(expandedSection === 'impact' ? null : 'impact')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-brand-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potential Impact</span>
            </div>
            <ChevronDown size={12} className={`text-slate-500 transition-transform ${expandedSection === 'impact' ? 'rotate-180' : ''}`} />
          </div>
          <p className={`text-xs text-slate-300 leading-relaxed mt-2 ${expandedSection === 'impact' ? '' : 'line-clamp-2'}`}>{insight.impact}</p>
        </div>

        <div 
          className={`p-3 rounded-lg cursor-pointer transition-all ${expandedSection === 'action' ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-brand-500/5 border border-brand-500/20 hover:border-brand-500/30'}`}
          onClick={() => setExpandedSection(expandedSection === 'action' ? null : 'action')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-brand-400" />
              <span className="text-[10px] font-bold text-brand-500/80 uppercase tracking-wider">Suggested Action</span>
            </div>
            <ChevronDown size={12} className={`text-brand-500/50 transition-transform ${expandedSection === 'action' ? 'rotate-180' : ''}`} />
          </div>
          <p className={`text-xs text-brand-200/80 leading-relaxed mt-2 ${expandedSection === 'action' ? '' : 'line-clamp-2'}`}>{insight.action}</p>
        </div>

        <div className="pt-3 border-t border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ChIcon size={11} className={chConfig?.color} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Signals</span>
            </div>
            <span className="text-[9px] text-slate-600">{insight.signals.length} detected</span>
          </div>
          <div className="space-y-2">
            {displayedSignals.map(signal => (
              <div 
                key={signal.id}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer group"
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${chConfig?.bgColor}`}>
                  <ChIcon size={10} className={chConfig?.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${chConfig?.color}`}>
                      {signal.type}
                    </span>
                    <span className="text-[8px] text-slate-600">{signal.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">{signal.content}</p>
                </div>
                <ExternalLink size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
          {hasMoreSignals && (
            <button 
              onClick={() => setSignalLimit(prev => prev + 10)}
              className="w-full mt-3 py-2 text-[10px] text-slate-500 hover:text-slate-300 bg-slate-900/50 hover:bg-slate-800/50 rounded border border-slate-800/50 transition-colors"
            >
              Load {Math.min(10, insight.signals.length - signalLimit)} more
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
  const [insights, setInsights] = useState<ChannelInsight[]>([]);
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [sessionSummaries, setSessionSummaries] = useState<ChannelSummary[] | null>(null);
  const [isCatchUpExpanded, setIsCatchUpExpanded] = useState(false);
  const [historicalSummaries, setHistoricalSummaries] = useState<HistoricalSummary[]>([]);
  const [viewingHistorical, setViewingHistorical] = useState<HistoricalSummary | null>(null);

  const availableChannels = ['website', 'seo', 'backlinks', 'social', 'news', 'talent', 'ads'];
  const lastLoginTime = '2 days ago';

  useEffect(() => {
    const mockHistory: HistoricalSummary[] = [
      {
        id: 'hist-1',
        generatedAt: 'Dec 28, 2024 14:32',
        periodStart: 'Dec 25',
        periodEnd: 'Dec 28',
        totalSignals: 23,
        summaries: [
          { channel: 'website', signalCount: 4, summary: 'Holiday promotion pages deployed with 30% discount messaging.', keyPoints: ['New /holiday-sale landing page', 'Banner updates across site'] },
          { channel: 'social', signalCount: 8, summary: 'Heavy social media activity promoting holiday deals.', keyPoints: ['12 posts across platforms', 'Influencer partnership announced'] },
          { channel: 'news', signalCount: 3, summary: 'Featured in year-end tech roundups.', keyPoints: ['Wired "Best of 2024" mention', 'TechRadar holiday guide feature'] },
        ]
      },
      {
        id: 'hist-2',
        generatedAt: 'Dec 20, 2024 09:15',
        periodStart: 'Dec 15',
        periodEnd: 'Dec 20',
        totalSignals: 18,
        summaries: [
          { channel: 'talent', signalCount: 6, summary: 'Significant engineering hiring push.', keyPoints: ['3 new backend engineer postings', 'DevOps lead position opened'] },
          { channel: 'seo', signalCount: 5, summary: 'Content strategy shift toward tutorials.', keyPoints: ['5 new tutorial articles published', 'Documentation site restructured'] },
          { channel: 'backlinks', signalCount: 4, summary: 'Guest post campaign active.', keyPoints: ['Medium publication partnership', 'Dev.to featured articles'] },
        ]
      },
      {
        id: 'hist-3',
        generatedAt: 'Dec 10, 2024 16:45',
        periodStart: 'Dec 5',
        periodEnd: 'Dec 10',
        totalSignals: 31,
        summaries: [
          { channel: 'news', signalCount: 5, summary: 'Product launch announcement received wide coverage.', keyPoints: ['ProductHunt launch day', 'Hacker News front page'] },
          { channel: 'website', signalCount: 8, summary: 'Major product page redesign.', keyPoints: ['New features page layout', 'Pricing page A/B test'] },
          { channel: 'social', signalCount: 12, summary: 'Launch day social blitz.', keyPoints: ['CEO Twitter thread went viral', 'LinkedIn employee amplification'] },
        ]
      }
    ];
    setHistoricalSummaries(mockHistory);
  }, []);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setViewingHistorical(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedSummaries: ChannelSummary[] = [
      {
        channel: 'website',
        signalCount: 5,
        summary: 'Significant website restructuring detected with new enterprise pricing tier and updated feature pages.',
        keyPoints: [
          'New $499/mo Enterprise tier launched with SSO/SAML',
          'Previous $299 Business tier removed',
          '3 new Fortune 500 case studies published'
        ]
      },
      {
        channel: 'seo',
        signalCount: 3,
        summary: 'Notable ranking improvements for enterprise-related keywords suggesting increased focus on enterprise market.',
        keyPoints: [
          '"enterprise collaboration tool" jumped from #18 to #4',
          'New ranking for "remote team platform" at #8'
        ]
      },
      {
        channel: 'backlinks',
        signalCount: 2,
        summary: 'High-authority backlinks acquired from major tech publications.',
        keyPoints: [
          'TechCrunch (DA 94) coverage of Series C funding',
          'Forbes (DA 95) feature in Top 10 list'
        ]
      },
      {
        channel: 'news',
        signalCount: 2,
        summary: '$50M Series C funding announced with focus on AI R&D and enterprise expansion.',
        keyPoints: [
          'Funding led by top-tier VC firm',
          'Focus areas: AI development and enterprise sales'
        ]
      },
      {
        channel: 'social',
        signalCount: 7,
        summary: 'CEO actively building AI narrative on LinkedIn with high engagement.',
        keyPoints: [
          '5 posts averaging 2,000+ impressions',
          'Teasing "big AI announcement coming soon"'
        ]
      },
      {
        channel: 'talent',
        signalCount: 8,
        summary: 'Heavy AI/ML hiring activity indicating significant product investment.',
        keyPoints: [
          '5 Senior ML Engineer openings for LLM integration',
          'AI Product Manager and Staff Engineer roles'
        ]
      }
    ];
    
    const newHistoricalEntry: HistoricalSummary = {
      id: `hist-${Date.now()}`,
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      periodStart: lastLoginTime,
      periodEnd: 'Now',
      totalSignals: generatedSummaries.reduce((sum, s) => sum + s.signalCount, 0),
      summaries: generatedSummaries
    };
    
    setHistoricalSummaries(prev => [newHistoricalEntry, ...prev]);
    setSessionSummaries(generatedSummaries);
    setIsGeneratingSummary(false);
    setIsCatchUpExpanded(true);
  };

  const totalSignals = useMemo(() => {
    return insights.reduce((sum, i) => sum + i.signals.length, 0);
  }, [insights]);

  useEffect(() => {
    let idx = 0;
    const scanTimer = setInterval(() => {
      idx = (idx + 1) % availableChannels.length;
    }, 15000);
    return () => clearInterval(scanTimer);
  }, []);

  useEffect(() => {
    const sampleInsights: ChannelInsight[] = [
      {
        id: 'web-1', channel: 'website', title: 'Enterprise Tier Launch Detected', tier: 'highlight',
        confidence: 'high',
        summary: 'New enterprise pricing page launched with significant restructuring of tier offerings.',
        keyInfo: 'Added $499/mo Enterprise tier with SSO, SAML, and dedicated support. Removed previous $299 Business tier.',
        impact: 'May affect positioning in enterprise segment. Price point differs from your current enterprise offering.',
        action: 'Review enterprise battle card with new tier comparison. Consider briefing enterprise sales team.',
        signals: [
          { id: 1, type: 'Page Added', time: '2h ago', content: 'New /enterprise page detected with full feature matrix', sourceUrl: '#', channel: 'website' },
          { id: 2, type: 'Pricing Update', time: '2h ago', content: 'Pricing table restructured: Basic $29, Pro $99, Enterprise $499', sourceUrl: '#', channel: 'website' },
          { id: 3, type: 'Feature Page', time: '3h ago', content: 'SSO/SAML documentation added to security section', sourceUrl: '#', channel: 'website' },
        ],
        time: '2h ago', isRead: false, isResolved: false,
      },
      {
        id: 'seo-1', channel: 'seo', title: 'Keyword Ranking Changes', tier: 'notable',
        confidence: 'medium',
        summary: 'Competitor ranking improved for several enterprise-related keywords.',
        keyInfo: '"enterprise collaboration tool" moved from #18 to #4. "team management software" from #12 to #6.',
        impact: 'May capture more organic traffic for enterprise-intent keywords.',
        action: 'Consider auditing content gaps on these keywords.',
        signals: [
          { id: 6, type: 'Rank Change', time: '6h ago', content: '"enterprise collaboration" #18 → #4', sourceUrl: '#', channel: 'seo' },
          { id: 7, type: 'Rank Change', time: '6h ago', content: '"team management software" #12 → #6', sourceUrl: '#', channel: 'seo' },
          { id: 8, type: 'New Ranking', time: '1d ago', content: 'Now ranking #8 for "remote team platform"', sourceUrl: '#', channel: 'seo' },
        ],
        time: '6h ago', isRead: false, isResolved: false,
      },
      {
        id: 'bl-1', channel: 'backlinks', title: 'New High-Authority Backlinks', tier: 'notable',
        confidence: 'high',
        summary: 'Featured in TechCrunch and Forbes articles.',
        keyInfo: 'TechCrunch DA 94 backlink, Forbes DA 95 backlink. Both articles about Series C funding.',
        impact: 'Domain authority may increase. Potential SEO boost.',
        action: 'Monitor their DA changes. Consider outreach to similar publications.',
        signals: [
          { id: 9, type: 'New Backlink', time: '4h ago', content: 'TechCrunch: "Startup raises $50M to revolutionize team collaboration"', sourceUrl: '#', channel: 'backlinks' },
          { id: 10, type: 'New Backlink', time: '2d ago', content: 'Forbes: "Top 10 collaboration tools to watch in 2025"', sourceUrl: '#', channel: 'backlinks' },
        ],
        time: '4h ago', isRead: false, isResolved: false,
      },
      {
        id: 'news-1', channel: 'news', title: 'Funding Announcement', tier: 'notable',
        confidence: 'high',
        summary: 'Raised $50M Series C led by top-tier VC firm.',
        keyInfo: 'Funding to be used for AI R&D and enterprise sales expansion per press release.',
        impact: 'Indicates significant runway for market expansion.',
        action: 'Monitor their hiring patterns and marketing spend.',
        signals: [
          { id: 13, type: 'Press Release', time: '12h ago', content: 'Announces $50M Series C funding round', sourceUrl: '#', channel: 'news' },
          { id: 14, type: 'News Article', time: '12h ago', content: 'VentureBeat coverage of funding announcement', sourceUrl: '#', channel: 'news' },
        ],
        time: '12h ago', isRead: false, isResolved: false,
      },
      {
        id: 'ads-1', channel: 'ads', title: 'New Competitor Ad Campaign', tier: 'notable',
        confidence: 'high',
        summary: 'Targeting enterprise collaboration keywords with aggressive pricing messaging.',
        keyInfo: 'New ad creatives focusing on "Free Enterprise Migration" and "Better than Figma AI".',
        impact: 'May increase CAC for your enterprise keywords.',
        action: 'Review ad copy and consider defensive bidding strategy.',
        signals: [
          { id: 18, type: 'Google Ad', time: '1h ago', content: 'Ad targeting "enterprise collaboration": 50% off for first year', sourceUrl: '#', channel: 'ads' },
          { id: 19, type: 'LinkedIn Ad', time: '3h ago', content: 'Video ad featuring "Seamless migration from legacy tools"', sourceUrl: '#', channel: 'ads' },
        ],
        time: '1h ago', isRead: false, isResolved: false,
      },
      {
        id: 'seo-2', channel: 'seo', title: 'Content Velocity Increase', tier: 'update',
        confidence: 'medium',
        summary: 'Published 12 new technical articles in the last 48 hours.',
        keyInfo: 'High density of articles focusing on "AI Workflows" and "Team Productivity".',
        impact: 'Likely trying to dominate long-tail AI-related search queries.',
        action: 'Analyze their internal linking structure for these new posts.',
        signals: [
          { id: 20, type: 'New Page', time: '2h ago', content: 'Guide: Optimizing AI workflows for remote teams', sourceUrl: '#', channel: 'seo' },
          { id: 21, type: 'New Page', time: '5h ago', content: 'Top 10 AI integrations for enterprise productivity', sourceUrl: '#', channel: 'seo' },
        ],
        time: '2h ago', isRead: false, isResolved: false,
      },
      {
        id: 'bl-2', channel: 'backlinks', title: 'Viral Industry Mention', tier: 'highlight',
        confidence: 'high',
        summary: 'Cited as "Industry Leader" in a viral newsletter from a top design influencer.',
        keyInfo: 'Newsletter has 200k+ subscribers. Resulted in 15+ high-quality backlinks from sub-blogs.',
        impact: 'Significant boost in direct traffic and domain authority.',
        action: 'Draft a response or counter-narrative for your own social channels.',
        signals: [
          { id: 22, type: 'Backlink', time: '30min ago', content: 'DesignWeekly: "Why [Competitor] is winning the AI race"', sourceUrl: '#', channel: 'backlinks' },
          { id: 23, type: 'Social Mention', time: '45min ago', content: 'Influencer @designguru: "[Competitor] is the future of work"', sourceUrl: '#', channel: 'social' },
        ],
        time: '30min ago', isRead: false, isResolved: false,
      },
      {
        id: 'soc-2', channel: 'social', title: 'Community Engagement Spike', tier: 'notable',
        confidence: 'medium',
        summary: 'New Reddit thread about competitor feature request has 500+ comments.',
        keyInfo: 'Users are highly requesting a "Local-first" mode which competitor seems to be teasing.',
        impact: 'Community sentiment is shifting positively towards their roadmap.',
        action: 'Engage in the thread to gather user pain points.',
        signals: [
          { id: 24, type: 'Reddit Thread', time: '4h ago', content: 'r/Productivity: Is [Competitor] better than the rest now?', sourceUrl: '#', channel: 'social' },
        ],
        time: '4h ago', isRead: false, isResolved: false,
      },
      {
        id: 'tal-2', channel: 'talent', title: 'Strategic Leadership Hire', tier: 'highlight',
        confidence: 'high',
        summary: 'Hired former Head of Product from a major direct competitor.',
        keyInfo: 'Strategic move likely aimed at accelerating their enterprise roadmap.',
        impact: 'May reveal product strategy shifts in the next 3-6 months.',
        action: 'Update leadership battle card and monitor product announcements.',
        signals: [
          { id: 25, type: 'Leadership Change', time: '1d ago', content: 'New VP of Product: Jane Doe (formerly @BigTech)', sourceUrl: '#', channel: 'talent' },
        ],
        time: '1d ago', isRead: false, isResolved: false,
      },
      {
        id: 'web-2', channel: 'website', title: 'Blog Content Update', tier: 'update',
        confidence: 'low',
        summary: 'Recent blog posts targeting enterprise decision makers.',
        keyInfo: '3 new case studies featuring Fortune 500 companies published.',
        impact: 'Building enterprise credibility and SEO authority.',
        action: 'Consider accelerating own case study publication.',
        signals: [
          { id: 4, type: 'Blog Post', time: '1d ago', content: 'Case study: How Acme Corp saved 40% with our platform', sourceUrl: '#', channel: 'website' },
          { id: 5, type: 'Blog Post', time: '3d ago', content: 'Enterprise security compliance guide published', sourceUrl: '#', channel: 'website' },
        ],
        time: '1d ago', isRead: true, isResolved: false,
      },
      {
        id: 'soc-1', channel: 'social', title: 'Executive Social Activity', tier: 'update',
        confidence: 'medium',
        summary: 'CEO posting about AI features on LinkedIn.',
        keyInfo: '5 posts in last week averaging 2,000+ impressions. Mentions AI features roadmap.',
        impact: 'Building narrative around AI capabilities.',
        action: 'Monitor for AI feature announcements.',
        signals: [
          { id: 11, type: 'LinkedIn Post', time: '8h ago', content: 'CEO: "Excited to share our AI vision for the future of work"', sourceUrl: '#', channel: 'social' },
          { id: 12, type: 'Twitter/X', time: '1d ago', content: 'Company account teasing "big AI announcement coming soon"', sourceUrl: '#', channel: 'social' },
        ],
        time: '8h ago', isRead: true, isResolved: false,
      },
      {
        id: 'tal-1', channel: 'talent', title: 'AI Hiring Activity', tier: 'update',
        confidence: 'medium',
        summary: 'Hiring AI/ML engineers and product managers.',
        keyInfo: 'Job postings mention "next-generation AI features" and "LLM integration".',
        impact: 'Indicates AI product investment. Features may be 6-9 months out.',
        action: 'Consider own AI roadmap positioning.',
        signals: [
          { id: 15, type: 'Job Posting', time: '1d ago', content: 'Senior ML Engineer - LLM Integration (5 openings)', sourceUrl: '#', channel: 'talent' },
          { id: 16, type: 'Job Posting', time: '2d ago', content: 'AI Product Manager - Enterprise Features', sourceUrl: '#', channel: 'talent' },
          { id: 17, type: 'Job Posting', time: '3d ago', content: 'Staff Engineer - AI Infrastructure', sourceUrl: '#', channel: 'talent' },
        ],
        time: '1d ago', isRead: true, isResolved: false,
      },
    ];
    setInsights(sampleInsights);
    setSelectedInsightId('web-1');
  }, []);

  const handleMarkRead = (id: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, isRead: true } : i));
  };

  const handleMarkResolved = () => {
    if (selectedInsightId) {
      setInsights(prev => prev.map(i => i.id === selectedInsightId ? { ...i, isResolved: !i.isResolved } : i));
    }
  };

  // Demote insight - user feedback that AI priority was wrong
  const handleDemote = (id: string) => {
    setInsights(prev => prev.map(i => {
      if (i.id === id) {
        // Use effective tier to allow repeated demotion
        const currentTier = i.userOverride || i.tier;
        // Demote: highlight -> notable, notable -> update, update stays update
        const newTier = currentTier === 'highlight' ? 'notable' : 'update';
        return { ...i, userOverride: newTier };
      }
      return i;
    }));
  };

  // Compute last visit days from lastLoginTime (simulate parsing)
  const lastVisitDays = useMemo(() => {
    // Parse "12 hours ago" or "3 days ago" etc.
    if (lastLoginTime.includes('hour')) return 0;
    if (lastLoginTime.includes('day')) {
      const match = lastLoginTime.match(/(\d+)/);
      return match ? parseInt(match[1]) : 1;
    }
    if (lastLoginTime.includes('week')) {
      const match = lastLoginTime.match(/(\d+)/);
      return match ? parseInt(match[1]) * 7 : 7;
    }
    return 3; // default to 3 days
  }, [lastLoginTime]);

  const unreadCount = useMemo(() => insights.filter(i => !i.isRead && !i.isResolved).length, [insights]);
  const totalActive = useMemo(() => insights.filter(i => !i.isResolved).length, [insights]);

  // Compute top actions (unread highlights and notable items, respecting userOverride)
  const topActions = useMemo(() => {
    return insights
      .filter(i => {
        const effectiveTier = i.userOverride || i.tier;
        return !i.isRead && !i.isResolved && (effectiveTier === 'highlight' || effectiveTier === 'notable');
      })
      .sort((a, b) => {
        const aTier = a.userOverride || a.tier;
        const bTier = b.userOverride || b.tier;
        return tierConfig[aTier].order - tierConfig[bTier].order;
      })
      .slice(0, 3)
      .map(i => ({
        id: i.id,
        channel: i.channel,
        title: i.title,
        tier: i.userOverride || i.tier,
        action: i.action
      }));
  }, [insights]);

  const handleTopActionClick = (id: string) => {
    setSelectedInsightId(id);
    handleMarkRead(id);
  };

  // Compute sinceLastVisit stats for infrequent users
  const sinceLastVisit = useMemo(() => {
    const unreadInsights = insights.filter(i => !i.isRead && !i.isResolved);
    const highlights = unreadInsights.filter(i => {
      const effectiveTier = i.userOverride || i.tier;
      return effectiveTier === 'highlight';
    }).length;
    const notable = unreadInsights.filter(i => {
      const effectiveTier = i.userOverride || i.tier;
      return effectiveTier === 'notable';
    }).length;
    return {
      totalInsights: unreadInsights.length,
      highlights,
      notable,
      lastVisitDays
    };
  }, [insights, lastVisitDays]);

  const selectedInsight = insights.find(i => i.id === selectedInsightId) || null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 relative">
      <LiveStatusBar scanningChannel={scanningChannel} totalInsights={totalActive} unreadCount={unreadCount} />
      
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar scroll-smooth">
        <SessionCatchUp
          lastLoginTime={lastLoginTime}
          isGenerating={isGeneratingSummary}
          summaries={sessionSummaries}
          onGenerate={handleGenerateSummary}
          availableChannels={availableChannels}
          totalSignals={totalSignals}
          isExpanded={isCatchUpExpanded}
          setIsExpanded={setIsCatchUpExpanded}
          historicalSummaries={historicalSummaries}
          onViewHistorical={setViewingHistorical}
          viewingHistorical={viewingHistorical}
          onClearHistoricalView={() => setViewingHistorical(null)}
          topActions={topActions}
          onActionClick={handleTopActionClick}
          sinceLastVisit={sinceLastVisit}
        />
        
        <div className="flex-none flex flex-col">
          <div className="flex h-[calc(100vh-200px)] min-h-[400px] shrink-0">
            <div className="w-[420px] shrink-0 border-r border-slate-800/50 flex flex-col overflow-hidden">
              <InsightFeed 
                insights={insights}
                selectedId={selectedInsightId}
                onSelect={setSelectedInsightId}
                onMarkRead={handleMarkRead}
                onDemote={handleDemote}
                channelFilter={channelFilter}
                onChannelFilterChange={setChannelFilter}
                availableChannels={availableChannels}
                lastVisitDays={lastVisitDays}
              />
            </div>

            <div className="flex-1 bg-slate-950/30 overflow-hidden">
              <EvidencePanel insight={selectedInsight} onMarkResolved={handleMarkResolved} />
            </div>
          </div>
          
          <RawSignalFeed 
            insights={insights}
            availableChannels={availableChannels}
            scanningChannel={scanningChannel}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackInsightPanel;
