import { useState, useEffect } from 'react';
import { 
  Sparkles, Zap, TrendingUp, ShieldAlert, ChevronDown, ChevronUp, 
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Check, Star, Eye, EyeOff, GripVertical, Settings, Bot,
  AlertTriangle, BrainCircuit, Activity, Clock, Radio, Radar, RefreshCw
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
  lastScan?: string;
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

const LiveMonitorRail = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanningChannel, setScanningChannel] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const channels = ['website', 'backlinks', 'seo', 'social', 'news'];
    let idx = 0;
    const scanTimer = setInterval(() => {
      setScanningChannel(channels[idx]);
      idx = (idx + 1) % channels.length;
      setTimeout(() => setScanningChannel(null), 2000);
    }, 8000);
    return () => clearInterval(scanTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="bg-slate-950/80 border-l border-slate-800 w-48 shrink-0 flex flex-col">
      <div className="p-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <Radar size={14} className="text-brand-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Monitor</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Activity size={12} className="animate-pulse" />
          <span className="text-xs font-mono font-medium">{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">System Status</span>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">All Trackers Active</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Last Scan</span>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={12} />
            <span className="text-[10px]">2 min ago</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Next Scan</span>
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw size={12} className={scanningChannel ? 'animate-spin text-brand-400' : ''} />
            <span className="text-[10px]">{scanningChannel ? `Scanning ${scanningChannel}...` : 'In 8 min'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Channel Activity</span>
          <div className="space-y-1.5">
            {Object.entries(dimensionConfig).slice(0, 5).map(([key, config]) => {
              const ChannelIcon = config.icon;
              const isScanning = scanningChannel === key;
              return (
                <div key={key} className={`flex items-center justify-between px-2 py-1.5 rounded transition-all ${isScanning ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-slate-900/50'}`}>
                  <div className="flex items-center gap-1.5">
                    <ChannelIcon size={10} className={isScanning ? 'text-brand-400' : config.color} />
                    <span className={`text-[9px] ${isScanning ? 'text-brand-300' : 'text-slate-500'}`}>{config.label}</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-brand-400 animate-pulse' : 'bg-slate-700'}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/50">
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Today's Activity</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded bg-slate-900/50">
              <div className="text-lg font-bold text-white">47</div>
              <div className="text-[8px] text-slate-500 uppercase">Scans</div>
            </div>
            <div className="text-center p-2 rounded bg-slate-900/50">
              <div className="text-lg font-bold text-emerald-400">6</div>
              <div className="text-[8px] text-slate-500 uppercase">New</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FlatInsightCardProps {
  insight: AIInsight;
  isNew?: boolean;
}

const FlatInsightCard = ({ insight, isNew = false }: FlatInsightCardProps) => {
  const catConfig = categoryConfig[insight.category];
  const CategoryIcon = catConfig.icon;
  
  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className={`relative rounded-xl border ${catConfig.borderColor} ${catConfig.bgColor} overflow-hidden transition-all duration-300 group`}>
      {isNew && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-pulse" />
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${catConfig.bgColor} border ${catConfig.borderColor} flex items-center justify-center relative`}>
              <CategoryIcon size={16} className={catConfig.color} />
              {isNew && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse border-2 border-slate-900" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{insight.title}</h4>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                {insight.time}
                {isNew && <span className="text-brand-400 font-medium ml-1">NEW</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${priorityStyles[insight.priority]}`}>
              {insight.priority === 'high' ? 'HIGH' : insight.priority === 'medium' ? 'MED' : 'LOW'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{insight.summary}</p>
        
        <div className="space-y-2.5">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${catConfig.bgColor}`}>
              <BrainCircuit size={12} className={catConfig.color} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Key Info</span>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.keyInfo}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-brand-500/20">
              <AlertTriangle size={12} className="text-brand-400" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Impact</span>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.impact}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-amber-500/20">
              <Zap size={12} className="text-amber-400" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider block mb-0.5">Suggested Action</span>
              <p className="text-xs text-amber-200/80 leading-relaxed">{insight.action}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50">
          <div className="flex flex-wrap gap-1.5">
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
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-slate-500 hover:text-white">
              <Eye size={12} className="mr-1" /> {insight.relatedSignals.length} signals
            </Button>
          </div>
        </div>
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
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {filteredSignals.map(signal => {
            const dimConfig = signal.dimension ? dimensionConfig[signal.dimension] : null;
            const DimIcon = dimConfig?.icon || Globe;
            return (
              <div 
                key={signal.id}
                onClick={() => onSignalClick(signal)}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedSignalId === signal.id 
                    ? 'bg-brand-500/10 border border-brand-500/30' 
                    : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dimConfig?.bgColor || 'bg-slate-700'}/20`}>
                  <DimIcon size={14} className={dimConfig?.color || 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${dimConfig?.color || 'text-slate-400'}`}>
                      {signal.type}
                    </span>
                    <span className="text-[10px] text-slate-600">{signal.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{signal.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {Object.entries(groupedByChannel).map(([channel, channelSignals]) => {
            const dimConfig = dimensionConfig[channel];
            const DimIcon = dimConfig?.icon || Globe;
            return (
              <div key={channel} className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/50">
                  <DimIcon size={14} className={dimConfig?.color || 'text-slate-400'} />
                  <span className="text-xs font-bold text-white">{dimConfig?.label || channel}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">{channelSignals.length}</span>
                </div>
                <div className="space-y-1.5">
                  {channelSignals.slice(0, 3).map(signal => (
                    <div 
                      key={signal.id}
                      onClick={() => onSignalClick(signal)}
                      className="text-[10px] text-slate-400 truncate cursor-pointer hover:text-slate-200 transition-colors"
                    >
                      {signal.content}
                    </div>
                  ))}
                  {channelSignals.length > 3 && (
                    <div className="text-[10px] text-slate-600">+{channelSignals.length - 3} more</div>
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
    { id: 'ads', name: 'Ads', icon: Megaphone, color: 'text-amber-400', enabled: false, signalCount: 0 },
    { id: 'talent', name: 'Talent', icon: Briefcase, color: 'text-pink-400', enabled: true, signalCount: 4 },
  ]);

  const sampleSignals: Signal[] = [
    { id: 1, type: 'Page Update', category: 'website', time: '2h ago', content: 'Enterprise pricing page redesigned with new tier structure', domain: targetDomain, color: 'text-cyan-400', bgColor: 'bg-cyan-500', value: 'high', sourceUrl: '#', dimension: 'website' },
    { id: 2, type: 'New Backlink', category: 'backlinks', time: '4h ago', content: 'Featured in TechCrunch article about AI tools', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: '#', dimension: 'backlinks' },
    { id: 3, type: 'Keyword Rank', category: 'seo', time: '6h ago', content: '"enterprise collaboration" moved from #8 to #3', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'medium', sourceUrl: '#', dimension: 'seo' },
    { id: 4, type: 'Social Mention', category: 'social', time: '8h ago', content: 'CEO announced new AI features on LinkedIn', domain: targetDomain, color: 'text-purple-400', bgColor: 'bg-purple-500', value: 'medium', sourceUrl: '#', dimension: 'social' },
    { id: 5, type: 'News Article', category: 'news', time: '12h ago', content: 'Series C funding announcement covered by Forbes', domain: targetDomain, color: 'text-rose-400', bgColor: 'bg-rose-500', value: 'high', sourceUrl: '#', dimension: 'news' },
    { id: 6, type: 'Job Posting', category: 'talent', time: '1d ago', content: 'Hiring 5 senior engineers for AI team expansion', domain: targetDomain, color: 'text-pink-400', bgColor: 'bg-pink-500', value: 'medium', sourceUrl: '#', dimension: 'talent' },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: 'insight-1',
      title: 'Market Strategy Shift Detected',
      priority: 'high',
      summary: 'Detected 4 signals indicating shift toward Enterprise Infrastructure positioning.',
      keyInfo: '2 new Enterprise landing pages + 1 SSO technical doc update + pricing tier restructure',
      impact: 'High risk to mid-market accounts; increased competitive pressure on security compliance features',
      action: 'Brief sales team on new SOC2 comparison; update Enterprise security battle card immediately',
      sources: ['website', 'seo', 'backlinks'],
      relatedSignals: sampleSignals.filter(s => ['website', 'seo', 'backlinks'].includes(s.dimension || '')),
      time: 'Today',
      category: 'strategy',
    },
    {
      id: 'insight-2',
      title: 'Pricing Model Changes',
      priority: 'high',
      summary: 'Price model consolidation detected across multiple trackers.',
      keyInfo: 'New $49/mo flat rate identified; temporary promotional banner detected on ads',
      impact: 'Aggressive undercutting of your per-seat model in the 5-15 user segment',
      action: 'Launch "Total Cost of Ownership" calculator for prospects comparing flat vs per-seat',
      sources: ['website', 'ads'],
      relatedSignals: sampleSignals.filter(s => ['website'].includes(s.dimension || '')),
      time: 'Today',
      category: 'pricing',
    },
    {
      id: 'insight-3',
      title: 'Growth Momentum Spike',
      priority: 'medium',
      summary: 'Significant spike in external authority and social mentions.',
      keyInfo: '3 high-DA backlinks from tech news + 45% increase in X/Twitter mentions this week',
      impact: 'Domain authority likely to rise by +2 in next update; higher SEO visibility for core keywords',
      action: 'Boost budget on "alternatives to [competitor]" search ads; initiate outreach to shared media contacts',
      sources: ['backlinks', 'social', 'news'],
      relatedSignals: sampleSignals.filter(s => ['backlinks', 'social', 'news'].includes(s.dimension || '')),
      time: 'Yesterday',
      category: 'growth',
    },
    {
      id: 'insight-4',
      title: 'Talent Acquisition Pattern',
      priority: 'low',
      summary: 'Increased hiring activity suggests product expansion.',
      keyInfo: '5 new AI/ML engineering roles posted; 2 enterprise sales positions',
      impact: 'Likely launching AI features within 3-6 months; expanding enterprise sales push',
      action: 'Accelerate own AI roadmap communication; prepare competitive positioning on AI capabilities',
      sources: ['talent', 'news'],
      relatedSignals: sampleSignals.filter(s => ['talent', 'news'].includes(s.dimension || '')),
      time: 'This Week',
      category: 'competitive',
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
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`${isSignalsPanelOpen ? 'flex-[3]' : 'flex-1'} overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-600/20 flex items-center justify-center relative">
                <Sparkles size={20} className="text-brand-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-slate-900" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  AI Intelligence Summary 
                  <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Activity size={10} className="animate-pulse" /> Live
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Insights from {enabledChannels.length} active channels for {targetName}</p>
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

          <Collapsible defaultOpen={false}>
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Settings size={12} /> Channel Sources ({enabledChannels.length} active)
                  </span>
                  <ChevronDown size={14} className="text-slate-600" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 pt-0 border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-600 block mb-2">Drag to reorder priority</span>
                  <ChannelManager 
                    channels={channels}
                    onToggle={handleToggleChannel}
                    onReorder={handleReorderChannels}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <div className="space-y-4">
            {filteredInsights.map((insight, idx) => (
              <FlatInsightCard 
                key={insight.id} 
                insight={insight} 
                isNew={idx === 0}
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

      <LiveMonitorRail />
    </div>
  );
};

export default TrackInsightPanel;
