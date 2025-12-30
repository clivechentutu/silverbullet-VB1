import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Zap, ChevronRight, ChevronDown,
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Clock, Radio, RefreshCw, AlertTriangle, 
  BrainCircuit, Archive, Check, Eye, TrendingUp
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
  summary: string;
  keyInfo: string;
  impact: string;
  action: string;
  signals: Signal[];
  time: string;
  isRead: boolean;
  isResolved: boolean;
}

interface ChannelConfig {
  id: string;
  name: string;
  icon: typeof Globe;
  color: string;
  bgColor: string;
  borderColor: string;
}

const channelConfig: Record<string, ChannelConfig> = {
  website: { id: 'website', name: 'Website', icon: Globe, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  backlinks: { id: 'backlinks', name: 'Backlinks', icon: LinkIcon, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  seo: { id: 'seo', name: 'SEO', icon: Search, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  social: { id: 'social', name: 'Social', icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  news: { id: 'news', name: 'News', icon: FileText, color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
  ads: { id: 'ads', name: 'Ads', icon: Megaphone, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  talent: { id: 'talent', name: 'Talent', icon: Briefcase, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
};

const tierConfig = {
  highlight: { label: 'Suggested Focus', order: 0 },
  notable: { label: 'Notable', order: 1 },
  update: { label: 'Update', order: 2 },
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
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock size={11} />
          <span className="text-[10px] font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
        {scanningChannel && (
          <>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-brand-400">
              <RefreshCw size={11} className="animate-spin" />
              <span className="text-[10px]">Scanning {channelConfig[scanningChannel]?.name}...</span>
            </div>
          </>
        )}
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
}

const InsightCard = ({ insight, isSelected, onClick }: InsightCardProps) => {
  const chConfig = channelConfig[insight.channel];
  const ChIcon = chConfig?.icon || Globe;

  return (
    <div 
      onClick={onClick}
      className={`relative p-3 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? `${chConfig?.bgColor} border ${chConfig?.borderColor}` 
          : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'
      }`}
      data-testid={`insight-card-${insight.id}`}
    >
      {!insight.isRead && (
        <span className="absolute top-3 right-3 w-2 h-2 bg-brand-500 rounded-full" />
      )}
      
      <div className="flex items-start gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${chConfig?.bgColor} border ${chConfig?.borderColor}`}>
          <ChIcon size={14} className={chConfig?.color} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[9px] font-medium ${chConfig?.color}`}>{chConfig?.name}</span>
            <span className="text-[8px] text-slate-600">|</span>
            <span className="text-[8px] text-slate-500">{insight.time}</span>
          </div>
          
          <h4 className="text-xs font-bold text-white mb-1 leading-snug">{insight.title}</h4>
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{insight.summary}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-[8px] text-slate-600">{insight.signals.length} signals</span>
            <ChevronRight size={12} className={isSelected ? chConfig?.color : 'text-slate-600'} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface InsightFeedProps {
  insights: ChannelInsight[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const InsightFeed = ({ insights, selectedId, onSelect, onMarkRead }: InsightFeedProps) => {
  const activeInsights = insights.filter(i => !i.isResolved);
  const resolvedInsights = insights.filter(i => i.isResolved);

  const sortedInsights = useMemo(() => {
    return [...activeInsights].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      const tDiff = tierConfig[a.tier].order - tierConfig[b.tier].order;
      if (tDiff !== 0) return tDiff;
      return 0;
    });
  }, [activeInsights]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onMarkRead(id);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand-400" />
          <span className="text-sm font-bold text-white">AI Insights</span>
          <span className="text-[10px] text-slate-500 ml-auto">{activeInsights.length} active</span>
        </div>
        <p className="text-[9px] text-slate-500 mt-1">AI-generated summaries from monitored channels</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {sortedInsights.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">No new insights</p>
            <p className="text-xs text-slate-600 mt-1">Monitoring is active</p>
          </div>
        ) : (
          sortedInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              isSelected={selectedId === insight.id}
              onClick={() => handleSelect(insight.id)}
            />
          ))
        )}

        {resolvedInsights.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between px-1 py-2 cursor-pointer hover:bg-slate-900/30 rounded transition-colors mt-3 border-t border-slate-800/50 pt-4">
                <div className="flex items-center gap-1.5">
                  <Archive size={10} className="text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-600">{resolvedInsights.length}</span>
                  <ChevronDown size={10} className="text-slate-500" />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1.5 mt-2">
                {resolvedInsights.map(insight => {
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

  const availableChannels = ['website', 'seo', 'backlinks', 'social', 'news', 'talent'];

  useEffect(() => {
    let idx = 0;
    const scanTimer = setInterval(() => {
      setScanningChannel(availableChannels[idx]);
      idx = (idx + 1) % availableChannels.length;
      setTimeout(() => setScanningChannel(null), 2000);
    }, 15000);
    return () => clearInterval(scanTimer);
  }, []);

  useEffect(() => {
    const sampleInsights: ChannelInsight[] = [
      {
        id: 'web-1', channel: 'website', title: 'Enterprise Tier Launch Detected', tier: 'highlight',
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
        id: 'web-2', channel: 'website', title: 'Blog Content Update', tier: 'update',
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

  const unreadCount = useMemo(() => insights.filter(i => !i.isRead && !i.isResolved).length, [insights]);
  const totalActive = useMemo(() => insights.filter(i => !i.isResolved).length, [insights]);

  const selectedInsight = insights.find(i => i.id === selectedInsightId) || null;

  return (
    <div className="flex flex-col h-full">
      <LiveStatusBar scanningChannel={scanningChannel} totalInsights={totalActive} unreadCount={unreadCount} />
      
      <div className="flex-1 flex min-h-0">
        <div className="w-[360px] shrink-0 border-r border-slate-800/50">
          <InsightFeed 
            insights={insights}
            selectedId={selectedInsightId}
            onSelect={setSelectedInsightId}
            onMarkRead={handleMarkRead}
          />
        </div>

        <div className="flex-1 bg-slate-950/30 overflow-hidden">
          <EvidencePanel insight={selectedInsight} onMarkResolved={handleMarkResolved} />
        </div>
      </div>
    </div>
  );
};

export default TrackInsightPanel;
