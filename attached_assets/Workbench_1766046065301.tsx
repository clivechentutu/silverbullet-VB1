import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, 
  Crosshair, 
  Bot, 
  Library, 
  Link as LinkIcon, 
  Search, 
  Bell, 
  Settings, 
  Plus, 
  ArrowUpRight, 
  MessageSquare, 
  FileText, 
  Download, 
  Chrome,
  Check,
  Eye,
  Edit2,
  Trash2,
  Globe,
  Target as TargetIcon, 
  ChevronLeft,
  Megaphone,
  Globe2,
  Newspaper,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  ToggleRight,
  ToggleLeft,
  Zap,
  Swords,
  LayoutGrid,
  PieChart,
  DollarSign,
  Sparkles,
  BarChart3,
  Send,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  MoreHorizontal,
  BrainCircuit,
  History,
  Share2,
  Activity,
  TrendingUp,
  Briefcase,
  MoreHorizontal as MoreDots,
  Rss,
  MousePointerClick,
  MessageCircle,
  ArrowRight,
  Paperclip,
  Maximize2,
  StopCircle,
  Clock,
  PanelRight,
  Sidebar,
  Info,
  Book,
  Star,
  ArrowUpDown,
  MessageSquareText,
  User,
  Key,
  Shield,
  CreditCard,
  LogOut,
  Mail,
  Lightbulb,
  ZapIcon,
  TrendingUpIcon,
  Code2,
  FileSearch,
  HistoryIcon,
  ShieldAlert,
  ZapIcon as AlertZap
} from 'lucide-react';
import { WorkbenchView } from '../types';

// --- Types ---
interface TargetCompany {
  id: number;
  name: string;
  url: string;
  icon: string;
}

interface Signal {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  date: string;
}

interface TrackerConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  signals: Signal[];
}

interface ExtractionRecord {
  id: string;
  type: 'Web Change' | 'Social' | 'Job Board' | 'Legal' | 'News';
  source: string;
  timestamp: string;
  summary: string;
  details: string;
  relevance: number;
}

// --- Sub-Components ---

const TrafficChart = ({ data }: { data: number[] }) => {
  const height = 40;
  const width = 120;
  const max = Math.max(...data);
  const min = Math.min(...data) * 0.8;
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
      <div className="flex flex-col w-full">
         <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height + 5}`} className="overflow-visible">
            <defs>
               <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0"/>
               </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#chartGradient)" />
            <polyline
               fill="none"
               stroke="#2dd4bf"
               strokeWidth="2"
               points={points}
               strokeLinecap="round"
               strokeLinejoin="round"
               vectorEffect="non-scaling-stroke"
            />
            {data.map((val, i) => {
                 const x = (i / (data.length - 1)) * width;
                 const y = height - ((val - min) / range) * height;
                 return <circle key={i} cx={x} cy={y} r="2.5" className="fill-slate-900 stroke-brand-400" strokeWidth="1.5" />
            })}
         </svg>
         <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-500 uppercase">
             <span>Oct</span>
             <span>Nov</span>
             <span>Dec</span>
         </div>
      </div>
  );
};

// --- Add Target Modal ---
const AddTargetModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (name: string, url: string) => void }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus size={20} className="text-brand-500" /> Add New Target
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Website URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://acme.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors font-mono"
            />
          </div>
        </div>

        <footer className="p-6 border-t border-slate-800 bg-slate-950/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              if (name && url) {
                onAdd(name, url);
                setName('');
                setUrl('');
                onClose();
              }
            }}
            disabled={!name || !url}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all"
          >
            Add to Track List
          </button>
        </footer>
      </div>
    </div>
  );
};

// --- Intelligence Panel (Side-over Drawer) ---
const IntelligencePanel = ({ isOpen, onClose, companyName }: { isOpen: boolean, onClose: () => void, companyName: string }) => {
  const mockExtractions: ExtractionRecord[] = [
    {
      id: 'ex-1',
      type: 'Web Change',
      source: 'https://figma.com/pricing',
      timestamp: 'Today, 08:15 AM',
      summary: 'Dev Mode pricing table updated',
      details: 'Added "Free during beta" removal. New line item: "$25/user/month on Enterprise". Previous value was "Beta: $0". This represents a 100% price increase for this specific seat type.',
      relevance: 98
    },
    {
      id: 'ex-2',
      type: 'Job Board',
      source: 'LinkedIn Jobs - Figma',
      timestamp: 'Yesterday, 04:30 PM',
      summary: 'New "Enterprise Compliance Lead" role',
      details: 'Job description explicitly mentions "Navigating federal regulatory frameworks" and "Leading ISO 27001 certification audits for government clients". Matches strategic shift toward regulated sectors.',
      relevance: 92
    },
    {
      id: 'ex-3',
      type: 'Web Change',
      source: 'https://help.figma.com/security',
      timestamp: 'Oct 25, 2024',
      summary: 'Terms of Service: Data Sovereignty Section',
      details: 'Updated clauses regarding data residency in EMEA and APAC regions. Now includes specific provisions for Frankfurt-based storage clusters.',
      relevance: 85
    },
    {
      id: 'ex-4',
      type: 'Social',
      source: 'X (Twitter) - Developer Feed',
      timestamp: 'Oct 24, 2024',
      summary: 'Infrastructure performance chatter',
      details: 'Detected spike (400%) in keywords related to "Figma WASM performance" and "local model loading" across top technical contributors\' feeds.',
      relevance: 70
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-[#020617] border-l border-slate-800 z-[101] shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-brand-500" /> Intelligence Panel
            </h2>
            <p className="text-xs text-slate-500">AI-synthesized dynamics for {companyName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto p-8 custom-scrollbar space-y-10 pb-20">
          
          {/* Section 1: AI Synthesis Summary */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
              AI Synthesis Summary
              <span className="text-[10px] text-slate-600 lowercase font-normal italic">Updated Today 10:42 AM</span>
            </h3>
            
            <div className="space-y-4">
              {/* Commercial */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-all">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <DollarSign size={14} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Commercial Dynamics</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-200">Aggressive Upsell:</span> Figma has introduced forced seat upgrades for "Dev Mode" on Enterprise plans, signaling a move to increase ACV ahead of Q1 targets.
                </p>
              </div>

              {/* Product */}
              <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 hover:border-brand-500/20 transition-all">
                <div className="flex items-center gap-2 text-brand-400 mb-2">
                  <Zap size={14} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Product Velocity</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="font-bold text-brand-200">AI Core Focus:</span> Significant infrastructure updates detected targeting browser performance, likely preparing for heavy local LLM integration.
                </p>
              </div>

              {/* Strategic */}
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/20 transition-all">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <TrendingUpIcon size={14} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Strategic Shifts</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="font-bold text-purple-200">Enterprise Expansion:</span> Increased focus on ISO/SOC2 compliance documentation changes indicates a push into highly regulated markets (Finance/Gov).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Evidence / Detailed Extraction */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              Detailed Extractions (Evidence)
            </h3>
            
            <div className="space-y-8 pl-1">
              {mockExtractions.map((ex, i) => (
                <div 
                  key={ex.id} 
                  className="relative pl-6 border-l border-slate-800 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {ex.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{ex.timestamp}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2">{ex.summary}</h4>
                  
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50 mb-3">
                    <p className="text-sm text-slate-400 leading-relaxed italic font-light italic">
                      "{ex.details}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <a 
                      href={ex.source} 
                      target="_blank" 
                      className="text-[11px] font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon size={12} /> View Source Object
                    </a>
                    <button className="text-[11px] font-medium text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                      <HistoryIcon size={12} /> View History Diff
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};

// --- Settings Modal ---
interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'security' | 'billing'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API Access', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl h-[600px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* Modal Sidebar */}
        <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-1">Settings</h2>
            <p className="text-xs text-slate-500">Manage your workspace preferences</p>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-brand-500/10 text-brand-400' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/5 transition-all">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Modal Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white relative group cursor-pointer shadow-xl">
                    DU
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit2 size={20} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Demo User</h4>
                    <p className="text-sm text-slate-500">Member since October 2024</p>
                    <button className="mt-2 text-xs font-bold text-brand-500 hover:text-brand-400 uppercase tracking-widest transition-colors">Change Avatar</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue="Demo User" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="email" 
                        defaultValue="demo@competiscope.com" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
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
                          <p className="text-[10px] text-slate-500 font-mono">Last used: 2 mins ago • Created Oct 12, 2024</p>
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
                          <p className="text-[10px] text-slate-500 font-mono">Never used • Created Oct 20, 2024</p>
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

          <footer className="p-6 border-t border-slate-800 bg-slate-950/30 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Discard</button>
            <button onClick={onClose} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-lg shadow-brand-900/20 transition-all">Save Changes</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

// --- Modal Component for Tracking ---
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
        {/* Header */}
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

        {/* Content */}
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

        {/* Footer */}
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


// 1. RADAR: Discovery
const RadarView = ({ onTrackSignal, onResearch }: { onTrackSignal: (signal: any) => void; onResearch: (signal: any) => void }) => {
  const [trackingSignal, setTrackingSignal] = useState<any | null>(null);

  // Mock Data
  const scopes = [
    {
      id: 1,
      name: "ChampSignal",
      url: "champsignal.com",
      status: "Scanning",
      signals: [
        { 
          id: 101, 
          name: "CompetiShark", 
          website: "competishark.com",
          desc: "Automated competitive analysis platform with similar UI patterns.", 
          score: 92, 
          trafficData: [15000, 22000, 45000],
          date: "2h ago",
          regDate: "2023-09-15"
        },
        { 
          id: 102, 
          name: "MarketMind", 
          website: "marketmind.io",
          desc: "AI-driven market intelligence specifically for enterprise sales teams.", 
          score: 85, 
          trafficData: [8000, 8500, 9200],
          date: "5h ago",
          regDate: "2023-10-02" 
        },
      ]
    },
    {
      id: 2,
      name: "OpusClip",
      url: "opus.pro",
      status: "Scanning",
      signals: [
        { 
          id: 201, 
          name: "Vizard.ai", 
          website: "vizard.ai",
          desc: "AI video editor optimized for social media clips and virality.", 
          score: 98, 
          trafficData: [450000, 680000, 1200000],
          date: "1d ago",
          regDate: "2023-05-20" 
        },
        { 
          id: 202, 
          name: "Munch", 
          website: "getmunch.com",
          desc: "Repurpose long-form video into shorts using generative AI.", 
          score: 94, 
          trafficData: [300000, 420000, 580000],
          date: "1d ago",
          regDate: "2023-06-11"
        },
      ]
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleStartTracking = (scenarios: string[]) => {
    if (trackingSignal) {
      onTrackSignal(trackingSignal);
      setTrackingSignal(null);
    }
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
         {/* Header Section */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 <Radar className="text-brand-500" /> Market Radar
              </h2>
              <p className="text-slate-400 mt-1">
                Active surveillance across <span className="text-white font-medium">2 product scopes</span>.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 flex items-center gap-2">
                 Filter Feed
              </button>
              <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(13,148,136,0.2)]">
                 <Plus size={16} /> Add Product Scope
              </button>
            </div>
         </div>

         {/* Scopes List */}
         <div className="flex flex-col gap-10">
            {scopes.map(scope => (
              <div key={scope.id} className="space-y-6">
                 {/* Scope Header */}
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
                             <span className="text-xs text-slate-600">•</span>
                             <span className="text-xs text-slate-500">{scope.signals.length} new signals found</span>
                          </div>
                       </div>
                    </div>
                    <button className="text-slate-500 hover:text-white p-2">
                       <Settings size={16} />
                    </button>
                 </div>

                 {/* Signals Grid Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {scope.signals.map(signal => (
                      <div key={signal.id} className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                         
                         {/* Card Body */}
                         <div className="p-5 flex-1 flex flex-col gap-4">
                            
                            {/* Top Row: Logo + Score */}
                            <div className="flex justify-between items-start">
                               <div className="w-12 h-12 rounded-lg bg-white p-1.5 flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner">
                                  <img 
                                      src={`https://www.google.com/s2/favicons?domain=${signal.website}&sz=128`} 
                                      alt={signal.name} 
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                      }}
                                  />
                                  <div className="hidden text-slate-900 font-bold text-lg">{signal.name[0]}</div>
                               </div>
                               <div className="flex flex-col items-end">
                                  <span className={`text-xl font-bold ${signal.score > 90 ? 'text-brand-400' : 'text-slate-200'}`}>
                                     {signal.score}%
                                  </span>
                                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Similarity</span>
                               </div>
                            </div>

                            {/* Title & Link */}
                            <div>
                               <h4 className="text-lg font-bold text-white mb-1 group-hover:text-brand-400 transition-colors truncate pr-2">
                                 {signal.name}
                               </h4>
                               <div className="flex items-center gap-2 flex-wrap">
                                  <a 
                                    href={`https://${signal.website}`}
                                    target="_blank"
                                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hover:border-slate-600 transition-colors"
                                  >
                                    {signal.website} <ExternalLink size={10} />
                                  </a>
                                  {signal.score > 90 && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                      <Zap size={10} className="fill-current" /> Hot
                                      </span>
                                  )}
                               </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 h-10">
                               {signal.desc}
                            </p>

                            {/* Metadata Tags */}
                            <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-slate-800/50 border-dashed relative">
                               {/* Traffic Tooltip Trigger */}
                               <div className="relative group/traffic">
                                  <span className="cursor-help text-[10px] px-2 py-1 rounded bg-slate-800/50 text-slate-400 border border-slate-700/50 flex items-center gap-1 hover:bg-slate-800 hover:text-brand-400 transition-colors">
                                    <TrendingUp size={10} /> Traffic
                                  </span>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-0 mb-3 w-48 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl opacity-0 translate-y-2 group-hover/traffic:opacity-100 group-hover/traffic:translate-y-0 transition-all duration-300 pointer-events-none z-50">
                                     <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-slate-950 border-r border-b border-slate-800 rotate-45"></div>
                                     <div className="flex justify-between items-end mb-3">
                                        <div>
                                           <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Monthly Visits</p>
                                           <p className="text-sm font-bold text-white flex items-center gap-1">
                                              {formatNumber(signal.trafficData[signal.trafficData.length-1])}
                                              <span className="text-[10px] text-brand-500 bg-brand-500/10 px-1 rounded">
                                                 +12%
                                              </span>
                                           </p>
                                        </div>
                                        <Activity size={14} className="text-slate-600 mb-1" />
                                     </div>
                                     <TrafficChart data={signal.trafficData} />
                                  </div>
                               </div>

                               <span className="text-[10px] px-2 py-1 rounded bg-slate-800/50 text-slate-400 border border-slate-700/50">
                                  Reg: {signal.regDate}
                               </span>
                               <span className="text-[10px] px-2 py-1 rounded bg-slate-800/50 text-slate-500 border border-slate-700/50 ml-auto">
                                  {signal.date}
                               </span>
                            </div>
                         </div>

                         {/* Bottom Tabs/Actions */}
                         <div className="grid grid-cols-2 border-t border-slate-800 divide-x divide-slate-800">
                            <button 
                              onClick={() => onResearch(signal)}
                              className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                               <Bot size={14} className="text-brand-500" /> Research
                            </button>
                            <button 
                              onClick={() => setTrackingSignal(signal)}
                              className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                               <Activity size={14} className="text-blue-500" /> Track
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

// --- Target Sidebar Item (Reverted to use Favicons) ---
interface TargetSidebarItemProps {
  target: TargetCompany;
  isActive: boolean;
  onClick: () => void;
}

const TargetSidebarItem: React.FC<TargetSidebarItemProps> = ({ target, isActive, onClick }) => {
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(target.url).hostname}&sz=64`;

  return (
    <div 
      onClick={onClick}
      className={`
        group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200
        ${isActive ? 'bg-slate-800' : 'hover:bg-slate-900'}
      `}
    >
      <div className={`
        w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold border transition-colors overflow-hidden p-1 bg-white
        ${isActive 
          ? 'border-brand-500/30' 
          : 'border-slate-800 group-hover:border-slate-700'
        }
      `}>
         <img src={faviconUrl} alt={target.name} className="w-full h-full object-contain"/>
      </div>
      <div className="flex-1 overflow-hidden">
         <h4 className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
            {target.name}
         </h4>
         <p className="text-xs text-slate-600 truncate">{target.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</p>
      </div>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>}
    </div>
  );
};

// --- TrackerCard (Reverted to High Density Design) ---
interface TrackerCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  signals: Signal[];
  onToggle: (id: string) => void;
}

const TrackerCard: React.FC<TrackerCardProps> = ({ id, title, description, icon, isEnabled, signals, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`
      group border rounded-xl transition-all duration-300 overflow-hidden mb-6
      ${isEnabled ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-slate-950 border-slate-800/60 opacity-70'}
    `}>
        {/* Card Header */}
        <div className="p-6 flex items-start justify-between gap-4">
            <div className="flex gap-4">
                <div className={`mt-1 p-2 rounded-lg border ${isEnabled ? 'bg-slate-900 border-slate-700 text-brand-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                    {icon}
                </div>
                <div>
                    <h3 className={`text-base font-semibold ${isEnabled ? 'text-white' : 'text-slate-400'}`}>{title}</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
                </div>
            </div>
            
            <button 
                onClick={() => onToggle(id)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out shrink-0 focus:outline-none ${isEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
                <span className={`block w-4 h-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out mt-1 ml-1 ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        {/* Signals Section */}
        {isEnabled && signals.length > 0 && (
            <div className="border-t border-slate-800/50 bg-slate-950/20">
                <div 
                    className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/30 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                     <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${signals.length > 0 ? 'text-brand-500' : 'text-slate-500'}`}>
                            Signals ({signals.length} found)
                        </span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Dismiss all</span>
                        {isExpanded ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
                     </div>
                </div>

                {isExpanded && (
                    <div className="divide-y divide-slate-800/50">
                        {signals.map(signal => (
                            <div key={signal.id} className="p-6 pl-[72px] hover:bg-slate-900/30 transition-colors relative group/signal">
                                <div className="absolute left-6 top-6 w-8 flex justify-center">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-2 ${signal.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                </div>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h4 className="text-sm font-semibold text-slate-200">{signal.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide shrink-0
                                        ${signal.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}
                                    `}>
                                        {signal.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed mb-3">{signal.description}</p>
                                
                                <div className="flex items-center justify-between">
                                    <button className="text-xs font-medium text-slate-500 hover:text-brand-400 flex items-center gap-1 transition-colors group/btn">
                                        View Impact & Next Action 
                                        <ChevronDown size={12} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                    </button>
                                    <span className="text-xs text-slate-600">{signal.date}</span>
                                </div>
                                
                                {/* Hover Actions */}
                                <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 group-hover/signal:opacity-100 transition-opacity">
                                    <button className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600">
                                        <Eye size={14} />
                                    </button>
                                    <button className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600">
                                        <Check size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

// 2. TARGETS: Monitoring Main Container (Refactored to Split Layout)
const TargetDetailView: React.FC<{ target: TargetCompany; onBack: () => void }> = ({ target, onBack }) => {
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  
  const [trackers, setTrackers] = useState<TrackerConfig[]>([
    {
      id: 'website-changes',
      title: 'Website Change Detection',
      description: 'Monitoring homepage, pricing page, and feature announcements.',
      icon: <Globe size={18} />,
      isEnabled: true,
      signals: [
        {
          id: 's1',
          title: 'Pricing Page: New "Enterprise" Tier',
          description: 'Added a new enterprise tier with "Contact Sales" CTA. Previously only "Pro" and "Starter".',
          priority: 'High',
          date: '2 days ago'
        },
        {
          id: 's2',
          title: 'Homepage: New Hero Headline',
          description: 'Changed from "Design for everyone" to "Design for teams that scale".',
          priority: 'Low',
          date: '1 week ago'
        }
      ]
    },
    {
      id: 'keywords',
      title: 'Keywords Tracker',
      description: 'Monitors new keyword opportunities to get more traffic.',
      icon: <Search size={18} />,
      isEnabled: true,
      signals: [
        {
          id: 'k1',
          title: 'High search volume and low difficulty for "wizard ai"',
          description: 'Your competitor is ranking for a keyword with a high search volume, low difficulty and a commercial intent.',
          priority: 'High',
          date: '1 day ago'
        },
        { id: 'k4', title: 'New keyword alert: "ai video clips"', description: 'Rising trend detected in competitor traffic sources.', priority: 'High', date: '1 day ago' }
      ]
    },
    {
      id: 'google-ads',
      title: 'Google Ads Tracker',
      description: 'Monitors new and existing Google Ads creatives.',
      icon: <ArrowUpRight size={18} />, 
      isEnabled: true, 
      signals: [] 
    },
    {
      id: 'social-sentiment',
      title: 'Social Sentiment & Reviews',
      description: 'Tracking Twitter, LinkedIn, Reddit, and G2 Crowd.',
      icon: <MessageSquare size={18} />,
      isEnabled: true,
      signals: [] 
    },
    {
      id: 'hiring-trends',
      title: 'Hiring & Job Postings',
      description: 'Monitoring Careers page and LinkedIn Jobs.',
      icon: <TargetIcon size={18} />, 
      isEnabled: false,
      signals: []
    },
    {
      id: 'news',
      title: 'News Tracker',
      description: 'Monitors news sources and coverage of current events.',
      icon: <Newspaper size={18} />,
      isEnabled: false,
      signals: [] 
    }
  ]);

  const handleToggle = (id: string) => {
    setTrackers(prev => prev.map(t => t.id === id ? { ...t, isEnabled: !t.isEnabled } : t));
  };

  // Calculate stats
  const activeCount = trackers.filter(t => t.isEnabled).length;
  const highPriorityAlerts = trackers.reduce((acc, t) => acc + t.signals.filter(s => s.priority === 'High').length, 0);
  const totalSignals = trackers.reduce((acc, t) => acc + t.signals.length, 0);

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto pb-20">
         {/* AI Intelligence Panel Slide-over */}
         <IntelligencePanel 
            isOpen={isIntelligenceOpen} 
            onClose={() => setIsIntelligenceOpen(false)} 
            companyName={target.name}
         />

         {/* Header */}
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-700 overflow-hidden shadow-sm">
                       <img src={`https://www.google.com/s2/favicons?domain=${new URL(target.url).hostname}&sz=128`} className="w-full h-full object-contain" alt={target.name} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{target.name}</h1>
                        <a href={target.url} target="_blank" className="text-xs text-slate-500 hover:text-brand-400 flex items-center gap-1.5 font-mono">
                            {target.url} <ExternalLink size={8} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsIntelligenceOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg hover:bg-brand-500/20 hover:text-brand-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                >
                    <Sparkles size={14} /> AI Intelligence Synthesis
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                    Edit Trackers
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-brand-500 rounded-lg hover:bg-brand-400 transition-colors shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                    Generate Report
                </button>
            </div>
         </div>

         {/* Compact Metrics Strip */}
         <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-4 transition-all hover:bg-slate-900/60">
               <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <ShieldAlert size={16} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Trackers</p>
                  <p className="text-lg font-bold text-white">{activeCount}<span className="text-xs text-slate-600 font-medium ml-1">/{trackers.length}</span></p>
               </div>
            </div>
            <div className="flex-1 bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-4 transition-all hover:bg-slate-900/60">
               <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertZap size={16} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">High Priority Alerts</p>
                  <p className="text-lg font-bold text-white">{highPriorityAlerts}</p>
               </div>
            </div>
            <div className="flex-1 bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-4 transition-all hover:bg-slate-900/60">
               <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <TrendingUpIcon size={16} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Signals Found (7d)</p>
                  <p className="text-lg font-bold text-brand-400">{totalSignals}</p>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Active Intelligence Trackers
                </h2>
                <div className="flex gap-2">
                   <span className="text-sm text-slate-500 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     Auto-refresh active
                   </span>
                </div>
             </div>

             <div className="space-y-4">
                {trackers.map(tracker => (
                   <TrackerCard 
                     key={tracker.id}
                     {...tracker}
                     onToggle={(id) => handleToggle(id)} 
                     signals={tracker.signals}
                   />
                ))}
             </div>
         </div>
    </div>
  );
};

interface TargetsViewProps {
  targets: TargetCompany[];
  selectedTargetId: number | null;
  setSelectedTargetId: (id: number | null) => void;
  onAddTarget: (name: string, url: string) => void;
}

const TargetsView: React.FC<TargetsViewProps> = ({ targets, selectedTargetId, setSelectedTargetId, onAddTarget }) => {
  const [isAddTargetModalOpen, setIsAddTargetModalOpen] = useState(false);

  // Ensure a target is selected for this view if list is not empty
  useEffect(() => {
    if (!selectedTargetId && targets.length > 0) {
        setSelectedTargetId(targets[0].id);
    }
  }, [targets, selectedTargetId, setSelectedTargetId]);

  const selectedTarget = targets.find(t => t.id === selectedTargetId) || targets[0];

  return (
    <div className="flex h-full -m-8 animate-fade-in-up"> 
       <AddTargetModal 
         isOpen={isAddTargetModalOpen} 
         onClose={() => setIsAddTargetModalOpen(false)} 
         onAdd={onAddTarget} 
       />

       {/* Sidebar for Targets */}
       <div className="w-52 border-r border-slate-800 bg-[#020617] flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
             <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Monitored Products</h3>
             <button 
               onClick={() => setIsAddTargetModalOpen(true)}
               className="text-slate-500 hover:text-brand-400 transition-colors"
             >
               <Plus size={14} />
             </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
             {targets.map(t => (
                <TargetSidebarItem 
                   key={t.id} 
                   target={t} 
                   isActive={t.id === selectedTargetId} 
                   onClick={() => setSelectedTargetId(t.id)} 
                />
             ))}
          </div>
       </div>

       {/* Main Detail Area */}
       <div className="flex-1 bg-[#0b0c0f] overflow-y-auto custom-scrollbar p-8">
          {selectedTarget ? (
              <TargetDetailView target={selectedTarget} onBack={() => {}} /> 
          ) : (
             <div className="flex items-center justify-center h-full text-slate-500">Select a target</div>
          )}
       </div>
    </div>
  );
};

// 3. RESEARCH: Enhanced "Manus-like" Agent Workspace

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
  reasoning?: ReasoningStep[]; // Only for agent
  isThinking?: boolean; // Visual state for active thinking
}

interface ResearchSession {
  id: string;
  title: string;
  agent: string;
  date: string;
  group: 'Today' | 'Yesterday' | 'Previous';
  status: 'active' | 'completed';
  messages: ChatMessage[];
}

const ResearchView = ({ initialPrompt }: { initialPrompt?: string }) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effect to pre-fill input if initialPrompt is provided
  useEffect(() => {
    if (initialPrompt) {
        setInput(initialPrompt);
    }
  }, [initialPrompt]);

  // Mock Data: Research History
  const [history, setHistory] = useState<ResearchSession[]>([
    {
      id: 'session-1',
      title: 'Figma Pricing Analysis',
      agent: 'Pricing Analyst',
      date: '2:30 PM',
      group: 'Today',
      status: 'completed',
      messages: [], // simplified
    },
    {
      id: 'session-2',
      title: 'Arc Browser Growth',
      agent: 'Market Scout',
      date: 'Yesterday',
      group: 'Yesterday',
      status: 'completed',
      messages: [],
    }
  ]);

  // Active Session State (Default empty/new)
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);

  const startNewSession = () => {
    const newSession: ResearchSession = {
      id: `session-${Date.now()}`,
      title: 'New Investigation',
      agent: 'Deep Research Agent',
      date: 'Just now',
      group: 'Today',
      status: 'active',
      messages: [],
    };
    setActiveSession(newSession);
    setCurrentSessionId(newSession.id);
    setHistory(prev => [newSession, ...prev]);
  };

  const handleSendMessage = () => {
    if (!input.trim() || !activeSession) return;
    
    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Update session with user message
    const updatedSession = { 
       ...activeSession, 
       title: activeSession.messages.length === 0 ? input : activeSession.title, // Rename on first msg
       messages: [...activeSession.messages, userMsg] 
    };
    setActiveSession(updatedSession);
    setInput('');
    setIsTyping(true);

    // 2. Simulate Agent "Thinking" & Response
    setTimeout(() => {
        // Step 1: Start Thinking
        const agentThinkingMsg: ChatMessage = {
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
        setActiveSession(prev => prev ? ({...prev, messages: [...prev.messages, agentThinkingMsg]}) : null);

        // Simulate steps updating
        setTimeout(() => {
            setActiveSession(prev => {
                if(!prev) return null;
                const msgs = [...prev.messages];
                const lastMsg = msgs[msgs.length - 1];
                if(lastMsg.reasoning) {
                    lastMsg.reasoning[0].status = 'done';
                    lastMsg.reasoning[1].status = 'active';
                }
                return {...prev, messages: msgs};
            });
        }, 1500);

         setTimeout(() => {
            setActiveSession(prev => {
                if(!prev) return null;
                const msgs = [...prev.messages];
                const lastMsg = msgs[msgs.length - 1];
                if(lastMsg.reasoning) {
                    lastMsg.reasoning[1].status = 'done';
                    lastMsg.reasoning[2].status = 'active';
                }
                return {...prev, messages: msgs};
            });
        }, 3000);

        // Final Response - Directly in chat stream
        setTimeout(() => {
            setActiveSession(prev => {
                if(!prev) return null;
                const msgs = [...prev.messages];
                const lastMsg = msgs[msgs.length - 1];
                lastMsg.isThinking = false;
                if(lastMsg.reasoning) lastMsg.reasoning.forEach(r => r.status = 'done');
                
                // Construct the "Report" content as part of the message
                const reportContent = `Based on the latest data for **${activeSession.title}**, I've identified a significant shift in their enterprise strategy.
                
### Executive Summary
The competitor has aggressively moved upmarket, targeting enterprise customers with new compliance features and dedicated support tiers.

### Key Findings
*   **Pricing Changes**: Enterprise tier now requires annual commitment starting at $50k/yr.
*   **Feature Rollout**: Launched "Advanced Security" module last week.
*   **Market Sentiment**: Positive reception from IT admins, but mixed reviews from SMBs due to price hikes.

### Next Steps
1.  **Counter-Positioning**: Highlight our flexible month-to-month plans for SMBs.
2.  **Feature Audit**: Compare our security features against their new module.
`;
                lastMsg.content = reportContent;
                
                return {...prev, messages: msgs};
            });
            setIsTyping(false);
        }, 4500);

    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);


  // --- Render ---
  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] -m-8 animate-fade-in-up"> 
       
       {/* 1. Sidebar (History) */}
       <div className="w-52 border-r border-slate-800 bg-[#020617] flex flex-col shrink-0 z-20">
          <div className="p-4 border-b border-slate-800/50">
             <button 
               onClick={startNewSession}
               className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(13,148,136,0.2)]"
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
                           onClick={() => { setActiveSession(session); setCurrentSessionId(session.id); }}
                           className={`p-2.5 rounded-lg text-sm cursor-pointer transition-colors truncate flex items-center gap-3 group ${currentSessionId === session.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-300'}`}
                         >
                            <MessageSquare size={14} className={currentSessionId === session.id ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-500'} />
                            <span className="truncate">{session.title}</span>
                         </div>
                      ))}
                   </div>
                </div>
             ))}
          </div>

          {/* User / Settings Footer */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-slate-500">
             <div className="flex items-center gap-2 text-xs hover:text-white cursor-pointer transition-colors">
                <History size={14} /> Archived
             </div>
             <Settings size={14} className="hover:text-white cursor-pointer transition-colors" />
          </div>
       </div>

       {/* 2. Main Chat Area */}
       <div className="flex-1 flex flex-col relative min-w-0 bg-[#0b0c0f]">
          {/* Header (Context) */}
          {activeSession && (
             <header className="h-14 border-b border-slate-800/50 flex items-center justify-between px-6 bg-[#0b0c0f]/80 backdrop-blur z-10">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-medium text-slate-200">{activeSession.title}</span>
                   <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{activeSession.agent}</span>
                </div>
                <div className="flex items-center gap-3">
                </div>
             </header>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 scroll-smooth">
             {!activeSession || activeSession.messages.length === 0 ? (
                // Zero State
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
                         >
                            {prompt}
                         </button>
                      ))}
                   </div>
                </div>
             ) : (
                // Chat Stream
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
                                  {/* Reasoning Chain */}
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
                                  
                                  {/* Content */}
                                  {msg.content && (
                                     <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                                        {/* Simple markdown rendering simulation by splitting newlines for basic paragraphs */}
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

          {/* Input Area */}
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
                      >
                         <ArrowRight size={16} />
                      </button>
                   </div>
                </div>
                <div className="text-center mt-2">
                   <p className="text-[10px] text-slate-500 font-medium">CompetiScope Agent v2.5 • AI can make mistakes.</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// 4. NEW LIBRARY VIEW
interface LibraryViewProps {
    onJumpToResearch: (reportTitle: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onJumpToResearch }) => {
    // Mock data with state
    const [reports, setReports] = useState([
        {
            id: 1,
            title: "Figma Pricing Strategy Analysis",
            product: "Figma",
            date: "Oct 24, 2024",
            summary: "Analysis of the new enterprise tier constraints and Dev Mode impact.",
            isFavorite: false
        },
        {
            id: 2,
            title: "Arc Browser Growth Tactics",
            product: "Arc",
            date: "Oct 22, 2024",
            summary: "Breakdown of the 'Boosts' feature and its viral loop mechanisms.",
            isFavorite: false
        },
        {
            id: 3,
            title: "Adobe XD Feature Gap Audit",
            product: "Adobe XD",
            date: "Oct 15, 2024",
            summary: "Detailed comparison of lack of variables and advanced prototyping vs Figma.",
            isFavorite: false
        },
        {
            id: 4,
            title: "Miro Enterprise Security Review",
            product: "Miro",
            date: "Sep 28, 2024",
            summary: "Evaluation of SSO enforcement and data residency options.",
            isFavorite: false
        }
    ]);

    const [filter, setFilter] = useState<'all' | 'favorites'>('all');
    const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFavorite = (id: number) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
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

    return (
        <div className="animate-fade-in-up space-y-6">
            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Book className="text-brand-500" size={20} /> Research Library
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Archive of generated intelligence reports.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative">
                       <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                       <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search reports..." 
                          className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-medium text-white focus:outline-none focus:border-brand-500 w-40 md:w-56 transition-all placeholder-slate-600"
                       />
                    </div>

                    {/* Filter Segment */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex">
                        <button 
                            onClick={() => setFilter('all')}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilter('favorites')}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 ${filter === 'favorites' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Star size={10} className={filter === 'favorites' ? 'fill-yellow-400 text-yellow-400' : ''} /> Favorites
                        </button>
                    </div>

                    {/* Sort Button */}
                    <button 
                        onClick={() => setSort(prev => prev === 'latest' ? 'oldest' : 'latest')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    >
                        <ArrowUpDown size={12} />
                        {sort === 'latest' ? 'Latest' : 'Oldest'}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredReports.map(report => (
                    <div key={report.id} className="group relative bg-slate-900/40 border border-slate-800 hover:border-brand-500/50 rounded-lg p-5 transition-all hover:bg-slate-900/60 cursor-pointer flex flex-col aspect-[3/4] overflow-hidden shadow-2xl">
                        {/* Decorative Background Icon */}
                        <FileText className="absolute -right-6 -bottom-6 text-slate-800/10 group-hover:text-brand-500/5 w-32 h-32 transition-colors pointer-events-none" />

                        {/* Top Action Row */}
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:border-brand-500/30 group-hover:text-brand-400 transition-colors">
                                {report.product}
                            </span>
                            
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(report.id); }}
                                    className={`p-1 rounded transition-colors hover:bg-slate-800 ${report.isFavorite ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'}`}
                                    title={report.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                >
                                    <Star size={14} className={report.isFavorite ? 'fill-yellow-400' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative z-10 flex flex-col">
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 group-hover:text-brand-400 group-hover:border-brand-900/50 transition-colors w-fit mb-4">
                                <FileText size={20} />
                            </div>
                            
                            <h3 className="text-sm font-bold text-white group-hover:text-brand-100 transition-colors line-clamp-3 leading-tight mb-3">
                                {report.title}
                            </h3>
                            
                            <p className="text-[11px] text-slate-500 line-clamp-6 group-hover:text-slate-400 transition-colors leading-relaxed">
                                {report.summary}
                            </p>

                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-[9px] text-slate-600 font-mono font-medium">{report.date}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onJumpToResearch(report.title); }}
                                    className="p-1.5 rounded-md transition-all bg-slate-950 border border-slate-800 text-slate-500 hover:text-brand-400 hover:border-brand-900/50 group/jump"
                                    title="View research chat"
                                >
                                    <MessageSquareText size={14} className="group-hover/jump:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Hover line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                ))}
            </div>
            
            {/* Empty State */}
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

// 5. ACTS TEMPLATE: Enhanced
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
         {/* New Extension CTA Banner */}
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
            
            <button className="relative z-10 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap">
               <Chrome size={18} /> Add to Chrome
            </button>
         </div>

         {/* Header */}
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
               />
            </div>
         </div>

         {/* Categories */}
         <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {categories.map(cat => (
               <button 
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeCat === cat ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  {cat}
               </button>
            ))}
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.filter(t => activeCat === 'All' || t.category === activeCat).map(template => (
               <div key={template.id} className="group bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col h-full">
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
                  <button className="w-full py-2.5 bg-slate-950 hover:bg-brand-600 hover:text-white border border-slate-700 hover:border-brand-500 text-slate-300 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                     <FileText size={16} /> Use Template
                  </button>
               </div>
            ))}
            
            {/* "Create Custom" Card */}
            <div className="bg-dashed border border-slate-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 hover:border-slate-700 transition-all cursor-pointer">
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

// 6. LINK WORKSPACE: Placeholder
const LinkWorkspaceView = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
      <LinkIcon size={32} className="text-brand-500" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Integrations & Links</h2>
    <p className="text-slate-400 max-w-md">
      Connect CompetiScope to your CRM, Slack, or Notion workspace to sync intelligence automatically.
    </p>
    <button className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors border border-slate-700">
      Connect App
    </button>
  </div>
);

// --- MAIN WORKBENCH LAYOUT ---

const INITIAL_TARGETS: TargetCompany[] = [
    { id: 1, name: 'Figma', url: 'https://figma.com', icon: 'F' },
    { id: 2, name: 'Sketch', url: 'https://sketch.com', icon: 'S' },
    { id: 3, name: 'Adobe XD', url: 'https://adobe.com', icon: 'A' },
    { id: 4, name: 'Framer', url: 'https://framer.com', icon: 'F' },
    { id: 5, name: 'Miro', url: 'https://miro.com', icon: 'M' },
];

export const Workbench: React.FC = () => {
  const [activeView, setActiveView] = useState<WorkbenchView>(WorkbenchView.RADAR);
  const [researchPrompt, setResearchPrompt] = useState<string>(''); // For deep linking Radar -> Research
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lifted state for targets
  const [targets, setTargets] = useState<TargetCompany[]>(INITIAL_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);

  const NAV_ITEMS = [
    { 
      id: WorkbenchView.RADAR, 
      label: 'Radar', 
      icon: Radar,
      description: 'Discover market trends and new competitors using AI scanning.'
    },
    { 
      id: WorkbenchView.TARGETS, 
      label: 'Track', 
      icon: Crosshair,
      description: 'Monitor specific competitors for pricing changes, feature launches, and traffic shifts.'
    },
    { 
      id: WorkbenchView.RESEARCH, 
      label: 'Research', 
      icon: Bot,
      description: 'Deep-dive AI analysis agent to generate reports and answer strategic questions.'
    },
    { 
      id: WorkbenchView.LIBRARY, 
      label: 'Library', 
      icon: Book,
      description: 'Access your archive of generated research reports and deep-dives.'
    },
    { 
      id: WorkbenchView.ACTS_TEMPLATE, 
      label: 'Acts Template', 
      icon: Library,
      description: 'Pre-built templates for battle cards, SWOT analysis, and executive summaries.'
    },
    { 
      id: WorkbenchView.LINK_WORKSPACE, 
      label: 'Link Workspace', 
      icon: LinkIcon,
      description: 'Integrate with your CRM, Slack, and other tools to sync intelligence.'
    },
  ];

  // Handler for Radar -> Track
  const handleTrackSignal = (signal: any) => {
      let target = targets.find(t => t.name === signal.name);
      
      if (!target) {
          target = {
              id: signal.id, 
              name: signal.name,
              url: `https://${signal.website}`,
              icon: signal.name[0]
          };
          setTargets([...targets, target]);
      }
      
      setSelectedTargetId(target.id);
      setActiveView(WorkbenchView.TARGETS);
  };

  // Handler for Manual Add Target
  const handleAddTarget = (name: string, url: string) => {
    const newTarget: TargetCompany = {
      id: Date.now(),
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
      icon: name[0]
    };
    setTargets([...targets, newTarget]);
    setSelectedTargetId(newTarget.id);
  };

  // Handler for Radar -> Research
  const handleResearchSignal = (signal: any) => {
      setResearchPrompt(`Research ${signal.name} (${signal.website}) and analyze their latest product features and pricing changes.`);
      setActiveView(WorkbenchView.RESEARCH);
  };

  // Handler for Library -> Research Jump
  const handleJumpToResearch = (title: string) => {
    setResearchPrompt(`Revisit the investigation for: ${title}`);
    setActiveView(WorkbenchView.RESEARCH);
  };

  const renderContent = () => {
    switch(activeView) {
      case WorkbenchView.RADAR: return <RadarView onTrackSignal={handleTrackSignal} onResearch={handleResearchSignal} />;
      case WorkbenchView.TARGETS: return <TargetsView targets={targets} selectedTargetId={selectedTargetId} setSelectedTargetId={setSelectedTargetId} onAddTarget={handleAddTarget} />;
      case WorkbenchView.RESEARCH: return <ResearchView initialPrompt={researchPrompt} />;
      case WorkbenchView.LIBRARY: return <LibraryView onJumpToResearch={handleJumpToResearch} />;
      case WorkbenchView.ACTS_TEMPLATE: return <ActsTemplateView />;
      case WorkbenchView.LINK_WORKSPACE: return <LinkWorkspaceView />;
      default: return <RadarView onTrackSignal={handleTrackSignal} onResearch={handleResearchSignal} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans">
      
      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

      {/* Sidebar */}
      <aside className="w-52 fixed top-0 bottom-0 left-0 bg-slate-950 border-r border-slate-800 z-20 flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
           <span className="text-xl font-bold tracking-tight text-white">Competi<span className="text-brand-500">Scope</span></span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  group/nav-item relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border
                  ${isActive 
                    ? 'bg-brand-900/20 text-brand-400 border-brand-500/10' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border-transparent'
                  }
                `}
              >
                <item.icon size={18} className={isActive ? 'text-brand-500' : 'text-slate-500'} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                
                {/* Info Icon with Tooltip */}
                <div className="relative group/tooltip">
                  <Info size={14} className={`opacity-100 transition-opacity duration-200 ${isActive ? 'text-brand-500/70' : 'text-slate-600'}`} />
                  
                  {/* Tooltip Content */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-48 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs text-slate-300 font-normal leading-relaxed pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45"></div>
                    <div className="relative z-10">
                      <span className="block font-semibold text-white mb-1">{item.label}</span>
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600"></div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Demo User</p>
              <p className="text-xs text-slate-500 truncate">Enterprise Plan</p>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-52 min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Top Header for Context (Breadcrumbs/Actions) */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">
              {NAV_ITEMS.find(n => n.id === activeView)?.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div key={activeView} className="p-8 pb-20">
          {renderContent()}
        </div>
      </main>

    </div>
  );
};
