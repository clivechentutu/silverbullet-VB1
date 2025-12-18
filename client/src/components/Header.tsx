import { Hexagon } from 'lucide-react';
import { useLocation } from 'wouter';

export const Header = () => {
  const [, navigate] = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <Hexagon className="text-brand-500 fill-brand-500/20 group-hover:rotate-90 transition-transform duration-500" size={32} />
          <span className="text-xl font-bold tracking-tight text-white">Competi<span className="text-brand-500">Scope</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors" data-testid="link-platform">Platform</a>
          <a href="#" className="hover:text-white transition-colors" data-testid="link-solutions">Solutions</a>
          <a href="#" className="hover:text-white transition-colors" data-testid="link-pricing">Pricing</a>
          <a href="#" className="hover:text-white transition-colors" data-testid="link-resources">Resources</a>
        </nav>

        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={() => navigate('/debug')}
            className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors" 
            data-testid="link-workbench"
          >
            Workbench
          </button>
          <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors" data-testid="button-login">Log In</button>
          <button className="text-sm font-semibold bg-white text-slate-950 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors" data-testid="button-demo">
            Get Demo
          </button>
        </div>
      </div>
    </header>
  );
};
