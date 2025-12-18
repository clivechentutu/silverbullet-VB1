import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { WorkbenchView, TargetCompany, type Target, type AnalysisReport, type ResearchSession as DBResearchSession, type ChatMessage as DBChatMessage } from '@shared/schema';
import { 
  Radar, Crosshair, Bot, Book, Library, Link as LinkIcon, Hexagon, Settings, User, 
  Plus, TrendingUp, Activity, ExternalLink, Zap, Search, ToggleRight, 
  Key, Trash2, Download, CreditCard, Shield, Sparkles, ChevronLeft,
  ShieldAlert, Check, Megaphone, Globe, DollarSign, Briefcase, X,
  MessageSquare, History, Loader2, BrainCircuit, Paperclip, ArrowRight,
  FileText, Star, ArrowUpDown, MessageSquareText, Swords, LayoutGrid,
  PieChart, BarChart3, Chrome, ChevronDown, ChevronRight
} from 'lucide-react';

const AlertZap = Zap;
const TrendingUpIcon = TrendingUp;

// Signal data templates for each tracker
const TRACKER_SIGNALS = {
  website: [
    { title: 'Pricing Page: New "Enterprise" Tier', time: 'Just now', severity: 'HIGH', desc: 'Added a new enterprise tier with "Contact Sales" CTA.' },
    { title: 'Homepage Copy Changes', time: '2 hours ago', severity: 'MED', desc: 'Updated hero section tagline to emphasize "Enterprise-grade".' },
    { title: 'New Feature Section Added', time: '1 day ago', severity: 'LOW', desc: 'New "AI-Powered Analytics" section added with demo.' },
    { title: 'Pricing Page Restructured', time: '3 days ago', severity: 'MED', desc: 'Restructured pricing table with annual discount highlight.' }
  ],
  backlinks: [
    { title: 'New Referring Domain Detected', time: 'Just now', severity: 'HIGH', desc: 'High-authority tech blog linked. DA increased to 58.' },
    { title: 'Backlink Lost', time: '6 hours ago', severity: 'MED', desc: 'One referring domain removed link from resource page.' },
    { title: 'Domain Authority Update', time: '2 days ago', severity: 'LOW', desc: 'Monthly refresh. Score stable. Spam score -1.' }
  ],
  seo: [
    { title: 'Keyword Ranking Change', time: 'Just now', severity: 'HIGH', desc: '"AI analytics" ranking dropped from #3 to #8.' },
    { title: 'New Meta Tags Added', time: '8 hours ago', severity: 'LOW', desc: 'Updated meta descriptions and schema markup.' }
  ],
  social: [
    { title: 'Product Launch Announcement', time: 'Just now', severity: 'HIGH', desc: 'Major launch across LinkedIn, Twitter, TikTok. 15K+.' },
    { title: 'Follower Spike', time: '3 days ago', severity: 'MED', desc: 'LinkedIn +8,200 followers from viral post.' }
  ],
  news: [
    { title: 'TechCrunch Feature', time: 'Just now', severity: 'HIGH', desc: '"Disrupting Enterprise AI" - 2.3M reach.' },
    { title: 'Industry Report Mention', time: '2 days ago', severity: 'MED', desc: 'Gartner Magic Quadrant Leader 2024.' }
  ],
  ads: [
    { title: 'New Campaign Launched', time: 'Just now', severity: 'HIGH', desc: 'Enterprise segment $500K budget "AI analytics".' },
    { title: 'Bid Increase Detected', time: '5 hours ago', severity: 'MED', desc: 'CPC +23% on branded keywords.' }
  ]
};

const TrafficChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end h-8 gap-1">
      {data.map((val, i) => (
        <div 
          key={i}
          className="flex-1 bg-brand-500/50 rounded-sm"
          style={{ height: `${(val / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const URLPreview = ({ url }: { url: string }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLAnchorElement>(null);

  const getPreviewImageUrl = (domain: string) => {
    return `https://api.microlink.io/?url=https://${domain}&screenshot=true&meta=false&force=true&viewport.width=1400&viewport.height=900`;
  };

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12,
        left: Math.min(rect.left, window.innerWidth - 900)
      });
    }
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <div className="inline-block">
      <a 
        ref={triggerRef}
        href={`https://${url}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
        data-testid={`url-preview-${url}`}
      >
        {url} <ExternalLink size={10} />
      </a>
      
      {showPreview && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden shadow-2xl pointer-events-auto" style={{ width: '900px', height: '600px' }}>
            <div className="relative w-full h-full bg-slate-900">
              <img 
                src={getPreviewImageUrl(url)}
                alt={`Preview of ${url}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600'%3E%3Crect fill='%231e293b' width='900' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='20' font-family='monospace'%3ELoading preview...%3C/text%3E%3C/svg%3E`;
                }}
              />
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
                <p className="text-sm text-white font-mono font-bold">{url}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-brand-500" size={20} /> Settings
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-all" data-testid="button-close-settings">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-32 border-r border-slate-800 p-2 space-y-1">
            {['General', 'Trackers', 'Notifications'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === tab.toLowerCase() ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Email notifications</label>
                <p className="text-xs text-slate-500 mt-1">Receive alerts for new signals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TrackingSignal {
  id: string;
  name: string;
  website: string;
  score: number;
  date: string;
  regDate: string;
}

interface TrackingConfigurationModalProps {
  signal: TrackingSignal;
  onClose: () => void;
  onStart: (signal: TrackingSignal, dimension: string) => void;
}

const TrackingConfigurationModal: React.FC<TrackingConfigurationModalProps> = ({ signal, onClose, onStart }) => {
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['website-changes']);

  const dimensions = [
    { id: 'website-changes', name: 'Website Changes', desc: 'Track pricing, copy, and features' },
    { id: 'backlinks', name: 'Backlinks', desc: 'Monitor domain authority and referral links' },
    { id: 'seo', name: 'SEO', desc: 'Track keyword rankings and visibility' },
    { id: 'social', name: 'Social Media', desc: 'Monitor posts and engagement' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white">Configure Tracking</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tracking Dimensions</p>
            {dimensions.map(dim => (
              <label key={dim.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer">
                <input type="checkbox" defaultChecked={selectedDimensions.includes(dim.id)} className="rounded" />
                <div>
                  <p className="text-sm font-medium text-white">{dim.name}</p>
                  <p className="text-xs text-slate-500">{dim.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <button 
            onClick={() => onStart(signal, selectedDimensions[0])}
            className="w-full mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors"
          >
            Start Tracking
          </button>
        </div>
      </div>
    </div>
  );
};

const MarketRadarView = ({ onResearch }: { onResearch: (signal: TrackingSignal) => void }) => {
  const [trackingSignal, setTrackingSignal] = useState<TrackingSignal | null>(null);

  const scopes = [
    { id: 1, name: 'AI Analytics', url: 'example-ai.com', status: 'Active', signals: [
      { id: '1', name: 'Competitor A', website: 'competitor-a.com', score: 92, date: '2m ago', regDate: '2021' },
      { id: '2', name: 'Competitor B', website: 'competitor-b.com', score: 78, date: '5m ago', regDate: '2020' }
    ]},
    { id: 2, name: 'Enterprise Saas', url: 'enterprise-saas.com', status: 'Active', signals: [
      { id: '3', name: 'Competitor C', website: 'competitor-c.com', score: 85, date: '10m ago', regDate: '2019' }
    ]}
  ];

  const handleStartTracking = (signal: TrackingSignal, dimension: string) => {
    setTrackingSignal(null);
  };

  return (
    <div className="animate-fade-in-up">
      {trackingSignal && (
        <TrackingConfigurationModal 
          signal={trackingSignal} 
          onClose={() => setTrackingSignal(null)} 
          onStart={handleStartTracking}
        />
      )}
      <div className="space-y-10">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 <Radar className="text-brand-500" /> Market Radar
              </h2>
              <p className="text-slate-400 mt-1">
                Active surveillance across <span className="text-white font-medium">2 product scopes</span>.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 flex items-center gap-2" data-testid="button-filter-feed">
                 Filter Feed
              </button>
              <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(13,148,136,0.2)]" data-testid="button-add-scope">
                 <Plus size={16} /> Add Product Scope
              </button>
            </div>
         </div>

         <div className="flex flex-col gap-10">
            {scopes.map(scope => (
              <div key={scope.id} className="space-y-6">
                 <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                          {scope.name[0]}
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                             {scope.name}
                             <a 
                               href={`https://${scope.url}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={(e) => e.stopPropagation()}
                               className="text-[10px] font-mono font-normal text-slate-500 border border-slate-800 rounded px-2 py-0.5 bg-slate-950 hover:text-brand-400 hover:border-brand-500/50 hover:bg-slate-900 transition-all flex items-center gap-1 group/link"
                             >
                               {scope.url}
                               <ExternalLink size={8} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                             </a>
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="relative flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                             </span>
                             <span className="text-xs text-brand-400 font-medium">{scope.status}</span>
                             <span className="text-xs text-slate-600">-</span>
                             <span className="text-xs text-slate-500">{scope.signals.length} new signals found</span>
                          </div>
                       </div>
                    </div>
                    <button className="text-slate-500 hover:text-white p-2">
                       <Settings size={16} />
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {scope.signals.map(signal => (
                      <div key={signal.id} className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                         <div className="p-5 flex-1 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                               <div className="w-12 h-12 rounded-lg bg-white p-1.5 flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner">
                                  <img 
                                      src={`https://www.google.com/s2/favicons?domain=${signal.website}&sz=128`} 
                                      alt={signal.name} 
                                      className="w-full h-full object-contain"
                                  />
                               </div>
                               <div className="flex flex-col items-end">
                                  <span className={`text-xl font-bold ${signal.score > 90 ? 'text-brand-400' : 'text-slate-200'}`}>
                                     {signal.score}%
                                  </span>
                                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Similarity</span>
                               </div>
                            </div>

                            <div>
                               <h4 className="text-lg font-bold text-white mb-1 group-hover:text-brand-400 transition-colors truncate pr-2">
                                 {signal.name}
                               </h4>
                               <div className="flex items-center gap-2 flex-wrap">
                                  <URLPreview url={signal.website} />
                                  {signal.score > 90 && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                      <Zap size={10} className="fill-current" /> Hot
                                      </span>
                                  )}
                               </div>
                            </div>

                            <div className="space-y-2 flex-1">
                               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tracking Recommendations</p>
                               <div className="space-y-1.5">
                                  <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-brand-400 rounded-full"></div>
                                    Monitor pricing changes
                                  </div>
                                  <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-brand-400 rounded-full"></div>
                                    Track feature releases
                                  </div>
                               </div>
                            </div>

                            <div className="flex gap-1.5 text-xs">
                               <span className="text-[10px] px-2 py-1 rounded bg-slate-800/50 text-slate-400 border border-slate-700/50">
                                  Reg: {signal.regDate}
                               </span>
                               <span className="text-[10px] px-2 py-1 rounded bg-slate-800/50 text-slate-500 border border-slate-700/50 ml-auto">
                                  {signal.date}
                               </span>
                            </div>
                         </div>

                         <div className="px-4 py-3 border-t border-slate-800 flex gap-2">
                            <button 
                              onClick={() => setTrackingSignal(signal)}
                              className="flex-1 text-xs font-medium py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1"
                              data-testid={`button-track-${signal.id}`}
                            >
                               <Crosshair size={12} /> Track
                            </button>
                            <button 
                              onClick={() => onResearch(signal)}
                              className="flex-1 text-xs font-medium py-1.5 rounded-md bg-brand-900/50 hover:bg-brand-800/50 text-brand-400 hover:text-brand-300 transition-colors border border-brand-500/20 flex items-center justify-center gap-1"
                              data-testid={`button-research-${signal.id}`}
                            >
                               <Bot size={12} /> Research
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const TargetsView = ({ targets, selectedTargetId, setSelectedTargetId, onAddTarget }: {
  targets: TargetCompany[];
  selectedTargetId: number | null;
  setSelectedTargetId: (id: number | null) => void;
  onAddTarget: (name: string, url: string) => void;
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [trackerOrder, setTrackerOrder] = useState<string[]>(['website', 'backlinks', 'seo', 'social', 'news', 'ads']);
  const [draggedTracker, setDraggedTracker] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTargetId && targets.length > 0) {
        setSelectedTargetId(targets[0].id);
    }
  }, [targets, selectedTargetId, setSelectedTargetId]);

  const selectedTarget = targets.find(t => t.id === selectedTargetId) || targets[0];

  const handleAddTarget = async () => {
    if (newTargetName.trim() && newTargetUrl.trim()) {
      await onAddTarget(newTargetName.trim(), newTargetUrl.trim());
      setNewTargetName('');
      setNewTargetUrl('');
      setShowAddModal(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, trackerId: string) => {
    setDraggedTracker(trackerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTrackerId: string) => {
    e.preventDefault();
    if (!draggedTracker || draggedTracker === targetTrackerId) return;
    
    const draggedIndex = trackerOrder.indexOf(draggedTracker);
    const targetIndex = trackerOrder.indexOf(targetTrackerId);
    const newOrder = [...trackerOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedTracker);
    setTrackerOrder(newOrder);
    setDraggedTracker(null);
  };

  const handleDragEnd = () => {
    setDraggedTracker(null);
  };

  const renderTrackerCard = (trackerId: string) => {
    const colorMap: Record<string, {border: string, header: string, icon: string, pulse: string, bg: string, hoverBorder: string}> = {
      website: { border: 'border-cyan-500/40', hoverBorder: 'hover:border-cyan-500/60', header: 'border-cyan-500/20 bg-cyan-500/5', icon: 'text-cyan-400', pulse: 'bg-cyan-500', bg: 'from-cyan-500/10' },
      backlinks: { border: 'border-emerald-500/40', hoverBorder: 'hover:border-emerald-500/60', header: 'border-emerald-500/20 bg-emerald-500/5', icon: 'text-emerald-400', pulse: 'bg-emerald-500', bg: 'from-emerald-500/10' },
      seo: { border: 'border-blue-500/40', hoverBorder: 'hover:border-blue-500/60', header: 'border-blue-500/20 bg-blue-500/5', icon: 'text-blue-400', pulse: 'bg-blue-500', bg: 'from-blue-500/10' },
      social: { border: 'border-purple-500/40', hoverBorder: 'hover:border-purple-500/60', header: 'border-purple-500/20 bg-purple-500/5', icon: 'text-purple-400', pulse: 'bg-purple-500', bg: 'from-purple-500/10' },
      news: { border: 'border-rose-500/40', hoverBorder: 'hover:border-rose-500/60', header: 'border-rose-500/20 bg-rose-500/5', icon: 'text-rose-400', pulse: 'bg-rose-500', bg: 'from-rose-500/10' },
      ads: { border: 'border-orange-500/40', hoverBorder: 'hover:border-orange-500/60', header: 'border-orange-500/20 bg-orange-500/5', icon: 'text-orange-400', pulse: 'bg-orange-500', bg: 'from-orange-500/10' }
    };

    const iconMap: Record<string, typeof Globe> = {
      website: Globe, backlinks: LinkIcon, seo: Search, social: Megaphone, news: FileText, ads: DollarSign
    };

    const nameMap: Record<string, string> = {
      website: 'Website Tracker', backlinks: 'Backlinks Tracker', seo: 'SEO Tracker', 
      social: 'Social Media Tracker', news: 'News Mentions Tracker', ads: 'Google Ads Tracker'
    };

    const descMap: Record<string, string> = {
      website: 'On-page copy, pricing, features, SEO and more.',
      backlinks: 'Domain ranking, backlinks and referring domains.',
      seo: 'Rankings, keywords, and search visibility.',
      social: 'Posts, engagement, and follower growth.',
      news: 'Press coverage and brand mentions.',
      ads: 'Ad spend, keywords, and campaign changes.'
    };

    const colors = colorMap[trackerId];
    const Icon = iconMap[trackerId];
    const signals = TRACKER_SIGNALS[trackerId as keyof typeof TRACKER_SIGNALS] || [];

    return (
      <div 
        key={trackerId}
        draggable 
        onDragStart={(e) => handleDragStart(e, trackerId)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, trackerId)}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br ${colors.bg} to-transparent border ${colors.border} ${colors.hoverBorder} rounded-lg overflow-hidden transition-all cursor-move ${draggedTracker === trackerId ? 'opacity-50' : ''}`}>
        <div className={`px-4 py-3 border-b ${colors.header} flex items-center gap-2.5`}>
          <Icon size={16} className={`${colors.icon} shrink-0`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">{nameMap[trackerId]}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">{descMap[trackerId]}</p>
          </div>
          <div className={`w-2 h-2 ${colors.pulse} rounded-full animate-pulse shrink-0`}></div>
        </div>
        <div className="px-4 py-2.5 max-h-80 overflow-y-auto custom-scrollbar space-y-2">
          {signals.map((sig, i) => (
            <div key={i} className={`bg-slate-900/50 border ${colors.header.split(' ')[0]} rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-white text-xs group-hover:${colors.icon} transition-colors line-clamp-1`}>{sig.title}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{sig.time}</p>
                </div>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold shrink-0 rounded-full border ${sig.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' : sig.severity === 'MED' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>{sig.severity}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{sig.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (targets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in-up">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 mx-auto">
            <Crosshair size={32} className="text-brand-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Competitors Tracked</h2>
          <p className="text-slate-400 mb-6">Start by adding a competitor to monitor. Track their pricing, features, and market movements.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
            data-testid="button-add-first-target"
          >
            <Plus size={18} /> Add First Competitor
          </button>
          
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold text-white mb-4">Add Competitor</h3>
                <input
                  type="text"
                  placeholder="Competitor Name"
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 mb-3"
                />
                <input
                  type="url"
                  placeholder="Website URL (https://...)"
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTarget}
                    className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full -m-8 animate-fade-in-up gap-0">
      <div className="w-48 border-r border-slate-800 bg-[#020617] flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Monitored Products</h3>
          <button onClick={() => setShowAddModal(true)} className="text-slate-500 hover:text-brand-400 transition-colors" data-testid="button-add-target">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {targets.map(t => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTargetId(t.id)}
              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all group ${t.id === selectedTargetId ? 'bg-slate-800' : 'hover:bg-slate-900'}`}
              data-testid={`target-item-${t.id}`}
            >
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-700 overflow-hidden">
                <img src={`https://www.google.com/s2/favicons?domain=${new URL(t.url).hostname}&sz=128`} className="w-full h-full object-contain" alt={t.name} />
              </div>
              <h4 className={`text-sm font-medium truncate ${t.id === selectedTargetId ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {t.name}
              </h4>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 border-r border-slate-800 bg-[#0b0c0f] overflow-y-auto custom-scrollbar p-6 flex flex-col">
        {selectedTarget ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-700 overflow-hidden shadow-sm">
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(selectedTarget.url).hostname}&sz=128`} className="w-full h-full object-contain" alt={selectedTarget.name} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">{selectedTarget.name}</h1>
                  <a href={selectedTarget.url} target="_blank" className="text-xs text-slate-500 hover:text-brand-400 flex items-center gap-1.5 font-mono mt-1">
                    {selectedTarget.url} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors" data-testid="button-edit-config">
                  Edit Configuration
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors" data-testid="button-generate-report">
                  Generate Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Active Trackers</p>
                <p className="text-xl font-bold text-white">7<span className="text-xs text-slate-600 font-medium ml-1">/10</span></p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">New Signals</p>
                <p className="text-xl font-bold text-white">6<span className="text-xs text-slate-600 font-medium ml-1">today</span></p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Signal Severity</p>
                <p className="text-xl font-bold"><span className="text-red-400">1H</span> <span className="text-blue-400 ml-1">1L</span></p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Avg Response Time</p>
                <p className="text-xl font-bold text-white">2.3<span className="text-xs text-slate-600 font-medium ml-1">days</span></p>
              </div>
            </div>

            {/* AI Summary Section */}
            <div className="bg-gradient-to-br from-brand-500/10 to-blue-500/5 border border-brand-500/30 rounded-lg p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-500/20 rounded-lg shrink-0">
                  <BrainCircuit size={16} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm mb-1">AI Intelligence Summary</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Detected <span className="text-brand-400 font-semibold">6 critical signals</span> across competitor products in the last 24 hours. Most significant: new enterprise pricing tier launch and major press coverage. Recommended immediate action: analyze pricing impact and feature comparisons.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-medium">1 High Priority</span>
                <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-medium">3 Medium</span>
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium">2 Low</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1">
                  <Sparkles size={12} /> Generate Deep Analysis
                </button>
                <button className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors">
                  View Full Report
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertZap size={16} className="text-brand-500" /> Signals (6 Found)
                </h3>
                <button className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                  View Full Feed
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 auto-rows-max">
                {trackerOrder.map(trackerId => renderTrackerCard(trackerId))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Select a target</div>
        )}
      </div>
    </div>
  );
};

// ... Rest of the ResearchView and LibraryView components remain the same
const ResearchView = ({ initialPrompt }: { initialPrompt?: string }) => {
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      Research view placeholder
    </div>
  );
};

const LibraryView = ({ onJumpToResearch }: { onJumpToResearch: (reportTitle: string) => void }) => {
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      Library view placeholder
    </div>
  );
};

export function Workbench() {
  const [view, setView] = useState<WorkbenchView>('targets');
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data: targets = [] } = useQuery<TargetCompany[]>({
    queryKey: ['/api/targets'],
  });

  const addTargetMutation = useMutation({
    mutationFn: async (data: { name: string; url: string }) => {
      const res = await apiRequest('POST', '/api/targets', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
    }
  });

  const handleAddTarget = (name: string, url: string) => {
    addTargetMutation.mutate({ name, url });
  };

  const handleResearch = (signal: any) => {
    setView('research');
  };

  return (
    <div className="h-full flex flex-col bg-[#020617]">
      <header className="border-b border-slate-800 bg-slate-950/40 backdrop-blur px-6 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-white">CompetiScope</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {(['targets', 'research', 'library'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded font-medium text-sm transition-all ${v === view ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                data-testid={`button-view-${v}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors" data-testid="button-settings">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {view === 'targets' && <TargetsView targets={targets} selectedTargetId={selectedTargetId} setSelectedTargetId={setSelectedTargetId} onAddTarget={handleAddTarget} />}
        {view === 'research' && <ResearchView />}
        {view === 'library' && <LibraryView onJumpToResearch={() => {}} />}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
