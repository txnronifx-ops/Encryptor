import React, { useState } from 'react';
import { X, Save, Shield, Check, Sparkles } from 'lucide-react';
import { BrandingConfig } from '../types';

interface BrandingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingConfig;
  onSave: (branding: BrandingConfig) => void;
}

export const BrandingSettingsModal: React.FC<BrandingSettingsModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSave
}) => {
  const [formData, setFormData] = useState<BrandingConfig>(branding);
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#090d22] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron text-base font-bold text-white tracking-wide">
              AUTHOR &amp; BRANDING SIGNATURE
            </h3>
            <p className="text-xs text-slate-400 font-mono-tech">
              Customize embedded signature headers &amp; watermarks
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Author / Developer Name
            </label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              placeholder="BOSS LX PRIME / Rahul Sir"
              className="w-full bg-[#05060d] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telegram Channel / Handle
            </label>
            <input
              type="text"
              value={formData.telegramChannel}
              onChange={(e) => setFormData({ ...formData, telegramChannel: e.target.value })}
              placeholder="@BOSS_LX_PRIME"
              className="w-full bg-[#05060d] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telegram Bot Handle
            </label>
            <input
              type="text"
              value={formData.telegramBot}
              onChange={(e) => setFormData({ ...formData, telegramBot: e.target.value })}
              placeholder="@BOSS_LX_PRIME_BOT"
              className="w-full bg-[#05060d] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Watermark Note
            </label>
            <input
              type="text"
              value={formData.customWatermark}
              onChange={(e) => setFormData({ ...formData, customWatermark: e.target.value })}
              placeholder="ALL RIGHTS RESERVED — UNAUTHORIZED USE PROHIBITED"
              className="w-full bg-[#05060d] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono-tech text-slate-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 flex items-center gap-2 shadow-lg transition-all"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Branding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
