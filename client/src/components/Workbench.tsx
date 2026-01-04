import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  PieChart, BarChart3, Chrome, ChevronDown, ChevronRight, Target as TargetIcon, Calendar,
  Edit2, MoreVertical, Lightbulb, ChevronUp, Pause, Archive, Eye, Square, AlertTriangle, HelpCircle, Rocket, Pin, GripVertical, Users, Circle, RefreshCw, Mail, Pencil, Bell, Clock
} from 'lucide-react';
import { SiX, SiYoutube, SiInstagram, SiG2, SiTrustpilot, SiReddit, SiTechcrunch } from 'react-icons/si';
import { format } from 'date-fns';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  
  // Using microlink for screenshots as a robust way to get a visual preview
  const previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&embed=screenshot.url`;

  return (
    <div className="inline-block relative">
      <a 
        href={normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className="text-xs font-mono text-slate-400 hover:text-brand-400 flex items-center gap-1 transition-colors cursor-pointer"
        data-testid={`url-preview-trigger-${url}`}
      >
        {url} <ExternalLink size={10} />
      </a>
      
      {showPreview && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none"
        >
          <div 
            className="bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200 flex flex-col" 
            style={{ width: '800px', height: '500px' }}
          >
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-slate-400" />
                <span className="text-xs font-mono text-white">{url}</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Live Preview</span>
            </div>
            <div className="relative flex-1 bg-slate-900 overflow-hidden">
              <img 
                src={previewUrl}
                alt={`Preview of ${url}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrackInsightPanel } from "@/components/TrackInsightPanel";

// Signal detail hover card content component
interface SignalDetailHoverProps {
  title: string;
  time: string;
  description: string;
  priority: 'HIGH' | 'MED' | 'LOW' | 'INFO' | 'POS';
  type: string;
  domain?: string;
}

const SignalDetailHoverContent = ({ title, time, description, priority, type, domain = 'figma.com' }: SignalDetailHoverProps) => {
  const priorityConfig = {
    HIGH: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'High Value' },
    MED: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Medium Value' },
    LOW: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Low Value' },
    INFO: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Info' },
    POS: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Positive' },
  };
  
  const config = priorityConfig[priority] || priorityConfig.LOW;
  
  return (
    <div className="space-y-4 max-w-[320px] overflow-hidden">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Signal Title</p>
        <p className="text-sm text-white leading-snug font-medium break-words">{title}</p>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Source</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white p-0.5 flex items-center justify-center border border-slate-700 shrink-0">
              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} className="w-full h-full object-contain" alt={domain} />
            </div>
            <span className="text-xs text-brand-400 font-medium truncate">{domain}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Time</p>
          <p className="text-[10px] text-slate-400">{time}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Priority</p>
          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${config.bg} ${config.text} border ${config.border}`}>
            {config.label}
          </span>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Category</p>
          <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium bg-slate-800 text-slate-400 rounded border border-slate-700">
            {type}
          </span>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Description</p>
        <p className="text-[11px] text-slate-300 leading-relaxed break-words">{description}</p>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <p className="text-[10px] font-bold text-brand-400 mb-2 flex items-center gap-1.5">
            <BrainCircuit size={12} /> Strategic Impact
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">This signal indicates a strategic shift in their market positioning. Monitor for follow-up actions.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <p className="text-[10px] font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
            <TrendingUp size={12} /> Trend Direction
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">Strong upward momentum detected. This competitor is actively expanding capabilities in this area.</p>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  radarNotifyEmail: string;
  setRadarNotifyEmail: (v: string) => void;
  radarNotifyDailyDigest: boolean;
  setRadarNotifyDailyDigest: (v: boolean) => void;
  editNotificationEmail: string;
  setEditNotificationEmail: (v: string) => void;
  editFrequencyType: 'daily' | 'weekly';
  setEditFrequencyType: (v: 'daily' | 'weekly') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose,
  radarNotifyEmail,
  setRadarNotifyEmail,
  radarNotifyDailyDigest,
  setRadarNotifyDailyDigest,
  editNotificationEmail,
  setEditNotificationEmail,
  editFrequencyType,
  setEditFrequencyType
}) => {
  const [activeTab, setActiveTab] = useState('general');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px] max-h-[90vh] animate-in zoom-in-95 duration-200">
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
            {[
              { id: 'general', label: 'General', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'credits', label: 'Credits', icon: Sparkles },
              { id: 'security', label: 'Security', icon: Shield },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <tab.icon size={14} />
                {tab.label}
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
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <Tabs defaultValue="radar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700 rounded-lg p-1 mb-6">
                    <TabsTrigger value="radar" className="flex items-center gap-2 data-[state=active]:bg-brand-500 data-[state=active]:text-white rounded-md transition-all">
                      <Radar size={14} /> Radar
                    </TabsTrigger>
                    <TabsTrigger value="track" className="flex items-center gap-2 data-[state=active]:bg-brand-500 data-[state=active]:text-white rounded-md transition-all">
                      <Activity size={14} /> Track
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="radar" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-200">Notification Email</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input
                            type="email"
                            value={radarNotifyEmail}
                            onChange={(e) => setRadarNotifyEmail(e.target.value)}
                            placeholder="Enter email address..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
                          />
                        </div>
                        <button className="px-6 py-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-sm rounded-xl hover:bg-brand-500/20 transition-all flex items-center gap-2">
                          <Mail size={16} /> Send Verification
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">We will send a verification link to confirm your email address.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-200">Notification Frequency</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setRadarNotifyDailyDigest(true)}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${radarNotifyDailyDigest ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                          Daily
                        </button>
                        <button 
                          onClick={() => setRadarNotifyDailyDigest(false)}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${!radarNotifyDailyDigest ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                          Weekly
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Time</label>
                          <div className="relative group">
                            <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                              <option>09:00</option>
                              <option>12:00</option>
                              <option>18:00</option>
                              <option>21:00</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Timezone</label>
                          <div className="relative group">
                            <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                              <option>UTC</option>
                              <option>EST</option>
                              <option>PST</option>
                              <option>CST</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock size={12} />
                        <span>You'll receive {radarNotifyDailyDigest ? 'daily' : 'weekly'} signal summaries at 09:00 (UTC)</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="track" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-200">Notification Email</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input
                            type="email"
                            value={editNotificationEmail}
                            onChange={(e) => setEditNotificationEmail(e.target.value)}
                            placeholder="Enter email address..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
                          />
                        </div>
                        <button className="px-6 py-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-sm rounded-xl hover:bg-brand-500/20 transition-all flex items-center gap-2">
                          <Mail size={16} /> Send Verification
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">We will send a verification link to confirm your email address.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-200">Notification Frequency</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setEditFrequencyType('daily')}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${editFrequencyType === 'daily' ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                          Daily
                        </button>
                        <button 
                          onClick={() => setEditFrequencyType('weekly')}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${editFrequencyType === 'weekly' ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                          Weekly
                        </button>
                      </div>
                      
                      {editFrequencyType === 'daily' ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Time</label>
                            <div className="relative group">
                              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                                <option>06:00</option>
                                <option>07:00</option>
                                <option>08:00</option>
                                <option>09:00</option>
                                <option>10:00</option>
                                <option>12:00</option>
                                <option>18:00</option>
                                <option>21:00</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Timezone</label>
                            <div className="relative group">
                              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                                <option>UTC</option>
                                <option>America/New_York</option>
                                <option>America/Los_Angeles</option>
                                <option>America/Chicago</option>
                                <option>Europe/London</option>
                                <option>Asia/Tokyo</option>
                                <option>Asia/Shanghai</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Day</label>
                            <div className="relative group">
                              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                                <option>Monday</option>
                                <option>Tuesday</option>
                                <option>Wednesday</option>
                                <option>Thursday</option>
                                <option>Friday</option>
                                <option>Saturday</option>
                                <option>Sunday</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Time</label>
                            <div className="relative group">
                              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                                <option>09:00</option>
                                <option>12:00</option>
                                <option>18:00</option>
                                <option>21:00</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Timezone</label>
                            <div className="relative group">
                              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                                <option>UTC</option>
                                <option>America/New_York</option>
                                <option>America/Los_Angeles</option>
                                <option>Europe/London</option>
                                <option>Asia/Tokyo</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock size={12} />
                        <span>
                          {editFrequencyType === 'daily' 
                            ? "You'll receive daily signal summaries at 09:00 (UTC)"
                            : "You'll receive weekly signal summaries every Monday at 09:00 (UTC)"
                          }
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        <label className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-all group">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              defaultChecked 
                              className="peer w-5 h-5 rounded border-slate-700 bg-slate-900 checked:bg-brand-500 checked:border-brand-500 transition-all appearance-none cursor-pointer" 
                            />
                            <Check size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-200">Apply to all targets</p>
                            <p className="text-[10px] text-slate-500">Use these notification settings for all currently tracked competitors</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === 'credits' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white mb-1">Enterprise Plan</h4>
                      <p className="text-xs text-slate-400">Next renewal: Feb 1, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-400">2,450</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credits Remaining</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 w-[75%]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Usage History</h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800">
                    {[
                      { task: 'Competitor Site Scan', cost: 50, time: '2 mins ago' },
                      { task: 'SWOT Analysis Generation', cost: 120, time: '1 hour ago' },
                      { task: 'Market Radar Refresh', cost: 300, time: '5 hours ago' },
                      { task: 'Deep Research Agent', cost: 500, time: 'Yesterday' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{item.task}</p>
                          <p className="text-[10px] text-slate-500">{item.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-200">-{item.cost}</p>
                          <p className="text-[10px] text-slate-500">Credits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-lg shadow-brand-900/20 transition-all">
                    Add Credits
                  </button>
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

const TrafficChartPreview = ({ data, color = '#14b8a6' }: { data: number[]; color?: string }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [positionStyle, setPositionStyle] = useState<{ top?: number; left?: number; bottom?: number }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Only show last 3 months of data
  const chartData = data.slice(-3);
  
  const max = Math.max(...chartData);
  const min = Math.min(...chartData);
  const range = max - min || 1;
  
  const today = new Date();
  const dates = chartData.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (chartData.length - 1 - i));
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const chartWidth = 280;
  const chartHeight = 180;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  
  const points = chartData.map((v, i) => {
    const x = padding.left + (i / (chartData.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - ((v - min) / range) * plotHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const yLabels = [
    { value: max, label: `${(max / 1000).toFixed(0)}K` },
    { value: (max + min) / 2, label: `${((max + min) / 2000).toFixed(0)}K` },
    { value: min, label: `${(min / 1000).toFixed(0)}K` }
  ];

  const handleMouseEnter = () => {
    setShowPreview(true);
    setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const previewWidth = chartWidth + 32;
        const previewHeight = chartHeight + 80;
        const gap = 8;
        
        // Check vertical space
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const useAbove = spaceBelow < previewHeight + gap && spaceAbove > previewHeight + gap;
        
        // Check horizontal space
        const spaceRight = window.innerWidth - rect.right;
        const useLeft = spaceRight < previewWidth;
        
        // Calculate position
        let top = useAbove ? rect.top - previewHeight - gap : rect.bottom + gap;
        let left = useLeft ? rect.right - previewWidth : rect.right - previewWidth;
        
        // Clamp to viewport
        left = Math.max(gap, Math.min(left, window.innerWidth - previewWidth - gap));
        
        setPositionStyle({ top, left });
      }
    }, 0);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <div className="cursor-pointer">
        <MiniSparkline data={data} color={color} />
      </div>
      
      {showPreview && createPortal(
        <div 
          className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-[100] pointer-events-auto"
          style={{
            width: `${chartWidth + 32}px`,
            minHeight: `${chartHeight + 80}px`,
            position: 'fixed',
            ...positionStyle
          }}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={handleMouseLeave}
        >
          <svg width={chartWidth} height={chartHeight} className="bg-slate-950 rounded-lg overflow-hidden">
            {yLabels.map((_, i) => {
              const y = padding.top + (i / (yLabels.length - 1)) * plotHeight;
              return (
                <line
                  key={`grid-${i}`}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              );
            })}
            
            {yLabels.map((label, i) => (
              <text
                key={`ylabel-${i}`}
                x={padding.left - 8}
                y={padding.top + (i / (yLabels.length - 1)) * plotHeight + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="system-ui"
              >
                {label.label}
              </text>
            ))}
            
            <line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#475569"
              strokeWidth="1"
            />
            
            {dates.map((date, i) => {
              const x = padding.left + (i / (data.length - 1)) * plotWidth;
              return (
                <text
                  key={`xlabel-${i}`}
                  x={x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="system-ui"
                >
                  {date}
                </text>
              );
            })}
            
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
            
            {data.map((v, i) => {
              const x = padding.left + (i / (data.length - 1)) * plotWidth;
              const y = padding.top + plotHeight - ((v - min) / range) * plotHeight;
              return (
                <circle
                  key={`point-${i}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  opacity="0.8"
                />
              );
            })}
          </svg>
          <p className="text-xs text-slate-400 mt-2 text-center">Traffic Trend (SimilarWeb)</p>
        </div>,
        document.body
      )}
    </div>
  );
};

interface RadarTaskAnalysis {
  positioning: string;
  domain: string;
  coreFeatures: string[];
  scenarios: string[];
  discoveryPrompt: string;
}

const RadarView = ({ onTrackSignal, onResearch }: { onTrackSignal: (signal: any) => void; onResearch: (signal: any) => void }) => {
  const [trackingSignal, setTrackingSignal] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<'similarity' | 'newest' | 'oldest' | 'name'>('similarity');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [similarityMin, setSimilarityMin] = useState(60);
  const { toast } = useToast();
  const [activeScope, setActiveScope] = useState<string>('ChampSignal');
  const [scopeStatuses, setScopeStatuses] = useState<Record<string, 'active' | 'paused' | 'stopped'>>({
    'ChampSignal': 'active',
    'OpusClip': 'active'
  });
  const [showScopeActions, setShowScopeActions] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [targetScopes, setTargetScopes] = useState([
    { name: 'ChampSignal', url: 'champsignal.com' },
    { name: 'OpusClip', url: 'opus.pro' }
  ]);
  const [draggedScope, setDraggedScope] = useState<string | null>(null);
  const [editingScopeName, setEditingScopeName] = useState<string | null>(null);
  
  // New Radar Task Modal States
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RadarTaskAnalysis | null>(null);
  const [editableTaskName, setEditableTaskName] = useState('');
  const [editablePrompt, setEditablePrompt] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [updateSuccessState, setUpdateSuccessState] = useState<'idle' | 'adjusting' | 'completed'>('idle');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  
  // Historical Summary States
  const [selectedSummaryDate, setSelectedSummaryDate] = useState<Date>(new Date());
  const [showRadarNotifications, setShowRadarNotifications] = useState(false);
  const [radarNotifyHighPriority, setRadarNotifyHighPriority] = useState(true);
  const [radarNotifyDailyDigest, setRadarNotifyDailyDigest] = useState(true);
  const [radarNotifyEmail, setRadarNotifyEmail] = useState('');
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  
  // Session-based tracking: last radar visit time
  // Use a ref to capture the timestamp ONCE at session start, never re-read during session
  const previousRadarVisitRef = useRef<Date | null>(null);
  const sessionStartTimeRef = useRef<Date>(new Date());
  
  // Initialize previous visit time only once per session
  if (previousRadarVisitRef.current === null && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('competiscope_last_radar_visit');
      previousRadarVisitRef.current = stored ? new Date(stored) : null;
    } catch {
      previousRadarVisitRef.current = null;
    }
  }
  
  const previousRadarVisit = previousRadarVisitRef.current;
  const [showSinceLastVisit, setShowSinceLastVisit] = useState(true);
  
  // Save the session start timestamp ONLY on actual page exit (beforeunload)
  useEffect(() => {
    const saveVisitTimestamp = () => {
      try {
        // Save the session start time as the "last visit" for next session
        localStorage.setItem('competiscope_last_radar_visit', sessionStartTimeRef.current.toISOString());
      } catch {
        // localStorage not available
      }
    };
    
    // Only save on true page exit
    window.addEventListener('beforeunload', saveVisitTimestamp);
    
    return () => {
      window.removeEventListener('beforeunload', saveVisitTimestamp);
    };
  }, []);
  
  // Historical summaries data - dates with available summaries
  const historicalSummaryDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    // Simulate: summaries available for certain days in past 30 days
    [0, 1, 2, 3, 5, 7, 8, 10, 14, 15, 21, 28].forEach(daysAgo => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    });
    return dates;
  }, []);
  
  // Check if a date has summary
  const dateHasSummary = (date: Date) => {
    return historicalSummaryDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  };
  
  // Historical summary data cache - keyed by date string for deterministic results
  const historicalSummaryCache = useMemo(() => {
    const cache: Record<string, { date: string; total: number; high: number; scopeInsights: Array<{ scope: string; products: Array<{ name: string; color: string }>; text: string[] }> }> = {};
    
    // Today's summary
    const today = new Date();
    cache[format(today, 'yyyy-MM-dd')] = {
      date: format(today, 'MMM d'),
      total: 12,
      high: 3,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Figma AI', color: 'text-red-400' }, { name: 'Canva Magic', color: 'text-amber-400' }],
          text: ['Discovered 2 high-similarity competitors: ', 'Figma AI', ' (92% match, collaborative design focus) and ', 'Canva Magic', ' (87% match, AI template generation).']
        },
        { 
          scope: 'OpusClip', 
          products: [{ name: 'Descript', color: 'text-purple-400' }],
          text: ['Found 1 high-similarity competitor: ', 'Descript', ' (89% match, AI-powered video editing with transcript-based workflow).']
        }
      ]
    };
    
    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    cache[format(yesterday, 'yyyy-MM-dd')] = {
      date: format(yesterday, 'MMM d'),
      total: 9,
      high: 2,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Sketch Pro', color: 'text-blue-400' }],
          text: ['Detected 1 emerging competitor: ', 'Sketch Pro', ' (85% match, vector-first design approach with cloud sync).']
        }
      ]
    };
    
    // 2 days ago
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    cache[format(twoDaysAgo, 'yyyy-MM-dd')] = {
      date: format(twoDaysAgo, 'MMM d'),
      total: 11,
      high: 2,
      scopeInsights: [
        { 
          scope: 'OpusClip', 
          products: [{ name: 'CapCut', color: 'text-purple-400' }],
          text: ['Identified ', 'CapCut', ' (93% match, mobile-first short video editor with viral effects library).']
        }
      ]
    };
    
    // 3 days ago
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    cache[format(threeDaysAgo, 'yyyy-MM-dd')] = {
      date: format(threeDaysAgo, 'MMM d'),
      total: 8,
      high: 1,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Miro', color: 'text-amber-400' }],
          text: ['Discovered ', 'Miro', ' (79% match, collaborative whiteboard with design integration).']
        }
      ]
    };
    
    // 5 days ago
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    cache[format(fiveDaysAgo, 'yyyy-MM-dd')] = {
      date: format(fiveDaysAgo, 'MMM d'),
      total: 18,
      high: 4,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Adobe Express', color: 'text-red-400' }, { name: 'Penpot', color: 'text-emerald-400' }],
          text: ['Identified 2 competitors: ', 'Adobe Express', ' (90% match, enterprise integration) and ', 'Penpot', ' (82% match, open-source alternative).']
        },
        { 
          scope: 'OpusClip', 
          products: [{ name: 'Runway', color: 'text-purple-400' }],
          text: ['Discovered ', 'Runway', ' (91% match, AI video generation and editing platform).']
        }
      ]
    };
    
    // 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    cache[format(sevenDaysAgo, 'yyyy-MM-dd')] = {
      date: format(sevenDaysAgo, 'MMM d'),
      total: 22,
      high: 5,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Framer', color: 'text-amber-400' }, { name: 'Webflow', color: 'text-blue-400' }],
          text: ['Key discoveries: ', 'Framer', ' (88% match, code-export) and ', 'Webflow', ' (84% match, no-code website builder).']
        }
      ]
    };
    
    // 8 days ago
    const eightDaysAgo = new Date(today);
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    cache[format(eightDaysAgo, 'yyyy-MM-dd')] = {
      date: format(eightDaysAgo, 'MMM d'),
      total: 14,
      high: 3,
      scopeInsights: [
        { 
          scope: 'OpusClip', 
          products: [{ name: 'InVideo', color: 'text-green-400' }],
          text: ['Found ', 'InVideo', ' (88% match, template-driven video creation platform).']
        }
      ]
    };
    
    // 10 days ago
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    cache[format(tenDaysAgo, 'yyyy-MM-dd')] = {
      date: format(tenDaysAgo, 'MMM d'),
      total: 19,
      high: 4,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Canva', color: 'text-cyan-400' }],
          text: ['Major activity from ', 'Canva', ' (95% match, launched new AI design features).']
        }
      ]
    };
    
    // 14 days ago
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    cache[format(fourteenDaysAgo, 'yyyy-MM-dd')] = {
      date: format(fourteenDaysAgo, 'MMM d'),
      total: 26,
      high: 6,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Figma', color: 'text-red-400' }],
          text: ['High priority: ', 'Figma', ' (96% match, announced major platform update).']
        },
        { 
          scope: 'OpusClip', 
          products: [{ name: 'Kapwing', color: 'text-green-400' }],
          text: ['Detected ', 'Kapwing', ' (86% match, browser-based editing suite expansion).']
        }
      ]
    };
    
    // 15 days ago
    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    cache[format(fifteenDaysAgo, 'yyyy-MM-dd')] = {
      date: format(fifteenDaysAgo, 'MMM d'),
      total: 15,
      high: 3,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Pixlr', color: 'text-pink-400' }],
          text: ['Emerging player: ', 'Pixlr', ' (75% match, AI-powered photo editing suite).']
        }
      ]
    };
    
    // 21 days ago
    const twentyOneDaysAgo = new Date(today);
    twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
    cache[format(twentyOneDaysAgo, 'yyyy-MM-dd')] = {
      date: format(twentyOneDaysAgo, 'MMM d'),
      total: 31,
      high: 7,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Adobe XD', color: 'text-red-400' }, { name: 'Sketch', color: 'text-amber-400' }],
          text: ['Weekly highlights: ', 'Adobe XD', ' (89% match) and ', 'Sketch', ' (87% match) both released updates.']
        }
      ]
    };
    
    // 28 days ago
    const twentyEightDaysAgo = new Date(today);
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    cache[format(twentyEightDaysAgo, 'yyyy-MM-dd')] = {
      date: format(twentyEightDaysAgo, 'MMM d'),
      total: 42,
      high: 9,
      scopeInsights: [
        { 
          scope: 'ChampSignal', 
          products: [{ name: 'Lunacy', color: 'text-cyan-400' }],
          text: ['Month-start summary: ', 'Lunacy', ' (81% match, free alternative to Sketch gaining traction).']
        },
        { 
          scope: 'OpusClip', 
          products: [{ name: 'Lumen5', color: 'text-purple-400' }],
          text: ['Discovered ', 'Lumen5', ' (77% match, AI video creation for marketing).']
        }
      ]
    };
    
    return cache;
  }, []);
  
  // Get historical summary data for a specific date
  const getHistoricalSummaryForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const cached = historicalSummaryCache[dateKey];
    
    if (cached) {
      return cached;
    }
    
    // Fallback for dates not in cache
    return {
      date: format(date, 'MMM d'),
      total: 0,
      high: 0,
      scopeInsights: []
    };
  };
  
  // Generate date strip for last 7 days
  const dateStrip = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days;
  }, []);

  // Auto-transition and hide update success message
  useEffect(() => {
    if (updateSuccessState === 'adjusting') {
      const timer = setTimeout(() => {
        setUpdateSuccessState('completed');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (updateSuccessState === 'completed') {
      const timer = setTimeout(() => {
        setUpdateSuccessState('idle');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccessState]);

  const handleAnalyzeUrl = async () => {
    if (!newTaskUrl.trim()) return;
    
    let urlToAnalyze = newTaskUrl.trim();
    if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
      urlToAnalyze = 'https://' + urlToAnalyze;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    
    try {
      const response = await fetch('/api/analyze-radar-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToAnalyze })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze URL');
      }
      
      const data: RadarTaskAnalysis = await response.json();
      setAnalysisResult(data);
      
      // Extract task name from URL
      try {
        const hostname = new URL(urlToAnalyze).hostname.replace('www.', '');
        const taskName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
        setEditableTaskName(taskName);
      } catch {
        setEditableTaskName('New Task');
      }
      setEditablePrompt(data.discoveryPrompt);
    } catch (error: any) {
      setAnalysisError(error.message || 'Failed to analyze URL');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLaunchTask = () => {
    if (!editableTaskName.trim() || !analysisResult) return;
    
    const newScope = {
      name: editableTaskName.trim(),
      url: newTaskUrl.startsWith('http') ? new URL(newTaskUrl).hostname.replace('www.', '') : newTaskUrl.replace('www.', '')
    };
    
    setTargetScopes(prev => [...prev, newScope]);
    setScopeStatuses(prev => ({ ...prev, [newScope.name]: 'active' }));
    setActiveScope(newScope.name);
    
    // Reset modal state
    setShowNewTaskModal(false);
    setNewTaskUrl('');
    setAnalysisResult(null);
    setEditableTaskName('');
    setEditablePrompt('');
    setAnalysisError(null);
  };

  const handleCloseModal = () => {
    setShowNewTaskModal(false);
    setNewTaskUrl('');
    setAnalysisResult(null);
    setEditableTaskName('');
    setEditablePrompt('');
    setAnalysisError(null);
    setIsAnalyzing(false);
  };

  const handleDragStart = (e: React.DragEvent, scopeName: string) => {
    setDraggedScope(scopeName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetScopeName: string) => {
    e.preventDefault();
    if (!draggedScope || draggedScope === targetScopeName) {
      setDraggedScope(null);
      return;
    }
    
    const draggedIndex = targetScopes.findIndex(s => s.name === draggedScope);
    const targetIndex = targetScopes.findIndex(s => s.name === targetScopeName);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newScopes = [...targetScopes];
      [newScopes[draggedIndex], newScopes[targetIndex]] = [newScopes[targetIndex], newScopes[draggedIndex]];
      setTargetScopes(newScopes);
    }
    setDraggedScope(null);
  };

  const handleDragEnd = () => {
    setDraggedScope(null);
  };

  const handleDeleteScope = (scopeName: string) => {
    const remaining = targetScopes.filter(s => s.name !== scopeName);
    setTargetScopes(remaining);
    setScopeStatuses(prev => {
      const newStatuses = {...prev};
      delete newStatuses[scopeName];
      return newStatuses;
    });
    if (activeScope === scopeName && remaining.length > 0) {
      setActiveScope(remaining[0]?.name || '');
    }
    setShowDeleteConfirm(null);
    setShowScopeActions(null);
  };

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
    .filter(s => s.scope === activeScope)
    .filter(s => !showOnlyFavorites || favorites.includes(s.id))
    .filter(s => s.score >= similarityMin)
    .filter(s => searchQuery === '' || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      // 1. Favorites first (highest priority)
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // 2. New discoveries second (sorted by similarity high to low)
      const aIsNew = a.status === 'new';
      const bIsNew = b.status === 'new';
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      if (aIsNew && bIsNew) return b.score - a.score; // New items sorted by similarity descending
      
      // 3. Then apply the selected sort order for remaining items
      if (sortBy === 'similarity') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') {
        const getDays = (d: string) => {
          if (d.includes('h ago')) return 0;
          if (d === 'Yesterday') return 1;
          const match = d.match(/(\d+) day/);
          if (match) return parseInt(match[1]);
          if (d === '1 week ago') return 7;
          return 999;
        };
        return getDays(a.date) - getDays(b.date);
      }
      if (sortBy === 'oldest') {
        const getDays = (d: string) => {
          if (d.includes('h ago')) return 0;
          if (d === 'Yesterday') return 1;
          const match = d.match(/(\d+) day/);
          if (match) return parseInt(match[1]);
          if (d === '1 week ago') return 7;
          return 999;
        };
        return getDays(b.date) - getDays(a.date);
      }
      return 0;
    });

  const stats = {
    newDiscoveries: allSignals.filter(s => s.scope === activeScope && s.status === 'new').length,
    highPriority: allSignals.filter(s => s.scope === activeScope && s.score >= 90).length,
    totalMonitored: allSignals.filter(s => s.scope === activeScope).length,
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

      <Dialog open={!!editingScopeName} onOpenChange={(open) => !open && setEditingScopeName(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-white text-lg">Configure Scope: {editingScopeName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TargetIcon size={16} className="text-brand-400" />
                <h4 className="text-sm font-bold text-white">Scope Configuration</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Positioning</p>
                  <p className="text-sm text-slate-300">Leading AI-powered competitive intelligence platform for market discovery and signal tracking across multiple dimensions.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Scope Name</label>
                <input
                  type="text"
                  defaultValue={editingScopeName || ''}
                  placeholder="Scope name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                  data-testid="input-scope-name"
                />
              </div>

              <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 ring-1 ring-brand-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-brand-400" />
                    <span className="text-sm font-bold text-brand-400">Push Notifications</span>
                  </div>
                  <div className="w-8 h-4 bg-brand-500 rounded-full relative cursor-pointer border border-brand-500/30">
                    <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-brand-500/30 bg-slate-800 text-brand-500 focus:ring-brand-500" />
                    <span className="text-[11px] text-slate-300 font-medium">Instant alerts for High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-brand-500/30 bg-slate-800 text-brand-500 focus:ring-brand-500" />
                    <span className="text-[11px] text-slate-300 font-medium">Daily discovery digest</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  <Bot size={14} className="text-brand-400" />
                  Discovery Prompt
                  <span className="text-xs text-slate-500 font-normal">(Editable)</span>
                </span>
              </label>
              <textarea
                defaultValue="Find competitors and similar finds in the competitive intelligence space. Focus on companies offering market discovery, signal tracking, and competitive analysis. Include both direct competitors and adjacent solutions."
                rows={4}
                placeholder="Discovery prompt..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all resize-none"
                data-testid="textarea-scope-prompt"
              />
              <p className="mt-1.5 text-xs text-slate-500">This prompt guides the AI in discovering related competitors and market signals.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setEditingScopeName(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setUpdateSuccessState('adjusting');
                setTimeout(() => {
                  setEditingScopeName(null);
                }, 300);
              }}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all flex items-center gap-2"
            >
              <Check size={16} />
              Update Task
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {updateSuccessState !== 'idle' && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 transition-all duration-300 opacity-100 animate-in fade-in">
            {updateSuccessState === 'adjusting' ? (
              <>
                <div className="relative w-16 h-16">
                  {/* Radar base */}
                  <div className="absolute inset-0 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                    {/* Rotating radar */}
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-brand-500 border-r-brand-500 animate-spin" />
                    {/* Center dot */}
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">Adjusting Discovery Strategy</p>
                  <p className="text-sm text-slate-400">Radar is recalibrating for optimal signal tracking</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-16 h-16">
                  {/* Radar base */}
                  <div className="absolute inset-0 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                    {/* Static radar in new direction */}
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-brand-500 border-l-brand-500" />
                    {/* Center dot */}
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">Strategy Adjustment Complete</p>
                  <p className="text-sm text-slate-400">Radar repositioned for enhanced tracking</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Radar className="text-brand-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Market Radar</h2>
            <p className="text-sm text-slate-400">Active surveillance across <span className="text-white font-medium">{targetScopes.length} Task scopes</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showRadarNotifications} onOpenChange={setShowRadarNotifications}>
            <DialogTrigger asChild>
              <button 
                onClick={() => setShowRadarNotifications(true)}
                className="px-3 py-1.5 text-[11px] font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 flex items-center gap-1.5"
                data-testid="button-radar-notifications"
              >
                <Bell size={12} />
                <span className="font-medium">Notifications configure</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#020617] border-slate-800 text-white max-w-xl p-0 overflow-hidden">
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                    <Globe className="text-brand-500" size={32} />
                  </div>
                </div>

                <div className="text-center mb-10">
                  <DialogTitle className="text-2xl font-bold text-white mb-2">Radar Configuration</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Update discovery notifications and tracking settings
                  </DialogDescription>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-200">Notification Email</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type="email"
                          value={radarNotifyEmail}
                          onChange={(e) => setRadarNotifyEmail(e.target.value)}
                          placeholder="Enter email address..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
                        />
                      </div>
                      <button className="px-6 py-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-sm rounded-xl hover:bg-brand-500/20 transition-all flex items-center gap-2">
                        <Mail size={16} /> Send Verification
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">We will send a verification link to confirm your email address.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-200">Notification Frequency</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setRadarNotifyDailyDigest(true)}
                        className={`py-3 rounded-xl border font-bold text-sm transition-all ${radarNotifyDailyDigest ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        Daily
                      </button>
                      <button 
                        onClick={() => setRadarNotifyDailyDigest(false)}
                        className={`py-3 rounded-xl border font-bold text-sm transition-all ${!radarNotifyDailyDigest ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        Weekly
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Time</label>
                        <div className="relative group">
                          <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                            <option>09:00</option>
                            <option>12:00</option>
                            <option>18:00</option>
                            <option>21:00</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Timezone</label>
                        <div className="relative group">
                          <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                            <option>UTC</option>
                            <option>EST</option>
                            <option>PST</option>
                            <option>CST</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Clock size={12} />
                      <span>You'll receive daily signal summaries at 09:00 (UTC)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-12">
                  <button
                    onClick={() => setShowRadarNotifications(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast({
                        title: "Radar settings updated",
                        description: "Your notification preferences have been saved.",
                      });
                      setShowRadarNotifications(false);
                    }}
                    className="flex-2 px-8 py-3 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Save Changes
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Intelligence Summary - Rolling View */}
      <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl mb-6 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-800/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Radar size={14} className="text-brand-400" />
              <span className="text-xs font-bold text-white">Radar Summary</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-icon-active" />
                <span className="text-[8px] font-medium text-emerald-400">Monitoring</span>
              </div>
            </div>
            
            {/* Week Stats Summary - Limited to last 7 days */}
            <div className="flex items-center gap-3">
              {(() => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentEntries = Object.entries(historicalSummaryCache).filter(([dateKey]) => {
                  return new Date(dateKey) >= sevenDaysAgo;
                });
                const weekTotal = recentEntries.reduce((sum, [, s]) => sum + s.total, 0);
                const weekHigh = recentEntries.reduce((sum, [, s]) => sum + s.high, 0);
                const activeDays = recentEntries.length;
                return (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white">{weekTotal}</span>
                      <span className="text-[9px] text-slate-500">discoveries</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-amber-400">{weekHigh}</span>
                      <span className="text-[9px] text-slate-500">high priority</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[9px] text-slate-500">past</span>
                      <span className="text-sm font-bold text-slate-300">{activeDays}</span>
                      <span className="text-[9px] text-slate-500">days</span>
                    </div>
                  </>
                );
              })()}
              
              {/* Calendar Popover for browsing specific dates */}
              <Popover open={showCalendarPopover} onOpenChange={setShowCalendarPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                    data-testid="button-open-calendar"
                  >
                    <Calendar size={14} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedSummaryDate}
                    onSelect={(date) => {
                      if (date && dateHasSummary(date)) {
                        setSelectedSummaryDate(date);
                        setShowSinceLastVisit(false);
                        setShowCalendarPopover(false);
                      }
                    }}
                    disabled={(date) => !dateHasSummary(date)}
                    modifiers={{
                      hasSummary: historicalSummaryDates
                    }}
                    modifiersStyles={{
                      hasSummary: { 
                        position: 'relative'
                      }
                    }}
                    components={{
                      DayContent: ({ date }) => {
                        const hasSummaryDot = dateHasSummary(date);
                        return (
                          <div className="relative flex items-center justify-center w-full h-full">
                            {date.getDate()}
                            {hasSummaryDot && (
                              <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-500" />
                            )}
                          </div>
                        );
                      }
                    }}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        {/* Latest Discoveries - Session-aware Rolling View */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {/* View Toggle: Since Last Visit vs All Recent */}
            <div className="flex items-center gap-2">
              {previousRadarVisit && (
                <>
                  <button
                    onClick={() => setShowSinceLastVisit(true)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                      showSinceLastVisit 
                        ? 'bg-brand-500/20 text-brand-400' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    data-testid="button-since-last-visit"
                  >
                    Since Last Visit
                  </button>
                  <span className="text-slate-700">|</span>
                </>
              )}
              <button
                onClick={() => setShowSinceLastVisit(false)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                  !showSinceLastVisit || !previousRadarVisit
                    ? 'bg-brand-500/20 text-brand-400' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                data-testid="button-all-recent"
              >
                All Recent
              </button>
            </div>
            {/* Date Strip - Secondary Navigation */}
            <div className="flex items-center gap-0.5">
              {dateStrip.slice(0, 5).map((date, idx) => {
                const isToday = idx === 0;
                const hasSummary = dateHasSummary(date);
                const isSelected = selectedSummaryDate.getFullYear() === date.getFullYear() &&
                                   selectedSummaryDate.getMonth() === date.getMonth() &&
                                   selectedSummaryDate.getDate() === date.getDate();
                const dayNum = format(date, 'd');
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (hasSummary) {
                        setSelectedSummaryDate(date);
                        setShowSinceLastVisit(false);
                      }
                    }}
                    disabled={!hasSummary}
                    className={`flex flex-col items-center px-1.5 py-0.5 rounded transition-all relative ${
                      isSelected && !showSinceLastVisit
                        ? 'bg-brand-500/20' 
                        : hasSummary 
                          ? 'hover:bg-slate-800/50' 
                          : 'opacity-30 cursor-not-allowed'
                    }`}
                    data-testid={`date-nav-${format(date, 'yyyy-MM-dd')}`}
                  >
                    <span className={`text-[8px] ${isSelected && !showSinceLastVisit ? 'text-brand-400' : 'text-slate-600'}`}>
                      {isToday ? 'Today' : format(date, 'EEE')}
                    </span>
                    <span className={`text-[10px] font-bold ${isSelected && !showSinceLastVisit ? 'text-white' : hasSummary ? 'text-slate-400' : 'text-slate-700'}`}>
                      {dayNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Show insights based on view mode */}
          {(() => {
            // Mode 1: Since Last Visit - show discoveries since user's last radar visit
            if (showSinceLastVisit && previousRadarVisit) {
              const sinceLastVisitInsights = Object.entries(historicalSummaryCache)
                .filter(([dateKey]) => {
                  const d = new Date(dateKey);
                  return d > previousRadarVisit;
                })
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .flatMap(([dateKey, summary]) => 
                  summary.scopeInsights.map(insight => ({
                    ...insight,
                    date: dateKey,
                    total: summary.total,
                    isToday: new Date().toDateString() === new Date(dateKey).toDateString()
                  }))
                );
              
              const daysSinceLastVisit = Math.floor((new Date().getTime() - previousRadarVisit.getTime()) / (1000 * 60 * 60 * 24));
              const totalNewDiscoveries = sinceLastVisitInsights.reduce((sum, i, idx, arr) => {
                const prevDate = idx > 0 ? arr[idx - 1].date : null;
                if (prevDate !== i.date) {
                  return sum + i.total;
                }
                return sum;
              }, 0);
              
              // If no new discoveries since last visit, fall back to showing the most recent summary
              if (sinceLastVisitInsights.length === 0) {
                // Find the most recent summary with content
                const sortedSummaries = Object.entries(historicalSummaryCache)
                  .filter(([, summary]) => summary.scopeInsights.length > 0)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
                
                if (sortedSummaries.length > 0) {
                  const [latestDateKey, latestSummary] = sortedSummaries[0];
                  const latestDate = new Date(latestDateKey);
                  const isToday = new Date().toDateString() === latestDate.toDateString();
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/30">
                        <Clock size={12} className="text-slate-500" />
                        <span className="text-[9px] text-slate-400">
                          No new updates since {format(previousRadarVisit, 'MMM d, h:mm a')}
                        </span>
                        <span className="text-[8px] text-slate-600 ml-auto">
                          Showing latest: {isToday ? 'Today' : format(latestDate, 'MMM d')}
                        </span>
                      </div>
                      {latestSummary.scopeInsights.map((insight, idx) => (
                        <div key={idx} className="pt-2 border-t border-slate-800/30 first:border-t-0 first:pt-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TargetIcon size={9} className="text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-400">{insight.scope}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {insight.text.map((part, partIdx) => {
                              const matchedProduct = insight.products.find(p => p.name === part);
                              if (matchedProduct) {
                                return <span key={partIdx} className={`font-bold ${matchedProduct.color}`}>{part}</span>;
                              }
                              return <span key={partIdx}>{part}</span>;
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/30">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-brand-400" />
                      <span className="text-[9px] text-slate-400">
                        {daysSinceLastVisit === 0 
                          ? 'Since earlier today' 
                          : daysSinceLastVisit === 1 
                            ? 'Since yesterday' 
                            : `Past ${daysSinceLastVisit} days`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-brand-400">{sinceLastVisitInsights.length}</span>
                      <span className="text-[9px] text-slate-500">new insights</span>
                    </div>
                  </div>
                  {sinceLastVisitInsights.slice(0, 5).map((insight, idx) => (
                    <div key={idx} className="pt-2 border-t border-slate-800/30 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TargetIcon size={9} className="text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-400">{insight.scope}</span>
                        <span className="text-[8px] text-slate-600">-</span>
                        <span className="text-[8px] text-slate-500">
                          {insight.isToday ? 'Today' : format(new Date(insight.date), 'MMM d')}
                        </span>
                        <Badge variant="outline" className="text-[7px] px-1 py-0 border-brand-500/30 text-brand-400 ml-auto">
                          NEW
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {insight.text.map((part, partIdx) => {
                          const matchedProduct = insight.products.find(p => p.name === part);
                          if (matchedProduct) {
                            return <span key={partIdx} className={`font-bold ${matchedProduct.color}`}>{part}</span>;
                          }
                          return <span key={partIdx}>{part}</span>;
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              );
            }
            
            // Mode 2: Specific date selected
            const selectedDateKey = format(selectedSummaryDate, 'yyyy-MM-dd');
            const selectedDaySummary = historicalSummaryCache[selectedDateKey];
            const isShowingSpecificDate = selectedDaySummary && selectedDaySummary.scopeInsights.length > 0 && !showSinceLastVisit;
            
            if (isShowingSpecificDate) {
              const isToday = new Date().toDateString() === selectedSummaryDate.toDateString();
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] text-slate-500">
                      {isToday ? 'Today' : format(selectedSummaryDate, 'EEEE, MMM d')}
                    </span>
                    <span className="text-[9px] text-slate-600">-</span>
                    <span className="text-[9px] text-white font-medium">{selectedDaySummary.total} discoveries</span>
                  </div>
                  {selectedDaySummary.scopeInsights.map((insight, idx) => (
                    <div key={idx} className="pt-2 border-t border-slate-800/30 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TargetIcon size={9} className="text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-400">{insight.scope}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {insight.text.map((part, partIdx) => {
                          const matchedProduct = insight.products.find(p => p.name === part);
                          if (matchedProduct) {
                            return <span key={partIdx} className={`font-bold ${matchedProduct.color}`}>{part}</span>;
                          }
                          return <span key={partIdx}>{part}</span>;
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              );
            }
            
            // Mode 3: All recent (rolling 7-day view)
            const allInsights = Object.entries(historicalSummaryCache)
              .filter(([dateKey]) => {
                const d = new Date(dateKey);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return d >= sevenDaysAgo;
              })
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .flatMap(([dateKey, summary]) => 
                summary.scopeInsights.map(insight => ({
                  ...insight,
                  date: dateKey,
                  isToday: new Date().toDateString() === new Date(dateKey).toDateString()
                }))
              )
              .slice(0, 5);
            
            if (allInsights.length === 0) {
              return (
                <div className="text-center py-4">
                  <p className="text-[10px] text-slate-500">Radar is actively scanning. Discoveries will appear here.</p>
                </div>
              );
            }
            
            return (
              <div className="space-y-2">
                {allInsights.map((insight, idx) => (
                  <div key={idx} className="pt-2 border-t border-slate-800/30 first:border-t-0 first:pt-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TargetIcon size={9} className="text-slate-500" />
                      <span className="text-[9px] font-bold text-slate-400">{insight.scope}</span>
                      <span className="text-[8px] text-slate-600">-</span>
                      <span className="text-[8px] text-slate-500">
                        {insight.isToday ? 'Today' : format(new Date(insight.date), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {insight.text.map((part, partIdx) => {
                        const matchedProduct = insight.products.find(p => p.name === part);
                        if (matchedProduct) {
                          return <span key={partIdx} className={`font-bold ${matchedProduct.color}`}>{part}</span>;
                        }
                        return <span key={partIdx}>{part}</span>;
                      })}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          {targetScopes.map((scope) => (
            <div key={scope.name} className="relative">
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, scope.name)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, scope.name)}
                onDragEnd={handleDragEnd}
                className={`flex items-center rounded-xl border transition-all cursor-move ${
                  draggedScope === scope.name 
                    ? 'opacity-50 scale-95' 
                    : ''
                } ${
                  activeScope === scope.name
                    ? 'bg-brand-500/10 border-brand-500/50'
                    : 'bg-slate-900/40 border-slate-800/50'
                }`}
              >
                <button
                  onClick={() => setActiveScope(scope.name)}
                  className={`px-4 py-2 rounded-l-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    activeScope === scope.name
                      ? 'text-brand-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid={`tab-scope-${scope.name}`}
                >
                  {scope.name}
                  {scopeStatuses[scope.name] === 'active' && (
                    <Activity size={14} className="status-icon-active text-brand-400" data-testid={`status-icon-active-${scope.name}`} />
                  )}
                  {scopeStatuses[scope.name] === 'paused' && (
                    <Pause size={14} className="text-yellow-400" data-testid={`status-icon-paused-${scope.name}`} />
                  )}
                  {scopeStatuses[scope.name] === 'stopped' && (
                    <Square size={14} className="text-red-400" data-testid={`status-icon-stopped-${scope.name}`} />
                  )}
                </button>
                <button 
                  onClick={() => setShowScopeActions(showScopeActions === scope.name ? null : scope.name)}
                  className={`px-2 py-2 rounded-r-xl border-l transition-all ${
                    activeScope === scope.name
                      ? 'border-brand-500/30 text-brand-400 hover:bg-brand-500/20'
                      : 'border-slate-700/50 text-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                  data-testid={`button-scope-actions-${scope.name}`}
                  title={`Actions for ${scope.name}`}
                >
                  <MoreVertical size={14} />
                </button>
              </div>
              
              {showScopeActions === scope.name && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">{scope.name}</p>
                  </div>
                  <div className="p-1">
                    <button 
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                      data-testid={`action-pause-${scope.name}`}
                      onClick={() => {
                        setScopeStatuses(prev => ({...prev, [scope.name]: prev[scope.name] === 'paused' ? 'active' : 'paused'}));
                        setShowScopeActions(null);
                      }}
                    >
                      <Pause size={14} className="text-yellow-400" />
                      {scopeStatuses[scope.name] === 'paused' ? 'Resume' : 'Pause'}
                    </button>
                    <button 
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                      data-testid={`action-stop-${scope.name}`}
                      onClick={() => {
                        setScopeStatuses(prev => ({...prev, [scope.name]: prev[scope.name] === 'stopped' ? 'active' : 'stopped'}));
                        setShowScopeActions(null);
                      }}
                    >
                      <Square size={14} className="text-orange-400" />
                      {scopeStatuses[scope.name] === 'stopped' ? 'Restart' : 'Stop'}
                    </button>
                  </div>
                  <div className="border-t border-slate-800 p-1">
                    <button 
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                      data-testid={`action-delete-${scope.name}`}
                      onClick={() => {
                        setShowDeleteConfirm(scope.name);
                        setShowScopeActions(null);
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Scope
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setShowNewTaskModal(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          data-testid="button-add-scope"
          title="New Radar Task"
        >
          <Plus size={18} />
        </button>
      </div>

      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={handleCloseModal}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                  <Radar className="text-brand-500" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">New Radar Task</h3>
                  <p className="text-xs text-slate-400">AI-powered competitor discovery setup</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                data-testid="button-close-new-task-modal"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Website URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      value={newTaskUrl}
                      onChange={(e) => setNewTaskUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeUrl()}
                      placeholder="e.g., figma.com or https://figma.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                      data-testid="input-new-task-url"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={!newTaskUrl.trim() || isAnalyzing}
                    className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-all flex items-center gap-2"
                    data-testid="button-analyze-url"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
                {analysisError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {analysisError}
                  </p>
                )}
              </div>

              {isAnalyzing && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                  <Loader2 size={32} className="animate-spin text-brand-500 mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">Analyzing Website</p>
                  <p className="text-sm text-slate-400">AI is extracting positioning, features, and generating discovery prompts...</p>
                </div>
              )}

              {analysisResult && !isAnalyzing && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TargetIcon size={16} className="text-brand-400" />
                      <h4 className="text-sm font-bold text-white">AI Analysis Results</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Positioning</p>
                        <p className="text-sm text-slate-300">{analysisResult.positioning}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Task Name</label>
                    <input
                      type="text"
                      value={editableTaskName}
                      onChange={(e) => setEditableTaskName(e.target.value)}
                      placeholder="Enter task name"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                      data-testid="input-task-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Bot size={14} className="text-brand-400" />
                        AI Discovery Prompt
                        <span className="text-xs text-slate-500 font-normal">(Editable)</span>
                      </span>
                    </label>
                    <textarea
                      value={editablePrompt}
                      onChange={(e) => setEditablePrompt(e.target.value)}
                      rows={4}
                      placeholder="Discovery prompt for finding competitors..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all resize-none"
                      data-testid="textarea-discovery-prompt"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">This prompt will be used to discover similar finds and competitors.</p>
                  </div>
                </div>
              )}
            </div>

            {analysisResult && !isAnalyzing && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                  data-testid="button-cancel-new-task"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunchTask}
                  disabled={!editableTaskName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold transition-all flex items-center gap-2"
                  data-testid="button-launch-task"
                >
                  <Rocket size={16} />
                  Launch Radar Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Delete "{showDeleteConfirm}"?</h3>
              <p className="text-sm text-slate-400 text-center mb-4">
                This action cannot be undone. All radar data for this scope will be permanently deleted and cannot be recovered.
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                <p className="text-xs text-red-400 text-center font-medium">
                  Warning: All tracked competitors, signals, and research data will be lost.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteScope(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
                  data-testid="button-confirm-delete"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <p className="text-xs text-slate-400">High Similarity</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Zap className="text-red-500" size={20} />
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{stats.totalMonitored}</p>
            <p className="text-xs text-slate-400">Alternatives</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Eye className="text-blue-500" size={20} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 py-3 border-y border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sort:</span>
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 h-8">
              <button 
                onClick={() => setSortBy('similarity')}
                className={`px-3 h-full text-[10px] font-bold uppercase tracking-wider rounded transition-all ${sortBy === 'similarity' ? 'bg-slate-800 text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
                data-testid="sort-similarity"
              >
                Similarity
              </button>
              <button 
                onClick={() => setSortBy('newest')}
                className={`px-3 h-full text-[10px] font-bold uppercase tracking-wider rounded transition-all ${sortBy === 'newest' ? 'bg-slate-800 text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
                data-testid="sort-newest"
              >
                Newest
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Filter:</span>
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-2 px-3 h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${showOnlyFavorites ? 'bg-brand-500/10 border-brand-500/50 text-brand-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
              data-testid="filter-favorites"
            >
              <Star size={12} className={showOnlyFavorites ? 'fill-brand-400' : ''} />
              Favorites Only
            </button>
          </div>
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
            placeholder="Search alternatives, features..."
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
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alternatives</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Similarity</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Key Features</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discovered</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Traffic Trend</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Traffic Volume</th>
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
                    <button
                      onClick={() => {
                        if (favorites.includes(signal.id)) {
                          setFavorites(favorites.filter(id => id !== signal.id));
                        } else {
                          setFavorites([...favorites, signal.id]);
                        }
                      }}
                      className={`transition-colors ${favorites.includes(signal.id) ? 'text-amber-400 hover:text-amber-300' : 'text-slate-600 hover:text-slate-400'}`}
                      data-testid={`button-favorite-${signal.id}`}
                    >
                      <Star size={16} className={favorites.includes(signal.id) ? 'fill-amber-400' : ''} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="p-1 text-slate-600 hover:text-slate-400 transition-colors rounded hover:bg-slate-800/50"
                            data-testid={`button-signal-menu-${signal.id}`}
                          >
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-slate-900 border-slate-800 text-slate-300">
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 text-red-400 focus:text-red-400"
                            onClick={() => {
                              // Remove signal from filteredSignals by filtering it out
                              const updatedSignals = allSignals.filter(s => s.id !== signal.id);
                              // Since we can't directly modify filteredSignals, we use state or callback
                              // For now, we'll just show a toast or visual feedback
                              setFavorites(favorites.filter(id => id !== signal.id));
                            }}
                            data-testid={`button-delete-signal-${signal.id}`}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-700 overflow-hidden shrink-0">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${signal.website}&sz=128`} 
                          alt={signal.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{signal.name}</p>
                        <URLPreview url={signal.website} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <SimilarityRing value={signal.score} />
                    </div>
                  </td>
                  <td className="px-4 py-3 group/desc relative">
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-[200px]">
                      {signal.features.join(', ')}
                    </p>
                    <div className="absolute left-4 top-0 -translate-y-full mb-2 hidden group-hover/desc:block z-[60] pointer-events-none">
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-2xl max-w-xs animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-xs text-white leading-relaxed">
                          {signal.features.join(', ')}
                        </p>
                      </div>
                    </div>
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
                    <TrafficChartPreview 
                      data={signal.trafficData} 
                      color={signal.trafficData[signal.trafficData.length - 1] > signal.trafficData[0] ? '#14b8a6' : '#ef4444'} 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      {(signal.trafficData[signal.trafficData.length - 1] / 1000).toFixed(1)}K
                    </div>
                    <p className="text-xs text-slate-500">Last month</p>
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
            {scopeStatuses[activeScope] === 'active' ? (
              <>
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                    <Radar className="text-brand-400 animate-spin" size={28} />
                  </div>
                </div>
                <p className="text-white font-semibold mb-1">Discovering Similar Finds</p>
                <p className="text-sm text-slate-400 mb-3">Our AI is continuously scanning the market for competitors and alternatives</p>
                <p className="text-xs text-slate-500">You can safely leave this page • Results will be notified to you</p>
              </>
            ) : (
              <>
                <Search className="mx-auto text-slate-600 mb-3" size={32} />
                <p className="text-slate-400">No finds match your filters</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
              </>
            )}
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredSignals.length} of {allSignals.length} alternatives</span>
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
  dimension?: string;
}

const TargetsView = ({ targets, selectedTargetId, setSelectedTargetId, onAddTarget, onTrackResearch, runningResearchTasks, setRunningResearchTasks, onResearchPrompt }: {
  targets: Target[];
  selectedTargetId: number | null;
  setSelectedTargetId: (id: number | null) => void;
  onAddTarget: (name: string, url: string) => void;
  onTrackResearch: (targetName: string) => void;
  runningResearchTasks: number;
  setRunningResearchTasks: (count: number | ((prev: number) => number)) => void;
  onResearchPrompt: (prompt: string) => void;
}) => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [editTargetName, setEditTargetName] = useState('');
  const [editTargetUrl, setEditTargetUrl] = useState('');
  const [trackerOrder, setTrackerOrder] = useState<string[]>(['website', 'backlinks', 'seo', 'social', 'news', 'ads', 'talent']);
  const [draggedTracker, setDraggedTracker] = useState<string | null>(null);
  const [showFullFeed, setShowFullFeed] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'website' | 'backlinks' | 'seo' | 'social' | 'news' | 'ads' | 'talent' | 'favorites'>('all');
  const [summaryFrequency, setSummaryFrequency] = useState<'daily' | 'weekly'>('daily');
  
  const getPeriodLabel = () => {
    const now = new Date();
    if (summaryFrequency === 'daily') {
      return format(now, 'MMM d, yyyy');
    } else {
      const month = format(now, 'MMMM');
      const day = now.getDate();
      const weekNum = Math.ceil(day / 7);
      const weekSuffix = ['st', 'nd', 'rd', 'th'][Math.min(weekNum - 1, 3)];
      return `${month}, Week ${weekNum}${weekSuffix}`;
    }
  };

  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const [signalFavorites, setSignalFavorites] = useState<number[]>([]);
  const [readSummaries, setReadSummaries] = useState<string[]>([]);
  const [savedSummaries, setSavedSummaries] = useState<string[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'unread' | 'saved'>('all');
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightContent, setInsightContent] = useState('');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [activeTrackerType, setActiveTrackerType] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [isAddingTarget, setIsAddingTarget] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTrackers, setNewTaskTrackers] = useState(['website', 'backlinks', 'seo']);
  const [createTabError, setCreateTabError] = useState<string | null>(null);
  
  // Email notification state for Create dialog
  const [createFormTab, setCreateFormTab] = useState<'basic' | 'notifications'>('basic');
  const [newNotificationEmail, setNewNotificationEmail] = useState('');
  const [emailSendStatus, setEmailSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [newFrequencyType, setNewFrequencyType] = useState<'daily' | 'weekly'>('daily');
  const [newDailyTime, setNewDailyTime] = useState('09:00');
  const [newWeeklyDay, setNewWeeklyDay] = useState('monday');
  const [newWeeklyTime, setNewWeeklyTime] = useState('09:00');
  const [newTimezone, setNewTimezone] = useState('UTC');
  
  // Email notification state for Edit dialog
  const [editFormTab, setEditFormTab] = useState<'basic' | 'notifications'>('basic');
  const [editTabError, setEditTabError] = useState<string | null>(null);
  const [editNotificationEmail, setEditNotificationEmail] = useState('');
  const [editEmailSendStatus, setEditEmailSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [editEmailVerificationStatus, setEditEmailVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [editFrequencyType, setEditFrequencyType] = useState<'daily' | 'weekly'>('daily');
  const [editDailyTime, setEditDailyTime] = useState('09:00');
  const [editWeeklyDay, setEditWeeklyDay] = useState('monday');
  const [editWeeklyTime, setEditWeeklyTime] = useState('09:00');
  const [editTimezone, setEditTimezone] = useState('UTC');

  useEffect(() => {
    if (createTabError) {
      const timer = setTimeout(() => setCreateTabError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [createTabError]);

  useEffect(() => {
    if (editTabError) {
      const timer = setTimeout(() => setEditTabError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [editTabError]);

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
  
  // Research feature states
  const [researchPromptSignal, setResearchPromptSignal] = useState<Signal | null>(null);
  const [researchPrompt, setResearchPrompt] = useState('');
  const [researchingSignals, setResearchingSignals] = useState<Set<number>>(new Set());
  const [activeResearchTasks, setActiveResearchTasks] = useState<Array<{signalId: number; prompt: string; status: 'running' | 'completed'}>>([]);

  const selectedTarget = targets.find((t) => t.id === selectedTargetId) || targets[0];
  const targetDomain = selectedTarget ? new URL(selectedTarget.url).hostname.replace('www.', '') : '';

  const targetSignals = signalsData.filter(s => s.domain === targetDomain);

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

  // Demo data for tracker card signals
  const trackerSignalsData: Record<string, Signal> = {
    // Website tracker signals
    'web-1': { id: 101, type: 'product', category: 'Pricing Page Update', time: '2 hours ago', content: 'Pricing tiers restructured with new enterprise and startup plans.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}/pricing` },
    'web-2': { id: 102, type: 'product', category: 'Feature Launch', time: '3 hours ago', content: 'AI-Powered Editing: 3 new AI features added to the design suite.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}/features` },
    'web-3': { id: 103, type: 'product', category: 'Solutions Page', time: '5 hours ago', content: 'Launched vertical-specific solution pages for Fintech and Healthcare.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: `https://${targetDomain}/solutions` },
    'web-4': { id: 104, type: 'product', category: 'Policy Update', time: 'Yesterday', content: 'Minor updates to compliance documentation and cookie consent.', domain: targetDomain, color: 'text-slate-400', bgColor: 'bg-slate-500', value: 'low', sourceUrl: `https://${targetDomain}/privacy` },
    'web-5': { id: 105, type: 'marketing', category: 'Blog Content', time: '2 days ago', content: 'Published a comprehensive guide on ethical AI implementation in design.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: `https://${targetDomain}/blog` },
    'web-6': { id: 106, type: 'hiring', category: 'Careers', time: '3 days ago', content: 'Significant expansion in the engineering and product teams announced with 15 new openings.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: `https://${targetDomain}/careers` },
    // Backlinks tracker signals
    'backlink-1': { id: 201, type: 'marketing', category: 'New Backlink', time: '6 hours ago', content: 'High-authority tech blog linked to product page from TechReview.io.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://techreview.io/best-design-tools' },
    'backlink-2': { id: 202, type: 'marketing', category: 'Lost Backlink', time: 'Yesterday', content: 'Previous link from Forbes Tech "Top SaaS Trends" article was removed or changed.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://forbes.com/saas-trends' },
    'backlink-3': { id: 203, type: 'marketing', category: 'Competitor Comparison', time: '2 days ago', content: 'Linked in a new "Best AI Tools of 2024" comparison list.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://besttools2024.com/ai-tools' },
    'backlink-4': { id: 204, type: 'marketing', category: 'Review Spike', time: '4 days ago', content: 'Received 25+ new 5-star reviews on G2 following the recent update.', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: 'https://g2.com/products/reviews' },
    // SEO tracker signals
    'seo-1': { id: 301, type: 'product', category: 'Ranking Change', time: '1 hour ago', content: 'Main competitor jumped to #1 for "AI Design Tools" keyword.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: `https://${targetDomain}` },
    'seo-2': { id: 302, type: 'product', category: 'New Pages', time: '3 hours ago', content: 'Added 12 new documentation pages for specialized API integrations.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: `https://${targetDomain}/docs` },
    'seo-3': { id: 303, type: 'product', category: 'Performance', time: 'Yesterday', content: 'Homepage load time reduced by 40% globally.', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: `https://${targetDomain}` },
    'seo-4': { id: 304, type: 'product', category: 'Featured Snippet', time: '3 days ago', content: 'Successfully captured the featured snippet for "SaaS SEO automation".', domain: targetDomain, color: 'text-emerald-400', bgColor: 'bg-emerald-500', value: 'high', sourceUrl: `https://${targetDomain}/seo` },
    // Social tracker signals
    'social-1': { id: 401, type: 'marketing', category: 'Viral Content', time: '1 hour ago', content: 'A user\'s review of their new collaborative features is trending on X.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://x.com/trending' },
    'social-2': { id: 402, type: 'marketing', category: 'Influencer Review', time: '5 hours ago', content: 'Popular tech influencer published a comparison video on YouTube.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://youtube.com/watch' },
    'social-3': { id: 403, type: 'product', category: 'Product Launch', time: '2 days ago', content: 'Competitor\'s new "Pro+" mobile app launched on Product Hunt.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://producthunt.com/posts' },
    'social-4': { id: 404, type: 'marketing', category: 'Campaign', time: '1 week ago', content: 'New aesthetic design showcase campaign targeting Gen Z designers on Instagram.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://instagram.com/campaign' },
    // News tracker signals
    'news-1': { id: 501, type: 'marketing', category: 'TechCrunch Feature', time: '4 hours ago', content: 'Comprehensive deep-dive article on their recent $50M series B funding.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://techcrunch.com/funding' },
    'news-2': { id: 502, type: 'marketing', category: 'Forbes Listing', time: 'Yesterday', content: 'Named in the "Top 50 AI Startups to Watch" list.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://forbes.com/ai-startups' },
    'news-3': { id: 503, type: 'marketing', category: 'Wired Analysis', time: '3 days ago', content: 'Wired discusses the implications of their new AI-driven design engine.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://wired.com/ai-design' },
    // Ads tracker signals
    'ads-1': { id: 601, type: 'marketing', category: 'LinkedIn Campaign', time: '2 days ago', content: 'Targeting decision makers at mid-market design agencies with "Free Enterprise Trial".', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://linkedin.com/ads' },
    'ads-2': { id: 602, type: 'marketing', category: 'Facebook Retargeting', time: '4 days ago', content: 'Increased spend by 15% on retargeting ads for users who visited the pricing page.', domain: targetDomain, color: 'text-yellow-400', bgColor: 'bg-yellow-500', value: 'medium', sourceUrl: 'https://facebook.com/ads' },
    'ads-3': { id: 603, type: 'marketing', category: 'Google Ads Expansion', time: '1 week ago', content: 'Bidding heavily on high-intent transactional keywords in the UK market.', domain: targetDomain, color: 'text-red-400', bgColor: 'bg-red-500', value: 'high', sourceUrl: 'https://google.com/ads' },
    'ads-4': { id: 604, type: 'marketing', category: 'YouTube Video Ads', time: '2 weeks ago', content: 'Started a new video ad series featuring customer success stories.', domain: targetDomain, color: 'text-blue-400', bgColor: 'bg-blue-500', value: 'low', sourceUrl: 'https://youtube.com/ads' },
  };

  // Dimension configuration for styling - using muted/subtle colors to avoid visual fatigue
  const dimensionConfig: Record<string, { icon: typeof Globe; color: string; bgColor: string; label: string }> = {
    website: { icon: Globe, color: 'text-slate-400', bgColor: 'bg-slate-600', label: 'Website' },
    backlinks: { icon: LinkIcon, color: 'text-slate-400', bgColor: 'bg-slate-600', label: 'Backlinks' },
    seo: { icon: Search, color: 'text-slate-400', bgColor: 'bg-slate-600', label: 'SEO' },
    social: { icon: Users, color: 'text-slate-400', bgColor: 'bg-slate-600', label: 'Social' },
    news: { icon: FileText, color: 'text-slate-400', bgColor: 'bg-slate-600', label: 'News' },
    ads: { icon: Megaphone, color: 'text-slate-400', bgColor: 'bg-slate-600', label: 'Ads' },
    talent: { icon: Briefcase, color: 'text-slate-400', bgColor: 'bg-slate-600', label: 'Talent' },
  };

  // Get all tracker signals with dimension field (parent level - comprehensive feed)
  const getAllTrackerSignals = (): Signal[] => {
    return Object.entries(trackerSignalsData).map(([key, signal]) => {
      // Determine dimension from key prefix
      let dimension = 'website';
      if (key.startsWith('backlink-')) dimension = 'backlinks';
      else if (key.startsWith('seo-')) dimension = 'seo';
      else if (key.startsWith('social-')) dimension = 'social';
      else if (key.startsWith('news-')) dimension = 'news';
      else if (key.startsWith('ads-')) dimension = 'ads';
      else if (key.startsWith('talent-')) dimension = 'talent';
      return { ...signal, dimension };
    });
  };

  // Get tracker signals for a specific tracker type (child level)
  const getTrackerSignals = (trackerType: string | null): Signal[] => {
    if (!trackerType) return [];
    const prefixMap: Record<string, string> = {
      'website': 'web-',
      'backlinks': 'backlink-',
      'seo': 'seo-',
      'social': 'social-',
      'news': 'news-',
      'ads': 'ads-',
      'talent': 'talent-'
    };
    const prefix = prefixMap[trackerType];
    if (!prefix) return [];
    return Object.entries(trackerSignalsData)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, signal]) => {
        let dimension = trackerType;
        return { ...signal, dimension };
      });
  };

  // Comprehensive signals = all tracker signals combined (for "View Full Feed")
  const comprehensiveSignals = getAllTrackerSignals();

  // Priority sorting function
  const priorityOrder: Record<string, number> = { 'high': 0, 'medium': 1, 'low': 2, 'info': 3 };
  const sortByPriority = (signals: Signal[]) => {
    return [...signals].sort((a, b) => {
      const priorityA = priorityOrder[a.value] ?? 3;
      const priorityB = priorityOrder[b.value] ?? 3;
      return priorityA - priorityB;
    });
  };

  // Determine which signals to show based on context:
  // - If activeTrackerType is set: show only that tracker's signals (child level)
  // - If activeTrackerType is null: show all tracker signals (parent level - full feed)
  const activeTrackerSignals = getTrackerSignals(activeTrackerType);
  const filteredSignals = sortByPriority(
    activeTrackerType 
      ? activeTrackerSignals 
      : (feedFilter === 'all' ? comprehensiveSignals 
          : feedFilter === 'favorites' ? comprehensiveSignals.filter(s => signalFavorites.includes(s.id))
          : comprehensiveSignals.filter(s => s.dimension === feedFilter))
  );

  const handleSignalClick = (signalId: string, dimension: string) => {
    // Set dimension filter instead of type filter
    if (['website', 'backlinks', 'seo', 'social', 'news', 'ads', 'talent'].includes(dimension)) {
      setFeedFilter(dimension as 'all' | 'website' | 'backlinks' | 'seo' | 'social' | 'news' | 'ads' | 'talent' | 'favorites');
    } else {
      setFeedFilter('all');
    }
    setSelectedSignalId(signalId);
    setShowFullFeed(true);
    
    // Determine tracker type from signalId prefix
    const trackerTypeMap: Record<string, string> = {
      'web-': 'website',
      'backlink-': 'backlinks',
      'seo-': 'seo',
      'social-': 'social',
      'news-': 'news',
      'ads-': 'ads',
      'talent-': 'talent'
    };
    
    const matchedPrefix = Object.keys(trackerTypeMap).find(prefix => signalId.startsWith(prefix));
    if (matchedPrefix) {
      setActiveTrackerType(trackerTypeMap[matchedPrefix]);
    }
    
    // Auto-select the signal to show detail panel with demo data
    const trackerSignal = trackerSignalsData[signalId];
    if (trackerSignal) {
      setSelectedSignal({ ...trackerSignal, dimension: matchedPrefix ? trackerTypeMap[matchedPrefix] : 'website' });
    }
  };

  const handleAddTarget = async () => {
    if (!newTargetName.trim() || !newTargetUrl.trim()) {
      return;
    }
    setIsAddingTarget(true);
    try {
      await onAddTarget(newTargetName.trim(), newTargetUrl.trim());
      setNewTargetName('');
      setNewTargetUrl('');
      setShowAddModal(false);
      setAddError(null);
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to add competitor. Please try again.';
      setAddError(errorMsg);
      console.error('Error adding target:', error);
    } finally {
      setIsAddingTarget(false);
    }
  };

  const [isDraggingHandle, setIsDraggingHandle] = useState<string | null>(null);

  useEffect(() => {
    const handleDocumentMouseUp = () => {
      setIsDraggingHandle(null);
    };
    document.addEventListener('mouseup', handleDocumentMouseUp);
    return () => document.removeEventListener('mouseup', handleDocumentMouseUp);
  }, []);

  const handleDragHandleMouseDown = (trackerId: string) => {
    setIsDraggingHandle(trackerId);
  };

  const handleDragStart = (e: React.DragEvent, trackerId: string) => {
    if (isDraggingHandle !== trackerId) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', trackerId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTracker(trackerId);
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
        className={`bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/40 rounded-lg overflow-hidden transition-all ${draggedTracker === 'website' ? 'opacity-50 scale-95 cursor-grabbing' : isDraggingHandle === 'website' ? 'border-cyan-500/70' : 'hover:border-cyan-500/60'}`}>
        <div className="px-4 py-3 border-b border-cyan-500/20 bg-cyan-500/5 flex items-center gap-2.5">
          <button
            onMouseDown={() => handleDragHandleMouseDown('website')}
            className="text-slate-500 hover:text-cyan-400 transition-colors cursor-grab active:cursor-grabbing"
            title="Long press to reorder"
          >
            <GripVertical size={16} />
          </button>
          <Globe size={16} className="text-cyan-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Website Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">On-page copy, pricing, features, SEO and more.</p>
          </div>
          <Switch 
            className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700" 
            defaultChecked 
          />
        </div>
        <div className="px-3 py-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
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
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title='Pricing Page: New "Enterprise" Tier' time="Just now" description="Added a new enterprise tier with 'Contact Sales' CTA. Previously only 'Pro' and 'Starter'." priority="HIGH" type="pricing" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
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
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Homepage Copy Changes" time="2 hours ago" description="Updated hero section tagline to emphasize 'Enterprise-grade' capabilities and compliance features." priority="MED" type="product" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('web-3', 'product')} className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">New Solutions Page</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">5 hours ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Launched vertical-specific solution pages for Fintech and Healthcare.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New Solutions Page" time="5 hours ago" description="Launched vertical-specific solution pages for Fintech and Healthcare." priority="LOW" type="product" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('web-4', 'product')} className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">Cookie Policy Update</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full shrink-0">INFO</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Minor updates to compliance documentation and cookie consent.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Cookie Policy Update" time="Yesterday" description="Minor updates to compliance documentation and cookie consent." priority="INFO" type="product" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('web-5', 'marketing')} className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">New Blog Post: AI Ethics</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Published a comprehensive guide on ethical AI implementation in design.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New Blog Post: AI Ethics" time="2 days ago" description="Published a comprehensive guide on ethical AI implementation in design." priority="LOW" type="marketing" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('web-6', 'hiring')} className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">Career Page: 15 New Openings</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">3 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Significant expansion in the engineering and product teams announced.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Career Page: 15 New Openings" time="3 days ago" description="Significant expansion in the engineering and product teams announced." priority="MED" type="hiring" />
            </HoverCardContent>
          </HoverCard>
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
        className={`bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/40 rounded-lg overflow-hidden transition-all ${draggedTracker === 'backlinks' ? 'opacity-50 scale-95 cursor-grabbing' : isDraggingHandle === 'backlinks' ? 'border-emerald-500/70' : 'hover:border-emerald-500/60'}`}>
        <div className="px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2.5">
          <button
            onMouseDown={() => handleDragHandleMouseDown('backlinks')}
            className="text-slate-500 hover:text-emerald-400 transition-colors cursor-grab active:cursor-grabbing"
            title="Long press to reorder"
          >
            <GripVertical size={16} />
          </button>
          <LinkIcon size={16} className="text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Backlinks Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Domain ranking, backlinks and referring domains.</p>
          </div>
          <Switch 
            className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700" 
            defaultChecked 
          />
        </div>
        <div className="px-3 py-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
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
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New Referring Domain Detected" time="Just now" description="High-authority tech blog linked to product page." priority="HIGH" type="marketing" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('backlink-2', 'marketing')} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">Lost Backlink: Forbes Tech</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Previous link from "Top SaaS Trends" article was removed or changed.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Lost Backlink: Forbes Tech" time="Yesterday" description="Previous link from 'Top SaaS Trends' article was removed or changed." priority="MED" type="marketing" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('backlink-3', 'marketing')} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">New Competitor Comparison</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Linked in a new "Best AI Tools of 2024" comparison list.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New Competitor Comparison" time="2 days ago" description="Linked in a new 'Best AI Tools of 2024' comparison list." priority="LOW" type="marketing" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('backlink-4', 'marketing')} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">G2 Review Spike</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">4 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0">POS</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Received 25+ new 5-star reviews on G2 following the recent update.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="G2 Review Spike" time="4 days ago" description="Received 25+ new 5-star reviews on G2 following the recent update." priority="POS" type="marketing" />
            </HoverCardContent>
          </HoverCard>
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
        className={`bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/40 rounded-lg overflow-hidden transition-all ${draggedTracker === 'seo' ? 'opacity-50 scale-95 cursor-grabbing' : isDraggingHandle === 'seo' ? 'border-blue-500/70' : 'hover:border-blue-500/60'}`}>
        <div className="px-4 py-3 border-b border-blue-500/20 bg-blue-500/5 flex items-center gap-2.5">
          <button
            onMouseDown={() => handleDragHandleMouseDown('seo')}
            className="text-slate-500 hover:text-blue-400 transition-colors cursor-grab active:cursor-grabbing"
            title="Long press to reorder"
          >
            <GripVertical size={16} />
          </button>
          <Search size={16} className="text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">SEO Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Rankings, keywords, and search visibility.</p>
          </div>
          <Switch 
            className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700" 
            defaultChecked 
          />
        </div>
        <div className="px-3 py-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
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
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Keyword Ranking Change" time="Just now" description="Main competitor jumped to #1 for 'AI Design Tools'." priority="HIGH" type="product" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('seo-2', 'product')} className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-1">New Indexed Pages: 12</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">3 hours ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Added 12 new documentation pages for specialized API integrations.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New Indexed Pages: 12" time="3 hours ago" description="Added 12 new documentation pages for specialized API integrations." priority="LOW" type="product" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('seo-3', 'product')} className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-1">Site Speed Improvement</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0">POS</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Homepage load time reduced by 40% globally.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Site Speed Improvement" time="Yesterday" description="Homepage load time reduced by 40% globally." priority="POS" type="product" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('seo-4', 'product')} className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-blue-300 transition-colors line-clamp-1">Featured Snippet Won</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">3 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0">POS</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Successfully captured the featured snippet for "SaaS SEO automation".</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Featured Snippet Won" time="3 days ago" description="Successfully captured the featured snippet for 'SaaS SEO automation'." priority="POS" type="product" />
            </HoverCardContent>
          </HoverCard>
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
        className={`bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/40 rounded-lg overflow-hidden transition-all ${draggedTracker === 'social' ? 'opacity-50 scale-95 cursor-grabbing' : isDraggingHandle === 'social' ? 'border-purple-500/70' : 'hover:border-purple-500/60'}`}>
        <div className="px-4 py-3 border-b border-purple-500/20 bg-purple-500/5 flex items-center gap-2.5">
          <button
            onMouseDown={() => handleDragHandleMouseDown('social')}
            className="text-slate-500 hover:text-purple-400 transition-colors cursor-grab active:cursor-grabbing"
            title="Long press to reorder"
          >
            <GripVertical size={16} />
          </button>
          <Megaphone size={16} className="text-purple-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Social Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Posts and engagement.</p>
          </div>
          <Switch 
            className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700" 
            defaultChecked 
          />
        </div>
        <div className="px-3 py-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('social-1', 'marketing')} className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <SiX size={13} className="text-slate-300" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">X</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">Viral Thread Detected</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">1 hour ago</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 pl-9">A user's review of their new collaborative features is trending on X.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Viral Thread Detected" time="1 hour ago" description="A user's review of their new collaborative features is trending on X." priority="MED" type="marketing" domain="x.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('social-2', 'marketing')} className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <SiYoutube size={13} className="text-red-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">YouTube</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">New Review</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">5 hours ago</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 pl-9">Popular tech influencer published a comparison video.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New Review" time="5 hours ago" description="Popular tech influencer published a comparison video." priority="LOW" type="marketing" domain="youtube.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('social-3', 'product')} className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <Globe size={13} className="text-orange-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hunt</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">Product Launch</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 pl-9">Competitor's new "Pro+" mobile app launched on Product Hunt.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Product Launch" time="2 days ago" description="Competitor's new 'Pro+' mobile app launched on Product Hunt." priority="HIGH" type="product" domain="producthunt.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('social-4', 'marketing')} className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <SiInstagram size={13} className="text-pink-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Insta</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">Campaign</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">1 week ago</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 pl-9">New aesthetic design showcase campaign targeting Gen Z designers.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Campaign" time="1 week ago" description="New aesthetic design showcase campaign targeting Gen Z designers." priority="LOW" type="marketing" domain="instagram.com" />
            </HoverCardContent>
          </HoverCard>
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
        className={`bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/40 rounded-lg overflow-hidden transition-all ${draggedTracker === 'news' ? 'opacity-50 scale-95 cursor-grabbing' : isDraggingHandle === 'news' ? 'border-rose-500/70' : 'hover:border-rose-500/60'}`}>
        <div className="px-4 py-3 border-b border-rose-500/20 bg-rose-500/5 flex items-center gap-2.5">
          <button
            onMouseDown={() => handleDragHandleMouseDown('news')}
            className="text-slate-500 hover:text-rose-400 transition-colors cursor-grab active:cursor-grabbing"
            title="Long press to reorder"
          >
            <GripVertical size={16} />
          </button>
          <FileText size={16} className="text-rose-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">News Mentions</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Press coverage.</p>
          </div>
          <Switch 
            className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700" 
            defaultChecked 
          />
        </div>
        <div className="px-3 py-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('news-1', 'marketing')} className="bg-slate-900/50 border border-rose-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <SiTechcrunch size={13} className="text-green-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TC</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs group-hover:text-rose-300 transition-colors line-clamp-1">Feature</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">4 hours ago</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 pl-9">Comprehensive deep-dive article on their recent $50M series B funding.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="TechCrunch Feature" time="4 hours ago" description="Comprehensive deep-dive article on their recent $50M series B funding." priority="HIGH" type="marketing" domain="techcrunch.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('news-2', 'marketing')} className="bg-slate-900/50 border border-rose-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <FileText size={13} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Forbes</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs group-hover:text-rose-300 transition-colors line-clamp-1">Listing</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">Yesterday</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 pl-9">Named in the "Top 50 AI Startups to Watch" list.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Forbes Listing" time="Yesterday" description="Named in the 'Top 50 AI Startups to Watch' list." priority="MED" type="marketing" domain="forbes.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('news-3', 'marketing')} className="bg-slate-900/50 border border-rose-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <FileText size={13} className="text-indigo-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Wired</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs group-hover:text-rose-300 transition-colors line-clamp-1">Analysis</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">3 days ago</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 pl-9">Wired discusses the implications of their new AI-driven design engine.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Wired Analysis" time="3 days ago" description="Wired discusses the implications of their new AI-driven design engine." priority="LOW" type="marketing" domain="wired.com" />
            </HoverCardContent>
          </HoverCard>
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
        className={`bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/40 rounded-lg overflow-hidden transition-all ${draggedTracker === 'ads' ? 'opacity-50 scale-95 cursor-grabbing' : isDraggingHandle === 'ads' ? 'border-amber-500/70' : 'hover:border-amber-500/60'}`}>
        <div className="px-4 py-3 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2.5">
          <button
            onMouseDown={() => handleDragHandleMouseDown('ads')}
            className="text-slate-500 hover:text-amber-400 transition-colors cursor-grab active:cursor-grabbing"
            title="Long press to reorder"
          >
            <GripVertical size={16} />
          </button>
          <DollarSign size={16} className="text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Ads Tracker</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Ad spend.</p>
          </div>
          <Switch 
            className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700" 
            defaultChecked 
          />
        </div>
        <div className="px-3 py-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('ads-1', 'marketing')} className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">New LinkedIn Ad Campaign</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Targeting decision makers at mid-market design agencies with "Free Enterprise Trial".</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New LinkedIn Ad Campaign" time="2 days ago" description="Targeting decision makers at mid-market design agencies with 'Free Enterprise Trial'." priority="LOW" type="marketing" domain="linkedin.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('ads-2', 'marketing')} className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">Facebook Retargeting Boost</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">4 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Increased spend by 15% on retargeting ads for users who visited the pricing page.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Facebook Retargeting Boost" time="4 days ago" description="Increased spend by 15% on retargeting ads for users who visited the pricing page." priority="MED" type="marketing" domain="facebook.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('ads-3', 'marketing')} className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">Google Search Ad Expansion</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">1 week ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Bidding heavily on high-intent transactional keywords in the UK market.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Google Search Ad Expansion" time="1 week ago" description="Bidding heavily on high-intent transactional keywords in the UK market." priority="HIGH" type="marketing" domain="google.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('ads-4', 'marketing')} className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">YouTube Video Ads</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">2 weeks ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Started a new video ad series featuring customer success stories.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="YouTube Video Ads" time="2 weeks ago" description="Started a new video ad series featuring customer success stories." priority="LOW" type="marketing" domain="youtube.com" />
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    ),
    talent: (
      <div 
        key="talent"
        draggable 
        onDragStart={(e) => handleDragStart(e, 'talent')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'talent')}
        onDragEnd={handleDragEnd}
        className={`bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/40 rounded-lg overflow-hidden transition-all ${draggedTracker === 'talent' ? 'opacity-50 scale-95 cursor-grabbing' : isDraggingHandle === 'talent' ? 'border-pink-500/70' : 'hover:border-pink-500/60'}`}>
        <div className="px-4 py-3 border-b border-pink-500/20 bg-pink-500/5 flex items-center gap-2.5">
          <button
            onMouseDown={() => handleDragHandleMouseDown('talent')}
            className="text-slate-500 hover:text-pink-400 transition-colors cursor-grab active:cursor-grabbing"
            title="Long press to reorder"
          >
            <GripVertical size={16} />
          </button>
          <Users size={16} className="text-pink-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">Talent Intelligence</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Recruitment activity and org changes.</p>
          </div>
          <Switch 
            className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700" 
            defaultChecked 
          />
        </div>
        <div className="px-3 py-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('talent-1', 'hiring')} className="bg-slate-900/50 border border-pink-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-pink-300 transition-colors line-clamp-1">New CTO Posted on LinkedIn</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">Just now</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shrink-0">HIGH</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">CTO position posted; actively recruiting for leadership vacancy in engineering.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="New CTO Posted on LinkedIn" time="Just now" description="CTO position posted; actively recruiting for leadership vacancy in engineering." priority="HIGH" type="hiring" domain="linkedin.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('talent-2', 'hiring')} className="bg-slate-900/50 border border-pink-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-pink-300 transition-colors line-clamp-1">VP Sales Role Announced</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">2 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full shrink-0">MED</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">VP of Sales position opened on LinkedIn; suggests leadership restructuring underway.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="VP Sales Role Announced" time="2 days ago" description="VP of Sales position opened on LinkedIn; suggests leadership restructuring underway." priority="MED" type="hiring" domain="linkedin.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('talent-3', 'hiring')} className="bg-slate-900/50 border border-pink-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-pink-300 transition-colors line-clamp-1">Engineering Hiring Surge</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">4 days ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0">POS</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">25+ engineer roles posted; major expansion in AI/ML and platform teams detected.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Engineering Hiring Surge" time="4 days ago" description="25+ engineer roles posted; major expansion in AI/ML and platform teams detected." priority="POS" type="hiring" domain="linkedin.com" />
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={400} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div onClick={() => handleSignalClick('talent-4', 'hiring')} className="bg-slate-900/50 border border-pink-500/20 rounded-lg p-2.5 hover:bg-slate-900/70 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs group-hover:text-pink-300 transition-colors line-clamp-1">Product Org Restructure</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">1 week ago</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shrink-0">LOW</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Multiple new director-level roles posted; signals org restructuring in product division.</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="bg-slate-950 border-slate-700 p-4 z-[100]">
              <SignalDetailHoverContent title="Product Org Restructure" time="1 week ago" description="Multiple new director-level roles posted; signals org restructuring in product division." priority="LOW" type="hiring" domain="linkedin.com" />
            </HoverCardContent>
          </HoverCard>
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
                {addError && (
                  <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-sm text-red-400">
                    {addError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={isAddingTarget}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTarget}
                    disabled={!newTargetName.trim() || !newTargetUrl.trim() || isAddingTarget}
                    className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAddingTarget ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Adding...
                      </>
                    ) : (
                      'Add'
                    )}
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
          <button 
            onClick={() => {
              setNewTargetName('');
              setNewTargetUrl('');
              setNewTaskTrackers(['website', 'backlinks', 'seo']);
              setShowCreateTaskModal(true);
            }} 
            className="text-slate-500 hover:text-brand-400 transition-colors" 
            data-testid="button-create-tracking-task"
            title="Create Tracking Task"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {[...targets].sort((a, b) => {
            const statusOrder: Record<string, number> = { active: 0, paused: 1, stopped: 2, archived: 3 };
            return (statusOrder[a.status] ?? 999) - (statusOrder[b.status] ?? 999);
          }).map(t => (
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
      <div className="flex-1 border-r border-slate-800 bg-[#0b0c0f] overflow-hidden p-4 flex flex-col">
        {selectedTarget ? (
          <div className="flex flex-col h-full gap-4">
            {/* Header with logo and info */}
            <div className="flex items-start justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-700 overflow-hidden shadow-sm">
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(selectedTarget.url).hostname}&sz=128`} className="w-full h-full object-contain" alt={selectedTarget.name} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{selectedTarget.name}</h1>
                    <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-4 py-1.5 rounded-xl h-10 shadow-inner">
                      <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Trackers</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-white">7</span>
                          <span className="text-[10px] text-slate-600 font-medium">/10</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-emerald-400">New Signals</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-white">6</span>
                          <span className="text-[10px] text-emerald-500/60 font-medium">today</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Severity</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-sm font-bold text-red-400">1</span>
                            <span className="text-[10px] text-red-500/40 font-bold">H</span>
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-sm font-bold text-blue-400">1</span>
                            <span className="text-[10px] text-blue-500/40 font-bold">L</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Response Time</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-white">2.3</span>
                          <span className="text-[10px] text-slate-600 font-medium">days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a href={selectedTarget.url} target="_blank" className="text-xs text-slate-500 hover:text-brand-400 flex items-center gap-1.5 font-mono mt-0.5">
                    {selectedTarget.url} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Edit button clicked, selectedTarget:', selectedTarget);
                    if (selectedTarget) {
                      setEditTargetName(selectedTarget.name);
                      setEditTargetUrl(selectedTarget.url);
                      setShowEditModal(true);
                      console.log('Modal should be open now');
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors" 
                  data-testid="button-edit-config"
                >
                  Edit Configuration
                </button>
              </div>
            </div>

            {/* AI Insight Panel - Refactored Track Interface */}
            <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden min-h-0">
              <TrackInsightPanel 
                targetName={selectedTarget.name} 
                targetDomain={new URL(selectedTarget.url).hostname}
                onResearch={onResearchPrompt}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Select a target</div>
        )}
      </div>
      {/* Create Task Dialog */}
      <Dialog open={showCreateTaskModal} onOpenChange={(open) => {
        setShowCreateTaskModal(open);
        if (!open) setCreateFormTab('basic');
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-4 mx-auto">
              <Globe className="text-brand-500" size={24} />
            </div>
            <div className="space-y-1.5 w-full">
              <DialogTitle className="text-white text-xl font-bold text-center w-full">Create Tracking Target</DialogTitle>
              <p className="text-sm text-slate-400 max-w-[80%] mx-auto text-center">Add a new competitor to track across multiple dimensions</p>
            </div>
          </DialogHeader>
          
          <Tabs value={createFormTab} onValueChange={(v) => {
            if (v === 'notifications' && (!newTargetName.trim() || !newTargetUrl.trim())) {
              setCreateTabError("Please complete Basic Info first.");
              return;
            }
            setCreateFormTab(v as 'basic' | 'notifications');
          }} className="w-full">
            <div className="relative">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700 rounded-lg p-1 mb-4">
                <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-brand-500 data-[state=active]:text-white rounded-md transition-all">
                  <Settings size={14} />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-brand-500 data-[state=active]:text-white rounded-md transition-all">
                  <Bell size={14} />
                  Notifications
                </TabsTrigger>
              </TabsList>
              {createTabError && (
                <div className="absolute -top-10 left-0 right-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-slate-800 border border-brand-500/40 text-brand-400 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-2 justify-center mx-auto w-fit shadow-lg">
                    <AlertTriangle size={12} />
                    {createTabError}
                  </div>
                </div>
              )}
            </div>
            
            <TabsContent value="basic" className="space-y-6 py-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Name</label>
                <input
                  type="text"
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  placeholder="e.g., Figma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                  data-testid="input-new-target-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Website URL</label>
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={newTargetUrl}
                    onChange={(e) => setNewTargetUrl(e.target.value)}
                    placeholder="e.g., figma.com or https://figma.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                    data-testid="input-new-target-url"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Active Trackers</label>
                <div className="space-y-2">
                  {['Website', 'Backlinks', 'SEO', 'Social', 'News', 'Ads'].map((tracker) => (
                    <label key={tracker} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={newTaskTrackers.includes(tracker.toLowerCase())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTaskTrackers([...newTaskTrackers, tracker.toLowerCase()]);
                          } else {
                            setNewTaskTrackers(newTaskTrackers.filter(t => t !== tracker.toLowerCase()));
                          }
                        }}
                        className="w-4 h-4 rounded accent-brand-500" 
                      />
                      <span className="text-sm text-slate-300">{tracker} Tracker</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 py-2">
              {/* Single Email Management Section - 3-Stage Magic Link Flow */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Notification Email</label>
                <div className="space-y-3">
                  {/* Stage 1: Email Entry (when unverified and not sent) */}
                  {emailVerificationStatus === 'unverified' && emailSendStatus !== 'sent' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                          type="email"
                          value={newNotificationEmail}
                          onChange={(e) => setNewNotificationEmail(e.target.value)}
                          placeholder="Enter email address..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                          disabled={emailSendStatus === 'sending'}
                          data-testid="input-new-notification-email"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (newNotificationEmail.trim()) {
                            setEmailSendStatus('sending');
                            // Simulate sending magic link
                            setTimeout(() => {
                              setEmailSendStatus('sent');
                              setEmailVerificationStatus('pending');
                            }, 1500);
                          }
                        }}
                        disabled={!newNotificationEmail.trim() || emailSendStatus === 'sending'}
                        className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 min-w-[160px] justify-center whitespace-nowrap"
                        data-testid="button-send-verification"
                      >
                        {emailSendStatus === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                        {emailSendStatus === 'sending' ? 'Sending...' : 'Send Verification'}
                      </button>
                    </div>
                  )}

                  {/* Stage 2: Pending Verification (link sent, awaiting click) */}
                  {emailVerificationStatus === 'pending' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <Mail size={16} className="text-amber-400" />
                        <div className="flex-1">
                          <p className="text-sm text-amber-400 font-medium">Verification link sent!</p>
                          <p className="text-xs text-slate-400 mt-0.5">Check your inbox at <span className="text-white">{newNotificationEmail}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEmailSendStatus('sending');
                            setTimeout(() => {
                              setEmailSendStatus('sent');
                            }, 1500);
                          }}
                          disabled={emailSendStatus === 'sending'}
                          className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 disabled:opacity-50"
                          data-testid="button-resend-verification"
                        >
                          {emailSendStatus === 'sending' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                          Resend link
                        </button>
                        <button
                          onClick={() => {
                            setEmailSendStatus('idle');
                            setEmailVerificationStatus('unverified');
                          }}
                          className="text-sm text-slate-500 hover:text-slate-400 flex items-center gap-1"
                          data-testid="button-change-email"
                        >
                          <Pencil size={12} />
                          Change email
                        </button>
                        <button
                          onClick={() => {
                            // Simulate user clicking the magic link (for demo purposes)
                            setEmailVerificationStatus('verified');
                          }}
                          className="ml-auto text-xs text-slate-600 hover:text-slate-500 underline"
                          data-testid="button-simulate-verify"
                        >
                          (Simulate: I clicked the link)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Verified */}
                  {emailVerificationStatus === 'verified' && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <Check size={16} className="text-emerald-400" />
                      <div className="flex-1">
                        <p className="text-sm text-emerald-400 font-medium">Email verified</p>
                        <p className="text-xs text-slate-400 mt-0.5">{newNotificationEmail}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEmailSendStatus('idle');
                          setEmailVerificationStatus('unverified');
                        }}
                        className="text-sm text-slate-500 hover:text-slate-400 flex items-center gap-1"
                        data-testid="button-change-verified-email"
                      >
                        <Pencil size={12} />
                        Change
                      </button>
                    </div>
                  )}

                  {/* Helper text for Stage 1 */}
                  {emailVerificationStatus === 'unverified' && emailSendStatus !== 'sent' && (
                    <p className="text-[10px] text-slate-500 italic">
                      We will send a verification link to confirm your email address.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Frequency Settings Section */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Notification Frequency</label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewFrequencyType('daily')}
                      className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                        newFrequencyType === 'daily' 
                          ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                      data-testid="button-frequency-daily"
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setNewFrequencyType('weekly')}
                      className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                        newFrequencyType === 'weekly' 
                          ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                      data-testid="button-frequency-weekly"
                    >
                      Weekly
                    </button>
                  </div>
                  
                  {newFrequencyType === 'daily' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Time</label>
                        <Select value={newDailyTime} onValueChange={setNewDailyTime}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-daily-time">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => (
                              <SelectItem key={time} value={time} className="text-white hover:bg-slate-700">{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Timezone</label>
                        <Select value={newTimezone} onValueChange={setNewTimezone}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney'].map(tz => (
                              <SelectItem key={tz} value={tz} className="text-white hover:bg-slate-700">{tz.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Day</label>
                        <Select value={newWeeklyDay} onValueChange={setNewWeeklyDay}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-weekly-day">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                              <SelectItem key={day} value={day} className="text-white hover:bg-slate-700 capitalize">{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Time</label>
                        <Select value={newWeeklyTime} onValueChange={setNewWeeklyTime}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-weekly-time">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => (
                              <SelectItem key={time} value={time} className="text-white hover:bg-slate-700">{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Timezone</label>
                        <Select value={newTimezone} onValueChange={setNewTimezone}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-timezone-weekly">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney'].map(tz => (
                              <SelectItem key={tz} value={tz} className="text-white hover:bg-slate-700">{tz.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock size={12} />
                    {newFrequencyType === 'daily' 
                      ? `You'll receive daily signal summaries at ${newDailyTime} (${newTimezone.replace('_', ' ')})`
                      : `You'll receive weekly signal summaries every ${newWeeklyDay.charAt(0).toUpperCase() + newWeeklyDay.slice(1)} at ${newWeeklyTime} (${newTimezone.replace('_', ' ')})`
                    }
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowCreateTaskModal(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              data-testid="button-cancel-create-task"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (newTargetName.trim() && newTargetUrl.trim()) {
                  setIsAddingTarget(true);
                  try {
                    await apiRequest('POST', '/api/targets', {
                      name: newTargetName,
                      url: newTargetUrl
                    });
                    queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
                    setNewTargetName('');
                    setNewTargetUrl('');
                    setNewTaskTrackers(['website', 'backlinks', 'seo']);
                    setNewNotificationEmail('');
                    setEmailSendStatus('idle');
                    setEmailVerificationStatus('unverified');
                    setNewFrequencyType('daily');
                    setNewDailyTime('09:00');
                    setNewTimezone('UTC');
                    setShowCreateTaskModal(false);
                  } catch (error) {
                    console.error('Failed to create target:', error);
                  } finally {
                    setIsAddingTarget(false);
                  }
                }
              }}
              disabled={!newTargetName.trim() || !newTargetUrl.trim() || isAddingTarget || emailVerificationStatus !== 'verified'}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center gap-2"
              data-testid="button-create-task-submit"
            >
              {isAddingTarget ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
              Create & Start Tracking
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Dialog */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        setShowEditModal(open);
        if (!open) setEditFormTab('basic');
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-4 mx-auto">
              <Globe className="text-brand-500" size={24} />
            </div>
            <div className="space-y-1.5 w-full">
              <DialogTitle className="text-white text-xl font-bold text-center w-full">Edit Target Configuration</DialogTitle>
              <p className="text-sm text-slate-400 max-w-[80%] mx-auto text-center">Update target details and tracking settings</p>
            </div>
          </DialogHeader>
          
          <Tabs value={editFormTab} onValueChange={(v) => {
            if (v === 'notifications' && (!editTargetName.trim() || !editTargetUrl.trim())) {
              setEditTabError("Please complete Basic Info first.");
              return;
            }
            setEditFormTab(v as 'basic' | 'notifications');
          }} className="w-full">
            <div className="relative">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700 rounded-lg p-1 mb-4">
                <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-brand-500 data-[state=active]:text-white rounded-md transition-all">
                  <Settings size={14} />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-brand-500 data-[state=active]:text-white rounded-md transition-all">
                  <Bell size={14} />
                  Notifications
                </TabsTrigger>
              </TabsList>
              {editTabError && (
                <div className="absolute -top-10 left-0 right-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-slate-800 border border-brand-500/40 text-brand-400 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-2 justify-center mx-auto w-fit shadow-lg">
                    <AlertTriangle size={12} />
                    {editTabError}
                  </div>
                </div>
              )}
            </div>
            
            <TabsContent value="basic" className="space-y-6 py-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Name</label>
                <input
                  type="text"
                  value={editTargetName}
                  onChange={(e) => setEditTargetName(e.target.value)}
                  placeholder="e.g., Figma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                  data-testid="input-edit-target-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Website URL</label>
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={editTargetUrl}
                    onChange={(e) => setEditTargetUrl(e.target.value)}
                    placeholder="e.g., figma.com or https://figma.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                    data-testid="input-edit-target-url"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Active Trackers</label>
                <div className="space-y-2">
                  {['Website', 'Backlinks', 'SEO', 'Social', 'News', 'Ads'].map((tracker) => (
                    <label key={tracker} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-brand-500" />
                      <span className="text-sm text-slate-300">{tracker} Tracker</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 py-2">
              {/* Single Email Management Section - 3-Stage Magic Link Flow */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Notification Email</label>
                <div className="space-y-3">
                  {/* Stage 1: Email Entry (when unverified and not sent) */}
                  {editEmailVerificationStatus === 'unverified' && editEmailSendStatus !== 'sent' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                          type="email"
                          value={editNotificationEmail}
                          onChange={(e) => setEditNotificationEmail(e.target.value)}
                          placeholder="Enter email address..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                          disabled={editEmailSendStatus === 'sending'}
                          data-testid="input-edit-notification-email"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (editNotificationEmail.trim()) {
                            setEditEmailSendStatus('sending');
                            // Simulate sending magic link
                            setTimeout(() => {
                              setEditEmailSendStatus('sent');
                              setEditEmailVerificationStatus('pending');
                            }, 1500);
                          }
                        }}
                        disabled={!editNotificationEmail.trim() || editEmailSendStatus === 'sending'}
                        className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 min-w-[160px] justify-center whitespace-nowrap"
                        data-testid="button-edit-send-verification"
                      >
                        {editEmailSendStatus === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                        {editEmailSendStatus === 'sending' ? 'Sending...' : 'Send Verification'}
                      </button>
                    </div>
                  )}

                  {/* Stage 2: Pending Verification (link sent, awaiting click) */}
                  {editEmailVerificationStatus === 'pending' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <Mail size={16} className="text-amber-400" />
                        <div className="flex-1">
                          <p className="text-sm text-amber-400 font-medium">Verification link sent!</p>
                          <p className="text-xs text-slate-400 mt-0.5">Check your inbox at <span className="text-white">{editNotificationEmail}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditEmailSendStatus('sending');
                            setTimeout(() => {
                              setEditEmailSendStatus('sent');
                            }, 1500);
                          }}
                          disabled={editEmailSendStatus === 'sending'}
                          className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 disabled:opacity-50"
                          data-testid="button-edit-resend-verification"
                        >
                          {editEmailSendStatus === 'sending' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                          Resend link
                        </button>
                        <button
                          onClick={() => {
                            setEditEmailSendStatus('idle');
                            setEditEmailVerificationStatus('unverified');
                          }}
                          className="text-sm text-slate-500 hover:text-slate-400 flex items-center gap-1"
                          data-testid="button-edit-change-email"
                        >
                          <Pencil size={12} />
                          Change email
                        </button>
                        <button
                          onClick={() => {
                            // Simulate user clicking the magic link (for demo purposes)
                            setEditEmailVerificationStatus('verified');
                          }}
                          className="ml-auto text-xs text-slate-600 hover:text-slate-500 underline"
                          data-testid="button-edit-simulate-verify"
                        >
                          (Simulate: I clicked the link)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Verified */}
                  {editEmailVerificationStatus === 'verified' && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <Check size={16} className="text-emerald-400" />
                      <div className="flex-1">
                        <p className="text-sm text-emerald-400 font-medium">Email verified</p>
                        <p className="text-xs text-slate-400 mt-0.5">{editNotificationEmail}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditEmailSendStatus('idle');
                          setEditEmailVerificationStatus('unverified');
                        }}
                        className="text-sm text-slate-500 hover:text-slate-400 flex items-center gap-1"
                        data-testid="button-edit-change-verified-email"
                      >
                        <Pencil size={12} />
                        Change
                      </button>
                    </div>
                  )}

                  {/* Helper text for Stage 1 */}
                  {editEmailVerificationStatus === 'unverified' && editEmailSendStatus !== 'sent' && (
                    <p className="text-[10px] text-slate-500 italic">
                      We will send a verification link to confirm your email address.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Frequency Settings Section */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Notification Frequency</label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditFrequencyType('daily')}
                      className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                        editFrequencyType === 'daily' 
                          ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                      data-testid="button-edit-frequency-daily"
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setEditFrequencyType('weekly')}
                      className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                        editFrequencyType === 'weekly' 
                          ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                      data-testid="button-edit-frequency-weekly"
                    >
                      Weekly
                    </button>
                  </div>
                  
                  {editFrequencyType === 'daily' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Time</label>
                        <Select value={editDailyTime} onValueChange={setEditDailyTime}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-edit-daily-time">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => (
                              <SelectItem key={time} value={time} className="text-white hover:bg-slate-700">{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Timezone</label>
                        <Select value={editTimezone} onValueChange={setEditTimezone}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-edit-timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney'].map(tz => (
                              <SelectItem key={tz} value={tz} className="text-white hover:bg-slate-700">{tz.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Day</label>
                        <Select value={editWeeklyDay} onValueChange={setEditWeeklyDay}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-edit-weekly-day">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                              <SelectItem key={day} value={day} className="text-white hover:bg-slate-700 capitalize">{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Time</label>
                        <Select value={editWeeklyTime} onValueChange={setEditWeeklyTime}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-edit-weekly-time">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => (
                              <SelectItem key={time} value={time} className="text-white hover:bg-slate-700">{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Timezone</label>
                        <Select value={editTimezone} onValueChange={setEditTimezone}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-edit-timezone-weekly">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney'].map(tz => (
                              <SelectItem key={tz} value={tz} className="text-white hover:bg-slate-700">{tz.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock size={12} />
                    {editFrequencyType === 'daily' 
                      ? `You'll receive daily signal summaries at ${editDailyTime} (${editTimezone.replace('_', ' ')})`
                      : `You'll receive weekly signal summaries every ${editWeeklyDay.charAt(0).toUpperCase() + editWeeklyDay.slice(1)} at ${editWeeklyTime} (${editTimezone.replace('_', ' ')})`
                    }
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-all group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="peer w-5 h-5 rounded border-slate-700 bg-slate-900 checked:bg-brand-500 checked:border-brand-500 transition-all appearance-none cursor-pointer" 
                    />
                    <Check size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Apply to all targets</p>
                    <p className="text-[10px] text-slate-500">Use these notification settings for all currently tracked competitors</p>
                  </div>
                </label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              data-testid="button-cancel-edit"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (editTargetName.trim() && editTargetUrl.trim() && selectedTarget) {
                  console.log('Saving target:', editTargetName, editTargetUrl);
                  await apiRequest('PATCH', `/api/targets/${selectedTarget.id}`, {
                    name: editTargetName,
                    url: editTargetUrl
                  });
                  queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
                  setShowEditModal(false);
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all flex items-center gap-2"
              data-testid="button-save-edit"
            >
              <Check size={16} />
              Save Changes
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
    <div className="flex h-[calc(100%+4rem)] -m-8 overflow-hidden bg-[#020617] animate-fade-in-up"> 
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

       <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#0b0c0f]">
          {activeSession && (
             <header className="h-14 shrink-0 border-b border-slate-800/50 flex items-center justify-between px-6 bg-[#0b0c0f]/80 backdrop-blur z-10">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-medium text-slate-200">{activeSession.title}</span>
                   <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{activeSession.agent}</span>
                </div>
             </header>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 md:p-6 scroll-smooth">
             {!activeSession || activeSession.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="max-w-lg text-center animate-fade-in-up">
                   <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20 mb-3">
                      <Lightbulb size={20} className="text-white" />
                   </div>
                   <h2 className="text-xl font-bold text-white mb-1">What shall we investigate?</h2>
                   <p className="text-slate-400 text-xs mb-4 max-w-sm">I can analyze competitors, track pricing shifts, or synthesize market trends.</p>
                   
                   <div className="grid grid-cols-2 gap-1.5 w-full">
                      {[
                        "Analyze Figma's enterprise pricing",
                        "Compare Arc vs Chrome features",
                        "Find Adobe XD's weaknesses",
                        "Summarize G2 reviews for Miro"
                      ].map((prompt, i) => (
                         <button 
                           key={i} 
                           onClick={() => { setInput(prompt); }}
                           className="p-2 rounded-md bg-slate-900/50 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all text-left text-[11px] text-slate-300 hover:text-white"
                           data-testid={`prompt-suggestion-${i}`}
                         >
                            {prompt}
                         </button>
                      ))}
                   </div>
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
                               <div className="w-8 h-8 rounded-lg bg-amber-900/20 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                                  <Lightbulb size={16} className="text-amber-400" />
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

          <div className="shrink-0 px-4 md:px-8 pb-4 pt-2">
             <div className="max-w-3xl mx-auto relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
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
                        className="p-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all"
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
   const defaultTemplates = [
      { id: 1, title: 'Competitor Battle Card', category: 'Sales Enablement', desc: 'One-pager highlighting kill points, objection handling, and pricing traps.', icon: Swords, color: 'text-red-400' },
      { id: 2, title: 'Feature Comparison Matrix', category: 'Product Strategy', desc: 'Detailed side-by-side breakdown of feature availability and limits.', icon: LayoutGrid, color: 'text-blue-400' },
      { id: 3, title: 'Quarterly Market Report', category: 'Executive', desc: 'High-level slide deck summary of market movements and threats.', icon: PieChart, color: 'text-purple-400' },
      { id: 4, title: 'Pricing Tear-down', category: 'Strategy', desc: 'Analysis of competitor pricing tiers, psychology, and hidden costs.', icon: DollarSign, color: 'text-green-400' },
      { id: 5, title: 'Win/Loss Analysis', category: 'Sales', desc: 'Template for analyzing CRM data to understand why deals are won or lost.', icon: BarChart3, color: 'text-orange-400' },
      { id: 6, title: 'SEO Gap Analysis', category: 'Marketing', desc: 'Identify keywords where competitors are outranking you.', icon: Search, color: 'text-pink-400' },
   ];

   const categories = ['All', 'Sales Enablement', 'Product Strategy', 'Marketing', 'Executive', 'Custom'];
   const [activeCat, setActiveCat] = useState('All');
   const [enabledTemplates, setEnabledTemplates] = useState<number[]>([1, 2, 3]);
   const [pinnedTemplates, setPinnedTemplates] = useState<number[]>([]);
   const [customTemplates, setCustomTemplates] = useState<any[]>([]);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [newTemplateName, setNewTemplateName] = useState('');
   const [newTemplateDesc, setNewTemplateDesc] = useState('');
   const [newTemplateCategory, setNewTemplateCategory] = useState('Custom');
   const [newTemplatePrompt, setNewTemplatePrompt] = useState('');

   const toggleTemplate = (id: number) => {
      setEnabledTemplates(prev => 
         prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
   };

   const togglePin = (id: number) => {
      setPinnedTemplates(prev => {
         if (prev.includes(id)) {
            return prev.filter(t => t !== id);
         } else if (prev.length < 4) {
            return [...prev, id];
         }
         return prev;
      });
   };

   const allTemplates = [...defaultTemplates, ...customTemplates];
   
   const sortedTemplates = allTemplates.sort((a, b) => {
      const aPinned = pinnedTemplates.includes(a.id);
      const bPinned = pinnedTemplates.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
   });

   const handleCreateTemplate = () => {
      if (newTemplateName.trim() && newTemplateDesc.trim() && newTemplatePrompt.trim()) {
         const newTemplate = {
            id: Date.now(),
            title: newTemplateName,
            category: newTemplateCategory,
            desc: newTemplateDesc,
            icon: Lightbulb,
            color: 'text-yellow-400',
            prompt: newTemplatePrompt,
            isCustom: true
         };
         setCustomTemplates([...customTemplates, newTemplate]);
         setNewTemplateName('');
         setNewTemplateDesc('');
         setNewTemplateCategory('Custom');
         setNewTemplatePrompt('');
         setShowCreateModal(false);
      }
   };

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
            {sortedTemplates.filter(t => activeCat === 'All' || t.category === activeCat).map(template => {
               const isEnabled = enabledTemplates.includes(template.id);
               const isPinned = pinnedTemplates.includes(template.id);
               return (
               <div key={template.id} className={`group rounded-xl p-6 transition-all flex flex-col h-full ${isPinned ? 'border-2 border-brand-500/50 bg-brand-500/10' : 'bg-slate-900/40 border border-slate-800 hover:bg-slate-900/60 hover:border-slate-700'}`} data-testid={`template-card-${template.id}`}>
                  <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-lg bg-slate-950 border border-slate-800 ${template.color} group-hover:scale-110 transition-transform`}>
                        <template.icon size={24} />
                     </div>
                     <div className="flex items-center gap-2">
                        {isPinned && <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/30">Pinned</span>}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-1 rounded">
                           {template.category}
                        </span>
                     </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{template.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                     {template.desc}
                  </p>
                  <div className="flex gap-2">
                    <button 
                       onClick={() => toggleTemplate(template.id)}
                       className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border ${isEnabled ? 'bg-brand-600 hover:bg-brand-500 border-brand-500 text-white' : 'bg-slate-950 hover:bg-slate-900 border-slate-700 text-slate-400'}`}
                       data-testid={`button-toggle-template-${template.id}`}
                    >
                       {isEnabled ? '✓ Active' : 'Inactive'}
                    </button>
                    <button
                       onClick={() => togglePin(template.id)}
                       disabled={!isPinned && pinnedTemplates.length >= 4}
                       className={`px-3 py-2.5 rounded-lg transition-all flex items-center justify-center border ${isPinned ? 'bg-brand-500/20 border-brand-500/50 text-brand-400 hover:bg-brand-500/30' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'} disabled:opacity-50 disabled:cursor-not-allowed`}
                       title={pinnedTemplates.length >= 4 && !isPinned ? 'Maximum 4 pinned templates' : ''}
                       data-testid={`button-pin-template-${template.id}`}
                    >
                       <Pin size={16} />
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
            );
            })}

            
            <div 
               onClick={() => setShowCreateModal(true)}
               className="bg-dashed border border-slate-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 hover:border-slate-700 transition-all cursor-pointer" 
               data-testid="button-create-template"
            >
               <div className="p-4 rounded-full bg-slate-900 mb-4">
                  <Plus size={24} />
               </div>
               <h3 className="font-medium mb-1">Create Custom Template</h3>
               <p className="text-xs max-w-[200px]">Design a new intelligence output format for your team.</p>
            </div>
         </div>

         <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="bg-slate-950 border border-slate-800 max-w-2xl">
               <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                     <Lightbulb className="text-brand-400" size={20} />
                     Create Custom Template
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                     Design a new intelligence template tailored to your team's needs.
                  </DialogDescription>
               </DialogHeader>
               <div className="space-y-4">
                  <div>
                     <label className="text-sm font-semibold text-white block mb-2">Template Name</label>
                     <input 
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="e.g., Competitive Threat Assessment"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                        data-testid="input-template-name"
                     />
                  </div>
                  <div>
                     <label className="text-sm font-semibold text-white block mb-2">Description</label>
                     <textarea 
                        value={newTemplateDesc}
                        onChange={(e) => setNewTemplateDesc(e.target.value)}
                        placeholder="Brief description of what this template does..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none h-20"
                        data-testid="input-template-desc"
                     />
                  </div>
                  <div>
                     <label className="text-sm font-semibold text-white block mb-2">Category</label>
                     <select 
                        value={newTemplateCategory}
                        onChange={(e) => setNewTemplateCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                        data-testid="select-template-category"
                     >
                        <option>Custom</option>
                        <option>Sales Enablement</option>
                        <option>Product Strategy</option>
                        <option>Marketing</option>
                        <option>Executive</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-sm font-semibold text-white block mb-2">Prompt / Instructions</label>
                     <textarea 
                        value={newTemplatePrompt}
                        onChange={(e) => setNewTemplatePrompt(e.target.value)}
                        placeholder="Enter the AI prompt/instructions for this template..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none h-32"
                        data-testid="textarea-template-prompt"
                     />
                  </div>
                  <div className="flex gap-3 pt-4">
                     <button 
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        data-testid="button-cancel-template"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={handleCreateTemplate}
                        disabled={!newTemplateName.trim() || !newTemplateDesc.trim() || !newTemplatePrompt.trim()}
                        className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        data-testid="button-create-template-confirm"
                     >
                        Create Template
                     </button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
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

const BillingPopover: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [showUsageDetails, setShowUsageDetails] = useState(false);

  if (!isOpen) return null;

  // Mock usage data
  const usageData = [
    { date: '2024-12-23', action: 'Radar Task Scan - ChampSignal', credits: -450, type: 'radar' },
    { date: '2024-12-22', action: 'Research Report - Full Analysis', credits: -800, type: 'research' },
    { date: '2024-12-21', action: 'Competitor Discovery Scan', credits: -300, type: 'discovery' },
    { date: '2024-12-20', action: 'Track Signal Generation', credits: -200, type: 'track' },
    { date: '2024-12-19', action: 'SWOT Analysis Report', credits: -500, type: 'analysis' },
  ];

  const getIconForType = (type: string) => {
    switch(type) {
      case 'radar': return <Radar size={12} />;
      case 'research': return <BrainCircuit size={12} />;
      case 'discovery': return <Search size={12} />;
      case 'track': return <TrendingUp size={12} />;
      case 'analysis': return <BarChart3 size={12} />;
      default: return <Zap size={12} />;
    }
  };

  if (showUsageDetails) {
    return (
      <div className="fixed inset-0 z-[140] flex items-start justify-end pt-20 pr-8 pointer-events-none">
        <div 
          className="pointer-events-auto w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between shrink-0">
            <button
              onClick={() => setShowUsageDetails(false)}
              className="p-0.5 hover:bg-slate-800 rounded transition-colors mr-2"
              data-testid="button-back-usage"
            >
              <ChevronLeft size={16} className="text-slate-400" />
            </button>
            <h3 className="text-sm font-bold text-white flex-1">Usage Details</h3>
            <button 
              onClick={onClose}
              className="p-0.5 hover:bg-slate-800 rounded transition-colors"
              data-testid="button-close-usage"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>

          {/* Usage List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-2 p-3">
              {usageData.map((item, idx) => (
                <div key={idx} className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-slate-500">{getIconForType(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{item.action}</p>
                        <p className="text-[10px] text-slate-500">{item.date}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-red-400 ml-2 shrink-0">{item.credits}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-start justify-end pt-20 pr-8 pointer-events-none">
      <div 
        className="pointer-events-auto w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-brand-400" /> Account
          </h3>
          <button 
            onClick={onClose}
            className="p-0.5 hover:bg-slate-800 rounded transition-colors"
            data-testid="button-close-billing-popover"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Plan */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">Current Plan</p>
              <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 text-[10px] font-bold rounded border border-brand-500/30">Starter</span>
            </div>
            <p className="text-xs text-slate-300">10,000 credits/month</p>
          </div>

          {/* Credits Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Total Credits</p>
              <p className="text-sm font-bold text-white">10,000</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-slate-400">Remaining Balance</p>
                <p className="text-sm font-bold text-brand-400">2,450</p>
              </div>
              <button
                onClick={() => setShowUsageDetails(true)}
                className="px-2 py-1 rounded text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                data-testid="button-view-usage"
              >
                Details
              </button>
            </div>
            <div className="w-full bg-slate-800/30 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-brand-500 to-brand-400 h-2 rounded-full" style={{width: '24.5%'}}></div>
            </div>
          </div>

          {/* Top-Up Options */}
          <div className="border-t border-slate-700 pt-3">
            <p className="text-xs font-bold text-white mb-2">Quick Top-Up</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="border border-slate-700 rounded-lg p-2 hover:bg-slate-800/50 transition-colors text-center" data-testid="topup-5k">
                <p className="text-xs font-bold text-white">5K</p>
                <p className="text-[10px] text-slate-400">$49</p>
              </button>
              <button className="border border-slate-700 rounded-lg p-2 hover:bg-slate-800/50 transition-colors text-center" data-testid="topup-10k">
                <p className="text-xs font-bold text-white">10K</p>
                <p className="text-[10px] text-slate-400">$89</p>
              </button>
              <button className="border border-slate-700 rounded-lg p-2 hover:bg-slate-800/50 transition-colors text-center" data-testid="topup-25k">
                <p className="text-xs font-bold text-white">25K</p>
                <p className="text-[10px] text-slate-400">$199</p>
              </button>
              <button className="border border-slate-700 rounded-lg p-2 hover:bg-slate-800/50 transition-colors text-center" data-testid="topup-50k">
                <p className="text-xs font-bold text-white">50K</p>
                <p className="text-[10px] text-slate-400">$349</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-700 pt-3 flex gap-2">
            <button 
              onClick={onClose}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              data-testid="button-close-popover"
            >
              Close
            </button>
            <button 
              className="flex-1 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
              data-testid="button-upgrade-popover"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Workbench: React.FC = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<WorkbenchView>(WorkbenchView.RADAR);
  const [researchPrompt, setResearchPrompt] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [showFullFeed, setShowFullFeed] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [runningResearchTasks, setRunningResearchTasks] = useState<number>(0);
  
  // Global notification settings state (shared with SettingsModal)
  const [radarNotifyEmail, setRadarNotifyEmail] = useState('');
  const [radarNotifyDailyDigest, setRadarNotifyDailyDigest] = useState(true);
  const [editNotificationEmail, setEditNotificationEmail] = useState('');
  const [editFrequencyType, setEditFrequencyType] = useState<'daily' | 'weekly'>('daily');

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

  // Auto-select first target when targets load
  useEffect(() => {
    if (targets.length > 0 && !selectedTargetId) {
      setSelectedTargetId(targets[0].id);
    }
  }, [targets, selectedTargetId]);

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
    { id: WorkbenchView.RESEARCH, label: 'Research', icon: Lightbulb, description: 'Deep-dive AI analysis agent to generate reports and answer strategic questions.' },
    { id: WorkbenchView.LIBRARY, label: 'Library', icon: Book, description: 'Access your archive of generated research reports and deep-dives.' },
    { id: WorkbenchView.ACTS_TEMPLATE, label: 'Extensions', icon: Library, description: 'Pre-built templates for battle cards, SWOT analysis, and executive summaries.' },
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
        return <TargetsView targets={targets as any} selectedTargetId={selectedTargetId} setSelectedTargetId={setSelectedTargetId} onAddTarget={handleAddTarget} onTrackResearch={handleTrackResearch} runningResearchTasks={runningResearchTasks} setRunningResearchTasks={setRunningResearchTasks} onResearchPrompt={(prompt) => { setResearchPrompt(prompt); setActiveView(WorkbenchView.RESEARCH); }} />;
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
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        radarNotifyEmail={radarNotifyEmail}
        setRadarNotifyEmail={setRadarNotifyEmail}
        radarNotifyDailyDigest={radarNotifyDailyDigest}
        setRadarNotifyDailyDigest={setRadarNotifyDailyDigest}
        editNotificationEmail={editNotificationEmail}
        setEditNotificationEmail={setEditNotificationEmail}
        editFrequencyType={editFrequencyType}
        setEditFrequencyType={setEditFrequencyType}
      />

      <nav className="w-64 border-r border-slate-800 bg-[#020617] flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 group cursor-pointer">
          <Hexagon className="text-brand-500 fill-brand-500/20 group-hover:rotate-90 transition-transform duration-500" size={28} />
          <span className="text-lg font-bold tracking-tight text-white">Competi<span className="text-brand-500">Scope</span></span>
        </div>

        <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => (
            <div key={item.id} className="relative group/tooltip">
              <button
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
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.id === WorkbenchView.RESEARCH && runningResearchTasks > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[9px] font-bold shrink-0">
                    <Loader2 size={10} className="animate-spin" />
                    {runningResearchTasks}
                  </span>
                )}
                <HelpCircle 
                  size={14} 
                  className={`shrink-0 transition-colors ${
                    activeView === item.id 
                      ? 'text-brand-400/60 group-hover:text-brand-400' 
                      : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                  data-testid={`help-icon-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                />
                
                {activeView === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full"></div>
                )}
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/tooltip:block z-50 pointer-events-none">
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 shadow-xl animate-in fade-in zoom-in-95 duration-200 w-48">
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 space-y-1 border-t border-slate-800">
          {BOTTOM_NAV_ITEMS.map(item => (
            <div key={item.id} className="relative group/tooltip">
              <button
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
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <HelpCircle 
                  size={14} 
                  className={`shrink-0 transition-colors ${
                    activeView === item.id 
                      ? 'text-brand-400/60 group-hover:text-brand-400' 
                      : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                  data-testid={`help-icon-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                />
                
                {activeView === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full"></div>
                )}
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/tooltip:block z-50 pointer-events-none">
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 shadow-xl animate-in fade-in zoom-in-95 duration-200 w-48">
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
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
            <button 
              onClick={() => setShowBillingModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/50 hover:border-slate-600 transition-colors hover-elevate" 
              data-testid="container-credits"
            >
              <Sparkles size={14} className="text-brand-400" />
              <span className="text-xs font-bold text-white">2,450</span>
              <span className="text-[10px] text-slate-500 font-medium">Credits</span>
            </button>
            <button className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors" data-testid="button-help">
              Help & Docs
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0b0c0f]">
          {renderContent()}
        </div>
      </main>

      <BillingPopover isOpen={showBillingModal} onClose={() => setShowBillingModal(false)} />
    </div>
  );
};
