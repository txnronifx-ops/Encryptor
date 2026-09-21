import React, { useState, useEffect } from 'react';
import { 
  Shield, Link2, Key, Clock, UserCheck, EyeOff, 
  Copy, Download, Play, Check, QrCode, Sparkles, RefreshCw, ExternalLink
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import confetti from 'canvas-confetti';
import { BrandingConfig, RedirectMethod, SecurityTheme, UrlProtectionOptions } from '../types';
import { generateShieldedUrlHtml } from '../lib/cryptoEngine';

interface UrlShieldProps {
  branding: BrandingConfig;
  onTestInSandbox: (html: string) => void;
}

export const UrlShield: React.FC<UrlShieldProps> = ({ branding, onTestInSandbox }) => {
  const [targetUrl, setTargetUrl] = useState<string>('https://t.me/+zDMG6OFhIyExYzI9');
  const [redirectMethod, setRedirectMethod] = useState<RedirectMethod>('interactive-gate');
  const [delaySeconds, setDelaySeconds] = useState<number>(3);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [antiBotVerify, setAntiBotVerify] = useState<boolean>(true);
  const [maskReferrer, setMaskReferrer] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('🔒 SECURE DESTINATION GATEWAY');
  const [customNotice, setCustomNotice] = useState<string>('Identity verification is required before proceeding to the secured destination link.');
  const [buttonText, setButtonText] = useState<string>('PROCEED TO DESTINATION →');
  const [theme, setTheme] = useState<SecurityTheme>('cyber-neon');
  
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);

  // Generate QR Code on target URL change
  useEffect(() => {
    if (targetUrl.trim()) {
      QRCodeLib.toDataURL(targetUrl.trim(), {
        width: 220,
        margin: 2,
        color: {
          dark: '#00ffe5',
          light: '#070914'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(() => {});
    }
  }, [targetUrl]);

  const handleGenerate = async () => {
    if (!targetUrl.trim() || !targetUrl.startsWith('http')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (requirePassword && !password.trim()) {
      alert('Please enter an access PIN or password.');
      return;
    }

    setIsBuilding(true);
    try {
      const opts: UrlProtectionOptions = {
        targetUrl: targetUrl.trim(),
        redirectMethod,
        delaySeconds,
        requirePassword,
        password: password.trim(),
        antiBotVerify,
        maskReferrer,
        title: title.trim(),
        expiryDate: '',
        allowedDomains: '',
        theme,
        buttonText: buttonText.trim(),
        customNotice: customNotice.trim()
      };

      const html = await generateShieldedUrlHtml(opts, branding);
      setGeneratedHtml(html);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#00ffe5', '#06b6d4', '#ec4899']
      });
    } catch (err: any) {
      alert(`Error generating shielded gateway: ${err.message || err}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SHIELDED_GATEWAY.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!generatedHtml) return;
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#090d20] via-[#0d122c] to-[#120a22] border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-orbitron font-bold text-white tracking-wide">
            STANDALONE URL SHIELD &amp; ANTI-BOT GATEWAY GENERATOR
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono-tech mt-1">
          Wraps any destination URL in a single-file encrypted HTML gateway with interactive human checks, password protection &amp; referrer stripping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Link Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#090c1d] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-orbitron text-xs font-bold tracking-wider text-slate-200">
                1. DESTINATION URL &amp; GATEWAY SETTINGS
              </h3>
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Destination URL to Protect
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://t.me/boss_lx_prime or https://your-secret-app.com"
                  className="w-full bg-[#05060d] border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>

            {/* Redirect Method Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verification &amp; Gateway Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setRedirectMethod('interactive-gate')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    redirectMethod === 'interactive-gate'
                      ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> Interactive Gate
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Cloudflare-style human verify box before redirect
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRedirectMethod('delayed-countdown')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    redirectMethod === 'delayed-countdown'
                      ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Countdown Timer
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Displays animated timer before auto-forwarding
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRedirectMethod('click-button')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    redirectMethod === 'click-button'
                      ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Manual Action Button
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Requires user to manually click to open link
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRedirectMethod('js-location')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    redirectMethod === 'js-location'
                      ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Silent Fast Redirect
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Encrypted loader that unrolls and jumps silently
                  </div>
                </button>
              </div>
            </div>

            {/* Countdown seconds (if delayed) */}
            {redirectMethod === 'delayed-countdown' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Countdown Delay (Seconds)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 3)}
                  className="w-full bg-[#05060d] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono-tech text-cyan-300 focus:outline-none"
                />
              </div>
            )}

            {/* Protection Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maskReferrer}
                  onChange={(e) => setMaskReferrer(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500"
                />
                <span className="font-medium">🛡️ Strip HTTP Referrer (Hidden Source Tracking)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiBotVerify}
                  onChange={(e) => setAntiBotVerify(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500"
                />
                <span className="font-medium">🤖 Require Anti-Bot Checkmark Challenge</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={(e) => setRequirePassword(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500"
                />
                <span className="font-medium">🔑 Require Access PIN / Password</span>
              </label>

              {requirePassword && (
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set Gateway Passcode (e.g. VIP2026)"
                  className="w-full bg-[#05060d] border border-cyan-500/40 rounded-lg px-3 py-2 text-xs font-mono-tech text-cyan-300 focus:outline-none"
                />
              )}
            </div>

            {/* Custom Titles & Messages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Gateway Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#05060d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Button Action Label
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full bg-[#05060d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isBuilding}
              className="w-full py-4 rounded-xl font-orbitron font-bold text-xs tracking-widest bg-gradient-to-r from-cyan-500 via-teal-400 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBuilding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  BUILDING GATEWAY...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  BUILD SHIELDED URL GATEWAY
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Gateway Outputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#090c1d] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <h3 className="font-orbitron text-xs font-bold tracking-wider text-slate-200">
                  DESTINATION QR &amp; OUTPUT
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                LIVE
              </span>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#05060d] border border-slate-800/80 rounded-xl">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Destination QR Code"
                  className="w-44 h-44 rounded-lg border border-cyan-500/30 p-1 bg-[#070914] shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-600 font-mono-tech text-xs">
                  Generating QR...
                </div>
              )}
              <div className="mt-2 text-[11px] font-mono-tech text-slate-400 text-center truncate max-w-full px-2">
                {targetUrl}
              </div>
            </div>

            {/* Generated Gateway Actions */}
            {generatedHtml ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Standalone shielded HTML gateway created!</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 rounded-xl font-orbitron font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download .HTML
                  </button>

                  <button
                    onClick={handleCopy}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <button
                  onClick={() => onTestInSandbox(generatedHtml)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-purple-400" /> Test Gateway in Sandbox
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Click &quot;Build Shielded URL Gateway&quot; to generate your single-file standalone protector.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
