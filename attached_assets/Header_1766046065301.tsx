import React from 'react';
import { Hexagon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <Hexagon className="text-brand-500 fill-brand-500/20 group-hover:rotate-90 transition-transform duration-500" size={32} />
          <span className="text-xl font-bold tracking-tight text-white">Competi<span className="text-brand-500">Scope</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Platform</a>
          <a href="#" className="hover:text-white transition-colors">Solutions</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Resources</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</button>
          <button className="text-sm font-semibold bg-white text-slate-950 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">
            Get Demo
          </button>
        </div>
      </div>
    </header>
  );
};
