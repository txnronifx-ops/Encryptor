import React from 'react';
import { Shield, Sparkles, Terminal, BookOpen, Settings } from 'lucide-react';
import { BrandingConfig } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  branding: BrandingConfig;
  onOpenBranding: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  branding,
  onOpenBranding,
  onOpenGuide,
}) => {
  return (
    <header className="border-b border-cyan-950/60 bg-[#060814]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Signature */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] relative group cursor-pointer">
              <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060814] animate-pulse"></span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-orbitron font-extrabold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-400 bg-clip-text text-transparent">
                  {branding.authorName || 'BOSS LX PRIME'}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono-tech tracking-widest font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 rounded">
                  ULTRA V7.5
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-tech mt-0.5">
                <span className="text-pink-400 font-semibold">{branding.telegramChannel || '@BOSS_LX_PRIME'}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">SHA256-CTR &middot; 8-FRAGMENT KEY MASK</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0b0e20] p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'html'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              HTML Encryptor
            </button>

            <button
              onClick={() => setActiveTab('url-shield')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'url-shield'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              URL Shield &amp; Gate
            </button>

            <button
              onClick={() => setActiveTab('url-obfuscator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'url-obfuscator'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Quick Obfuscator
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
              title="View Security Architecture Guide"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Docs</span>
            </button>

            <button
              onClick={onOpenBranding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 hover:text-pink-300 transition-colors"
              title="Branding & Signature Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Branding</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between gap-1 py-2 border-t border-slate-800/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'html'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400'
            }`}
          >
            HTML Encryptor
          </button>
          <button
            onClick={() => setActiveTab('url-shield')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'url-shield'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400'
            }`}
          >
            URL Shield
          </button>
          <button
            onClick={() => setActiveTab('url-obfuscator')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'url-obfuscator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400'
            }`}
          >
            Quick Obfuscator
          </button>
        </div>
      </div>
    </header>
  );
};
