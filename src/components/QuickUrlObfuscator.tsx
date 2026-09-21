import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, ExternalLink, Code2, ShieldAlert,
  Layers, FileText, CheckCircle2
} from 'lucide-react';
import { generateQuickObfuscations } from '../lib/cryptoEngine';

export const QuickUrlObfuscator: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>('https://t.me/boss_lx_prime');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchInput, setBatchInput] = useState<string>(
    'https://example.com/login\nhttps://t.me/boss_lx_prime\nhttps://google.com'
  );

  const results = generateQuickObfuscations(inputUrl);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const batchResults = batchInput
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(url => ({
      original: url,
      ...generateQuickObfuscations(url)
    }));

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#090d20] via-[#0d122c] to-[#120a22] border border-cyan-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h2 className="text-base font-orbitron font-bold text-white tracking-wide">
              QUICK URL OBFUSCATOR &amp; ENCODER MATRIX
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech mt-1">
            Instantly encode URLs across multiple evasive formats: Hex, Unicode, Base64 Data URI, HTML Entities &amp; Polymorphic XOR
          </p>
        </div>

        {/* Mode Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBatchMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !batchMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single URL Mode
          </button>
          <button
            onClick={() => setBatchMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              batchMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Batch Converter Mode
          </button>
        </div>
      </div>

      {!batchMode ? (
        <div className="space-y-6">
          {/* Input Box */}
          <div className="bg-[#090c1d] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Enter Target URL to Obfuscate in Real-Time
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://your-domain.com/landing?id=99"
              className="w-full bg-[#05060d] border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Cards Grid for Each Encoding Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Hex URL Encoding */}
            <div className="bg-[#090c1d] border border-slate-800/90 rounded-xl p-4.5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-cyan-400">
                  1. Hexadecimal Percent-Encoded
                </span>
                <button
                  onClick={() => handleCopy('hex', results.hexUrl)}
                  className="text-slate-400 hover:text-cyan-300 transition-colors p-1"
                  title="Copy Hex"
                >
                  {copiedKey === 'hex' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                Evades standard string-matching URL filters and web scrapers.
              </p>
              <div className="bg-[#05060d] p-3 rounded-lg text-xs font-mono-tech text-slate-300 overflow-x-auto border border-slate-800/80">
                {results.hexUrl || '// Enter URL'}
              </div>
            </div>

            {/* 2. Base64 Self-Executing Data URI */}
            <div className="bg-[#090c1d] border border-slate-800/90 rounded-xl p-4.5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-pink-400">
                  2. Base64 Data URI Payload
                </span>
                <button
                  onClick={() => handleCopy('dataUri', results.base64DataUri)}
                  className="text-slate-400 hover:text-pink-300 transition-colors p-1"
                  title="Copy Data URI"
                >
                  {copiedKey === 'dataUri' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                Embeds complete destination page directly inside browser address bar.
              </p>
              <div className="bg-[#05060d] p-3 rounded-lg text-xs font-mono-tech text-slate-300 overflow-x-auto border border-slate-800/80 truncate">
                {results.base64DataUri || '// Enter URL'}
              </div>
            </div>

            {/* 3. Unicode Escape Sequence */}
            <div className="bg-[#090c1d] border border-slate-800/90 rounded-xl p-4.5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-purple-400">
                  3. Unicode Escape String (\\u00XX)
                </span>
                <button
                  onClick={() => handleCopy('unicode', results.unicodeEscaped)}
                  className="text-slate-400 hover:text-purple-300 transition-colors p-1"
                  title="Copy Unicode"
                >
                  {copiedKey === 'unicode' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                JavaScript unicode encoded literal representation.
              </p>
              <div className="bg-[#05060d] p-3 rounded-lg text-xs font-mono-tech text-slate-300 overflow-x-auto border border-slate-800/80">
                {results.unicodeEscaped || '// Enter URL'}
              </div>
            </div>

            {/* 4. HTML Decimal Entities */}
            <div className="bg-[#090c1d] border border-slate-800/90 rounded-xl p-4.5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-amber-400">
                  4. HTML Decimal Entities (&amp;#XX;)
                </span>
                <button
                  onClick={() => handleCopy('entities', results.htmlEntityEncoded)}
                  className="text-slate-400 hover:text-amber-300 transition-colors p-1"
                  title="Copy Entities"
                >
                  {copiedKey === 'entities' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                Converts each character into raw decimal ASCII entities.
              </p>
              <div className="bg-[#05060d] p-3 rounded-lg text-xs font-mono-tech text-slate-300 overflow-x-auto border border-slate-800/80">
                {results.htmlEntityEncoded || '// Enter URL'}
              </div>
            </div>

            {/* 5. JS Eval Packed Script */}
            <div className="bg-[#090c1d] border border-slate-800/90 rounded-xl p-4.5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-emerald-400">
                  5. JS Eval / Base64 Dynamic Relocation
                </span>
                <button
                  onClick={() => handleCopy('eval', results.jsEvalPacked)}
                  className="text-slate-400 hover:text-emerald-300 transition-colors p-1"
                  title="Copy Script"
                >
                  {copiedKey === 'eval' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                Single line JavaScript snippet ready to paste into any webpage.
              </p>
              <div className="bg-[#05060d] p-3 rounded-lg text-xs font-mono-tech text-slate-300 overflow-x-auto border border-slate-800/80">
                {results.jsEvalPacked || '// Enter URL'}
              </div>
            </div>

            {/* 6. Polymorphic XOR Snippet */}
            <div className="bg-[#090c1d] border border-slate-800/90 rounded-xl p-4.5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-teal-400">
                  6. Polymorphic XOR Bitwise Cloak
                </span>
                <button
                  onClick={() => handleCopy('multi', results.multiLayerHtml)}
                  className="text-slate-400 hover:text-teal-300 transition-colors p-1"
                  title="Copy XOR Snippet"
                >
                  {copiedKey === 'multi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                Bitwise XOR cipher unrolled at execution time.
              </p>
              <div className="bg-[#05060d] p-3 rounded-lg text-xs font-mono-tech text-slate-300 overflow-x-auto border border-slate-800/80 max-h-20">
                {results.multiLayerHtml || '// Enter URL'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Batch Processing Table */
        <div className="bg-[#090c1d] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            Paste Multiple URLs (One per line)
          </label>
          <textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            rows={5}
            className="w-full bg-[#05060d] border border-slate-800 rounded-xl p-3 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-500/60"
          />

          <div className="overflow-x-auto border border-slate-800/80 rounded-xl">
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-[#0e1229] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Original Destination</th>
                  <th className="p-3">Hex Encoded</th>
                  <th className="p-3">Base64 Data URI</th>
                  <th className="p-3">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batchResults.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-300 max-w-[180px] truncate">{item.original}</td>
                    <td className="p-3 text-cyan-400 max-w-[180px] truncate">{item.hexUrl}</td>
                    <td className="p-3 text-pink-400 max-w-[180px] truncate">{item.base64DataUri}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleCopy(`batch_${idx}`, item.base64DataUri)}
                        className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      >
                        {copiedKey === `batch_${idx}` ? 'Copied!' : 'Copy Data URI'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
