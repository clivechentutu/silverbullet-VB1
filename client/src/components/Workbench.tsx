import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { WorkbenchView, type Target, type AnalysisReport, type ResearchSession as DBResearchSession, type ChatMessage as DBChatMessage } from '@shared/schema';
import { 
  Radar, Crosshair, Bot, Book, Library, Link as LinkIcon, Hexagon, Settings, User, 
  Plus, TrendingUp, Activity, ExternalLink, Zap, Search, ToggleRight, 
  Key, Trash2, Download, CreditCard, Shield, Sparkles, ChevronLeft,
  ShieldAlert, Check, Megaphone, Globe, DollarSign, Briefcase, X,
  MessageSquare, History, Loader2, BrainCircuit, Paperclip, ArrowRight,
  FileText, Star, ArrowUpDown, MessageSquareText, Swords, LayoutGrid,
  PieChart, BarChart3, Chrome, ChevronDown, ChevronRight, Target as TargetIcon,
  Edit2, MoreVertical, Lightbulb, ChevronUp, Pause, Archive, Eye
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AlertZap = Zap;
const TrendingUpIcon = TrendingUp;

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
    // We remove position calculation logic since it's now centered fixed
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    // Add a small delay to prevent flickering when mouse passes through overlay boundaries
    leaveTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 100);
  };

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (
    <div className="inline-block relative">
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none"
        >
          <div 
            className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200" 
            style={{ width: '900px', height: '600px' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
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

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

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
          <nav className="w-48 shrink-0 border-r border-slate-800 bg-slate-950/50 p-3 space-y-1">
            {['general', 'api', 'billing', 'security'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all capitalize ${activeTab === tab ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                {tab === 'general' && <User size={14} />}
                {tab === 'api' && <Key size={14} />}
                {tab === 'billing' && <CreditCard size={14} />}
                {tab === 'security' && <Shield size={14} />}
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">User Profile</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-900/30 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xl font-bold">
                      AI
                    </div>
                    <button className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors">
                      Upload Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                    <input type="text" defaultValue="AI Strategist" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company</label>
                    <input type="text" defaultValue="Acme Corp" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <input type="email" defaultValue="strategist@acme.com" disabled className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-400 focus:outline-none opacity-70 cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-white">Notification Preferences</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Weekly Intelligence Digest', desc: 'Summary of all tracked signals and market shifts.' },
                      { label: 'Immediate Target Alerts', desc: 'Get notified instantly when a competitor changes pricing.' },
                      { label: 'AI Agent Reports', desc: 'Notifications when deep research investigations are complete.' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <button className="text-brand-500 hover:text-brand-400 transition-colors">
                          <ToggleRight size={32} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-500/20 rounded-lg text-brand-400">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">AI Intelligence Keys</h4>
                      <p className="text-sm text-slate-400">CompetiScope uses Gemini 3 Flash for deep market analysis. Configure your keys to manage usage and specialized research agents.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Active Keys</h4>
                    <button className="text-xs font-bold text-brand-500 hover:text-brand-400 uppercase tracking-widest flex items-center gap-1">
                      <Plus size={12} /> Create Key
                    </button>
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800">
                    <div className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Key size={16} className="text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-white">Market-Scanner-Prod</p>
                          <p className="text-[10px] text-slate-500 font-mono">Last used: 2 mins ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:text-white text-slate-500"><Download size={16} /></button>
                        <button className="p-2 hover:text-white text-slate-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Key size={16} className="text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-white">Research-Agent-Beta</p>
                          <p className="text-[10px] text-slate-500 font-mono">Never used</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:text-white text-slate-500"><Download size={16} /></button>
                        <button className="p-2 hover:text-white text-slate-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 text-center py-10">
                <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={32} className="text-slate-600" />
                </div>
                <h4 className="text-xl font-bold text-white">Enterprise Plan</h4>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">You are currently on the Enterprise tier with unlimited tracking and research investigators.</p>
                <div className="pt-4">
                  <button className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-all">Manage Subscription</button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                <Shield size={48} className="mb-4 text-slate-800" />
                <p className="text-sm">Security logs and workspace permissions are restricted to administrators.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="p-6 border-t border-slate-800 bg-slate-950/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Discard</button>
          <button onClick={onClose} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-lg shadow-brand-900/20 transition-all">Save Changes</button>
        </footer>
      </div>
    </div>
  );
};

interface TrackingConfigurationModalProps {
  signal: any;
  onClose: () => void;
  onStart: (selectedScenarios: string[]) => void;
}

const TrackingConfigurationModal: React.FC<TrackingConfigurationModalProps> = ({ signal, onClose, onStart }) => {
  const [selected, setSelected] = useState<string[]>([]);
  
  const scenarios = [
    { id: 'marketing', title: 'Marketing & SEO', channels: ['SimilarWeb', 'Semrush', 'Social Media'], icon: Megaphone },
    { id: 'product', title: 'Product Updates', channels: ['Homepage Changes', 'Changelogs', 'Docs'], icon: Globe },
    { id: 'pricing', title: 'Pricing Strategy', channels: ['Pricing Page', 'Checkout Flow'], icon: DollarSign },
    { id: 'hiring', title: 'Talent & Hiring', channels: ['Careers Page', 'LinkedIn Jobs'], icon: Briefcase },
  ];

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else setSelected([...selected, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center border border-slate-700 overflow-hidden">
                 <img src={`https://www.google.com/s2/favicons?domain=${signal.website}&sz=128`} className="w-full h-full object-contain" alt={signal.name} />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-white">Track {signal.name}</h3>
                 <p className="text-sm text-slate-400">{signal.website}</p>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-4">
           <p className="text-sm text-slate-400 font-medium">Select intelligence scenarios to monitor:</p>
           <div className="grid grid-cols-1 gap-3">
              {scenarios.map(s => (
                <div 
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 group select-none
                    ${selected.includes(s.id) 
                      ? 'bg-brand-900/10 border-brand-500/50' 
                      : 'bg-slate-950/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900'}`}
                >
                   <div className={`mt-0.5 p-1 rounded border transition-colors ${selected.includes(s.id) ? 'bg-brand-500 border-brand-500' : 'border-slate-600 bg-transparent'}`}>
                      <Check size={10} className={`text-white transition-opacity ${selected.includes(s.id) ? 'opacity-100' : 'opacity-0'}`} />
                   </div>
                   <div className="flex-1">
                      <h4 className={`text-sm font-bold mb-0.5 ${selected.includes(s.id) ? 'text-white' : 'text-slate-300'}`}>{s.title}</h4>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                         {s.channels.map(c => (
                           <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500 uppercase tracking-wide font-medium">
                              {c}
                           </span>
                         ))}
                      </div>
                   </div>
                   <s.icon size={18} className={`${selected.includes(s.id) ? 'text-brand-500' : 'text-slate-600'}`} />
                </div>
              ))}
           </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Cancel
           </button>
           <button 
             onClick={() => onStart(selected)}
             disabled={selected.length === 0}
             className="px-6 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
           >
              <Activity size={16} /> Start Tracking
           </button>
        </div>
      </div>
    </div>
  );
};

const SimilarityRing = ({ value, size = 32 }: { value: number; size?: number }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? '#14b8a6' : value >= 75 ? '#3b82f6' : value >= 60 ? '#eab308' : '#64748b';
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">{value}%</span>
    </div>
  );
};

const MiniSparkline = ({ data, color = '#14b8a6' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
};

const RadarView = ({ onTrackSignal, onResearch }: { onTrackSignal: (signal: any) => void; onResearch: (signal: any) => void }) => {
  const [trackingSignal, setTrackingSignal] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<'similarity' | 'date' | 'name'>('similarity');
  const [searchQuery, setSearchQuery] = useState('');
  const [similarityMin, setSimilarityMin] = useState(60);

  const allSignals = [
    { id: 101, name: "CompetiShark", website: "competishark.com", features: ["Real-time pricing", "Feature comparison", "Automated reports"], score: 92, trafficData: [15000, 22000, 45000, 52000, 48000], date: "2h ago", status: "new" as const, scope: "ChampSignal" },
    { id: 102, name: "MarketMind", website: "marketmind.io", features: ["Predictive analytics", "Sentiment analysis", "Competitive alerts"], score: 85, trafficData: [8000, 8500, 9200, 9800, 10200], date: "Yesterday", status: "review" as const, scope: "ChampSignal" },
    { id: 103, name: "VisionaryLens", website: "visionarylens.ai", features: ["Visual recognition", "Ad tracking", "Trend forecasting"], score: 78, trafficData: [12000, 11000, 13500, 14200, 15000], date: "3 days ago", status: "monitoring" as const, scope: "ChampSignal" },
    { id: 104, name: "DataDrivers", website: "datadrivers.io", features: ["Data aggregation", "Market sizing", "Competitor profiling"], score: 72, trafficData: [5000, 5200, 4800, 5500, 5300], date: "1 week ago", status: "archived" as const, scope: "ChampSignal" },
    { id: 201, name: "Vizard.ai", website: "vizard.ai", features: ["AI video editing", "Social clips", "Virality scoring"], score: 98, trafficData: [450000, 680000, 890000, 1050000, 1200000], date: "1d ago", status: "monitoring" as const, scope: "OpusClip" },
    { id: 202, name: "Munch", website: "getmunch.com", features: ["Long-form to shorts", "Generative AI", "Auto-captioning"], score: 94, trafficData: [300000, 350000, 420000, 510000, 580000], date: "1d ago", status: "monitoring" as const, scope: "OpusClip" },
    { id: 203, name: "TrendSpotter", website: "trendspotter.com", features: ["Predictive analytics", "Sentiment analysis", "Competitive alerts"], score: 80, trafficData: [25000, 28000, 32000, 29000, 35000], date: "3 days ago", status: "monitoring" as const, scope: "OpusClip" },
    { id: 204, name: "InsightEdge", website: "insightedge.io", features: ["Predictive analytics", "Ad tracking", "Competitor profiling"], score: 78, trafficData: [18000, 19500, 21000, 20000, 22500], date: "3 days ago", status: "review" as const, scope: "OpusClip" },
    { id: 205, name: "RivalWatch", website: "rivalwatch.com", features: ["Real-time pricing", "Feature comparison", "Automated alerts"], score: 63, trafficData: [9000, 8500, 9200, 8800, 9500], date: "3 days ago", status: "monitoring" as const, scope: "OpusClip" },
    { id: 206, name: "AlphaScope", website: "alphascope.ai", features: ["Data aggregation", "Market sizing", "Competitor profiling"], score: 62, trafficData: [7000, 7200, 6800, 7500, 7300], date: "1 week ago", status: "monitoring" as const, scope: "ChampSignal" },
  ];

  const filteredSignals = allSignals
    .filter(s => s.score >= similarityMin)
    .filter(s => searchQuery === '' || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'similarity') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const stats = {
    newDiscoveries: allSignals.filter(s => s.status === 'new').length,
    highPriority: allSignals.filter(s => s.score >= 90).length,
    totalMonitored: allSignals.length,
  };

  const handleStartTracking = (scenarios: string[]) => {
    if (trackingSignal) {
      onTrackSignal(trackingSignal);
      setTrackingSignal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">New</span>;
      case 'monitoring':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Monitoring</span>;
      case 'review':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Under Review</span>;
      case 'archived':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-500/20 text-slate-400 border border-slate-500/30">Archived</span>;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {trackingSignal && (
        <TrackingConfigurationModal 
          signal={trackingSignal} 
          onClose={() => setTrackingSignal(null)} 
          onStart={handleStartTracking}
        />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Radar className="text-brand-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Market Radar</h2>
            <p className="text-sm text-slate-400">Active surveillance across <span className="text-white font-medium">2 product scopes</span></p>
          </div>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(13,148,136,0.2)]" data-testid="button-add-scope">
          <Plus size={16} /> Add Product Scope
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{stats.newDiscoveries}</p>
            <p className="text-xs text-slate-400">New Discoveries This Week</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <TrendingUp className="text-brand-500" size={20} />
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{stats.highPriority}</p>
            <p className="text-xs text-slate-400">High Priority Signals</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Zap className="text-red-500" size={20} />
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{stats.totalMonitored}</p>
            <p className="text-xs text-slate-400">Products Monitored</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Eye className="text-blue-500" size={20} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-3 border-y border-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            data-testid="select-sort"
          >
            <option value="similarity">Similarity</option>
            <option value="date">Date</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Similarity:</span>
          <span className="text-xs text-brand-400 font-medium">{similarityMin}%+</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={similarityMin}
            onChange={(e) => setSimilarityMin(Number(e.target.value))}
            className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            data-testid="slider-similarity"
          />
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text"
            placeholder="Search products, features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-56"
            data-testid="input-search-radar"
          />
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Similarity</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Key Features</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discovered</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Traffic Trend</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.map((signal, idx) => (
                <tr 
                  key={signal.id} 
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-900/20' : ''}`}
                  data-testid={`radar-row-${signal.id}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-700 overflow-hidden shrink-0">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${signal.website}&sz=128`} 
                          alt={signal.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{signal.name}</p>
                        <div 
                          className="relative group/url"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            // Centered on screen logic for URLPreview would need global state or context
                            // For now, keeping it robust with local trigger
                          }}
                        >
                          <a 
                            href={signal.website.startsWith('http') ? signal.website : `https://${signal.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-500 hover:text-brand-400 transition-colors truncate block"
                          >
                            {signal.website}
                          </a>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/url:opacity-100 pointer-events-none transition-opacity z-50">
                            <URLPreview url={signal.website} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <SimilarityRing value={signal.score} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-[200px]">
                      {signal.features.join(', ')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{signal.date}</span>
                      {signal.status === 'new' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-brand-500 text-white">NEW</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <MiniSparkline 
                      data={signal.trafficData} 
                      color={signal.trafficData[signal.trafficData.length - 1] > signal.trafficData[0] ? '#14b8a6' : '#ef4444'} 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setTrackingSignal(signal)}
                        className="px-3 py-1.5 text-[11px] font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 flex items-center gap-1"
                        data-testid={`button-track-${signal.id}`}
                      >
                        <Crosshair size={12} /> Track
                      </button>
                      <button 
                        onClick={() => onResearch(signal)}
                        className="px-3 py-1.5 text-[11px] font-medium rounded-md bg-brand-900/50 hover:bg-brand-800/50 text-brand-400 hover:text-brand-300 transition-colors border border-brand-500/30 flex items-center gap-1"
                        data-testid={`button-research-${signal.id}`}
                      >
                        <Bot size={12} /> Research
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSignals.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-400">No products match your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredSignals.length} of {allSignals.length} products</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">Previous</button>
            <span className="px-3 py-1 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">1</span>
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
}

const TargetsView = ({ targets, selectedTargetId, setSelectedTargetId, onAddTarget, onTrackResearch }: {
  targets: Target[];
  selectedTargetId: number | null;
  setSelectedTargetId: (id: number | null) => void;
  onAddTarget: (name: string, url: string) => void;
  onTrackResearch: (targetName: string) => void;
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [trackerOrder, setTrackerOrder] = useState<string[]>(['website', 'backlinks', 'seo', 'social', 'news', 'ads']);
  const [draggedTracker, setDraggedTracker] = useState<string | null>(null);
  const [showFullFeed, setShowFullFeed] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'pricing' | 'product' | 'marketing' | 'hiring'>('all');
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightContent, setInsightContent] = useState('');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  const signalsData: Signal[] = [
    { id: 1, type: 'pricing', category: 'Plan Change', time: '2h ago', content: 'New "Pro Plus" tier added at $49/mo. Positioned between Pro and Enterprise.', domain: 'figma.com', color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: 'https://figma.com/pricing' },
    { id: 2, type: 'product', category: 'Feature Launch', time: '5h ago', content: 'Beta release of "AI Vision" for automated asset categorization.', domain: 'adobe.com', color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'high', sourceUrl: 'https://adobe.com/products' },
    { id: 3, type: 'pricing', category: 'Price Increase', time: '1d ago', content: 'Legacy Professional plan increasing from $12 to $15 per editor.', domain: 'figma.com', color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'medium', sourceUrl: 'https://figma.com/blog' },
    { id: 4, type: 'hiring', category: 'Key Hire', time: '2d ago', content: 'New VP of Engineering hired from Canva to lead AI initiatives.', domain: 'sketch.com', color: 'text-orange-400', bgColor: 'bg-orange-500', value: 'high', sourceUrl: 'https://linkedin.com/company/sketch' },
    { id: 5, type: 'marketing', category: 'Campaign Start', time: '3d ago', content: 'Major outdoor campaign launched in SF targeting design agencies.', domain: 'miro.com', color: 'text-purple-400', bgColor: 'bg-purple-500', value: 'medium', sourceUrl: 'https://miro.com/campaigns' },
    { id: 6, type: 'product', category: 'New Integration', time: '3d ago', content: 'Slack integration now supports real-time design updates and comments.', domain: 'figma.com', color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://figma.com/integrations' },
    { id: 7, type: 'marketing', category: 'Content Push', time: '4d ago', content: 'Published 12 new case studies featuring Fortune 500 companies.', domain: 'adobe.com', color: 'text-purple-400', bgColor: 'bg-purple-500', value: 'low', sourceUrl: 'https://adobe.com/case-studies' },
    { id: 8, type: 'hiring', category: 'Team Expansion', time: '5d ago', content: 'Opening 15 new engineering positions for cloud infrastructure team.', domain: 'miro.com', color: 'text-orange-400', bgColor: 'bg-orange-500', value: 'medium', sourceUrl: 'https://miro.com/careers' },
    { id: 9, type: 'pricing', category: 'Bundling', time: '1w ago', content: 'New "AI Add-on" bundle for $10/user per month across all tiers.', domain: 'canva.com', color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'medium', sourceUrl: 'https://canva.com/pricing' },
    { id: 10, type: 'product', category: 'Platform Refresh', time: '1w ago', content: 'Major UI overhaul for the mobile app, focusing on accessibility.', domain: 'figma.com', color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://figma.com/releases' },
    { id: 11, type: 'marketing', category: 'Event Sponsor', time: '1w ago', content: 'Confirmed as Platinum Sponsor for Config 2024.', domain: 'adobe.com', color: 'text-purple-400', bgColor: 'bg-purple-500', value: 'medium', sourceUrl: 'https://config.figma.com' },
    { id: 12, type: 'hiring', category: 'Exec Departure', time: '2w ago', content: 'Head of Growth announced departure to join a stealth startup.', domain: 'sketch.com', color: 'text-orange-400', bgColor: 'bg-orange-500', value: 'high', sourceUrl: 'https://twitter.com/sketch' },
    { id: 13, type: 'product', category: 'Core Update', time: '2w ago', content: 'Native support for dark mode implemented in web and desktop clients.', domain: 'miro.com', color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'medium', sourceUrl: 'https://miro.com/changelog' },
    { id: 14, type: 'pricing', category: 'Discount', time: '2w ago', content: 'Limited time 20% annual discount for new education users.', domain: 'figma.com', color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'low', sourceUrl: 'https://figma.com/education' },
  ];

  const [insightSignal, setInsightSignal] = useState<Signal | null>(null);

  const selectedTarget = targets.find((t) => t.id === selectedTargetId) || targets[0];
  const targetDomain = selectedTarget ? new URL(selectedTarget.url).hostname.replace('www.', '') : '';

  const targetSignals = signalsData.filter(s => s.domain === targetDomain);
  const filteredSignals = feedFilter === 'all' ? targetSignals : targetSignals.filter(s => s.type === feedFilter);

  useEffect(() => {
    if (!selectedTargetId && targets.length > 0) {
        setSelectedTargetId(targets[0].id);
    }
  }, [targets, selectedTargetId, setSelectedTargetId]);

  useEffect(() => {
    if (showFullFeed && selectedSignalId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`signal-feed-${selectedSignalId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.classList.add('ring-2', 'ring-brand-500', 'ring-offset-2', 'ring-offset-slate-950');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-2', 'ring-offset-slate-950');
          }, 2000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showFullFeed, selectedSignalId, feedFilter]);

  const handleSignalClick = (signalId: string, category: 'all' | 'pricing' | 'product' | 'marketing' | 'hiring') => {
    setFeedFilter(category);
    setSelectedSignalId(signalId);
    setShowFullFeed(true);
  };

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
    e.dataTransfer.setData('text/plain', trackerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTrackerId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetTrackerId) return;
    
    const draggedIndex = trackerOrder.indexOf(draggedId);
    const targetIndex = trackerOrder.indexOf(targetTrackerId);
    const newOrder = [...trackerOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);
    setTrackerOrder(newOrder);
    setDraggedTracker(null);
  };

  const handleDragEnd = () => {
    setDraggedTracker(null);
  };

  const trackers: Record<string, React.ReactNode> = {
    website: (
      <div 
        key="website"
        draggable 
        onDragStart={(e) => handleDragStart(e, 'website')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'website')}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/40 rounded-lg overflow-hidden hover:border-cyan-500/60 transition-all cursor-move ${draggedTracker === 'website' ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'}`}>
        <div className="px-4 py-3 border-b border-cyan-500/20 bg-cyan-500/5 flex items-center gap-2.5">
          <Globe size={16} className="text-cyan-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Website Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">On-page copy, pricing, features, SEO and more.</p>
          </div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shrink-0"></div>
        </div>
        <div className="px-4 py-2.5 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          <div 
            onClick={() => handleSignalClick('web-1', 'pricing')}
            className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">Pricing Page: New "Enterprise" Tier</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Just now</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Added a new enterprise tier with "Contact Sales" CTA. Previously only "Pro" and "Starter".</p>
            <button className="mt-1.5 text-[10px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors">
              View Impact & Next Action <ChevronRight size={10} />
            </button>
          </div>
          <div 
            onClick={() => handleSignalClick('web-2', 'product')}
            className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">Homepage Copy Changes</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">2 hours ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Updated hero section tagline to emphasize "Enterprise-grade" capabilities and compliance features.</p>
            <button className="mt-1.5 text-[10px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors">
              View Impact & Next Action <ChevronRight size={10} />
            </button>
          </div>
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">New Solutions Page</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">5 hours ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Launched vertical-specific solution pages for Fintech and Healthcare.</p>
          </div>
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">Cookie Policy Update</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full shrink-0">INFO</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Minor updates to compliance documentation and cookie consent.</p>
          </div>
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">New Blog Post: AI Ethics</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Published a comprehensive guide on ethical AI implementation in design.</p>
          </div>
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">Career Page: 15 New Openings</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">3 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Significant expansion in the engineering and product teams announced.</p>
          </div>
        </div>
      </div>
    ),
    backlinks: (
      <div 
        key="backlinks"
        draggable 
        onDragStart={(e) => handleDragStart(e, 'backlinks')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'backlinks')}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/40 rounded-lg overflow-hidden hover:border-emerald-500/60 transition-all cursor-move ${draggedTracker === 'backlinks' ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'}`}>
        <div className="px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2.5">
          <LinkIcon size={16} className="text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Backlinks Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Domain ranking, backlinks and referring domains.</p>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
        </div>
        <div className="px-4 py-2.5 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          <div 
            onClick={() => handleSignalClick('backlink-1', 'marketing')}
            className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">New Referring Domain Detected</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Just now</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">High-authority tech blog linked to product page.</p>
          </div>
          <div 
            className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">Lost Backlink: Forbes Tech</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Previous link from "Top SaaS Trends" article was removed or changed.</p>
          </div>
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">New Competitor Comparison</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Linked in a new "Best AI Tools of 2024" comparison list.</p>
          </div>
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">G2 Review Spike</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">4 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0">POS</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Received 25+ new 5-star reviews on G2 following the recent update.</p>
          </div>
        </div>
      </div>
    ),
    seo: (
      <div 
        key="seo"
        draggable 
        onDragStart={(e) => handleDragStart(e, 'seo')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'seo')}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/40 rounded-lg overflow-hidden hover:border-blue-500/60 transition-all cursor-move ${draggedTracker === 'seo' ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'}`}>
        <div className="px-4 py-3 border-b border-blue-500/20 bg-blue-500/5 flex items-center gap-2.5">
          <Search size={16} className="text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">SEO Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Rankings, keywords, and search visibility.</p>
          </div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0"></div>
        </div>
        <div className="px-4 py-2.5 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          <div 
            onClick={() => handleSignalClick('seo-1', 'product')}
            className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-1">Keyword Ranking Change</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Just now</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Main competitor jumped to #1 for "AI Design Tools".</p>
          </div>
          <div 
            className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-1">New Indexed Pages: 12</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">3 hours ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Added 12 new documentation pages for specialized API integrations.</p>
          </div>
          <div className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-1">Site Speed Improvement</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0">POS</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Homepage load time reduced by 40% globally.</p>
          </div>
          <div className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-1">Featured Snippet Won</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">3 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0">POS</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Successfully captured the featured snippet for "SaaS SEO automation".</p>
          </div>
        </div>
      </div>
    ),
    social: (
      <div 
        key="social"
        draggable 
        onDragStart={(e) => handleDragStart(e, 'social')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'social')}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/40 rounded-lg overflow-hidden hover:border-purple-500/60 transition-all cursor-move ${draggedTracker === 'social' ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'}`}>
        <div className="px-4 py-3 border-b border-purple-500/20 bg-purple-500/5 flex items-center gap-2.5">
          <Megaphone size={16} className="text-purple-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Social Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Posts and engagement.</p>
          </div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shrink-0"></div>
        </div>
        <div className="px-4 py-2.5 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          <div 
            className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">Viral Thread Detected</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">1 hour ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">A user's review of their new collaborative features is trending on X (Twitter).</p>
          </div>
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">New YouTube Review</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">5 hours ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Popular tech influencer published a comparison video.</p>
          </div>
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">Product Hunt Launch</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Competitor's new "Pro+" mobile app launched on Product Hunt.</p>
          </div>
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">Instagram Campaign</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">1 week ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">New aesthetic design showcase campaign targeting Gen Z designers.</p>
          </div>
        </div>
      </div>
    ),
    news: (
      <div 
        key="news"
        draggable 
        onDragStart={(e) => handleDragStart(e, 'news')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'news')}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/40 rounded-lg overflow-hidden hover:border-rose-500/60 transition-all cursor-move ${draggedTracker === 'news' ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'}`}>
        <div className="px-4 py-3 border-b border-rose-500/20 bg-rose-500/5 flex items-center gap-2.5">
          <FileText size={16} className="text-rose-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">News Mentions</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Press coverage.</p>
          </div>
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shrink-0"></div>
        </div>
        <div className="px-4 py-2.5 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          <div 
            className="bg-slate-900/50 border border-rose-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-rose-300 transition-colors line-clamp-1">TechCrunch Feature</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">4 hours ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Comprehensive deep-dive article on their recent $50M series B funding.</p>
          </div>
          <div className="bg-slate-900/50 border border-rose-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-rose-300 transition-colors line-clamp-1">Forbes Listing</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Named in the "Top 50 AI Startups to Watch" list.</p>
          </div>
          <div className="bg-slate-900/50 border border-rose-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-rose-300 transition-colors line-clamp-1">Wired Analysis</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">3 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Wired discusses the implications of their new AI-driven design engine.</p>
          </div>
        </div>
      </div>
    ),
    ads: (
      <div 
        key="ads"
        draggable 
        onDragStart={(e) => handleDragStart(e, 'ads')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'ads')}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/40 rounded-lg overflow-hidden hover:border-amber-500/60 transition-all cursor-move ${draggedTracker === 'ads' ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'}`}>
        <div className="px-4 py-3 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2.5">
          <DollarSign size={16} className="text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Ads Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Ad spend.</p>
          </div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shrink-0"></div>
        </div>
        <div className="px-4 py-2.5 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          <div 
            className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">New LinkedIn Ad Campaign</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Targeting decision makers at mid-market design agencies with "Free Enterprise Trial".</p>
          </div>
          <div 
            className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">Facebook Retargeting Boost</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">4 days ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Increased spend by 15% on retargeting ads for users who visited the pricing page.</p>
          </div>
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">Google Search Ad Expansion</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">1 week ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Bidding heavily on high-intent transactional keywords in the UK market.</p>
          </div>
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">YouTube Video Ads</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">2 weeks ago</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">Started a new video ad series featuring customer success stories.</p>
          </div>
        </div>
      </div>
    ),
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
      {/* LEFT: Monitored Products */}
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
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-700 overflow-hidden relative">
                <img src={`https://www.google.com/s2/favicons?domain=${new URL(t.url).hostname}&sz=128`} className="w-full h-full object-contain" alt={t.name} />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <h4 className={`text-sm font-medium truncate ${t.id === selectedTargetId ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  {t.name}
                </h4>
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  t.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                  t.status === 'paused' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                  t.status === 'stopped' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                  'bg-slate-500 shadow-[0_0_8px_rgba(107,114,128,0.5)]'
                }`} title={
                  t.status === 'active' ? 'Active' : 
                  t.status === 'paused' ? 'Paused' : 
                  t.status === 'stopped' ? 'Stopped' : 
                  'Archived'
                } />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await apiRequest('PATCH', `/api/targets/${t.id}`, { status: 'active' });
                      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
                    }}
                  >
                    <Activity size={14} className="text-emerald-500" />
                    <span>Activate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await apiRequest('PATCH', `/api/targets/${t.id}`, { status: 'paused' });
                      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
                    }}
                  >
                    <Pause size={14} className="text-amber-500" />
                    <span>Pause Tracking</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await apiRequest('PATCH', `/api/targets/${t.id}`, { status: 'stopped' });
                      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
                    }}
                  >
                    <X size={14} className="text-red-500" />
                    <span>Stop Tracking</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await apiRequest('PATCH', `/api/targets/${t.id}`, { status: 'archived' });
                      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
                    }}
                  >
                    <Archive size={14} className="text-slate-500" />
                    <span>Archive</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 text-red-400 focus:text-red-400"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this target?')) {
                        await apiRequest('DELETE', `/api/targets/${t.id}`);
                        queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
                        if (selectedTargetId === t.id) {
                          setSelectedTargetId(null);
                        }
                      }
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE: Target Details */}
      <div className="flex-1 border-r border-slate-800 bg-[#0b0c0f] overflow-y-auto custom-scrollbar p-6 flex flex-col">
        {selectedTarget ? (
          <div className="space-y-6">
            {/* Header with logo and info */}
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
                <button 
                  onClick={() => onTrackResearch(selectedTarget.name)}
                  className="px-4 py-2 text-sm font-medium bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 rounded-lg transition-all flex items-center gap-2"
                >
                  <Bot size={14} /> Analyze with AI
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors" data-testid="button-edit-config">
                  Edit Configuration
                </button>
              </div>
            </div>

            {/* Metrics Cards - Single Row */}
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

            {/* AI Summary Area */}
            <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-brand-400 animate-pulse" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Intelligence Summary <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[10px] uppercase tracking-wider">Auto-Generated</span>
                  </h3>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 bg-slate-900/50 border border-slate-800 rounded-md hover:border-brand-500/30">
                        <History size={10} className="text-brand-400" /> History Summary
                      </button>
                    </SheetTrigger>
                    <SheetContent className="bg-slate-950 border-l border-slate-800 sm:max-w-md custom-scrollbar overflow-y-auto">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-white flex items-center gap-2">
                          <History className="text-brand-500" size={20} />
                          Intelligence History
                        </SheetTitle>
                        <p className="text-xs text-slate-500">Timeline of AI-generated competitor insights and alerts.</p>
                      </SheetHeader>
                      <div className="relative space-y-6 before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-slate-800 before:h-full">
                        {/* History Item 1 */}
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-900 border border-emerald-500/50 flex items-center justify-center z-10">
                            <TrendingUp size={12} className="text-emerald-400" />
                          </div>
                          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Market Pivot</span>
                              <span className="text-[10px] text-slate-500">2 hours ago</span>
                            </div>
                            <p className="text-xs text-slate-300">Detected shift in core messaging from "Simple Design" to "Enterprise Infrastructure".</p>
                          </div>
                        </div>

                        {/* History Item 2 */}
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-900 border border-red-500/50 flex items-center justify-center z-10">
                            <ShieldAlert size={12} className="text-red-400" />
                          </div>
                          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Pricing Risk</span>
                              <span className="text-[10px] text-slate-500">Yesterday, 4:30 PM</span>
                            </div>
                            <p className="text-xs text-slate-300">Launched new "Scale" plan with unlimited seats, directly targeting mid-market customers.</p>
                          </div>
                        </div>

                        {/* History Item 3 */}
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-900 border border-amber-500/50 flex items-center justify-center z-10">
                            <Zap size={12} className="text-amber-400" />
                          </div>
                          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Growth Signal</span>
                              <span className="text-[10px] text-slate-500">Dec 20, 2024</span>
                            </div>
                            <p className="text-xs text-slate-300">Published extensive series of case studies focusing on Fortune 500 implementations.</p>
                          </div>
                        </div>

                        {/* History Item 4 */}
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-900 border border-blue-500/50 flex items-center justify-center z-10">
                            <TargetIcon size={12} className="text-blue-400" />
                          </div>
                          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Strategic Move</span>
                              <span className="text-[10px] text-slate-500">Dec 18, 2024</span>
                            </div>
                            <p className="text-xs text-slate-300">Quietly updated Enterprise SLA terms, matching your recent platform uptime guarantee.</p>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1.5">
                      <TrendingUp size={10} className="text-emerald-400" /> Market Pivot
                    </p>
                    <p className="text-[11px] text-slate-300">Shifted focus from "Individual Creators" to "Enterprise Teams".</p>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1.5">
                      <ShieldAlert size={10} className="text-red-400" /> Pricing Risk
                    </p>
                    <p className="text-[11px] text-slate-300">New "Enterprise" tier competes directly with your Pro offering.</p>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1.5">
                      <Zap size={10} className="text-amber-400" /> Growth Signal
                    </p>
                    <p className="text-[11px] text-slate-300">Acquired 3 high-DA backlinks from major tech news outlets.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signals - By Tracking Dimension (Multi-column Draggable) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertZap size={16} className="text-brand-500" /> Signals ({signalsData.length} Found)
                </h3>
                <Sheet open={showFullFeed} onOpenChange={setShowFullFeed}>
                  <SheetTrigger asChild>
                    <button 
                      className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                      data-testid="button-view-full-feed"
                    >
                      View Full Feed
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-xl bg-slate-950 border-slate-800 p-0 overflow-hidden flex flex-col">
                    <SheetHeader className="p-6 border-b border-slate-800 shrink-0">
                      <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertZap size={20} className="text-brand-500" /> {selectedTarget?.name} Intelligence Signals
                      </SheetTitle>
                      <p className="text-xs text-slate-500 mt-1">Real-time intelligence feed for {selectedTarget?.name}.</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button 
                          onClick={() => setFeedFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${feedFilter === 'all' ? 'bg-brand-500 text-white border-brand-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                          data-testid="filter-all"
                        >
                          All ({targetSignals.length})
                        </button>
                        <button 
                          onClick={() => setFeedFilter('pricing')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${feedFilter === 'pricing' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                          data-testid="filter-pricing"
                        >
                          <DollarSign size={12} /> Pricing ({targetSignals.filter(s => s.type === 'pricing').length})
                        </button>
                        <button 
                          onClick={() => setFeedFilter('product')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${feedFilter === 'product' ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                          data-testid="filter-product"
                        >
                          <Globe size={12} /> Product ({targetSignals.filter(s => s.type === 'product').length})
                        </button>
                        <button 
                          onClick={() => setFeedFilter('marketing')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${feedFilter === 'marketing' ? 'bg-purple-500 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                          data-testid="filter-marketing"
                        >
                          <Megaphone size={12} /> Marketing ({targetSignals.filter(s => s.type === 'marketing').length})
                        </button>
                        <button 
                          onClick={() => setFeedFilter('hiring')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${feedFilter === 'hiring' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                          data-testid="filter-hiring"
                        >
                          <Briefcase size={12} /> Hiring ({targetSignals.filter(s => s.type === 'hiring').length})
                        </button>
                      </div>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      {filteredSignals.length > 0 ? (
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500/50 via-slate-700 to-transparent" />
                          <div className="space-y-4 pl-10">
                            {filteredSignals.map((signal, index) => (
                              <div key={signal.id} id={`signal-feed-${signal.id}`} className="relative animate-in slide-in-from-right-4 duration-300 scroll-mt-20">
                                <div className="absolute -left-10 top-4 flex flex-col items-center">
                                  <div className={`w-3 h-3 rounded-full ${signal.bgColor} ring-4 ring-slate-950 z-10`} />
                                  <span className="text-[9px] text-slate-500 mt-1 whitespace-nowrap transform -rotate-0">{signal.time}</span>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-brand-500/30 transition-all group">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center border border-slate-700">
                                        <img src={`https://www.google.com/s2/favicons?domain=${signal.domain}&sz=32`} className="w-full h-full object-contain" alt={signal.domain} />
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-medium">{signal.domain}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-200 leading-relaxed mb-3">{signal.content}</p>
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${signal.bgColor}/20 ${signal.color} border ${signal.bgColor.replace('bg-', 'border-')}/30`}>
                                      {signal.category}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                      signal.value === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                      signal.value === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                      'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                    }`}>
                                      {signal.value === 'high' ? 'High Value' : signal.value === 'medium' ? 'Medium Value' : 'Low Value'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700`}>
                                      {signal.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={async () => {
                                        setInsightSignal(signal);
                                        setInsightLoading(true);
                                        setInsightContent('');
                                        try {
                                          const res = await apiRequest('POST', '/api/signal-insight', {
                                            signal: signal.content,
                                            category: signal.category,
                                            type: signal.type,
                                            domain: signal.domain
                                          });
                                          const data = await res.json();
                                          setInsightContent(data.insight);
                                        } catch (e) {
                                          setInsightContent('Unable to generate insight at this time. Please try again later.');
                                        }
                                        setInsightLoading(false);
                                      }}
                                      className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-brand-500 flex items-center justify-center gap-1.5"
                                      data-testid={`signal-insight-${signal.id}`}
                                    >
                                      <Lightbulb size={12} /> Insight
                                    </button>
                                    <a 
                                      href={signal.sourceUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-slate-500 hover:text-brand-400 transition-colors flex items-center gap-1" 
                                      data-testid={`link-signal-source-${signal.id}`}
                                      title="View Original Source"
                                    >
                                      <ExternalLink size={14} />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 py-20">
                          <Search size={48} className="opacity-20" />
                          <p className="text-sm font-medium">No intelligence signals found in this category.</p>
                        </div>
                      )}
                    </div>

                    <Dialog open={!!insightSignal} onOpenChange={(open) => !open && setInsightSignal(null)}>
                      <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-white">
                            <Lightbulb className="text-brand-400" size={20} />
                            AI Insight
                          </DialogTitle>
                          <DialogDescription className="text-slate-400">
                            {insightSignal?.category} - {insightSignal?.domain}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          {insightLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="flex items-center gap-3 text-slate-400">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-sm">Analyzing signal...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                <p className="text-sm text-slate-300 mb-3 italic">"{insightSignal?.content}"</p>
                              </div>
                              <div className="p-4 bg-brand-950/30 border border-brand-900/50 rounded-lg">
                                <h4 className="text-sm font-bold text-brand-400 mb-2 flex items-center gap-2">
                                  <BrainCircuit size={14} /> Analysis & Recommendations
                                </h4>
                                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                  {insightContent || 'Generating insight...'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 auto-rows-max">
                {trackerOrder.map(id => trackers[id as keyof typeof trackers])}
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

interface ResearchViewProps {
  initialPrompt?: string;
  researchType?: string;
  onTypeReset?: () => void;
}

interface ReasoningStep {
  id: string;
  desc: string;
  status: 'pending' | 'active' | 'done';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  reasoning?: ReasoningStep[];
  isThinking?: boolean;
}

interface ResearchSession {
  id: string;
  title: string;
  agent: string;
  type: string;
  date: string;
  group: 'Today' | 'Yesterday' | 'Previous';
  status: 'active' | 'completed';
  messages: ChatMessage[];
}

const ResearchView = ({ initialPrompt, researchType, onTypeReset }: ResearchViewProps) => {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
        setInput(initialPrompt);
    }
  }, [initialPrompt]);

  const { data: sessionsData = [] } = useQuery<DBResearchSession[]>({
    queryKey: ['/api/sessions'],
  });

  const history: ResearchSession[] = sessionsData.map((s) => {
    const createdAt = new Date(s.createdAt);
    const today = new Date();
    const isToday = createdAt.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = createdAt.toDateString() === yesterday.toDateString();
    
    return {
      id: String(s.id),
      title: s.title,
      agent: s.agent,
      type: (s as any).type || 'general',
      date: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      group: isToday ? 'Today' : isYesterday ? 'Yesterday' : 'Previous',
      status: s.status as 'active' | 'completed',
      messages: (s.messages || []) as ChatMessage[],
    };
  });

  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);

  const chatMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId?: number; message: string }) => {
      const res = await apiRequest('POST', '/api/chat', { 
        sessionId, 
        message,
        type: activeSession?.type || researchType || 'general'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    }
  });

  const startNewSession = () => {
    const newSession: ResearchSession = {
      id: `temp-${Date.now()}`,
      title: 'New Investigation',
      agent: 'Deep Research Agent',
      type: researchType || 'general',
      date: 'Just now',
      group: 'Today',
      status: 'active',
      messages: [],
    };
    setActiveSession(newSession);
    setCurrentSessionId(null);
    if (onTypeReset) onTypeReset();
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const messageToSend = input;
    const updatedSession: ResearchSession = activeSession 
      ? { 
          ...activeSession, 
          title: activeSession.messages.length === 0 ? input.substring(0, 50) : activeSession.title,
          messages: [...activeSession.messages, userMsg] 
        }
      : {
          id: `temp-${Date.now()}`,
          title: input.substring(0, 50),
          agent: 'Deep Research Agent',
          type: researchType || 'general',
          date: 'Just now',
          group: 'Today',
          status: 'active',
          messages: [userMsg],
        };
    
    setActiveSession(updatedSession);
    setInput('');
    setIsTyping(true);

    const thinkingMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isThinking: true,
        reasoning: [
            { id: 'r1', desc: 'Analyzing query context...', status: 'active' },
            { id: 'r2', desc: 'Searching internal knowledge base...', status: 'pending' },
            { id: 'r3', desc: 'Synthesizing competitive data...', status: 'pending' }
        ]
    };
    
    setActiveSession(prev => prev ? ({...prev, messages: [...prev.messages, thinkingMsg]}) : null);

    try {
      const result = await chatMutation.mutateAsync({
        sessionId: currentSessionId ?? undefined,
        message: messageToSend
      });

      if (result.sessionId && !currentSessionId) {
        setCurrentSessionId(result.sessionId);
      }

      setActiveSession(prev => {
        if (!prev) return null;
        const msgs = prev.messages.slice(0, -1);
        const agentMsg: ChatMessage = {
          id: result.message.id,
          role: 'agent',
          content: result.message.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reasoning: [
            { id: 'r1', desc: 'Analyzing query context...', status: 'done' },
            { id: 'r2', desc: 'Searching internal knowledge base...', status: 'done' },
            { id: 'r3', desc: 'Synthesizing competitive data...', status: 'done' }
          ]
        };
        return { ...prev, messages: [...msgs, agentMsg] };
      });
    } catch (error) {
      setActiveSession(prev => {
        if (!prev) return null;
        const msgs = prev.messages.slice(0, -1);
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'agent',
          content: 'I apologize, but I encountered an error processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return { ...prev, messages: [...msgs, errorMsg] };
      });
    }
    
    setIsTyping(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] -m-8 animate-fade-in-up"> 
       <div className="w-52 border-r border-slate-800 bg-[#020617] flex flex-col shrink-0 z-20">
          <div className="p-4 border-b border-slate-800/50">
             <button 
               onClick={startNewSession}
               className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(13,148,136,0.2)]"
               data-testid="button-new-research"
             >
                <Plus size={16} /> New Research
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
             {['Today', 'Yesterday'].map(group => (
                <div key={group}>
                   <h4 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{group}</h4>
                   <div className="space-y-1">
                      {history.filter(h => h.group === group).map(session => (
                         <div 
                           key={session.id}
                           onClick={() => { setActiveSession(session); setCurrentSessionId(parseInt(session.id) || null); }}
                           className={`p-2.5 rounded-lg text-sm cursor-pointer transition-colors truncate flex items-center gap-3 group ${String(currentSessionId) === session.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-300'}`}
                           data-testid={`session-${session.id}`}
                         >
                            {session.type === 'radar' ? (
                               <Radar size={14} className={String(currentSessionId) === session.id ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-500'} />
                            ) : session.type === 'acts' ? (
                               <Library size={14} className={String(currentSessionId) === session.id ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-500'} />
                            ) : session.type === 'track' ? (
                               <Crosshair size={14} className={String(currentSessionId) === session.id ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-500'} />
                            ) : (
                               <MessageSquare size={14} className={String(currentSessionId) === session.id ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-500'} />
                            )}
                            <span className="truncate flex-1">{session.title}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <button 
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                       }}
                                       className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-slate-300"
                                     >
                                        <MoreVertical size={14} />
                                     </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
                                     <DropdownMenuItem 
                                       className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          // Toggle favorite logic (UI only for now)
                                          (session as any).isFavorite = !(session as any).isFavorite;
                                          queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
                                       }}
                                     >
                                        <Star size={14} className={(session as any).isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
                                        <span>Favorite</span>
                                     </DropdownMenuItem>
                                     <DropdownMenuItem 
                                       className="flex items-center gap-2 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 text-red-400 focus:text-red-400"
                                       onClick={async (e) => {
                                          e.stopPropagation();
                                          if (confirm('Are you sure you want to delete this session?')) {
                                             await apiRequest('DELETE', `/api/sessions/${session.id}`);
                                             queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
                                             if (String(currentSessionId) === session.id) {
                                                setActiveSession(null);
                                                setCurrentSessionId(null);
                                             }
                                          }
                                       }}
                                     >
                                        <Trash2 size={14} />
                                        <span>Delete</span>
                                     </DropdownMenuItem>
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             ))}
          </div>

          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-slate-500">
             <div className="flex items-center gap-2 text-xs hover:text-white cursor-pointer transition-colors">
                <History size={14} /> Archived
             </div>
             <Settings size={14} className="hover:text-white cursor-pointer transition-colors" />
          </div>
       </div>

       <div className="flex-1 flex flex-col relative min-w-0 bg-[#0b0c0f]">
          {activeSession && (
             <header className="h-14 border-b border-slate-800/50 flex items-center justify-between px-6 bg-[#0b0c0f]/80 backdrop-blur z-10">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-medium text-slate-200">{activeSession.title}</span>
                   <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{activeSession.agent}</span>
                </div>
             </header>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 scroll-smooth">
             {!activeSession || activeSession.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center animate-fade-in-up">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-6">
                      <Bot size={32} className="text-white" />
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-3">What shall we investigate?</h2>
                   <p className="text-slate-400 text-lg mb-8 max-w-lg">I can analyze competitors, track pricing shifts, or synthesize market trends into actionable reports.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                      {[
                        "Analyze Figma's new enterprise pricing",
                        "Compare Arc Browser vs Chrome features",
                        "Find weaknesses in Adobe XD's latest release",
                        "Summarize G2 reviews for Miro"
                      ].map((prompt, i) => (
                         <button 
                           key={i} 
                           onClick={() => { setInput(prompt); }}
                           className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all text-left text-sm text-slate-300 hover:text-white"
                           data-testid={`prompt-suggestion-${i}`}
                         >
                            {prompt}
                         </button>
                      ))}
                   </div>
                </div>
             ) : (
                <div className="max-w-3xl mx-auto space-y-8 pb-32">
                   {activeSession.messages.map((msg) => (
                      <div key={msg.id} className="animate-fade-in-up">
                         {msg.role === 'user' ? (
                            <div className="flex justify-end mb-8">
                               <div className="bg-slate-800 text-slate-200 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed border border-slate-700">
                                  {msg.content}
                               </div>
                            </div>
                         ) : (
                            <div className="flex gap-4 items-start">
                               <div className="w-8 h-8 rounded-lg bg-brand-900/20 border border-brand-500/20 flex items-center justify-center shrink-0 mt-1">
                                  <Bot size={16} className="text-brand-400" />
                               </div>
                               <div className="flex-1 space-y-3">
                                  {msg.reasoning && msg.reasoning.length > 0 && (
                                     <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 max-w-md">
                                        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                           <BrainCircuit size={12} /> 
                                           {msg.isThinking ? 'Thinking Process...' : 'Reasoning Chain'}
                                        </div>
                                        <div className="space-y-2">
                                           {msg.reasoning.map(step => (
                                              <div key={step.id} className="flex items-start gap-2.5 text-xs transition-all">
                                                 <div className={`mt-0.5 w-3 h-3 flex items-center justify-center shrink-0`}>
                                                    {step.status === 'done' && <Check size={12} className="text-emerald-500" />}
                                                    {step.status === 'active' && <Loader2 size={12} className="text-brand-500 animate-spin" />}
                                                    {step.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                                                 </div>
                                                 <span className={`${step.status === 'active' ? 'text-brand-200' : step.status === 'done' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    {step.desc}
                                                 </span>
                                              </div>
                                           ))}
                                        </div>
                                     </div>
                                  )}
                                  
                                  {msg.content && (
                                     <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                                        {msg.content.split('\n').map((line, i) => (
                                            <p key={i} className={line.startsWith('#') ? 'font-bold text-lg text-white mt-4 mb-2' : 'mb-2'}>
                                                {line.replace(/^#+\s/, '')}
                                            </p>
                                        ))}
                                     </div>
                                  )}
                               </div>
                            </div>
                         )}
                      </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>
             )}
          </div>

          <div className="absolute bottom-6 left-0 right-0 px-4 md:px-8 z-20">
             <div className="max-w-3xl mx-auto relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/20 to-purple-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col">
                   <textarea
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         if(!activeSession) startNewSession(); 
                         setTimeout(handleSendMessage, 0);
                       }
                     }}
                     placeholder="Message Deep Research Agent..."
                     className="w-full bg-transparent border-none text-slate-200 text-sm p-4 focus:outline-none resize-none h-14 max-h-32 custom-scrollbar placeholder-slate-500"
                     data-testid="input-research"
                   />
                   <div className="flex justify-between items-center px-2 pb-2">
                      <div className="flex items-center gap-1">
                         <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Attach">
                            <Paperclip size={16} />
                         </button>
                         <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Deep Search">
                            <Globe size={16} />
                         </button>
                      </div>
                      <button 
                        onClick={() => { if(!activeSession) startNewSession(); setTimeout(handleSendMessage, 0); }}
                        disabled={!input.trim()}
                        className="p-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all"
                        data-testid="button-send-research"
                      >
                         <ArrowRight size={16} />
                      </button>
                   </div>
                </div>
                <div className="text-center mt-2">
                   <p className="text-[10px] text-slate-500 font-medium">CompetiScope Agent v2.5 - AI can make mistakes.</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const LibraryView = ({ onJumpToResearch }: { onJumpToResearch: (reportTitle: string) => void }) => {
    const { data: dbReports = [] } = useQuery<AnalysisReport[]>({
      queryKey: ['/api/reports'],
    });

    const [localFavorites, setLocalFavorites] = useState<Set<number>>(new Set());
    
    const reports = dbReports.map(r => ({
      id: r.id,
      title: r.title,
      product: new URL(r.url).hostname.replace('www.', ''),
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      summary: r.summary.substring(0, 150) + (r.summary.length > 150 ? '...' : ''),
      isFavorite: localFavorites.has(r.id)
    }));

    const [filter, setFilter] = useState<'all' | 'favorites'>('all');
    const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFavorite = (id: number) => {
        setLocalFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const filteredReports = reports
        .filter(r => filter === 'all' || (filter === 'favorites' && r.isFavorite))
        .filter(r => 
           searchQuery === '' || 
           r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.summary.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sort === 'latest' ? dateB - dateA : dateA - dateB;
        });

    if (reports.length === 0) {
      return (
        <div className="flex items-center justify-center h-full animate-fade-in-up">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 mx-auto">
              <Book size={32} className="text-brand-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Reports Yet</h2>
            <p className="text-slate-400 mb-6">Start by analyzing a competitor using the Research section. Your generated reports will appear here for easy access.</p>
            <button
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
              data-testid="button-start-research"
            >
              <Bot size={18} /> Start Research
            </button>
          </div>
        </div>
      );
    }

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Book className="text-brand-500" size={20} /> Research Library
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Archive of generated intelligence reports. ({reports.length})</p>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                       <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                       <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search reports..." 
                          className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-medium text-white focus:outline-none focus:border-brand-500 w-40 md:w-56 transition-all placeholder-slate-600"
                          data-testid="input-search-library"
                       />
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex">
                        <button 
                            onClick={() => setFilter('all')}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            data-testid="button-filter-all"
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilter('favorites')}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 ${filter === 'favorites' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            data-testid="button-filter-favorites"
                        >
                            <Star size={10} className={filter === 'favorites' ? 'fill-yellow-400 text-yellow-400' : ''} /> Favorites
                        </button>
                    </div>

                    <button 
                        onClick={() => setSort(prev => prev === 'latest' ? 'oldest' : 'latest')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                        data-testid="button-sort"
                    >
                        <ArrowUpDown size={12} />
                        {sort === 'latest' ? 'Latest' : 'Oldest'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredReports.map(report => (
                    <div key={report.id} className="group relative bg-slate-900/40 border border-slate-800 hover:border-brand-500/50 rounded-lg p-3 transition-all hover:bg-slate-900/60 cursor-pointer flex flex-col min-h-[220px] overflow-hidden shadow-2xl" data-testid={`report-card-${report.id}`}>
                        <FileText className="absolute -right-4 -bottom-4 text-slate-800/10 group-hover:text-brand-500/5 w-24 h-24 transition-colors pointer-events-none" />

                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[8px] font-bold text-slate-400 uppercase tracking-tight group-hover:border-brand-500/30 group-hover:text-brand-400 transition-colors">
                                {report.product}
                            </span>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(report.id); }}
                                className={`p-0.5 rounded transition-colors hover:bg-slate-800 ${report.isFavorite ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                <Star size={12} className={report.isFavorite ? 'fill-yellow-400' : ''} />
                            </button>
                        </div>

                        <div className="flex-1 relative z-10 flex flex-col">
                            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 group-hover:text-brand-400 group-hover:border-brand-900/50 transition-colors w-fit mb-2">
                                <FileText size={14} />
                            </div>
                            
                            <h3 className="text-xs font-bold text-white group-hover:text-brand-100 transition-colors line-clamp-2 leading-tight mb-1.5">
                                {report.title}
                            </h3>
                            
                            <p className="text-[9px] text-slate-500 line-clamp-3 group-hover:text-slate-400 transition-colors leading-relaxed">
                                {report.summary}
                            </p>

                            <div className="mt-auto pt-2 flex items-center justify-between gap-1">
                                <span className="text-[8px] text-slate-600 font-mono font-medium truncate">{report.date}</span>
                                <div className="flex items-center gap-0.5">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); window.open(`/api/reports/${report.id}/export/csv`, '_blank'); }}
                                        className="p-1 rounded-md transition-all bg-slate-950 border border-slate-800 text-slate-500 hover:text-green-400 hover:border-green-900/50"
                                        title="Export CSV"
                                        data-testid={`button-export-csv-${report.id}`}
                                    >
                                        <Download size={10} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); window.open(`/api/reports/${report.id}/export/text`, '_blank'); }}
                                        className="p-1 rounded-md transition-all bg-slate-950 border border-slate-800 text-slate-500 hover:text-blue-400 hover:border-blue-900/50"
                                        title="Export Text"
                                        data-testid={`button-export-text-${report.id}`}
                                    >
                                        <FileText size={10} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onJumpToResearch(report.title); }}
                                        className="p-1 rounded-md transition-all bg-slate-950 border border-slate-800 text-slate-500 hover:text-brand-400 hover:border-brand-900/50 group/jump"
                                        title="Research"
                                    >
                                        <MessageSquareText size={12} className="group-hover/jump:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                ))}
            </div>
            
            {filteredReports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                        <Search size={24} />
                    </div>
                    <p className="text-xs font-medium">No reports found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                    {(filter === 'favorites' || searchQuery) && (
                        <button 
                            onClick={() => { setFilter('all'); setSearchQuery(''); }} 
                            className="mt-3 text-brand-400 hover:text-brand-300 text-[11px] font-bold uppercase tracking-wider"
                        >
                            Reset view
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const ActsTemplateView = () => {
   const templates = [
      { id: 1, title: 'Competitor Battle Card', category: 'Sales Enablement', desc: 'One-pager highlighting kill points, objection handling, and pricing traps.', icon: Swords, color: 'text-red-400' },
      { id: 2, title: 'Feature Comparison Matrix', category: 'Product Strategy', desc: 'Detailed side-by-side breakdown of feature availability and limits.', icon: LayoutGrid, color: 'text-blue-400' },
      { id: 3, title: 'Quarterly Market Report', category: 'Executive', desc: 'High-level slide deck summary of market movements and threats.', icon: PieChart, color: 'text-purple-400' },
      { id: 4, title: 'Pricing Tear-down', category: 'Strategy', desc: 'Analysis of competitor pricing tiers, psychology, and hidden costs.', icon: DollarSign, color: 'text-green-400' },
      { id: 5, title: 'Win/Loss Analysis', category: 'Sales', desc: 'Template for analyzing CRM data to understand why deals are won or lost.', icon: BarChart3, color: 'text-orange-400' },
      { id: 6, title: 'SEO Gap Analysis', category: 'Marketing', desc: 'Identify keywords where competitors are outranking you.', icon: Search, color: 'text-pink-400' },
   ];

   const categories = ['All', 'Sales Enablement', 'Product Strategy', 'Marketing', 'Executive'];
   const [activeCat, setActiveCat] = useState('All');

   return (
      <div className="space-y-8 animate-fade-in-up">
         <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-500"></div>
            
            <div className="flex items-center gap-5 relative z-10">
               <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Chrome size={28} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                     Capture Intelligence Anywhere 
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-slate-950 uppercase tracking-wide">New</span>
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                     Don't just track from here. Install our browser extension to grab pricing, screenshots, and copy directly from competitor websites.
                  </p>
               </div>
            </div>
            
            <button className="relative z-10 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap" data-testid="button-add-chrome">
               <Chrome size={18} /> Add to Chrome
            </button>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Library className="text-brand-500" /> Intelligence Acts Library
               </h2>
               <p className="text-slate-400 mt-1">Proven templates to turn raw data into actionable business assets.</p>
            </div>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                  type="text" 
                  placeholder="Search templates..." 
                  className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 w-64"
                  data-testid="input-search-templates"
               />
            </div>
         </div>

         <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {categories.map(cat => (
               <button 
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeCat === cat ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  data-testid={`button-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
               >
                  {cat}
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.filter(t => activeCat === 'All' || t.category === activeCat).map(template => (
               <div key={template.id} className="group bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col h-full" data-testid={`template-card-${template.id}`}>
                  <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-lg bg-slate-950 border border-slate-800 ${template.color} group-hover:scale-110 transition-transform`}>
                        <template.icon size={24} />
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-1 rounded">
                        {template.category}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{template.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                     {template.desc}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-slate-950 hover:bg-brand-600 hover:text-white border border-slate-700 hover:border-brand-500 text-slate-300 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> Use
                    </button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="px-3 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all flex items-center justify-center group/edit">
                          <Edit2 size={16} className="group-hover/edit:text-brand-500 transition-colors" />
                        </button>
                      </SheetTrigger>
                      <SheetContent className="bg-slate-950 border-l border-slate-800 sm:max-w-md">
                        <SheetHeader className="mb-6">
                          <SheetTitle className="text-white flex items-center gap-2">
                            <Edit2 className="text-brand-500" size={20} />
                            Edit Template Prompt
                          </SheetTitle>
                          <p className="text-xs text-slate-500">Customize the AI instructions for this intelligence output.</p>
                        </SheetHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">System Instruction / Prompt Task</label>
                            <textarea 
                              className="w-full h-64 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-brand-500/50 resize-none custom-scrollbar"
                              defaultValue={`Analyze the competitor's recent signals and generate a comprehensive ${template.title}. \n\nFocus on: \n1. Strategic shifts in messaging\n2. Key pricing changes\n3. New feature impact\n4. Recommended response strategy`}
                            />
                          </div>
                          <button className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                            Save Template Configuration
                          </button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
               </div>
            ))}
            
            <div className="bg-dashed border border-slate-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 hover:border-slate-700 transition-all cursor-pointer" data-testid="button-create-template">
               <div className="p-4 rounded-full bg-slate-900 mb-4">
                  <Plus size={24} />
               </div>
               <h3 className="font-medium mb-1">Create Custom Template</h3>
               <p className="text-xs max-w-[200px]">Design a new intelligence output format for your team.</p>
            </div>
         </div>
      </div>
   );
};

const LinkWorkspaceView = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
      <LinkIcon size={32} className="text-brand-500" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Integrations & Links</h2>
    <p className="text-slate-400 max-w-md">
      Connect CompetiScope to your CRM, Slack, or Notion workspace to sync intelligence automatically.
    </p>
    <button className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors border border-slate-700" data-testid="button-connect-app">
      Connect App
    </button>
  </div>
);

export const Workbench: React.FC = () => {
  const [activeView, setActiveView] = useState<WorkbenchView>(WorkbenchView.RADAR);
  const [researchPrompt, setResearchPrompt] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [showFullFeed, setShowFullFeed] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  const handleSignalClick = (signalId: string, category: string) => {
    setFeedFilter(category.toLowerCase());
    setSelectedSignalId(signalId);
    setShowFullFeed(true);
  };
  const [dataInitialized, setDataInitialized] = useState(false);

  const { data: targets = [], isLoading: targetsLoading } = useQuery<Target[]>({
    queryKey: ['/api/targets'],
  });

  // Initialize demo data on first load
  useEffect(() => {
    const initDemo = async () => {
      if (!dataInitialized && targets.length === 0) {
        try {
          const response = await fetch('/api/init-demo-data', { method: 'POST' });
          if (response.ok) {
            setDataInitialized(true);
            queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
            queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
            queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
          }
        } catch (error) {
          console.error('Failed to initialize demo data:', error);
        }
      }
    };
    initDemo();
  }, [dataInitialized, targets.length]);

  const addTargetMutation = useMutation({
    mutationFn: async (target: { name: string; url: string; icon: string }) => {
      const res = await apiRequest('POST', '/api/targets', target);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
    },
  });

  const NAV_ITEMS = [
    { id: WorkbenchView.RADAR, label: 'Radar', icon: Radar, description: 'Discover market trends and new competitors using AI scanning.' },
    { id: WorkbenchView.TARGETS, label: 'Track', icon: Crosshair, description: 'Monitor specific competitors for pricing changes, feature launches, and traffic shifts.' },
    { id: WorkbenchView.RESEARCH, label: 'Research', icon: Bot, description: 'Deep-dive AI analysis agent to generate reports and answer strategic questions.' },
    { id: WorkbenchView.LIBRARY, label: 'Library', icon: Book, description: 'Access your archive of generated research reports and deep-dives.' },
    { id: WorkbenchView.ACTS_TEMPLATE, label: 'Acts Template', icon: Library, description: 'Pre-built templates for battle cards, SWOT analysis, and executive summaries.' },
  ];

  const BOTTOM_NAV_ITEMS = [
    { id: WorkbenchView.LINK_WORKSPACE, label: 'Link Workspace', icon: LinkIcon, description: 'Integrate with your CRM, Slack, and other tools to sync intelligence.' },
  ];

  const handleTrackSignal = async (signal: any) => {
      const existingTarget = targets.find(t => t.name === signal.name);
      
      if (!existingTarget) {
          const result = await addTargetMutation.mutateAsync({
              name: signal.name,
              url: `https://${signal.website}`,
              icon: signal.name[0]
          });
          if (result && result.id) {
            setSelectedTargetId(result.id);
          }
      } else {
          setSelectedTargetId(existingTarget.id);
      }
      setActiveView(WorkbenchView.TARGETS);
  };

  const [researchInitialType, setResearchInitialType] = useState<string>('general');

  const handleResearchFromRadar = (signal: any) => {
      setResearchPrompt(`Deep dive analysis for ${signal.name} (${signal.website})`);
      setResearchInitialType('radar');
      setActiveView(WorkbenchView.RESEARCH);
  };

  const handleJumpToResearch = (reportTitle: string) => {
      setResearchPrompt(`Follow up on: ${reportTitle}`);
      setResearchInitialType('acts');
      setActiveView(WorkbenchView.RESEARCH);
  };

  const handleTrackResearch = (targetName: string) => {
      setResearchPrompt(`Strategic tracking analysis for ${targetName}`);
      setResearchInitialType('track');
      setActiveView(WorkbenchView.RESEARCH);
  };

  const handleAddTarget = async (name: string, url: string) => {
      const result = await addTargetMutation.mutateAsync({
          name,
          url,
          icon: name[0]
      });
      if (result && result.id) {
          setSelectedTargetId(result.id);
      }
  };

  const renderContent = () => {
    switch (activeView) {
      case WorkbenchView.RADAR:
        return <RadarView onTrackSignal={handleTrackSignal} onResearch={handleResearchFromRadar} />;
      case WorkbenchView.TARGETS:
        return <TargetsView targets={targets as any} selectedTargetId={selectedTargetId} setSelectedTargetId={setSelectedTargetId} onAddTarget={handleAddTarget} onTrackResearch={handleTrackResearch} />;
      case WorkbenchView.RESEARCH:
        return (
          <ResearchView 
            initialPrompt={researchPrompt} 
            researchType={researchInitialType}
            onTypeReset={() => setResearchInitialType('general')}
          />
        );
      case WorkbenchView.LIBRARY:
        return <LibraryView onJumpToResearch={handleJumpToResearch} />;
      case WorkbenchView.ACTS_TEMPLATE:
        return <ActsTemplateView />;
      case WorkbenchView.LINK_WORKSPACE:
        return <LinkWorkspaceView />;
      default:
        return <RadarView onTrackSignal={handleTrackSignal} onResearch={handleResearchFromRadar} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617]">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <nav className="w-64 border-r border-slate-800 bg-[#020617] flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 group cursor-pointer">
          <Hexagon className="text-brand-500 fill-brand-500/20 group-hover:rotate-90 transition-transform duration-500" size={28} />
          <span className="text-lg font-bold tracking-tight text-white">Competi<span className="text-brand-500">Scope</span></span>
        </div>

        <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all group relative
                ${activeView === item.id 
                  ? 'bg-slate-800/80 text-white' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }
              `}
            >
              <item.icon 
                size={18} 
                className={activeView === item.id ? 'text-brand-500' : 'text-slate-500 group-hover:text-slate-400'} 
              />
              <span className="text-sm font-medium">{item.label}</span>
              
              {activeView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-3 space-y-1 border-t border-slate-800">
          {BOTTOM_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all group relative
                ${activeView === item.id 
                  ? 'bg-slate-800/80 text-white' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }
              `}
            >
              <item.icon 
                size={18} 
                className={activeView === item.id ? 'text-brand-500' : 'text-slate-500 group-hover:text-slate-400'} 
              />
              <span className="text-sm font-medium">{item.label}</span>
              
              {activeView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full"></div>
              )}
            </button>
          ))}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all"
            data-testid="nav-settings"
          >
            <Settings size={18} className="text-slate-500" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all"
            data-testid="nav-profile"
          >
            <div className="w-6 h-6 rounded-full bg-brand-900/30 border border-brand-500/30 flex items-center justify-center text-brand-400 text-[10px] font-bold">
              AI
            </div>
            <span className="text-sm font-medium">AI Strategist</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-[#020617] flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-bold text-white" data-testid="text-view-title">{NAV_ITEMS.find(n => n.id === activeView)?.label}</h1>
            <p className="text-xs text-slate-500">{NAV_ITEMS.find(n => n.id === activeView)?.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg" data-testid="container-credits">
              <Sparkles size={14} className="text-brand-400" />
              <span className="text-xs font-bold text-white">2,450</span>
              <span className="text-[10px] text-slate-500 font-medium">Credits</span>
            </div>
            <button className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors" data-testid="button-help">
              Help & Docs
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0b0c0f]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
