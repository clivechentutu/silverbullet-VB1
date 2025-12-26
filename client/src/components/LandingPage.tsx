import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Sparkles, Globe, AlertCircle, BarChart3, Target, Radar as RadarIcon, Crosshair, Bot, X, Mail, Gift, CheckCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Header } from './Header';
import { ScenarioSelector } from './ScenarioSelector';
import { AppState, AnalysisResult } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SiGoogle } from 'react-icons/si';

type ActionMode = 'radar' | 'tracker' | 'research';

export const LandingPage = () => {
  const [url, setUrl] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeMode, setActiveMode] = useState<ActionMode>('radar');
  const [, navigate] = useLocation();

  // Radar Modal States
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [isRadarLoading, setIsRadarLoading] = useState(false);
  const [radarTaskName, setRadarTaskName] = useState('');
  const [radarUrl, setRadarUrl] = useState('');
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<Array<{id: string; name: string; url: string; favicon: string; description: string}>>([]);
  const [hoveredCompetitor, setHoveredCompetitor] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Tracker Modal States
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackerTargetName, setTrackerTargetName] = useState('');
  const [trackerTargetUrl, setTrackerTargetUrl] = useState('');
  const [trackerSelectedTrackers, setTrackerSelectedTrackers] = useState<string[]>(['website', 'backlinks', 'seo', 'social', 'news', 'ads']);

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authSource, setAuthSource] = useState<'radar' | 'tracker' | 'research'>('radar');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authStep, setAuthStep] = useState<'choice' | 'email'>('choice');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validation Errors State
  const [errors, setErrors] = useState<{
    url?: string;
    email?: string;
    password?: string;
  }>({});

  const trackerOptions = [
    { id: 'website', label: 'Website Tracker', description: 'On-page copy, pricing, features' },
    { id: 'backlinks', label: 'Backlinks Tracker', description: 'Domain ranking, backlinks' },
    { id: 'seo', label: 'SEO Tracker', description: 'Rankings, keywords, search volume' },
    { id: 'social', label: 'Social Tracker', description: 'Posts and engagement' },
    { id: 'news', label: 'News Tracker', description: 'Press coverage' },
    { id: 'ads', label: 'Ads Tracker', description: 'Ad spend' }
  ];

  // ========== VALIDATION FUNCTIONS ==========
  const validateUrl = (urlValue: string): string | undefined => {
    if (!urlValue.trim()) {
      return 'URL is required';
    }
    const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (!urlRegex.test(urlValue)) {
      return 'Please enter a valid URL (e.g., example.com)';
    }
    return undefined;
  };

  const validateEmail = (emailValue: string): string | undefined => {
    if (!emailValue.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (passwordValue: string, mode: 'login' | 'signup'): string | undefined => {
    if (!passwordValue) {
      return 'Password is required';
    }
    if (mode === 'signup') {
      if (passwordValue.length < 8) {
        return 'Password must be at least 8 characters';
      }
      const hasUppercase = /[A-Z]/.test(passwordValue);
      const hasLowercase = /[a-z]/.test(passwordValue);
      const hasNumber = /\d/.test(passwordValue);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue);
      
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        return 'Password must contain uppercase, lowercase, and numbers';
      }
    }
    return undefined;
  };

  const validateQuery = (queryValue: string): string | undefined => {
    if (!queryValue.trim()) {
      return 'Research query is required';
    }
    if (queryValue.trim().length < 5) {
      return 'Query must be at least 5 characters';
    }
    return undefined;
  };

  // Simulated AI Analysis Results
  const generateAIAnalysis = (domain: string) => {
    return {
      positioning: `${domain} is a digital product or service company offering innovative solutions in their market vertical. The platform demonstrates strong market positioning with emphasis on ease of use and enterprise capabilities.`,
      discoveryPrompt: `Find all direct competitors and market alternatives to ${domain}. Identify companies offering similar products/services, indirect competitors in the adjacent market, and potential new entrants that could disrupt this space. Include both established players and emerging startups.`
    };
  };

  // Generate sample discovered competitors based on domain
  const generateDiscoveredCompetitors = (domain: string) => {
    const baseDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    const sampleCompetitors = [
      { id: '1', name: 'MarketWatch Pro', url: 'https://marketwatchpro.com', favicon: 'https://www.google.com/s2/favicons?domain=marketwatchpro.com&sz=32', description: 'Real-time market intelligence platform for tracking competitor pricing, product launches, and market trends across industries.' },
      { id: '2', name: 'CompeteIQ', url: 'https://competeiq.io', favicon: 'https://www.google.com/s2/favicons?domain=competeiq.io&sz=32', description: 'AI-powered competitive analysis tool that helps sales teams win more deals with battle cards and real-time insights.' },
      { id: '3', name: 'RivalScan', url: 'https://rivalscan.com', favicon: 'https://www.google.com/s2/favicons?domain=rivalscan.com&sz=32', description: 'Automated competitor monitoring and alerting platform for product managers and marketing teams.' },
      { id: '4', name: 'IntelliMarket', url: 'https://intellimarket.ai', favicon: 'https://www.google.com/s2/favicons?domain=intellimarket.ai&sz=32', description: 'Enterprise market research platform using AI to analyze industry trends, customer sentiment, and competitive positioning.' },
      { id: '5', name: 'Stratego Analytics', url: 'https://strategoanalytics.com', favicon: 'https://www.google.com/s2/favicons?domain=strategoanalytics.com&sz=32', description: 'Strategic planning and competitive intelligence software for executive teams and business strategists.' },
    ];
    return sampleCompetitors.slice(0, 5);
  };

  const removeDiscoveredCompetitor = (id: string) => {
    setDiscoveredCompetitors(prev => prev.filter(c => c.id !== id));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    // Clear any previous errors when user starts typing
    setErrors(prev => ({ ...prev, url: undefined }));
    setErrorMsg('');
  };

  const handleStart = async () => {
    if (!url) return;
    
    // Different validation based on mode
    if (activeMode === 'research') {
      const queryError = validateQuery(url);
      if (queryError) {
        setErrors(prev => ({ ...prev, url: queryError }));
        return;
      }
      setErrors(prev => ({ ...prev, url: undefined }));
    } else {
      const urlError = validateUrl(url);
      if (urlError) {
        setErrors(prev => ({ ...prev, url: urlError }));
        return;
      }
      setErrors(prev => ({ ...prev, url: undefined }));
    }
    
    setErrorMsg("");

    if (activeMode === 'radar') {
      // Start Radar scanning process
      setIsRadarLoading(true);
      setRadarUrl(url);
      setRadarTaskName(url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]);
      
      // Simulate scanning delay (3-5 seconds)
      setTimeout(() => {
        setIsRadarLoading(false);
        setRadarTaskName(generateAIAnalysis(url).discoveryPrompt);
        setDiscoveredCompetitors(generateDiscoveredCompetitors(url));
        setShowRadarModal(true);
      }, 3500);
    } else if (activeMode === 'tracker') {
      // Show Tracker configuration modal with pre-filled URL
      setTrackerTargetUrl(url);
      setTrackerTargetName(url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]);
      setShowTrackerModal(true);
    } else if (activeMode === 'research') {
      // Research mode - directly show auth modal (no configuration needed)
      setAuthSource('research');
      setAuthStep('choice');
      setShowAuthModal(true);
    }
  };

  const toggleScenario = (id: string) => {
    setSelectedScenarios(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const executeAnalysis = async () => {
    setAppState(AppState.ANALYZING);
    try {
      const result = await apiRequest('POST', '/api/analyze', {
        url,
        selectedScenarios
      });
      const data = await result.json();
      setAnalysisResult(data);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "An unexpected error occurred");
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setUrl('');
    setSelectedScenarios([]);
    setAnalysisResult(null);
  };

  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center min-h-screen">
        
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 opacity-20 pointer-events-none" />

        <div className={`w-full max-w-4xl mx-auto text-center transition-all duration-700 ${appState === AppState.RESULTS ? 'hidden' : 'block'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-brand-300 mb-6">
            <Sparkles size={14} />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Decode Your Competition.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Discover competitors in seconds. Track their moves in real-time. Analyze trends with AI &amp; Deep Research to Win.
          </p>

          {/* Mode Selection Tabs */}
          <div className="mb-8 flex justify-center gap-3">
            {[
              { id: 'radar' as ActionMode, label: 'Radar', icon: RadarIcon, desc: 'Discover competitors' },
              { id: 'tracker' as ActionMode, label: 'Tracker', icon: Crosshair, desc: 'Monitor competitors' },
              { id: 'research' as ActionMode, label: 'Research', icon: Bot, desc: 'Deep analysis' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id);
                  setErrors({});
                }}
                data-testid={`tab-${mode.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeMode === mode.id
                    ? 'bg-brand-500/20 border border-brand-500/50 text-brand-400'
                    : 'bg-slate-900/50 border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <mode.icon size={16} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <div className={`relative max-w-2xl mx-auto transition-all duration-500 ${appState !== AppState.IDLE ? 'scale-100' : 'hover:scale-[1.01]'}`}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              {activeMode === 'research' ? (
                <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <div className="flex items-start gap-4 p-4">
                    <div className="pt-1 text-slate-500 flex-shrink-0">
                      <Bot size={20} />
                    </div>
                    <textarea
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleStart()}
                      placeholder="Ask me about market trends, competitor strategies, pricing intelligence... What would you like to know about your market?"
                      disabled={appState === AppState.ANALYZING}
                      data-testid="input-research-query"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-base resize-none focus-visible:ring-0 min-h-20 py-2"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 px-4 pb-4">
                    <button
                      onClick={handleStart}
                      disabled={appState !== AppState.IDLE}
                      data-testid="button-start"
                      className={`
                        px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 flex-shrink-0 btn-hover-glow transition-all
                        ${appState !== AppState.IDLE
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-brand-500 hover:bg-brand-600 text-white'
                        }
                      `}
                    >
                      Deep Research <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl">
                  <div className="pl-2 pr-1 text-slate-500 flex-shrink-0">
                    <Globe size={20} />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={handleUrlChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    placeholder={
                      activeMode === 'radar' ? 'Paste a competitor URL to discover similar products...' :
                      activeMode === 'tracker' ? 'Enter a website URL to monitor...' :
                      'Ask me about your market, competitors, or strategy...'
                    }
                    disabled={appState === AppState.ANALYZING}
                    data-testid="input-url"
                    className={`flex-1 bg-transparent border-none outline-none text-white placeholder-slate-600 py-3 text-base input-focus-effect ${errors.url ? 'text-red-400' : ''}`}
                  />
                  <button
                    onClick={handleStart}
                    disabled={appState !== AppState.IDLE || !url.trim()}
                    data-testid="button-start"
                    className={`
                      py-3 px-6 rounded-lg font-semibold flex items-center gap-2 flex-shrink-0 btn-hover-glow text-sm transition-all
                      ${(appState !== AppState.IDLE || !url.trim()) 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-brand-500 hover:bg-brand-600 text-white'
                      }
                    `}
                  >
                    {activeMode === 'radar' ? 'Scan' :
                     activeMode === 'tracker' ? 'Track' :
                     'Deep Research'} <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {(errorMsg || errors.url) && appState !== AppState.RESULTS && appState !== AppState.ERROR && (
              <div className="absolute top-full left-0 mt-2 text-red-400 text-sm flex items-center gap-1 animate-bounce-in" data-testid="text-error">
                <AlertCircle size={14} /> {errors.url || errorMsg}
              </div>
            )}
          </div>
        </div>

        <ScenarioSelector 
          selectedIds={selectedScenarios}
          onToggle={toggleScenario}
          isVisible={appState === AppState.SCENARIO_SELECTION}
        />

        {appState === AppState.SCENARIO_SELECTION && selectedScenarios.length > 0 && (
          <div className="mt-12 animate-fade-in-up">
            <button
              onClick={executeAnalysis}
              data-testid="button-generate"
              className="bg-brand-600 hover:bg-brand-500 text-white text-lg font-semibold py-4 px-12 rounded-full shadow-[0_0_40px_rgba(13,148,136,0.3)] hover:shadow-[0_0_60px_rgba(13,148,136,0.5)] transition-all duration-300 flex items-center gap-3"
            >
              Generate Intelligence Report
            </button>
          </div>
        )}

        {(appState === AppState.ANALYZING || isRadarLoading) && (
          <div className="mt-20 flex flex-col items-center animate-fade-in-up">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-brand-500 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-medium text-slate-200" data-testid="text-loading">
              {isRadarLoading ? 'Scanning Website...' : 'Orchestrating AI Agents...'}
            </h3>
            <p className="text-slate-500 mt-2">
              {isRadarLoading ? `Analyzing ${url} for competitors` : `Gathering data points from ${url}`}
            </p>
          </div>
        )}

        {appState === AppState.RESULTS && analysisResult && (
          <div className="w-full max-w-5xl animate-fade-in-up mt-8">
            <button onClick={reset} className="mb-8 text-sm text-slate-400 hover:text-white flex items-center gap-2" data-testid="button-back">
              <ArrowRight className="rotate-180" size={14} /> Back to Search
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold mb-4 text-white" data-testid="text-summary-title">Executive Summary</h2>
                  <p className="text-slate-300 leading-relaxed text-lg" data-testid="text-summary">{analysisResult.summary}</p>
                </div>

                {analysisResult.swot && (
                   <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                     <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <BarChart3 className="text-brand-500" /> SWOT Analysis
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <h4 className="text-green-400 font-semibold mb-2 text-sm uppercase tracking-wider">Strengths</h4>
                         <ul className="list-disc list-inside text-slate-300 space-y-1">
                           {analysisResult.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                       <div>
                         <h4 className="text-red-400 font-semibold mb-2 text-sm uppercase tracking-wider">Weaknesses</h4>
                         <ul className="list-disc list-inside text-slate-300 space-y-1">
                           {analysisResult.swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                       <div>
                         <h4 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">Opportunities</h4>
                         <ul className="list-disc list-inside text-slate-300 space-y-1">
                           {analysisResult.swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                       <div>
                         <h4 className="text-orange-400 font-semibold mb-2 text-sm uppercase tracking-wider">Threats</h4>
                         <ul className="list-disc list-inside text-slate-300 space-y-1">
                           {analysisResult.swot.threats.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                     </div>
                   </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="text-brand-500" /> Identified Competitors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.competitors.map((comp, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 text-slate-200 rounded-full text-sm border border-slate-700" data-testid={`tag-competitor-${i}`}>
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {analysisResult.battleCard && (
                  <div className="bg-gradient-to-br from-brand-900/20 to-slate-900 border border-brand-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-400">
                      <Sparkles size={18} /> Battle Card Alpha
                    </h3>
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Kill Points</p>
                      <ul className="space-y-2">
                        {analysisResult.battleCard.killPoints.map((kp, i) => (
                          <li key={i} className="text-sm text-slate-200 flex gap-2">
                            <span className="text-brand-500">-</span> {kp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
           <div className="mt-20 text-center animate-fade-in-up">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
               <AlertCircle size={32} className="text-red-500" />
             </div>
             <h3 className="text-xl font-medium text-white mb-2">Analysis Failed</h3>
             <p className="text-slate-400 mb-8 max-w-md mx-auto" data-testid="text-error-message">{errorMsg}</p>
             <button 
               onClick={reset}
               data-testid="button-retry"
               className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors"
             >
               Try Again
             </button>
           </div>
        )}

        {/* Radar Configuration Modal */}
        <Dialog open={showRadarModal} onOpenChange={setShowRadarModal}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                <RadarIcon className="text-brand-500" size={20} />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">New Radar Task</DialogTitle>
                <p className="text-xs text-slate-400 mt-1">AI-powered competitor discovery</p>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Target Website URL - Read Only */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Website URL</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-500">
                    <Globe size={16} />
                  </div>
                  <input
                    type="text"
                    value={radarUrl}
                    readOnly
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-300 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* AI Analysis Results - Positioning (Read-Only) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Positioning</label>
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                  <p className="text-xs text-slate-300 leading-relaxed">{generateAIAnalysis(radarUrl).positioning}</p>
                </div>
              </div>

              {/* AI Discovery Prompt - Editable */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">AI Discovery Prompt</label>
                <textarea
                  value={radarTaskName}
                  onChange={(e) => setRadarTaskName(e.target.value)}
                  placeholder="Customize your discovery prompt..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all min-h-24 resize-none"
                  data-testid="textarea-radar-discovery-prompt"
                />
              </div>

              {/* Discovered Competitors Section */}
              {discoveredCompetitors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Discovered Competitors ({discoveredCompetitors.length})
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {discoveredCompetitors.map((competitor) => (
                      <div
                        key={competitor.id}
                        className="group relative flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all"
                        data-testid={`card-competitor-${competitor.id}`}
                      >
                        {/* Favicon/Logo */}
                        <div className="w-8 h-8 rounded-md bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={competitor.favicon}
                            alt={competitor.name}
                            className="w-5 h-5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <Globe className="w-4 h-4 text-slate-500 hidden" />
                        </div>

                        {/* Name and URL */}
                        <div className="w-28 flex-shrink-0 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{competitor.name}</p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(competitor.url, '_blank', 'noopener,noreferrer');
                            }}
                            onMouseEnter={() => setPreviewUrl(competitor.url)}
                            onMouseLeave={() => setPreviewUrl(null)}
                            className="text-xs text-slate-500 hover:text-brand-400 truncate flex items-center gap-1 group/link cursor-pointer bg-transparent border-none p-0"
                            data-testid={`link-competitor-url-${competitor.id}`}
                          >
                            <span className="truncate">{competitor.url.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        </div>

                        {/* Product Positioning / Meta Description */}
                        <div className="flex-1 min-w-0 px-2 border-l border-slate-700 flex items-center justify-between gap-4">
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <p 
                                className="text-xs text-slate-400 line-clamp-2 cursor-default flex-1"
                                data-testid={`text-competitor-description-${competitor.id}`}
                              >
                                {competitor.description}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="max-w-xs bg-slate-800 border-slate-700 text-slate-200 text-xs p-3"
                            >
                              {competitor.description}
                            </TooltipContent>
                          </Tooltip>

                          {/* Traffic Data */}
                          <div className="flex flex-col items-end flex-shrink-0 text-[10px] leading-tight pr-2 border-r border-slate-800/50 min-w-[70px]">
                            <span className="text-slate-500 font-medium uppercase tracking-tighter">Traffic</span>
                            <span className="text-brand-400 font-bold tabular-nums">1.2M+</span>
                            <span className="text-slate-600 text-[8px] italic">SimilarWeb</span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeDiscoveredCompetitor(competitor.id)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          data-testid={`button-remove-competitor-${competitor.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowRadarModal(false)}
                className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                data-testid="button-cancel-radar-task"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRadarModal(false);
                  setAuthSource('radar');
                  setAuthStep('choice');
                  setShowAuthModal(true);
                }}
                disabled={!radarTaskName.trim()}
                className="px-6 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center gap-2"
                data-testid="button-launch-radar-task"
              >
                <RadarIcon size={16} />
                Start Discovery
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tracker Configuration Modal */}
        <Dialog open={showTrackerModal} onOpenChange={setShowTrackerModal}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                <Target className="text-brand-500" size={20} />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">Edit Target Configuration</DialogTitle>
                <p className="text-xs text-slate-400 mt-1">Update target details and tracking settings</p>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Target Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Name</label>
                <input
                  type="text"
                  value={trackerTargetName}
                  onChange={(e) => setTrackerTargetName(e.target.value)}
                  placeholder="e.g., TrendSpotter"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                  data-testid="input-tracker-target-name"
                />
              </div>

              {/* Target Website URL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Website URL</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-500">
                    <Globe size={16} />
                  </div>
                  <input
                    type="url"
                    value={trackerTargetUrl}
                    onChange={(e) => setTrackerTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                    data-testid="input-tracker-target-url"
                  />
                </div>
              </div>

              {/* Active Trackers */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Active Trackers</label>
                <div className="space-y-2">
                  {trackerOptions.map((tracker) => (
                    <label key={tracker.id} className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={trackerSelectedTrackers.includes(tracker.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTrackerSelectedTrackers([...trackerSelectedTrackers, tracker.id]);
                          } else {
                            setTrackerSelectedTrackers(trackerSelectedTrackers.filter(t => t !== tracker.id));
                          }
                        }}
                        className="w-4 h-4 rounded mt-0.5 accent-brand-500" 
                        data-testid={`checkbox-tracker-${tracker.id}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{tracker.label}</p>
                        <p className="text-xs text-slate-500">{tracker.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowTrackerModal(false)}
                className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                data-testid="button-cancel-tracker-config"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTrackerModal(false);
                  setAuthSource('tracker');
                  setAuthStep('choice');
                  setShowAuthModal(true);
                }}
                disabled={!trackerTargetName.trim() || !trackerTargetUrl.trim()}
                className="px-6 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center gap-2"
                data-testid="button-save-tracker-config"
              >
                <Target size={16} />
                Start Tracking
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auth Modal - Registration/Login Interface */}
        <Dialog open={showAuthModal} onOpenChange={(open) => {
          setShowAuthModal(open);
          if (!open) {
            setAuthStep('choice');
            setEmailInput('');
            setPasswordInput('');
          }
        }}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md p-0 overflow-hidden">
            {/* Top Section - Operation Summary & Preview */}
            <div className="bg-gradient-to-br from-brand-600/20 via-brand-500/10 to-slate-900 p-6 border-b border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                  {authSource === 'radar' ? (
                    <RadarIcon className="text-brand-400" size={24} />
                  ) : authSource === 'tracker' ? (
                    <Target className="text-brand-400" size={24} />
                  ) : (
                    <Bot className="text-brand-400" size={24} />
                  )}
                </div>
                <div>
                  <p className="text-brand-400 text-sm font-medium">
                    {authSource === 'research' ? 'Deep AI Research Selected' : 'Configuration Complete'}
                  </p>
                  <h3 className="text-white font-semibold">
                    {authSource === 'radar' ? 'Radar Task Ready' : 
                     authSource === 'tracker' ? 'Tracker Configured' : 
                     'AI Research Agent Ready'}
                  </h3>
                </div>
              </div>
              
              {/* Preview Animation */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                </div>
                <div>
                  <p className="text-slate-300 text-sm">
                    {authSource === 'radar' 
                      ? 'Preparing competitor discovery results...' 
                      : authSource === 'tracker'
                      ? `Setting up monitoring for ${trackerTargetName || 'your target'}...`
                      : 'Initializing AI research agent...'}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">Sign in to view your results</p>
                </div>
              </div>
            </div>

            {/* Middle Section - Value Proposition & Credits */}
            <div className="p-6 space-y-4">
              {/* 300 Credits Incentive - Prominent */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Gift className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-amber-400 font-bold text-lg">300 Free Credits/Month</p>
                  <p className="text-slate-400 text-sm">Complete tasks and unlock insights at no cost</p>
                </div>
              </div>

              {/* Value Props */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="text-brand-500 flex-shrink-0" size={18} />
                  <span className="text-sm">Save and export all analysis results</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="text-brand-500 flex-shrink-0" size={18} />
                  <span className="text-sm">Continuous monitoring with real-time alerts</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="text-brand-500 flex-shrink-0" size={18} />
                  <span className="text-sm">AI-powered insights and battle cards</span>
                </div>
              </div>
            </div>

            {/* Bottom Section - Auth Options */}
            <div className="p-6 pt-0">
              {authStep === 'choice' ? (
                <div className="space-y-3">
                  {/* Google OAuth */}
                  <button
                    onClick={() => {
                      // TODO: Implement Google OAuth
                      console.log('Google OAuth clicked');
                      navigate('/workbench');
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3.5 px-4 rounded-lg transition-colors"
                    data-testid="button-auth-google"
                  >
                    <SiGoogle size={18} />
                    Continue with Google
                  </button>

                  {/* Email Option */}
                  <button
                    onClick={() => setAuthStep('email')}
                    className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-4 rounded-lg border border-slate-700 transition-colors"
                    data-testid="button-auth-email"
                  >
                    <Mail size={18} />
                    Continue with Email
                  </button>

                  {/* Toggle Login/Signup */}
                  <p className="text-center text-slate-500 text-sm pt-2">
                    {authMode === 'signup' ? (
                      <>Already have an account? <button onClick={() => setAuthMode('login')} className="text-brand-400 hover:underline" data-testid="link-switch-to-login">Log in</button></>
                    ) : (
                      <>New to CompetiScope? <button onClick={() => setAuthMode('signup')} className="text-brand-400 hover:underline" data-testid="link-switch-to-signup">Sign up</button></>
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Back Button */}
                  <button
                    onClick={() => setAuthStep('choice')}
                    className="text-slate-400 hover:text-slate-300 text-sm flex items-center gap-1"
                    data-testid="button-auth-back"
                  >
                    <ArrowRight className="rotate-180" size={14} /> Back to options
                  </button>

                  {/* Email Form */}
                  <div className="space-y-3">
                    {/* Success Message */}
                    {authSuccess && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-950/30 border border-green-900/50 text-green-400 text-sm animate-bounce-in">
                        <CheckCircle size={16} className="flex-shrink-0" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmailInput(val);
                          if (val) {
                            const err = validateEmail(val);
                            if (err) {
                              setErrors(prev => ({ ...prev, email: err }));
                            } else {
                              setErrors(prev => ({ ...prev, email: undefined }));
                            }
                          } else {
                            setErrors(prev => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder="you@company.com"
                        className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all input-focus-effect ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50'}`}
                        data-testid="input-auth-email"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPasswordInput(val);
                          if (val) {
                            const err = validatePassword(val, authMode);
                            if (err) {
                              setErrors(prev => ({ ...prev, password: err }));
                            } else {
                              setErrors(prev => ({ ...prev, password: undefined }));
                            }
                          } else {
                            setErrors(prev => ({ ...prev, password: undefined }));
                          }
                        }}
                        placeholder={authMode === 'signup' ? 'Create a password (8+ chars, uppercase, lowercase, numbers)' : 'Enter your password'}
                        className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all input-focus-effect ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50'}`}
                        data-testid="input-auth-password"
                      />
                      {errors.password && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.password}</p>}
                    </div>

                    <button
                      onClick={() => {
                        const emailErr = validateEmail(emailInput);
                        const passwordErr = validatePassword(passwordInput, authMode);
                        
                        if (emailErr || passwordErr) {
                          setErrors({
                            email: emailErr,
                            password: passwordErr
                          });
                          return;
                        }
                        
                        setAuthSuccess(true);
                        setSuccessMessage(authMode === 'signup' ? 'Account created successfully!' : 'Logged in successfully!');
                        setTimeout(() => {
                          navigate('/workbench');
                        }, 1500);
                      }}
                      disabled={!emailInput || !passwordInput || !!errors.email || !!errors.password}
                      className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-lg transition-all btn-hover-glow"
                      data-testid="button-auth-submit"
                    >
                      {authMode === 'signup' ? 'Create Account' : 'Log In'}
                    </button>

                    {authMode === 'login' && (
                      <button className="w-full text-slate-400 hover:text-slate-300 text-sm" data-testid="link-forgot-password">
                        Forgot password?
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-4">
              <p className="text-slate-600 text-xs text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Website Preview Tooltip - Hover triggered */}
        {previewUrl && createPortal(
          <div 
            className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden w-[1000px]">
              {/* Preview Header - Browser Chrome */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 flex items-center gap-1.5 bg-slate-700/50 rounded px-2 py-1">
                  <Globe className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-400 truncate">{previewUrl}</span>
                </div>
              </div>
              {/* Website Screenshot Preview */}
              <div className="relative bg-white h-[600px]">
                <img
                  src={`https://image.thum.io/get/width/1000/crop/600/${previewUrl}`}
                  alt="Website preview"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Fallback placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-500">
                  <Globe className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Loading preview...</p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      </main>


      <footer className="border-t border-slate-900 py-8 bg-slate-950/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-4 text-slate-600 text-sm">
          <p>2024 CompetiScope Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy</a>
            <a href="#" className="hover:text-slate-400">Terms</a>
            <a href="#" className="hover:text-slate-400">Security</a>
          </div>
        </div>
      </footer>
    </>
  );
};
