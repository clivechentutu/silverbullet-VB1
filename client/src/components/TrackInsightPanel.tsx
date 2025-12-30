import { useState } from 'react';
import { 
  Sparkles, Zap, TrendingUp, ShieldAlert, ChevronDown, ChevronUp, 
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Check, Star, Eye, EyeOff, GripVertical, Settings, Bot,
  AlertTriangle, BrainCircuit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  category: 'strategy' | 'pricing' | 'growth' | 'competitive';
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

interface InsightCardProps {
  insight: AIInsight;
  onViewEvidence: (insight: AIInsight) => void;
}

const InsightCard = ({ insight, onViewEvidence }: InsightCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRead, setIsRead] = useState(false);
  
  const catConfig = categoryConfig[insight.category];
  const CategoryIcon = catConfig.icon;
  
  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className={`rounded-xl border ${catConfig.borderColor} ${catConfig.bgColor} overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${catConfig.bgColor} border ${catConfig.borderColor} flex items-center justify-center`}>
              <CategoryIcon size={16} className={catConfig.color} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{insight.title}</h4>
              <p className="text-[10px] text-slate-500">{insight.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${priorityStyles[insight.priority]}`}>
              {insight.priority === 'high' ? 'HIGH' : insight.priority === 'medium' ? 'MED' : 'LOW'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-slate-300 leading-relaxed mb-3">{insight.summary}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {insight.sources.map((source, idx) => {
            const dimConfig = dimensionConfig[source];
            if (!dimConfig) return null;
            const DimIcon = dimConfig.icon;
            return (
              <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50 flex items-center gap-1">
                <DimIcon size={10} className={dimConfig.color} /> {dimConfig.label}
              </span>
            );
          })}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[11px] text-slate-400 hover:text-white px-2 h-7">
                {isExpanded ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </Button>
            </CollapsibleTrigger>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[11px] text-brand-400 hover:text-brand-300 px-2 h-7"
              onClick={() => onViewEvidence(insight)}
              data-testid={`button-view-evidence-${insight.id}`}
            >
              <Eye size={14} className="mr-1" /> View Evidence ({insight.relatedSignals.length})
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${isRead ? 'text-brand-400' : 'text-slate-500 hover:text-white'}`}
              onClick={() => setIsRead(!isRead)}
              data-testid={`button-mark-read-${insight.id}`}
            >
              <Check size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${isSaved ? 'text-amber-400' : 'text-slate-500 hover:text-white'}`}
              onClick={() => setIsSaved(!isSaved)}
              data-testid={`button-save-${insight.id}`}
            >
              <Star size={14} className={isSaved ? 'fill-amber-400' : ''} />
            </Button>
          </div>
          
          <CollapsibleContent className="mt-3 space-y-2 pt-3 border-t border-slate-800/50">
            <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                <span className="text-emerald-400 font-bold mr-1">Key Info:</span> {insight.keyInfo}
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                <span className="text-brand-400 font-bold mr-1">Impact:</span> {insight.impact}
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                <span className="text-amber-400 font-bold mr-1">Action:</span> {insight.action}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

interface ChannelManagerProps {
  channels: ChannelConfig[];
  onToggle: (id: string) => void;
  onReorder: (newOrder: string[]) => void;
}

const ChannelManager = ({ channels, onToggle, onReorder }: ChannelManagerProps) => {
  const [draggedChannel, setDraggedChannel] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent, channelId: string) => {
    e.dataTransfer.setData('text/plain', channelId);
    setDraggedChannel(channelId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetId) return;
    
    const currentOrder = channels.map(c => c.id);
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);
    onReorder(newOrder);
    setDraggedChannel(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {channels.map(channel => {
        const ChannelIcon = channel.icon;
        return (
          <div 
            key={channel.id}
            draggable
            onDragStart={(e) => handleDragStart(e, channel.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, channel.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-move ${
              draggedChannel === channel.id ? 'opacity-50 scale-95' : ''
            } ${
              channel.enabled 
                ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600' 
                : 'bg-slate-950/50 border-slate-800/50 opacity-60'
            }`}
          >
            <GripVertical size={12} className="text-slate-600" />
            <ChannelIcon size={14} className={channel.enabled ? channel.color : 'text-slate-600'} />
            <span className={`text-[11px] font-medium ${channel.enabled ? 'text-slate-300' : 'text-slate-600'}`}>
              {channel.name}
            </span>
            {channel.enabled && (
              <span className="text-[9px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                {channel.signalCount}
              </span>
            )}
            <Switch 
              checked={channel.enabled}
              onCheckedChange={() => onToggle(channel.id)}
              className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700"
            />
          </div>
        );
      })}
    </div>
  );
};

interface SignalTimelineProps {
  signals: Signal[];
  onSignalClick: (signal: Signal) => void;
  selectedSignalId?: number;
}

const SignalTimeline = ({ signals, onSignalClick, selectedSignalId }: SignalTimelineProps) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'channel'>('timeline');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  
  const groupedByChannel = signals.reduce((acc, signal) => {
    const channel = signal.dimension || 'other';
    if (!acc[channel]) acc[channel] = [];
    acc[channel].push(signal);
    return acc;
  }, {} as Record<string, Signal[]>);

  const filteredSignals = channelFilter === 'all' 
    ? signals 
    : signals.filter(s => s.dimension === channelFilter);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">View:</span>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${viewMode === 'timeline' ? 'bg-slate-800 text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
              data-testid="view-timeline"
            >
              Timeline
            </button>
            <button 
              onClick={() => setViewMode('channel')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${viewMode === 'channel' ? 'bg-slate-800 text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
              data-testid="view-channel"
            >
              By Channel
            </button>
          </div>
        </div>
        
        {viewMode === 'timeline' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <select 
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
              data-testid="select-channel-filter"
            >
              <option value="all">All Channels</option>
              {Object.keys(dimensionConfig).map(key => (
                <option key={key} value={key}>{dimensionConfig[key].label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {viewMode === 'timeline' ? (
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {filteredSignals.map(signal => {
            const dimConfig = signal.dimension ? dimensionConfig[signal.dimension] : null;
            const DimIcon = dimConfig?.icon || Globe;
            return (
              <div 
                key={signal.id}
                onClick={() => onSignalClick(signal)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedSignalId === signal.id 
                    ? 'bg-brand-500/10 border-brand-500/50' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
                data-testid={`signal-item-${signal.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <DimIcon size={12} className={dimConfig?.color || 'text-slate-400'} />
                    <span className="text-[10px] text-slate-500 font-medium">{dimConfig?.label || 'Signal'}</span>
                    <span className="text-[9px] text-slate-600">{signal.time}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                    signal.value === 'high' ? 'bg-red-500/20 text-red-400' :
                    signal.value === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {signal.value === 'high' ? 'H' : signal.value === 'medium' ? 'M' : 'L'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{signal.content}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {Object.entries(groupedByChannel).map(([channel, channelSignals]) => {
            const dimConfig = dimensionConfig[channel];
            const DimIcon = dimConfig?.icon || Globe;
            return (
              <div key={channel} className="bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden">
                <div className={`px-3 py-2 border-b border-slate-800 flex items-center gap-2 ${dimConfig?.bgColor || 'bg-slate-800'}/10`}>
                  <DimIcon size={14} className={dimConfig?.color || 'text-slate-400'} />
                  <span className="text-xs font-bold text-white">{dimConfig?.label || channel}</span>
                  <span className="text-[9px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded ml-auto">
                    {channelSignals.length}
                  </span>
                </div>
                <div className="p-2 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {channelSignals.slice(0, 5).map(signal => (
                    <div 
                      key={signal.id}
                      onClick={() => onSignalClick(signal)}
                      className="p-2 bg-slate-900/50 rounded border border-slate-800/50 hover:border-slate-700 cursor-pointer transition-all"
                      data-testid={`channel-signal-${signal.id}`}
                    >
                      <p className="text-[10px] text-slate-300 line-clamp-1">{signal.content}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{signal.time}</p>
                    </div>
                  ))}
                  {channelSignals.length > 5 && (
                    <p className="text-[9px] text-slate-500 text-center py-1">+{channelSignals.length - 5} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface TrackInsightPanelProps {
  targetName: string;
  targetDomain: string;
}

export const TrackInsightPanel = ({ targetName, targetDomain }: TrackInsightPanelProps) => {
  const [isSignalsPanelOpen, setIsSignalsPanelOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [summaryFrequency, setSummaryFrequency] = useState<'daily' | 'weekly'>('daily');
  
  const [channels, setChannels] = useState<ChannelConfig[]>([
    { id: 'website', name: 'Website', icon: Globe, color: 'text-cyan-400', enabled: true, signalCount: 6 },
    { id: 'backlinks', name: 'Backlinks', icon: LinkIcon, color: 'text-emerald-400', enabled: true, signalCount: 4 },
    { id: 'seo', name: 'SEO', icon: Search, color: 'text-blue-400', enabled: true, signalCount: 4 },
    { id: 'social', name: 'Social', icon: Users, color: 'text-purple-400', enabled: true, signalCount: 4 },
    { id: 'news', name: 'News', icon: FileText, color: 'text-rose-400', enabled: true, signalCount: 3 },
    { id: 'ads', name: 'Ads', icon: Megaphone, color: 'text-amber-400', enabled: false, signalCount: 4 },
    { id: 'talent', name: 'Talent', icon: Briefcase, color: 'text-pink-400', enabled: true, signalCount: 4 },
  ]);

  const sampleSignals: Signal[] = [
    { id: 101, type: 'product', category: 'Pricing Page Update', time: '2 hours ago', content: 'Pricing tiers restructured with new enterprise and startup plans.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}/pricing`, dimension: 'website' },
    { id: 102, type: 'product', category: 'Feature Launch', time: '3 hours ago', content: 'AI-Powered Editing: 3 new AI features added to the design suite.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}/features`, dimension: 'website' },
    { id: 201, type: 'marketing', category: 'New Backlink', time: '6 hours ago', content: 'High-authority tech blog linked to product page from TechReview.io.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://techreview.io/best-design-tools', dimension: 'backlinks' },
    { id: 301, type: 'product', category: 'Ranking Change', time: '1 hour ago', content: 'Main competitor jumped to #1 for "AI Design Tools" keyword.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}`, dimension: 'seo' },
    { id: 401, type: 'marketing', category: 'Viral Content', time: '1 hour ago', content: 'A user\'s review of their new collaborative features is trending on X.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://x.com/trending', dimension: 'social' },
    { id: 501, type: 'marketing', category: 'TechCrunch Feature', time: '4 hours ago', content: 'Comprehensive deep-dive article on their recent $50M series B funding.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://techcrunch.com/funding', dimension: 'news' },
    { id: 601, type: 'hiring', category: 'CTO Posting', time: 'Just now', content: 'CTO position posted; actively recruiting for leadership vacancy in engineering.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://linkedin.com', dimension: 'talent' },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: 'strategy-1',
      title: 'Market Strategy Shift Detected',
      priority: 'high',
      category: 'strategy',
      summary: 'Detected 4 signals indicating shift toward Enterprise Infrastructure. New landing pages and SSO documentation suggest upmarket expansion.',
      keyInfo: '2 new Enterprise landing pages + 1 SSO technical doc update.',
      impact: 'High risk to mid-market accounts; increased competitive pressure on security compliance.',
      action: 'Brief sales team on new SOC2 comparison; update Enterprise security battle card.',
      sources: ['website', 'seo'],
      relatedSignals: sampleSignals.filter(s => s.dimension === 'website' || s.dimension === 'seo'),
      time: summaryFrequency === 'daily' ? 'Today' : 'This Week',
    },
    {
      id: 'pricing-1',
      title: 'Pricing Model Changes',
      priority: 'high',
      category: 'pricing',
      summary: 'Price model consolidation detected. New $49/mo flat rate identified with promotional campaigns.',
      keyInfo: 'New $49/mo flat rate identified; temporary promotional banner detected on ads.',
      impact: 'Aggressive undercutting of your per-seat model in the 5-15 user segment.',
      action: 'Launch "Total Cost of Ownership" calculator for prospects comparing flat vs per-seat.',
      sources: ['website', 'ads'],
      relatedSignals: sampleSignals.filter(s => s.category.includes('Pricing')),
      time: summaryFrequency === 'daily' ? 'Today' : 'This Week',
    },
    {
      id: 'growth-1',
      title: 'Growth Momentum Surge',
      priority: 'medium',
      category: 'growth',
      summary: 'Significant spike in external authority and social mentions. Domain authority likely to increase.',
      keyInfo: '3 high-DA backlinks from tech news + 45% increase in X/Twitter mentions.',
      impact: 'Domain authority likely to rise by +2 in next update; higher SEO visibility for core keywords.',
      action: 'Boost budget on "alternatives to [competitor]" search ads; initiate outreach to shared media contacts.',
      sources: ['backlinks', 'social', 'news'],
      relatedSignals: sampleSignals.filter(s => ['backlinks', 'social', 'news'].includes(s.dimension || '')),
      time: summaryFrequency === 'daily' ? 'Today' : 'This Week',
    },
    {
      id: 'talent-1',
      title: 'Leadership Restructuring',
      priority: 'medium',
      category: 'competitive',
      summary: 'Key executive position posted, signaling potential strategic changes in engineering direction.',
      keyInfo: 'CTO position posted with urgency markers; possible internal departure.',
      impact: 'May indicate strategic pivot or integration challenges; watch for product roadmap changes.',
      action: 'Monitor product announcements; prepare competitive positioning around stability.',
      sources: ['talent'],
      relatedSignals: sampleSignals.filter(s => s.dimension === 'talent'),
      time: summaryFrequency === 'daily' ? 'Today' : 'This Week',
    },
  ];

  const handleToggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const handleReorderChannels = (newOrder: string[]) => {
    setChannels(prev => {
      const channelMap = Object.fromEntries(prev.map(c => [c.id, c]));
      return newOrder.map(id => channelMap[id]).filter(Boolean);
    });
  };

  const handleViewEvidence = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setIsSignalsPanelOpen(true);
  };

  const enabledChannels = channels.filter(c => c.enabled);
  const enabledChannelIds = enabledChannels.map(c => c.id);
  
  const filteredInsights = aiInsights
    .filter(insight => 
      insight.sources.some(source => enabledChannelIds.includes(source))
    )
    .sort((a, b) => {
      const aHighestPriority = Math.min(
        ...a.sources.map(s => enabledChannelIds.indexOf(s)).filter(i => i >= 0)
      );
      const bHighestPriority = Math.min(
        ...b.sources.map(s => enabledChannelIds.indexOf(s)).filter(i => i >= 0)
      );
      if (aHighestPriority !== bHighestPriority) {
        return aHighestPriority - bHighestPriority;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  return (
    <div className="flex flex-col h-full">
      {/* AI Insights Section - ~60% of interface */}
      <div className={`${isSignalsPanelOpen ? 'flex-[3]' : 'flex-1'} overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <Sparkles size={20} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Intelligence Summary 
                <Zap size={14} className="text-brand-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500">Insights based on {enabledChannels.length} active channels</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-lg p-0.5 h-7">
              <button 
                onClick={() => setSummaryFrequency('daily')}
                className={`px-2.5 h-full text-[10px] font-bold rounded-md transition-all ${summaryFrequency === 'daily' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                data-testid="freq-daily"
              >
                DAILY
              </button>
              <button 
                onClick={() => setSummaryFrequency('weekly')}
                className={`px-2.5 h-full text-[10px] font-bold rounded-md transition-all ${summaryFrequency === 'weekly' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                data-testid="freq-weekly"
              >
                WEEKLY
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Settings size={12} /> Channel Sources
            </span>
            <span className="text-[10px] text-slate-600">Drag to reorder priority</span>
          </div>
          <ChannelManager 
            channels={channels}
            onToggle={handleToggleChannel}
            onReorder={handleReorderChannels}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredInsights.map(insight => (
            <InsightCard 
              key={insight.id} 
              insight={insight} 
              onViewEvidence={handleViewEvidence}
            />
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-12">
            <Bot size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No insights available</p>
            <p className="text-xs text-slate-600 mt-1">Enable more channels to generate AI insights</p>
          </div>
        )}
      </div>

      {/* Signal Evidence Section - ~40% when open, collapsed by default */}
      <Collapsible open={isSignalsPanelOpen} onOpenChange={setIsSignalsPanelOpen} className={isSignalsPanelOpen ? 'flex-[2] flex flex-col min-h-0' : ''}>
        <CollapsibleTrigger asChild>
          <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-white">
                {selectedInsight ? `Evidence: ${selectedInsight.title}` : 'Signal Evidence & Details'}
              </span>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                {selectedInsight ? selectedInsight.relatedSignals.length : sampleSignals.length} signals
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              {isSignalsPanelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </Button>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="flex-1 min-h-0 overflow-hidden">
          <div className="border-t border-slate-800 p-4 bg-slate-950/50 h-full overflow-auto">
            <SignalTimeline 
              signals={selectedInsight?.relatedSignals || sampleSignals}
              onSignalClick={setSelectedSignal}
              selectedSignalId={selectedSignal?.id}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TrackInsightPanel;
