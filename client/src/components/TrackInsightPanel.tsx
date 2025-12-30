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
    // Website signals
    { id: 101, type: 'Website', category: 'Pricing Page Update', time: '2 hours ago', content: 'Pricing tiers restructured with new enterprise and startup plans.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}/pricing`, dimension: 'website', isNew: true },
    { id: 102, type: 'Website', category: 'Feature Launch', time: '3 hours ago', content: 'AI-Powered Editing: 3 new AI features added to the design suite.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}/features`, dimension: 'website', isNew: true },
    { id: 103, type: 'Website', category: 'Solutions Page', time: '5 hours ago', content: 'Launched vertical-specific solution pages for Fintech and Healthcare.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: `https://${targetDomain}/solutions`, dimension: 'website' },
    { id: 104, type: 'Website', category: 'Policy Update', time: 'Yesterday', content: 'Minor updates to compliance documentation and cookie consent.', domain: targetDomain, color: 'text-slate-400', bgColor: 'bg-slate-500', value: 'low', sourceUrl: `https://${targetDomain}/privacy`, dimension: 'website' },
    { id: 105, type: 'Website', category: 'Blog Content', time: '2 days ago', content: 'Published a comprehensive guide on ethical AI implementation in design.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: `https://${targetDomain}/blog`, dimension: 'website' },
    { id: 106, type: 'Website', category: 'Careers', time: '3 days ago', content: 'Significant expansion in the engineering and product teams announced with 15 new openings.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: `https://${targetDomain}/careers`, dimension: 'website' },
    // Backlinks signals
    { id: 201, type: 'Backlinks', category: 'New Backlink', time: '6 hours ago', content: 'High-authority tech blog linked to product page from TechReview.io.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://techreview.io/best-design-tools', dimension: 'backlinks', isNew: true },
    { id: 202, type: 'Backlinks', category: 'Lost Backlink', time: 'Yesterday', content: 'Previous link from Forbes Tech "Top SaaS Trends" article was removed or changed.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://forbes.com/saas-trends', dimension: 'backlinks' },
    { id: 203, type: 'Backlinks', category: 'Competitor Comparison', time: '2 days ago', content: 'Linked in a new "Best AI Tools of 2024" comparison list.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://besttools2024.com/ai-tools', dimension: 'backlinks' },
    { id: 204, type: 'Backlinks', category: 'Review Spike', time: '4 days ago', content: 'Received 25+ new 5-star reviews on G2 following the recent update.', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: 'https://g2.com/products/reviews', dimension: 'backlinks' },
    // SEO signals
    { id: 301, type: 'SEO', category: 'Ranking Change', time: '1 hour ago', content: 'Main competitor jumped to #1 for "AI Design Tools" keyword.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}`, dimension: 'seo', isNew: true },
    { id: 302, type: 'SEO', category: 'New Pages', time: '3 hours ago', content: 'Added 12 new documentation pages for specialized API integrations.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: `https://${targetDomain}/docs`, dimension: 'seo' },
    { id: 303, type: 'SEO', category: 'Performance', time: 'Yesterday', content: 'Homepage load time reduced by 40% globally.', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: `https://${targetDomain}`, dimension: 'seo' },
    { id: 304, type: 'SEO', category: 'Featured Snippet', time: '3 days ago', content: 'Successfully captured the featured snippet for "SaaS SEO automation".', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: `https://${targetDomain}/seo`, dimension: 'seo' },
    // Social signals
    { id: 401, type: 'Social', category: 'Viral Content', time: '1 hour ago', content: "A user's review of their new collaborative features is trending on X.", domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://x.com/trending', dimension: 'social', isNew: true },
    { id: 402, type: 'Social', category: 'Influencer Review', time: '5 hours ago', content: 'Popular tech influencer published a comparison video on YouTube.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://youtube.com/watch', dimension: 'social' },
    { id: 403, type: 'Social', category: 'Product Launch', time: '2 days ago', content: "Competitor's new \"Pro+\" mobile app launched on Product Hunt.", domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://producthunt.com/posts', dimension: 'social' },
    { id: 404, type: 'Social', category: 'Campaign', time: '1 week ago', content: 'New aesthetic design showcase campaign targeting Gen Z designers on Instagram.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://instagram.com/campaign', dimension: 'social' },
    // News signals
    { id: 501, type: 'News', category: 'TechCrunch Feature', time: '4 hours ago', content: 'Comprehensive deep-dive article on their recent $50M series B funding.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://techcrunch.com/funding', dimension: 'news', isNew: true },
    { id: 502, type: 'News', category: 'Forbes Listing', time: 'Yesterday', content: 'Named in the "Top 50 AI Startups to Watch" list.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://forbes.com/ai-startups', dimension: 'news' },
    { id: 503, type: 'News', category: 'Wired Analysis', time: '3 days ago', content: 'Wired discusses the implications of their new AI-driven design engine.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://wired.com/ai-design', dimension: 'news' },
    // Ads signals
    { id: 601, type: 'Ads', category: 'LinkedIn Campaign', time: '2 days ago', content: 'Targeting decision makers at mid-market design agencies with "Free Enterprise Trial".', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://linkedin.com/ads', dimension: 'ads' },
    { id: 602, type: 'Ads', category: 'Facebook Retargeting', time: '4 days ago', content: 'Increased spend by 15% on retargeting ads for users who visited the pricing page.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://facebook.com/ads', dimension: 'ads' },
    { id: 603, type: 'Ads', category: 'Google Ads Expansion', time: '1 week ago', content: 'Bidding heavily on high-intent transactional keywords in the UK market.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://google.com/ads', dimension: 'ads' },
    { id: 604, type: 'Ads', category: 'YouTube Video Ads', time: '2 weeks ago', content: 'Started a new video ad series featuring customer success stories.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://youtube.com/ads', dimension: 'ads' },
    // Talent signals
    { id: 701, type: 'Talent', category: 'Engineering', time: '1 day ago', content: 'Posted 5 new senior engineering roles including 2 ML Engineers and VP Engineering.', domain: targetDomain, color: 'text-pink-400', bgColor: 'bg-pink-500', value: 'medium', sourceUrl: `https://${targetDomain}/careers`, dimension: 'talent', isNew: true },
    { id: 702, type: 'Talent', category: 'Sales', time: '3 days ago', content: 'Expanding enterprise sales team with 3 new Account Executive positions in EMEA.', domain: targetDomain, color: 'text-pink-400', bgColor: 'bg-pink-500', value: 'low', sourceUrl: `https://${targetDomain}/careers`, dimension: 'talent' },
  ];

  const websiteSignals = sampleSignals.filter(s => s.dimension === 'website');
  const backlinkSignals = sampleSignals.filter(s => s.dimension === 'backlinks');
  const seoSignals = sampleSignals.filter(s => s.dimension === 'seo');
  const socialSignals = sampleSignals.filter(s => s.dimension === 'social');
  const newsSignals = sampleSignals.filter(s => s.dimension === 'news');
  const adsSignals = sampleSignals.filter(s => s.dimension === 'ads');
  const talentSignals = sampleSignals.filter(s => s.dimension === 'talent');

  const aiInsights: AIInsight[] = [
    {
      id: 'pricing-strategy',
      title: 'Pricing Restructure Detected',
      priority: 'high',
      summary: 'Major pricing page overhaul with new enterprise and startup tiers, accompanied by targeted ad campaigns.',
      keyInfo: 'New pricing tiers launched + Google Ads bidding on high-intent transactional keywords.',
      impact: 'Aggressive market positioning; potential undercutting in startup/SMB segment.',
      action: 'Review your pricing strategy; prepare competitive comparison materials for sales team.',
      sources: ['website', 'ads'],
      relatedSignals: [...websiteSignals.slice(0, 2), ...adsSignals.slice(0, 2)],
      time: '2 hours ago',
      category: 'pricing',
      isNew: true,
    },
    {
      id: 'ai-feature-launch',
      title: 'AI Feature Expansion',
      priority: 'high',
      summary: 'Detected 3 new AI-powered features in their design suite with strong social traction.',
      keyInfo: 'AI-Powered Editing launched + trending review on X + YouTube influencer coverage.',
      impact: 'Feature gap emerging in AI capabilities; social proof building momentum.',
      action: 'Accelerate your AI roadmap; prepare messaging around your AI differentiators.',
      sources: ['website', 'social', 'news'],
      relatedSignals: [websiteSignals[1], ...socialSignals.slice(0, 2), newsSignals[0]],
      time: '3 hours ago',
      category: 'strategy',
      isNew: true,
    },
    {
      id: 'seo-authority',
      title: 'SEO & Authority Surge',
      priority: 'high',
      summary: 'Significant gains in search rankings and backlink authority with high-profile press coverage.',
      keyInfo: 'Jumped to #1 for "AI Design Tools" + TechCrunch feature + Forbes "Top 50" listing.',
      impact: 'Organic visibility advantage; brand authority increasing rapidly.',
      action: 'Counter with content marketing push; pursue similar press coverage opportunities.',
      sources: ['seo', 'backlinks', 'news'],
      relatedSignals: [...seoSignals.slice(0, 2), ...backlinkSignals.slice(0, 2), ...newsSignals.slice(0, 2)],
      time: 'Today',
      category: 'growth',
    },
    {
      id: 'enterprise-expansion',
      title: 'Enterprise Sales Push',
      priority: 'medium',
      summary: 'Coordinated enterprise expansion with vertical-specific pages and targeted LinkedIn campaigns.',
      keyInfo: 'Fintech & Healthcare solution pages + LinkedIn ads targeting mid-market decision makers.',
      impact: 'Competing for enterprise accounts with industry-specific messaging.',
      action: 'Develop your own vertical-specific content; review enterprise sales playbook.',
      sources: ['website', 'ads'],
      relatedSignals: [websiteSignals[2], ...adsSignals.slice(0, 2)],
      time: 'Yesterday',
      category: 'strategy',
    },
    {
      id: 'product-hunt-launch',
      title: 'Mobile App Launch',
      priority: 'medium',
      summary: 'New "Pro+" mobile app launched on Product Hunt with positive early traction.',
      keyInfo: 'Product Hunt launch + YouTube video ads promoting mobile features.',
      impact: 'Mobile-first strategy gaining visibility; potential market share in mobile design tools.',
      action: 'Monitor Product Hunt performance; evaluate your mobile offering competitiveness.',
      sources: ['social', 'ads'],
      relatedSignals: [socialSignals[2], adsSignals[3]],
      time: '2 days ago',
      category: 'competitive',
    },
    {
      id: 'talent-expansion',
      title: 'Engineering Team Growth',
      priority: 'low',
      summary: 'Significant engineering hiring push suggesting major product development ahead.',
      keyInfo: '5 senior engineering roles + 2 ML Engineers + VP Engineering + 15 total openings.',
      impact: 'Building capabilities for future product expansion; likely AI/ML focus.',
      action: 'Monitor for product announcements; consider accelerating your own ML roadmap.',
      sources: ['talent', 'website'],
      relatedSignals: [...talentSignals, websiteSignals[5]],
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
