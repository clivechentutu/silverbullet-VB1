import { useState, useEffect } from 'react';
import { 
  Sparkles, Zap, TrendingUp, ShieldAlert, ChevronDown, ChevronUp, 
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Check, Star, Eye, EyeOff, Settings, Bot,
  AlertTriangle, BrainCircuit, Activity, Clock, Radio, RefreshCw,
  ArrowUpRight, TrendingDown, Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  isNew?: boolean;
  riskTrend?: 'rising' | 'stable' | 'falling';
}

interface ChannelStatus {
  id: string;
  name: string;
  icon: typeof Globe;
  color: string;
  signalCount: number;
  trend: number;
  lastUpdate: string;
  isActive: boolean;
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

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; borderColor: string; bgColor: string; label: string }> = {
  strategy: { icon: TrendingUp, color: 'text-emerald-400', borderColor: 'border-emerald-500/50', bgColor: 'bg-emerald-500/10', label: 'Strategy Shift' },
  pricing: { icon: ShieldAlert, color: 'text-red-400', borderColor: 'border-red-500/50', bgColor: 'bg-red-500/10', label: 'Pricing Alert' },
  growth: { icon: Zap, color: 'text-amber-400', borderColor: 'border-amber-500/50', bgColor: 'bg-amber-500/10', label: 'Growth Signal' },
  competitive: { icon: AlertTriangle, color: 'text-blue-400', borderColor: 'border-blue-500/50', bgColor: 'bg-blue-500/10', label: 'Competitive Move' },
};

interface InsightCardProps {
  insight: AIInsight;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const InsightCard = ({ insight, isExpanded, onToggleExpand }: InsightCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  
  const catConfig = categoryConfig[insight.category];
  const CategoryIcon = catConfig.icon;
  
  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const riskTrendIcon = insight.riskTrend === 'rising' 
    ? <Flame size={10} className="text-red-400" />
    : insight.riskTrend === 'falling' 
    ? <TrendingDown size={10} className="text-emerald-400" />
    : null;

  return (
    <div className={`rounded-xl border ${catConfig.borderColor} ${catConfig.bgColor} overflow-hidden transition-all duration-300`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${catConfig.bgColor} border ${catConfig.borderColor} flex items-center justify-center shrink-0`}>
              <CategoryIcon size={14} className={catConfig.color} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white truncate">{insight.title}</h4>
                {insight.isNew && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-brand-500 text-white rounded animate-pulse">
                    NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-slate-500">{insight.time}</span>
                {riskTrendIcon && (
                  <span className="flex items-center gap-0.5 text-[9px]">
                    {riskTrendIcon}
                    <span className={insight.riskTrend === 'rising' ? 'text-red-400' : 'text-emerald-400'}>
                      {insight.riskTrend === 'rising' ? 'Rising' : 'Falling'}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border ${priorityStyles[insight.priority]}`}>
              {insight.priority === 'high' ? 'HIGH' : insight.priority === 'medium' ? 'MED' : 'LOW'}
            </span>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="p-1 rounded hover:bg-slate-800/50 transition-colors"
              data-testid={`button-save-insight-${insight.id}`}
            >
              <Star size={12} className={isSaved ? 'fill-amber-400 text-amber-400' : 'text-slate-500'} />
            </button>
          </div>
        </div>
        
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2 line-clamp-2">{insight.summary}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {insight.sources.slice(0, 3).map((source, idx) => {
            const dimConfig = dimensionConfig[source];
            if (!dimConfig) return null;
            const DimIcon = dimConfig.icon;
            return (
              <span key={idx} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50 flex items-center gap-0.5">
                <DimIcon size={8} className={dimConfig.color} /> {dimConfig.label}
              </span>
            );
          })}
        </div>

        {insight.relatedSignals.length > 0 && (
          <div className="border-t border-slate-800/50 pt-2 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] text-slate-500 font-medium">Evidence Preview</span>
              <button 
                onClick={onToggleExpand}
                className="text-[9px] text-brand-400 hover:text-brand-300 flex items-center gap-0.5"
                data-testid={`button-expand-evidence-${insight.id}`}
              >
                {isExpanded ? 'Collapse' : `View all ${insight.relatedSignals.length}`}
                {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            </div>
            
            <div className="space-y-1">
              {(isExpanded ? insight.relatedSignals : insight.relatedSignals.slice(0, 2)).map(signal => {
                const dimConfig = signal.dimension ? dimensionConfig[signal.dimension] : null;
                const DimIcon = dimConfig?.icon || Globe;
                return (
                  <div 
                    key={signal.id}
                    className="flex items-center gap-2 p-1.5 rounded bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer group"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${dimConfig?.bgColor || 'bg-slate-700'}/20`}>
                      <DimIcon size={10} className={dimConfig?.color || 'text-slate-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 truncate">{signal.content}</p>
                    </div>
                    <span className="text-[8px] text-slate-600 shrink-0">{signal.time}</span>
                    <ExternalLink size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="border-t border-slate-800/50 pt-2 mt-2 space-y-1.5">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className={`${catConfig.color} font-bold mr-1`}>Key Info:</span> 
              {insight.keyInfo}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className="text-brand-400 font-bold mr-1">Impact:</span> 
              {insight.impact}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-bold mr-1">Action:</span> 
              {insight.action}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChannelThermostatProps {
  channels: ChannelStatus[];
}

const ChannelThermostat = ({ channels }: ChannelThermostatProps) => {
  const totalSignals = channels.reduce((sum, c) => sum + c.signalCount, 0);
  const activeChannels = channels.filter(c => c.isActive).length;
  
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity size={16} className="text-brand-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-bold text-white">Signal Monitor</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Radio size={10} className="text-emerald-400 animate-pulse" />
          <span>{activeChannels}/{channels.length} Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1.5">
        {channels.map(channel => {
          const ChannelIcon = channel.icon;
          const trendColor = channel.trend > 0 ? 'text-emerald-400' : channel.trend < 0 ? 'text-red-400' : 'text-slate-500';
          
          return (
            <div 
              key={channel.id}
              className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${
                channel.isActive 
                  ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600' 
                  : 'bg-slate-950/50 border-slate-800/50 opacity-50'
              }`}
              title={`${channel.name}: ${channel.signalCount} signals`}
            >
              <ChannelIcon size={14} className={channel.isActive ? channel.color : 'text-slate-600'} />
              <span className="text-[10px] font-bold text-slate-300 mt-1">{channel.signalCount}</span>
              {channel.trend !== 0 && channel.isActive && (
                <span className={`text-[8px] ${trendColor} flex items-center`}>
                  {channel.trend > 0 ? <ArrowUpRight size={8} /> : <TrendingDown size={8} />}
                  {Math.abs(channel.trend)}
                </span>
              )}
              {channel.isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/50">
        <span className="text-[10px] text-slate-500">{totalSignals} total signals tracked</span>
        <div className="flex items-center gap-1 text-[9px] text-slate-600">
          <Clock size={10} />
          <span>Updates every 15min</span>
        </div>
      </div>
    </div>
  );
};

interface ActivityTickerProps {
  signals: Signal[];
}

const ActivityTicker = ({ signals }: ActivityTickerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(signals.length, 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [signals.length]);

  const recentSignals = signals.slice(0, 5);
  
  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-2">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw size={10} className="text-brand-400 animate-spin" style={{ animationDuration: '3s' }} />
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Live Activity</span>
      </div>
      
      <div className="space-y-1">
        {recentSignals.map((signal, idx) => {
          const dimConfig = signal.dimension ? dimensionConfig[signal.dimension] : null;
          const DimIcon = dimConfig?.icon || Globe;
          const isLatest = idx === 0;
          
          return (
            <div 
              key={signal.id}
              className={`flex items-center gap-2 p-1.5 rounded transition-all ${
                isLatest ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-slate-900/50 opacity-70'
              }`}
              style={{ opacity: 1 - (idx * 0.15) }}
            >
              <DimIcon size={10} className={dimConfig?.color || 'text-slate-400'} />
              <p className="text-[9px] text-slate-400 truncate flex-1">{signal.content}</p>
              <span className="text-[8px] text-slate-600 shrink-0">{signal.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TrackInsightPanelProps {
  targetName: string;
  targetDomain: string;
}

export const TrackInsightPanel = ({ targetName, targetDomain }: TrackInsightPanelProps) => {
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setLastRefresh(new Date());
      }, 2000);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = () => {
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const channelStatuses: ChannelStatus[] = [
    { id: 'website', name: 'Website', icon: Globe, color: 'text-cyan-400', signalCount: 12, trend: 3, lastUpdate: '2m ago', isActive: true },
    { id: 'backlinks', name: 'Backlinks', icon: LinkIcon, color: 'text-emerald-400', signalCount: 8, trend: 2, lastUpdate: '5m ago', isActive: true },
    { id: 'seo', name: 'SEO', icon: Search, color: 'text-blue-400', signalCount: 15, trend: -1, lastUpdate: '3m ago', isActive: true },
    { id: 'social', name: 'Social', icon: Users, color: 'text-purple-400', signalCount: 23, trend: 5, lastUpdate: '1m ago', isActive: true },
    { id: 'news', name: 'News', icon: FileText, color: 'text-rose-400', signalCount: 4, trend: 0, lastUpdate: '10m ago', isActive: true },
    { id: 'ads', name: 'Ads', icon: Megaphone, color: 'text-amber-400', signalCount: 6, trend: 1, lastUpdate: '8m ago', isActive: true },
    { id: 'talent', name: 'Talent', icon: Briefcase, color: 'text-pink-400', signalCount: 3, trend: 0, lastUpdate: '15m ago', isActive: true },
  ];

  const sampleSignals: Signal[] = [
    { id: 1, type: 'change', category: 'product', time: '2m ago', content: 'New Enterprise SSO documentation page added', domain: targetDomain, color: 'text-cyan-400', bgColor: 'bg-cyan-500', value: 'high', sourceUrl: '#', dimension: 'website' },
    { id: 2, type: 'new', category: 'marketing', time: '15m ago', content: 'Launched "Scale with confidence" campaign on LinkedIn', domain: targetDomain, color: 'text-purple-400', bgColor: 'bg-purple-500', value: 'medium', sourceUrl: '#', dimension: 'social' },
    { id: 3, type: 'alert', category: 'pricing', time: '1h ago', content: 'Pricing page updated - new $49/mo flat rate tier', domain: targetDomain, color: 'text-amber-400', bgColor: 'bg-amber-500', value: 'high', sourceUrl: '#', dimension: 'website' },
    { id: 4, type: 'new', category: 'seo', time: '2h ago', content: 'Ranking improved for "enterprise collaboration tool"', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'medium', sourceUrl: '#', dimension: 'seo' },
    { id: 5, type: 'mention', category: 'news', time: '3h ago', content: 'Featured in TechCrunch article about AI collaboration', domain: targetDomain, color: 'text-rose-400', bgColor: 'bg-rose-500', value: 'high', sourceUrl: '#', dimension: 'news' },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      title: 'Enterprise Market Pivot Detected',
      priority: 'high',
      summary: 'Multiple signals indicate strategic shift toward Enterprise Infrastructure segment with new SSO docs and security compliance pages.',
      keyInfo: '2 new Enterprise landing pages + 1 SSO technical doc update detected in last 24h.',
      impact: 'High risk to mid-market accounts; increased competitive pressure on security compliance.',
      action: 'Brief sales team on new SOC2 comparison; update Enterprise security battle card.',
      sources: ['website', 'seo', 'social'],
      relatedSignals: sampleSignals.filter(s => s.dimension === 'website' || s.dimension === 'seo'),
      time: 'Today',
      category: 'strategy',
      isNew: true,
      riskTrend: 'rising',
    },
    {
      id: '2',
      title: 'Aggressive Pricing Strategy',
      priority: 'high',
      summary: 'New $49/mo flat rate tier launched, directly undercutting per-seat pricing models in SMB segment.',
      keyInfo: 'Pricing page updated with new tier; promotional banner detected on Google Ads.',
      impact: 'Aggressive undercutting of your per-seat model in the 5-15 user segment.',
      action: 'Launch "Total Cost of Ownership" calculator for prospects comparing flat vs per-seat.',
      sources: ['website', 'ads'],
      relatedSignals: sampleSignals.filter(s => s.dimension === 'website' || s.dimension === 'ads'),
      time: 'Today',
      category: 'pricing',
      isNew: true,
      riskTrend: 'rising',
    },
    {
      id: '3',
      title: 'Social Momentum Surge',
      priority: 'medium',
      summary: 'Significant spike in LinkedIn engagement and Twitter mentions following new campaign launch.',
      keyInfo: '45% increase in social mentions; 3 high-DA backlinks from tech publications.',
      impact: 'Domain authority likely to rise; higher SEO visibility for core keywords expected.',
      action: 'Boost budget on "alternatives to [competitor]" search ads; initiate media outreach.',
      sources: ['social', 'backlinks', 'news'],
      relatedSignals: sampleSignals.filter(s => s.dimension === 'social' || s.dimension === 'news'),
      time: 'Yesterday',
      category: 'growth',
      riskTrend: 'stable',
    },
    {
      id: '4',
      title: 'Talent Acquisition Signal',
      priority: 'low',
      summary: 'New job postings for ML engineers and enterprise sales roles indicate expansion plans.',
      keyInfo: '5 new engineering roles; 3 enterprise sales positions posted on LinkedIn.',
      impact: 'Signals investment in AI features and enterprise sales capacity.',
      action: 'Monitor for product announcements in next quarter; prepare competitive positioning.',
      sources: ['talent', 'social'],
      relatedSignals: sampleSignals.filter(s => s.dimension === 'social'),
      time: '2 days ago',
      category: 'competitive',
      riskTrend: 'stable',
    },
  ];

  const highPriorityInsights = aiInsights.filter(i => i.priority === 'high');
  const otherInsights = aiInsights.filter(i => i.priority !== 'high');

  return (
    <div className="flex flex-col h-full bg-slate-950/30">
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BrainCircuit size={20} className="text-brand-400" />
            {isAnalyzing && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Intelligence for {targetName}
              {isAnalyzing && (
                <span className="text-[10px] font-normal text-brand-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  Analyzing
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500">Continuous monitoring across 7 channels</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-800">
            <Clock size={10} />
            <span>Updated {getTimeAgo()}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-4">
          <ChannelThermostat channels={channelStatuses} />

          {highPriorityInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame size={14} className="text-red-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Priority Alerts</span>
                <span className="text-[10px] text-slate-500">({highPriorityInsights.length})</span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {highPriorityInsights.map(insight => (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight} 
                    isExpanded={expandedInsightId === insight.id}
                    onToggleExpand={() => setExpandedInsightId(expandedInsightId === insight.id ? null : insight.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {otherInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-brand-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Other Insights</span>
                <span className="text-[10px] text-slate-500">({otherInsights.length})</span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {otherInsights.map(insight => (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight} 
                    isExpanded={expandedInsightId === insight.id}
                    onToggleExpand={() => setExpandedInsightId(expandedInsightId === insight.id ? null : insight.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <ActivityTicker signals={sampleSignals} />
        </div>
      </div>
    </div>
  );
};

export default TrackInsightPanel;
