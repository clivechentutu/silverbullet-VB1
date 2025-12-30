import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Zap, TrendingUp, ShieldAlert, ChevronRight, ChevronDown,
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Activity, Clock, Radio, RefreshCw, AlertTriangle, 
  BrainCircuit, Archive, Check, Eye, Bell, ArrowRight
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
  priority: 'critical' | 'high' | 'medium' | 'low';
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

const priorityConfig = {
  critical: { label: 'CRITICAL', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50' },
  high: { label: 'HIGH', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/50' },
  medium: { label: 'MED', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50' },
  low: { label: 'LOW', color: 'text-slate-400', bgColor: 'bg-slate-500/20', borderColor: 'border-slate-500/50' },
};

const LiveStatusBar = ({ activeChannel, scanningChannel }: { activeChannel: string | null; scanningChannel: string | null }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const channelInfo = activeChannel ? channelConfig[activeChannel] : null;

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
      {channelInfo && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Viewing:</span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${channelInfo.bgColor} border ${channelInfo.borderColor}`}>
            <channelInfo.icon size={10} className={channelInfo.color} />
            <span className={`text-[10px] font-medium ${channelInfo.color}`}>{channelInfo.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface CriticalAlertStripProps {
  insights: ChannelInsight[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const CriticalAlertStrip = ({ insights, onSelect, selectedId }: CriticalAlertStripProps) => {
  const criticalInsights = insights.filter(i => i.priority === 'critical' && !i.isResolved);
  
  if (criticalInsights.length === 0) return null;

  return (
    <div className="px-3 py-2 bg-red-950/30 border-b border-red-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Bell size={11} className="text-red-400" />
        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Immediate Attention Required</span>
        <span className="text-[9px] text-red-500/60">{criticalInsights.length} critical</span>
      </div>
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
        {criticalInsights.map(insight => {
          const chConfig = channelConfig[insight.channel];
          const ChIcon = chConfig?.icon || Globe;
          return (
            <div 
              key={insight.id}
              onClick={() => onSelect(insight.id)}
              className={`shrink-0 p-2 rounded-lg cursor-pointer transition-all min-w-[200px] max-w-[280px] ${
                selectedId === insight.id 
                  ? 'bg-red-500/20 border border-red-500/50' 
                  : 'bg-slate-900/80 border border-red-500/30 hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${chConfig?.bgColor}`}>
                  <ChIcon size={9} className={chConfig?.color} />
                </div>
                <span className={`text-[8px] font-bold ${chConfig?.color}`}>{chConfig?.name}</span>
                <span className="text-[8px] text-slate-600 ml-auto">{insight.time}</span>
              </div>
              <h4 className="text-[10px] font-bold text-white line-clamp-1">{insight.title}</h4>
              <p className="text-[9px] text-red-300/70 line-clamp-1 mt-0.5">{insight.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ChannelTabsProps {
  channels: string[];
  activeChannel: string;
  onSelect: (channel: string) => void;
  insightCounts: Record<string, { total: number; unread: number; critical: number }>;
}

const ChannelTabs = ({ channels, activeChannel, onSelect, insightCounts }: ChannelTabsProps) => {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800/50 overflow-x-auto custom-scrollbar">
      {channels.map(channelId => {
        const config = channelConfig[channelId];
        if (!config) return null;
        const Icon = config.icon;
        const counts = insightCounts[channelId] || { total: 0, unread: 0, critical: 0 };
        const isActive = activeChannel === channelId;
        
        return (
          <button
            key={channelId}
            onClick={() => onSelect(channelId)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all shrink-0 ${
              isActive 
                ? `${config.bgColor} border ${config.borderColor}` 
                : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'
            }`}
            data-testid={`channel-tab-${channelId}`}
          >
            <Icon size={12} className={isActive ? config.color : 'text-slate-500'} />
            <span className={`text-[10px] font-medium ${isActive ? config.color : 'text-slate-400'}`}>{config.name}</span>
            {counts.total > 0 && (
              <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-slate-900/50 text-slate-300' : 'bg-slate-800 text-slate-500'}`}>
                {counts.total}
              </span>
            )}
            {counts.unread > 0 && (
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

interface ChannelInsightListProps {
  insights: ChannelInsight[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  channelId: string;
}

const ChannelInsightList = ({ insights, selectedId, onSelect, onMarkRead, channelId }: ChannelInsightListProps) => {
  const config = channelConfig[channelId];
  const Icon = config?.icon || Globe;
  
  const activeInsights = insights.filter(i => !i.isResolved);
  const resolvedInsights = insights.filter(i => i.isResolved);

  const sortedActive = [...activeInsights].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="h-full flex flex-col">
      <div className={`p-3 border-b ${config?.borderColor || 'border-slate-800/50'} ${config?.bgColor || 'bg-slate-900/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded flex items-center justify-center ${config?.bgColor} border ${config?.borderColor}`}>
              <Icon size={14} className={config?.color} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{config?.name} Insights</h3>
              <p className="text-[9px] text-slate-500">{activeInsights.length} active, {resolvedInsights.length} resolved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        {sortedActive.length === 0 ? (
          <div className="text-center py-8">
            <Icon size={24} className="text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No active insights</p>
            <p className="text-[10px] text-slate-600">This channel is all clear</p>
          </div>
        ) : (
          sortedActive.map(insight => {
            const pConfig = priorityConfig[insight.priority];
            const isSelected = selectedId === insight.id;
            
            return (
              <div 
                key={insight.id}
                onClick={() => { onSelect(insight.id); onMarkRead(insight.id); }}
                className={`relative p-2.5 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? `${config?.bgColor} border ${config?.borderColor}` 
                    : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'
                }`}
                data-testid={`insight-item-${insight.id}`}
              >
                {!insight.isRead && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                )}
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider rounded border ${pConfig.bgColor} ${pConfig.color} ${pConfig.borderColor}`}>
                        {pConfig.label}
                      </span>
                      <span className="text-[9px] text-slate-500">{insight.time}</span>
                    </div>
                    <h4 className="text-[11px] font-bold text-white mb-0.5">{insight.title}</h4>
                    <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{insight.summary}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[8px] text-slate-600">{insight.signals.length} signals</span>
                    </div>
                  </div>
                  <ChevronRight size={12} className={`shrink-0 transition-colors mt-0.5 ${isSelected ? config?.color : 'text-slate-600'}`} />
                </div>
              </div>
            );
          })
        )}

        {resolvedInsights.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between px-1 py-2 cursor-pointer hover:bg-slate-900/30 rounded transition-colors mt-3">
                <div className="flex items-center gap-1.5">
                  <Archive size={10} className="text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
                </div>
                <span className="text-[9px] text-slate-600">{resolvedInsights.length}</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1.5 mt-1">
                {resolvedInsights.map(insight => (
                  <div 
                    key={insight.id}
                    onClick={() => onSelect(insight.id)}
                    className={`p-2 rounded-lg cursor-pointer transition-all opacity-60 ${
                      selectedId === insight.id 
                        ? 'bg-slate-800/50 border border-slate-700' 
                        : 'bg-slate-900/30 border border-slate-800/30 hover:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Check size={10} className="text-emerald-500" />
                      <span className="text-[10px] text-slate-400 line-clamp-1">{insight.title}</span>
                      <span className="text-[8px] text-slate-600 ml-auto">{insight.time}</span>
                    </div>
                  </div>
                ))}
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
          <Sparkles size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Select an insight</p>
          <p className="text-xs text-slate-600 mt-1">View AI analysis and supporting evidence</p>
        </div>
      </div>
    );
  }

  const chConfig = channelConfig[insight.channel];
  const pConfig = priorityConfig[insight.priority];
  const ChIcon = chConfig?.icon || Globe;
  const displayedSignals = insight.signals.slice(0, signalLimit);
  const hasMoreSignals = insight.signals.length > signalLimit;

  return (
    <div className="h-full flex flex-col">
      <div className={`p-3 border-b border-slate-800/50 ${chConfig?.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded flex items-center justify-center ${chConfig?.bgColor} border ${chConfig?.borderColor}`}>
              <ChIcon size={14} className={chConfig?.color} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[8px] font-bold ${chConfig?.color}`}>{chConfig?.name}</span>
                <span className={`px-1 py-0.5 text-[7px] font-bold uppercase rounded ${pConfig.bgColor} ${pConfig.color}`}>
                  {pConfig.label}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{insight.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500">{insight.time}</span>
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
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{insight.summary}</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        <div 
          className={`p-2.5 rounded-lg cursor-pointer transition-all ${expandedSection === 'keyInfo' ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'}`}
          onClick={() => setExpandedSection(expandedSection === 'keyInfo' ? null : 'keyInfo')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit size={11} className={chConfig?.color} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Key Finding</span>
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
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Business Impact</span>
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
              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider">Recommended Action</span>
            </div>
            <ChevronDown size={10} className={`text-amber-500/50 transition-transform ${expandedSection === 'action' ? 'rotate-180' : ''}`} />
          </div>
          <p className={`text-[11px] text-amber-200/80 leading-relaxed mt-1.5 ${expandedSection === 'action' ? '' : 'line-clamp-2'}`}>{insight.action}</p>
        </div>

        <div className="pt-2 border-t border-slate-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ChIcon size={10} className={chConfig?.color} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{chConfig?.name} Signals</span>
            </div>
            <span className="text-[9px] text-slate-600">{insight.signals.length} total</span>
          </div>
          <div className="space-y-1.5">
            {displayedSignals.map(signal => (
              <div 
                key={signal.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer group"
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center ${chConfig?.bgColor}`}>
                  <ChIcon size={10} className={chConfig?.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${chConfig?.color}`}>
                      {signal.type}
                    </span>
                    <span className="text-[8px] text-slate-600">{signal.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{signal.content}</p>
                </div>
                <ExternalLink size={9} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
          {hasMoreSignals && (
            <button 
              onClick={() => setSignalLimit(prev => prev + 10)}
              className="w-full mt-2 py-1.5 text-[9px] text-slate-500 hover:text-slate-300 bg-slate-900/50 hover:bg-slate-800/50 rounded border border-slate-800/50 transition-colors"
            >
              Load {Math.min(10, insight.signals.length - signalLimit)} more signals
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
  const [activeChannel, setActiveChannel] = useState<string>('website');
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [scanningChannel, setScanningChannel] = useState<string | null>(null);
  const [insights, setInsights] = useState<ChannelInsight[]>([]);

  const availableChannels = ['website', 'seo', 'backlinks', 'social', 'news', 'talent'];

  useEffect(() => {
    const channelList = availableChannels;
    let idx = 0;
    const scanTimer = setInterval(() => {
      setScanningChannel(channelList[idx]);
      idx = (idx + 1) % channelList.length;
      setTimeout(() => setScanningChannel(null), 2000);
    }, 15000);
    return () => clearInterval(scanTimer);
  }, []);

  useEffect(() => {
    const sampleInsights: ChannelInsight[] = [
      // Website Channel Insights
      {
        id: 'web-1', channel: 'website', title: 'Enterprise Tier Launch Detected', priority: 'critical',
        summary: 'New enterprise pricing page launched with significant restructuring of tier offerings.',
        keyInfo: 'Added $499/mo Enterprise tier with SSO, SAML, and dedicated support. Removed previous $299 Business tier.',
        impact: 'Direct competitive threat to your enterprise accounts. Price point undercuts your current enterprise offering.',
        action: 'Update enterprise battle card with new tier comparison. Brief enterprise sales team within 24 hours.',
        signals: [
          { id: 1, type: 'Page Added', time: '2h ago', content: 'New /enterprise page detected with full feature matrix', sourceUrl: '#', channel: 'website' },
          { id: 2, type: 'Pricing Update', time: '2h ago', content: 'Pricing table restructured: Basic $29, Pro $99, Enterprise $499', sourceUrl: '#', channel: 'website' },
          { id: 3, type: 'Feature Page', time: '3h ago', content: 'SSO/SAML documentation added to security section', sourceUrl: '#', channel: 'website' },
        ],
        time: '2h ago', isRead: false, isResolved: false,
      },
      {
        id: 'web-2', channel: 'website', title: 'Blog Strategy Shift to Enterprise', priority: 'medium',
        summary: 'Recent blog posts targeting enterprise decision makers with ROI-focused content.',
        keyInfo: '3 new case studies featuring Fortune 500 companies published in last week.',
        impact: 'Building enterprise credibility and SEO authority in enterprise keywords.',
        action: 'Accelerate own enterprise case study publication. Consider reaching out to shared prospects.',
        signals: [
          { id: 4, type: 'Blog Post', time: '1d ago', content: 'Case study: How Acme Corp saved 40% with our platform', sourceUrl: '#', channel: 'website' },
          { id: 5, type: 'Blog Post', time: '3d ago', content: 'Enterprise security compliance guide published', sourceUrl: '#', channel: 'website' },
        ],
        time: '1d ago', isRead: true, isResolved: false,
      },
      // SEO Channel Insights
      {
        id: 'seo-1', channel: 'seo', title: 'Aggressive Keyword Expansion', priority: 'high',
        summary: 'Competitor now ranking for 12 new enterprise-related keywords in top 10.',
        keyInfo: '"enterprise collaboration tool" jumped from #18 to #4. "team management software" from #12 to #6.',
        impact: 'Capturing organic traffic for high-intent enterprise keywords you currently target.',
        action: 'Audit content gaps on these keywords. Consider increasing content production or PPC coverage.',
        signals: [
          { id: 6, type: 'Rank Change', time: '6h ago', content: '"enterprise collaboration" #18 → #4', sourceUrl: '#', channel: 'seo' },
          { id: 7, type: 'Rank Change', time: '6h ago', content: '"team management software" #12 → #6', sourceUrl: '#', channel: 'seo' },
          { id: 8, type: 'New Ranking', time: '1d ago', content: 'Now ranking #8 for "remote team platform"', sourceUrl: '#', channel: 'seo' },
        ],
        time: '6h ago', isRead: false, isResolved: false,
      },
      // Backlinks Channel Insights
      {
        id: 'bl-1', channel: 'backlinks', title: 'High-Authority Press Coverage', priority: 'high',
        summary: 'Featured in TechCrunch and Forbes articles within the same week.',
        keyInfo: 'TechCrunch DA 94 backlink, Forbes DA 95 backlink. Both articles about Series C funding.',
        impact: 'Domain authority will likely increase by +3-5 points. Significant SEO boost incoming.',
        action: 'Reach out to same publications with your differentiation story. Monitor their DA changes.',
        signals: [
          { id: 9, type: 'New Backlink', time: '4h ago', content: 'TechCrunch: "Startup raises $50M to revolutionize team collaboration"', sourceUrl: '#', channel: 'backlinks' },
          { id: 10, type: 'New Backlink', time: '2d ago', content: 'Forbes: "Top 10 collaboration tools to watch in 2025"', sourceUrl: '#', channel: 'backlinks' },
        ],
        time: '4h ago', isRead: false, isResolved: false,
      },
      // Social Channel Insights
      {
        id: 'soc-1', channel: 'social', title: 'CEO Thought Leadership Campaign', priority: 'medium',
        summary: 'CEO actively posting about AI features on LinkedIn with high engagement.',
        keyInfo: '5 posts in last week averaging 2,000+ impressions. Announcing AI features roadmap.',
        impact: 'Building narrative around AI capabilities. May announce AI features within weeks.',
        action: 'Accelerate own AI messaging. Consider executive response or thought leadership counter-campaign.',
        signals: [
          { id: 11, type: 'LinkedIn Post', time: '8h ago', content: 'CEO: "Excited to share our AI vision for the future of work"', sourceUrl: '#', channel: 'social' },
          { id: 12, type: 'Twitter/X', time: '1d ago', content: 'Company account teasing "big AI announcement coming soon"', sourceUrl: '#', channel: 'social' },
        ],
        time: '8h ago', isRead: true, isResolved: false,
      },
      // News Channel Insights
      {
        id: 'news-1', channel: 'news', title: 'Series C Funding Announcement', priority: 'high',
        summary: 'Raised $50M Series C led by top-tier VC firm. Valued at $500M.',
        keyInfo: 'Funding to be used for AI R&D and enterprise sales expansion per press release.',
        impact: 'Significant runway for aggressive market expansion. Expect increased marketing spend.',
        action: 'Prepare competitive positioning on financial stability. Monitor their hiring patterns.',
        signals: [
          { id: 13, type: 'Press Release', time: '12h ago', content: 'Announces $50M Series C funding round', sourceUrl: '#', channel: 'news' },
          { id: 14, type: 'News Article', time: '12h ago', content: 'VentureBeat coverage of funding announcement', sourceUrl: '#', channel: 'news' },
        ],
        time: '12h ago', isRead: false, isResolved: false,
      },
      // Talent Channel Insights
      {
        id: 'tal-1', channel: 'talent', title: 'AI Team Expansion', priority: 'medium',
        summary: 'Hiring 8 AI/ML engineers and 2 AI product managers.',
        keyInfo: 'Job postings mention "next-generation AI features" and "LLM integration".',
        impact: 'Indicates serious AI product investment. Features likely 6-9 months out.',
        action: 'Audit own AI roadmap timeline. Consider accelerating key AI features.',
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

  const insightCounts = useMemo(() => {
    const counts: Record<string, { total: number; unread: number; critical: number }> = {};
    availableChannels.forEach(ch => {
      const chInsights = insights.filter(i => i.channel === ch && !i.isResolved);
      counts[ch] = {
        total: chInsights.length,
        unread: chInsights.filter(i => !i.isRead).length,
        critical: chInsights.filter(i => i.priority === 'critical').length,
      };
    });
    return counts;
  }, [insights]);

  const channelInsights = useMemo(() => {
    return insights.filter(i => i.channel === activeChannel);
  }, [insights, activeChannel]);

  const selectedInsight = insights.find(i => i.id === selectedInsightId) || null;

  return (
    <div className="flex flex-col h-full">
      <LiveStatusBar activeChannel={activeChannel} scanningChannel={scanningChannel} />
      <CriticalAlertStrip insights={insights} onSelect={setSelectedInsightId} selectedId={selectedInsightId} />
      <ChannelTabs 
        channels={availableChannels} 
        activeChannel={activeChannel} 
        onSelect={setActiveChannel} 
        insightCounts={insightCounts} 
      />
      
      <div className="flex-1 flex min-h-0">
        <div className="w-[320px] shrink-0 border-r border-slate-800/50">
          <ChannelInsightList 
            insights={channelInsights}
            selectedId={selectedInsightId}
            onSelect={setSelectedInsightId}
            onMarkRead={handleMarkRead}
            channelId={activeChannel}
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
