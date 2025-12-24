import { Radar as RadarIcon, Crosshair, Bot, ChevronRight } from 'lucide-react';

interface FeatureComparisonCardsProps {
  activeMode: 'radar' | 'tracker' | 'research';
  onModeSelect: (mode: 'radar' | 'tracker' | 'research') => void;
}

export const FeatureComparisonCards = ({ activeMode, onModeSelect }: FeatureComparisonCardsProps) => {
  const features = [
    {
      id: 'radar',
      icon: RadarIcon,
      title: 'Radar',
      subtitle: 'Quick Competitor Discovery',
      proposition: 'Input URL, AI analysis in seconds',
      scenarios: ['Understand competitor positioning', 'Identify market alternatives', 'Analyze strengths & weaknesses'],
      results: ['Product positioning analysis', 'Core feature identification', 'Competitor discovery', 'Visual comparison'],
      difficulty: 'Easiest',
      time: 'Real-time results',
      users: ['Product Managers', 'Marketing Teams', 'Operations Teams'],
      price: 'Free Trial',
      buttonText: 'Try Now',
      accentColor: 'brand'
    },
    {
      id: 'tracker',
      icon: Crosshair,
      title: 'Tracker',
      subtitle: 'Continuous Competitor Monitoring',
      proposition: 'Multi-dimensional tracking, real-time alerts',
      scenarios: ['Monitor feature updates', 'Track pricing changes', 'Watch marketing strategy shifts'],
      results: ['Product change monitoring', 'SEO/keyword tracking', 'Ad spend analysis', 'Social sentiment', 'Hiring trends', 'News monitoring'],
      difficulty: 'Requires setup',
      time: 'Data starts in 1 day',
      users: ['Competitive Analysts', 'Product Managers', 'Operations Teams'],
      price: 'Pro Plan',
      buttonText: 'Start Tracking',
      accentColor: 'slate'
    },
    {
      id: 'research',
      icon: Bot,
      title: 'Research',
      subtitle: 'Deep AI Analysis',
      proposition: 'AI Agents, multi-dimensional insights',
      scenarios: ['Analyze competitor strategy', 'Understand user feedback', 'Identify market trends'],
      results: ['Strategic analysis', 'Market trend insights', 'User feedback analysis', 'Custom reports', 'Actionable recommendations'],
      difficulty: 'Most flexible',
      time: 'Analysis in minutes',
      users: ['Product Managers', 'Competitive Analysts', 'Marketing Teams'],
      price: 'Premium',
      buttonText: 'Deep Analyze',
      accentColor: 'purple'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const isActive = activeMode === feature.id;
          const Icon = feature.icon;
          
          const accentClasses = {
            brand: {
              border: isActive ? 'border-brand-500/60' : 'border-slate-700/50',
              bg: isActive ? 'bg-brand-950/40' : 'bg-slate-900/40',
              shadow: isActive ? 'shadow-[0_0_30px_rgba(20,184,166,0.25)]' : '',
              iconBg: isActive ? 'bg-brand-500/20' : 'bg-slate-800/50',
              iconColor: isActive ? 'text-brand-400' : 'text-slate-400',
              badge: 'bg-brand-500/20 text-brand-300',
              difficultyColor: 'text-brand-300',
              button: isActive ? 'bg-brand-500/30 text-brand-300 border-brand-500/50' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
            },
            slate: {
              border: isActive ? 'border-slate-600/60' : 'border-slate-700/50',
              bg: isActive ? 'bg-slate-800/40' : 'bg-slate-900/40',
              shadow: isActive ? 'shadow-[0_0_30px_rgba(100,116,139,0.25)]' : '',
              iconBg: isActive ? 'bg-slate-700/50' : 'bg-slate-800/50',
              iconColor: isActive ? 'text-slate-300' : 'text-slate-400',
              badge: 'bg-slate-700/50 text-slate-200',
              difficultyColor: 'text-slate-300',
              button: isActive ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
            },
            purple: {
              border: isActive ? 'border-purple-500/60' : 'border-slate-700/50',
              bg: isActive ? 'bg-purple-950/40' : 'bg-slate-900/40',
              shadow: isActive ? 'shadow-[0_0_30px_rgba(168,85,247,0.25)]' : '',
              iconBg: isActive ? 'bg-purple-500/20' : 'bg-slate-800/50',
              iconColor: isActive ? 'text-purple-400' : 'text-slate-400',
              badge: 'bg-purple-500/20 text-purple-300',
              difficultyColor: 'text-purple-300',
              button: isActive ? 'bg-purple-500/30 text-purple-300 border-purple-500/50' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
            }
          };

          const colors = accentClasses[feature.accentColor as keyof typeof accentClasses];
          
          return (
            <button
              key={feature.id}
              onClick={() => onModeSelect(feature.id as any)}
              data-testid={`card-feature-${feature.id}`}
              className={`text-left transition-all duration-300 group relative overflow-hidden rounded-2xl p-6 border-2 ${colors.bg} ${colors.border} ${colors.shadow} hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]`}
            >
              {/* Free Badge */}
              {feature.accentColor === 'brand' && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500 text-white">
                    Free
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`mb-4 inline-flex p-3 rounded-lg transition-colors ${colors.iconBg} ${colors.iconColor}`}>
                <Icon size={24} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className={`text-sm font-semibold mb-3 ${isActive ? colors.difficultyColor : 'text-slate-400'}`}>
                {feature.subtitle}
              </p>

              {/* Value Proposition */}
              <div className="mb-4 pb-4 border-b border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Value Proposition</p>
                <p className="text-sm text-slate-300 mt-1">{feature.proposition}</p>
              </div>

              {/* Core Scenarios */}
              <div className="mb-4 pb-4 border-b border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Core Scenarios</p>
                <ul className="space-y-1">
                  {feature.scenarios.map((scenario, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className={`${isActive ? colors.difficultyColor : 'text-slate-600'} mt-0.5`}>•</span>
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expected Results */}
              <div className="mb-4 pb-4 border-b border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Expected Results</p>
                <div className="flex flex-wrap gap-2">
                  {feature.results.slice(0, 3).map((result, idx) => (
                    <span key={idx} className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                      {result}
                    </span>
                  ))}
                  {feature.results.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800/50 text-slate-400">
                      +{feature.results.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Difficulty & Time */}
              <div className="mb-4 pb-4 border-b border-slate-700/50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Getting Started</p>
                  <p className={`text-sm font-semibold mt-1 ${colors.difficultyColor}`}>{feature.difficulty}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Time to Value</p>
                  <p className={`text-sm font-semibold mt-1 ${colors.difficultyColor}`}>{feature.time}</p>
                </div>
              </div>

              {/* Best For */}
              <div className="mb-4 pb-4 border-b border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Best For</p>
                <div className="space-y-1">
                  {feature.users.map((user, idx) => (
                    <p key={idx} className="text-xs text-slate-400">• {user}</p>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-center transition-all border ${colors.button} hover:opacity-90 flex items-center justify-center gap-2`}>
                {feature.buttonText}
                <ChevronRight size={14} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
