import React from 'react';
import { X, ShieldCheck, Cpu, Lock, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface SecurityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityGuideModal: React.FC<SecurityGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#080c20] border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold text-white tracking-wide">
              CRYPTOGRAPHIC ARCHITECTURE &amp; DEFENSE MATRIX
            </h2>
            <p className="text-xs text-slate-400 font-mono-tech">
              Deep dive into multi-layer stream ciphers and anti-reverse engineering
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-mono-tech max-h-[70vh] overflow-y-auto pr-2">
          
          {/* Layer 1 */}
          <div className="p-4 rounded-xl bg-[#0d122b] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-orbitron text-xs">
              <Cpu className="w-4 h-4" />
              LAYER 1: SHA256-CTR DYNAMIC STREAM CIPHER
            </div>
            <p className="text-slate-400">
              Generates a cryptographic pseudo-random keystream on the fly using native WebCrypto SHA-256 blocks:
              <br />
              <code className="text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">
                Block(i) = SHA256(MasterKey + IV + BigEndian32(Counter))
              </code>
              <br />
              Eliminates pattern matching and frequency analysis attacks.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-xl bg-[#0d122b] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-pink-400 font-bold font-orbitron text-xs">
              <Lock className="w-4 h-4" />
              LAYER 2: POLYMORPHIC RADIX CUSTOM-ALPHABET
            </div>
            <p className="text-slate-400">
              Standard Base64 alphabets are shuffled using a seed-derived 64-bit Linear Congruential Generator (LCG) combined with a Fisher-Yates permutation. Standard Base64 decoders fail with corrupted decoding tables.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-xl bg-[#0d122b] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-orbitron text-xs">
              <Terminal className="w-4 h-4" />
              LAYER 3: 8-FRAGMENT KEY MASKING &amp; SIGNATURE LOCK
            </div>
            <p className="text-slate-400">
              The 256-bit master decryption key is split into 8 separate fragments. Each fragment is XOR-masked against a dynamic signature token calculated via DJB2 hashing. If any header watermark or bot credit is modified, the mathematical reconstruction yields corrupted keys and halts execution.
            </p>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-xl bg-[#0d122b] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-orbitron text-xs">
              <FileCode className="w-4 h-4" />
              LAYER 4: ZERO-CDN STANDALONE OFFLINE SHELL
            </div>
            <p className="text-slate-400">
              The generated HTML file has <strong>zero external script dependencies</strong>. It executes 100% offline inside local browsers, Kiwi Browser on Android, Safari on iOS, Chrome, Firefox, and Edge with immediate zero-latency decoding.
            </p>
          </div>

          {/* Defense Features Summary */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-white font-orbitron">
              ACTIVE HEURISTIC DEFENSES INCLUDED:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Anti-Right-Click &amp; Context Menu</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>F12 &amp; DevTools Keyboard Blocking</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Window Outer-Inner Delta Detection</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Anti-Iframe Framing &amp; Clickjacking</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Aggressive Console Scrubber &amp; Nullifier</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Optional Domain Whitelist &amp; Expiry</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer"
          >
            GOT IT &middot; CLOSE DOCS
          </button>
        </div>
      </div>
    </div>
  );
};
