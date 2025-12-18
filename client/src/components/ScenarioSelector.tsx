import { SCENARIOS } from '@/lib/constants';
import { CheckCircle2, Circle } from 'lucide-react';

interface ScenarioSelectorProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  isVisible: boolean;
}

export const ScenarioSelector = ({ selectedIds, onToggle, isVisible }: ScenarioSelectorProps) => {
  return (
    <div 
      className={`
        w-full max-w-5xl mx-auto transition-all duration-1000
        ${isVisible 
          ? 'opacity-100 translate-y-0 mt-12 max-h-[1200px]' 
          : 'opacity-0 translate-y-4 mt-0 max-h-0 overflow-hidden pointer-events-none'
        }
      `}
    >
      <div className="text-center mb-8">
        <h3 className="text-xl text-slate-300 font-light">Select your intelligence objectives</h3>
        <p className="text-sm text-slate-500 mt-2">Choose one or more modules to customize your report</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
        {SCENARIOS.map((scenario, index) => {
          const isSelected = selectedIds.includes(scenario.id);
          const Icon = scenario.icon;

          return (
            <div
              key={scenario.id}
              onClick={() => onToggle(scenario.id)}
              data-testid={`card-scenario-${scenario.id}`}
              className={`
                group relative p-6 rounded-xl border cursor-pointer transition-all duration-500
                backdrop-blur-sm transform
                ${isSelected 
                  ? 'bg-brand-950/40 border-brand-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)] scale-[1.02]' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/40 hover:scale-[1.01]'
                }
              `}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg transition-colors duration-300 ${isSelected ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                  <Icon size={24} />
                </div>
                <div className={`transition-colors duration-300 ${isSelected ? 'text-brand-500' : 'text-slate-700 group-hover:text-slate-500'}`}>
                  {isSelected ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
              </div>
              
              <h4 className={`text-lg font-medium mb-2 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {scenario.title}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {scenario.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
