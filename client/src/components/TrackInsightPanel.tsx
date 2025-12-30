import { useState, useEffect } from 'react';
import { 
  Sparkles, Zap, TrendingUp, ShieldAlert, ChevronDown, ChevronUp, 
  ExternalLink, Globe, LinkIcon, Search, Users, FileText, Megaphone,
  Briefcase, Check, Star, Eye, EyeOff, Settings, Bot,
  AlertTriangle, BrainCircuit, Radio, Clock, RefreshCw, Activity,
  CheckCircle2, ArrowUpRight, Loader2
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
  isNew?: boolean;
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

interface FlatInsightCardProps {
  insight: AIInsight;
  onViewEvidence: (insight: AIInsight) => void;
}

const FlatInsightCard = ({ insight, onViewEvidence }: FlatInsightCardProps) => {
  const catConfig = categoryConfig[insight.category];
  const CategoryIcon = catConfig.icon;
  
  const priorityStyles = {
    high: 'border-l-red-500 bg-red-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    low: 'border-l-blue-500 bg-blue-500/5',
  };

  return (
    <div className={`rounded-lg border border-slate-800 border-l-4 ${priorityStyles[insight.priority]} p-4 transition-all hover:border-slate-700`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <CategoryIcon size={16} className={catConfig.color} />
          <h4 className="text-sm font-bold text-white">{insight.title}</h4>
          {insight.isNew && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-brand-500 text-white rounded animate-pulse">NEW</span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 whitespace-nowrap">{insight.time}</span>
      </div>
      
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{insight.summary}</p>
      
      <div className="space-y-2 text-[11px]">
        <div className="flex gap-2">
          <span className="text-emerald-400 font-bold shrink-0">Key:</span>
          <span className="text-slate-300">{insight.keyInfo}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-brand-400 font-bold shrink-0">Impact:</span>
          <span className="text-slate-300">{insight.impact}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-amber-400 font-bold shrink-0">Action:</span>
          <span className="text-slate-300">{insight.action}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
        <div className="flex flex-wrap gap-1">
          {insight.sources.slice(0, 3).map((source, idx) => {
            const dimConfig = dimensionConfig[source];
            if (!dimConfig) return null;
            const DimIcon = dimConfig.icon;
            return (
              <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800/60 text-slate-500 flex items-center gap-1">
                <DimIcon size={9} className={dimConfig.color} /> {dimConfig.label}
              </span>
            );
          })}
        </div>
        <button 
          onClick={() => onViewEvidence(insight)}
          className="text-[10px] text-slate-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
          data-testid={`view-evidence-${insight.id}`}
        >
          View {insight.relatedSignals.length} signals <ArrowUpRight size={10} />
        </button>
      </div>
    </div>
  );
};

const SystemStatusBar = ({ lastScan, nextScan, isScanning, signalsToday }: { 
  lastScan: string; 
  nextScan: string; 
  isScanning: boolean;
  signalsToday: number;
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isScanning ? (
            <Loader2 size={12} className="text-brand-400 animate-spin" />
          ) : (
            <Radio size={12} className="text-emerald-400 animate-pulse" />
          )}
          <span className="text-[10px] text-slate-400">
            {isScanning ? 'Scanning...' : 'Monitoring active'}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Clock size={10} />
          <span>Last: {lastScan}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <RefreshCw size={10} />
          <span>Next: {nextScan}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Activity size={12} className="text-brand-400" />
        <span className="text-[10px] text-slate-400">
          <span className="text-brand-400 font-bold">{signalsToday}</span> signals today
        </span>
      </div>
    </div>
  );
};

const ActivityFeed = ({ activities }: { activities: { time: string; message: string; type: 'scan' | 'signal' | 'insight' }[] }) => {
  return (
    <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={12} className="text-slate-500" />
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recent Activity</span>
      </div>
      <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
        {activities.slice(0, 5).map((activity, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-600 shrink-0">{activity.time}</span>
            <span className={`w-1 h-1 rounded-full ${
              activity.type === 'insight' ? 'bg-brand-400' : 
              activity.type === 'signal' ? 'bg-emerald-400' : 'bg-slate-600'
            }`} />
            <span className="text-slate-400 truncate">{activity.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TrackInsightPanelProps {
  targetName: string;
  targetDomain: string;
}

export const TrackInsightPanel = ({ targetName, targetDomain }: TrackInsightPanelProps) => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isSignalsPanelOpen, setIsSignalsPanelOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setIsScanning(true);
      setScanProgress(0);
      
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => setIsScanning(false), 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      setTimeout(() => {
        clearInterval(progressInterval);
        setIsScanning(false);
      }, 3000);
    }, 60000);
    
    return () => clearInterval(scanInterval);
  }, []);

  const sampleSignals: Signal[] = [
    { id: 1, type: 'Website', category: 'Content', time: '2h ago', content: 'New Enterprise landing page detected with SOC2 compliance messaging', domain: targetDomain, color: 'text-cyan-400', bgColor: 'bg-cyan-500', value: 'high', sourceUrl: '#', dimension: 'website', isNew: true },
    { id: 2, type: 'SEO', category: 'Keywords', time: '4h ago', content: 'Ranking improved for "enterprise collaboration" - now position 3', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'medium', sourceUrl: '#', dimension: 'seo' },
    { id: 3, type: 'Social', category: 'Mentions', time: '6h ago', content: 'CEO announced partnership with Microsoft on LinkedIn - 2.4K engagements', domain: targetDomain, color: 'text-purple-400', bgColor: 'bg-purple-500', value: 'high', sourceUrl: '#', dimension: 'social', isNew: true },
    { id: 4, type: 'Backlinks', category: 'Authority', time: '1d ago', content: 'Featured in TechCrunch article about remote work tools', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: '#', dimension: 'backlinks' },
    { id: 5, type: 'Ads', category: 'Campaign', time: '1d ago', content: 'New Google Ads campaign targeting "Slack alternative" keywords', domain: targetDomain, color: 'text-amber-400', bgColor: 'bg-amber-500', value: 'medium', sourceUrl: '#', dimension: 'ads' },
    { id: 6, type: 'News', category: 'Press', time: '2d ago', content: 'Series C funding announcement - $50M raised', domain: targetDomain, color: 'text-rose-400', bgColor: 'bg-rose-500', value: 'high', sourceUrl: '#', dimension: 'news' },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: 'strategy-shift',
      title: 'Enterprise Market Push',
      priority: 'high',
      summary: 'Detected coordinated move toward enterprise segment with 4 signals in past 24 hours.',
      keyInfo: '2 new Enterprise landing pages + SSO documentation update + SOC2 badge added.',
      impact: 'High risk to mid-market accounts; increased competitive pressure on security compliance.',
      action: 'Brief sales team on new SOC2 comparison; update Enterprise security battle card.',
      sources: ['website', 'seo', 'social'],
      relatedSignals: sampleSignals.slice(0, 3),
      time: 'Today',
      category: 'strategy',
      isNew: true,
    },
    {
      id: 'pricing-change',
      title: 'Pricing Model Shift',
      priority: 'high',
      summary: 'New $49/mo flat rate pricing detected, replacing per-seat model for SMB tier.',
      keyInfo: 'Pricing page updated with "Flat Rate" plan; promotional banner on homepage.',
      impact: 'Aggressive undercutting of your per-seat model in 5-15 user segment.',
      action: 'Launch "Total Cost of Ownership" calculator for flat vs per-seat comparison.',
      sources: ['website', 'ads'],
      relatedSignals: sampleSignals.slice(1, 4),
      time: 'Yesterday',
      category: 'pricing',
    },
    {
      id: 'growth-momentum',
      title: 'Authority Spike',
      priority: 'medium',
      summary: 'Significant increase in external authority signals and social mentions.',
      keyInfo: '3 high-DA backlinks from tech news + 45% increase in Twitter mentions.',
      impact: 'Domain authority likely to rise by +2; higher SEO visibility for core keywords.',
      action: 'Boost budget on "alternatives to [competitor]" ads; outreach to shared media contacts.',
      sources: ['backlinks', 'social', 'news'],
      relatedSignals: sampleSignals.slice(3, 6),
      time: '2 days ago',
      category: 'growth',
    },
    {
      id: 'talent-move',
      title: 'Hiring Push Detected',
      priority: 'low',
      summary: 'Multiple senior engineering roles posted, suggesting product expansion.',
      keyInfo: '5 new job posts: 2 Senior Backend, 2 ML Engineers, 1 VP Engineering.',
      impact: 'Likely building new product capabilities in AI/ML space within 6-12 months.',
      action: 'Monitor for product announcements; consider accelerating own ML roadmap.',
      sources: ['talent', 'social'],
      relatedSignals: sampleSignals.slice(2, 5),
      time: '3 days ago',
      category: 'competitive',
    },
  ];

  const recentActivities = [
    { time: '2m ago', message: 'Completed scan of website, SEO, and social channels', type: 'scan' as const },
    { time: '15m ago', message: 'New insight generated: Enterprise Market Push', type: 'insight' as const },
    { time: '1h ago', message: 'Detected 2 new signals from social monitoring', type: 'signal' as const },
    { time: '3h ago', message: 'Completed full domain analysis', type: 'scan' as const },
    { time: '6h ago', message: 'Price change detected on competitor website', type: 'signal' as const },
  ];

  const handleViewEvidence = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setIsSignalsPanelOpen(true);
  };

  const highPriorityInsights = aiInsights.filter(i => i.priority === 'high');
  const otherInsights = aiInsights.filter(i => i.priority !== 'high');
  const newSignalsCount = sampleSignals.filter(s => s.isNew).length;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <SystemStatusBar 
        lastScan="2 min ago" 
        nextScan="in 28 min" 
        isScanning={isScanning}
        signalsToday={sampleSignals.length}
      />
      
      {isScanning && (
        <div className="h-0.5 bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-200"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
      )}
      
      <div className={`${isSignalsPanelOpen ? 'flex-[3]' : 'flex-1'} overflow-y-auto custom-scrollbar min-h-0`}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                  <BrainCircuit size={20} className="text-brand-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {targetName} Intelligence
                </h3>
                <p className="text-xs text-slate-500">
                  {newSignalsCount > 0 && (
                    <span className="text-brand-400">{newSignalsCount} new signals found</span>
                  )}
                  {newSignalsCount === 0 && 'All caught up'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-slate-500 hover:text-white"
              onClick={() => {}}
              data-testid="button-settings"
            >
              <Settings size={14} className="mr-1" /> Preferences
            </Button>
          </div>

          {highPriorityInsights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Requires Attention</span>
              </div>
              <div className="space-y-3">
                {highPriorityInsights.map(insight => (
                  <FlatInsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onViewEvidence={handleViewEvidence}
                  />
                ))}
              </div>
            </div>
          )}

          {otherInsights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keep Watching</span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {otherInsights.map(insight => (
                  <FlatInsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onViewEvidence={handleViewEvidence}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ActivityFeed activities={recentActivities} />

      <Collapsible open={isSignalsPanelOpen} onOpenChange={setIsSignalsPanelOpen} className={isSignalsPanelOpen ? 'flex-[2] flex flex-col min-h-0' : ''}>
        <CollapsibleTrigger asChild>
          <div className="border-t border-slate-800 px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-slate-500" />
              <span className="text-xs font-medium text-slate-300">
                {selectedInsight ? `Evidence: ${selectedInsight.title}` : 'All Signal Evidence'}
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">
                {selectedInsight ? selectedInsight.relatedSignals.length : sampleSignals.length}
              </span>
            </div>
            <ChevronUp size={14} className={`text-slate-500 transition-transform ${isSignalsPanelOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="flex-1 min-h-0 overflow-hidden">
          <div className="p-4 bg-slate-950/80 h-full overflow-auto custom-scrollbar">
            <div className="space-y-2">
              {(selectedInsight?.relatedSignals || sampleSignals).map(signal => {
                const dimConfig = signal.dimension ? dimensionConfig[signal.dimension] : null;
                const DimIcon = dimConfig?.icon || Globe;
                return (
                  <div 
                    key={signal.id}
                    onClick={() => setSelectedSignal(signal)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedSignal?.id === signal.id 
                        ? 'border-brand-500/50 bg-brand-500/5' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <DimIcon size={12} className={dimConfig?.color || 'text-slate-400'} />
                        <span className="text-[10px] font-medium text-slate-500">{signal.type}</span>
                        {signal.isNew && (
                          <span className="px-1 py-0.5 text-[8px] font-bold bg-brand-500/20 text-brand-400 rounded">NEW</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600">{signal.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{signal.content}</p>
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

export default TrackInsightPanel;
