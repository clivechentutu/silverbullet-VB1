import { useState } from 'react';
import { ArrowRight, Sparkles, Globe, AlertCircle, BarChart3, Target } from 'lucide-react';
import { useLocation } from 'wouter';
import { Header } from './Header';
import { ScenarioSelector } from './ScenarioSelector';
import { AppState, AnalysisResult } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export const LandingPage = () => {
  const [url, setUrl] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [, navigate] = useLocation();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleStart = () => {
    if (!url) return;
    if (!url.includes('.') || url.length < 4) {
      setErrorMsg("Please enter a valid URL");
      return;
    }
    setErrorMsg("");
    setAppState(AppState.SCENARIO_SELECTION);
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
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light">
            Enter a competitor's URL and let our AI agents orchestrate a deep-dive market intelligence report in seconds.
          </p>

          <div className={`relative max-w-2xl mx-auto transition-all duration-500 ${appState !== AppState.IDLE ? 'scale-100' : 'hover:scale-[1.01]'}`}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl">
                <div className="pl-4 pr-3 text-slate-500">
                  <Globe size={20} />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="enter-competitor-website.com"
                  disabled={appState === AppState.ANALYZING}
                  data-testid="input-url"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-600 h-12 text-lg"
                />
                <button
                  onClick={handleStart}
                  disabled={appState !== AppState.IDLE && appState !== AppState.SCENARIO_SELECTION}
                  data-testid="button-start"
                  className={`
                    h-12 px-8 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300
                    ${(appState !== AppState.IDLE && appState !== AppState.SCENARIO_SELECTION) 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-white text-slate-950 hover:bg-brand-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    }
                  `}
                >
                  Start <ArrowRight size={18} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => navigate('/debug')}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors bg-slate-900/50 hover:bg-slate-800/50"
                data-testid="button-debug"
              >
                Debug: Preview Workbench
              </button>
            </div>
            {errorMsg && appState !== AppState.RESULTS && appState !== AppState.ERROR && (
              <div className="absolute top-full left-0 mt-2 text-red-400 text-sm flex items-center gap-1 animate-fade-in-up" data-testid="text-error">
                <AlertCircle size={14} /> {errorMsg}
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

        {appState === AppState.ANALYZING && (
          <div className="mt-20 flex flex-col items-center animate-fade-in-up">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-brand-500 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-medium text-slate-200" data-testid="text-loading">Orchestrating AI Agents...</h3>
            <p className="text-slate-500 mt-2">Gathering data points from {url}</p>
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
