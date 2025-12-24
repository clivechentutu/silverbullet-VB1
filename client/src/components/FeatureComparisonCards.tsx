import { Radar as RadarIcon, Crosshair, Bot } from 'lucide-react';

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
      description: 'Fast scan & identify competitors',
      duration: '30 seconds',
      price: 'Free Trial',
      roles: [
        'Product Managers',
        'Market Researchers',
        'Investors & Angels'
      ],
      buttonText: 'Try Now',
      highlight: true,
      color: 'brand'
    },
    {
      id: 'tracker',
      icon: Crosshair,
      title: 'Tracker',
      subtitle: 'Continuous Monitoring',
      description: 'Real-time alerts & dynamic tracking',
      duration: 'Continuous',
      price: 'Pro Plan',
      roles: [
        'Competitive Analysts',
        'Operations Teams',
        'Product Teams'
      ],
      buttonText: 'Start Tracking',
      highlight: false,
      color: 'slate'
    },
    {
      id: 'research',
      icon: Bot,
      title: 'Research',
      subtitle: 'Deep AI Analysis',
      description: 'AI-powered strategic insights',
      duration: '5 minutes',
      price: 'Premium',
      roles: [
        'Strategic Planners',
        'Executive Teams',
        'Management Consultants'
      ],
      buttonText: 'Deep Analyze',
      highlight: false,
      color: 'purple'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature) => {
          const isActive = activeMode === feature.id;
          const Icon = feature.icon;
          
          return (
            <button
              key={feature.id}
              onClick={() => onModeSelect(feature.id as any)}
              data-testid={`card-feature-${feature.id}`}
              className={`text-left transition-all duration-300 group relative overflow-hidden rounded-2xl p-6 border-2 ${
                isActive
                  ? feature.color === 'brand'
                    ? 'bg-brand-950/60 border-brand-500/60 shadow-[0_0_30px_rgba(20,184,166,0.3)]'
                    : feature.color === 'purple'
                    ? 'bg-purple-950/60 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-800/60 border-slate-600/60 shadow-[0_0_30px_rgba(100,116,139,0.3)]'
                  : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600/80'
              }`}
            >
              {/* Highlight badge */}
              {feature.highlight && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500 text-white">
                    Free
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`mb-4 inline-flex p-3 rounded-lg transition-colors ${
                isActive
                  ? feature.color === 'brand'
                    ? 'bg-brand-500/20 text-brand-400'
                    : feature.color === 'purple'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-slate-700/50 text-slate-300'
                  : 'bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-slate-300'
              }`}>
                <Icon size={24} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
              <p className={`text-sm font-medium mb-3 ${
                isActive
                  ? feature.color === 'brand'
                    ? 'text-brand-300'
                    : feature.color === 'purple'
                    ? 'text-purple-300'
                    : 'text-slate-300'
                  : 'text-slate-400'
              }`}>
                {feature.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm text-slate-300 mb-4 line-clamp-1">{feature.description}</p>

              {/* Duration */}
              <div className="mb-4 pb-4 border-b border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Duration</p>
                <p className={`text-sm font-semibold mt-1 ${
                  isActive
                    ? feature.color === 'brand'
                      ? 'text-brand-300'
                      : feature.color === 'purple'
                      ? 'text-purple-300'
                      : 'text-slate-300'
                    : 'text-slate-400'
                }`}>
                  {feature.duration}
                </p>
              </div>

              {/* Best For */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Best For</p>
                <div className="space-y-1">
                  {feature.roles.map((role, idx) => (
                    <p key={idx} className="text-xs text-slate-400">• {role}</p>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-4 ${
                isActive
                  ? feature.color === 'brand'
                    ? 'bg-brand-500/20 text-brand-300'
                    : feature.color === 'purple'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-slate-700/50 text-slate-300'
                  : 'bg-slate-800/50 text-slate-400'
              }`}>
                {feature.price}
              </div>

              {/* Button */}
              <div className="pt-4">
                <div className={`w-full py-2 px-3 rounded-lg text-sm font-semibold text-center transition-all ${
                  isActive
                    ? feature.color === 'brand'
                      ? 'bg-brand-500/30 text-brand-300 border border-brand-500/50'
                      : feature.color === 'purple'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-700 text-slate-200 border border-slate-600'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 group-hover:bg-slate-700/50 group-hover:text-slate-300'
                }`}>
                  {feature.buttonText}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
