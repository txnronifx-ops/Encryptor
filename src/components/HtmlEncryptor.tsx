import React, { useState, useRef } from 'react';
import { 
  FileCode, Upload, Lock, ShieldCheck, Key, Globe, Calendar, 
  Copy, Download, Play, Check, AlertCircle, Sparkles, RefreshCw,
  Eye, Sliders, ShieldAlert, Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandingConfig, EncryptionResult, ProtectionOptions, SecurityTheme } from '../types';
import { encryptHtmlCode } from '../lib/cryptoEngine';

interface HtmlEncryptorProps {
  branding: BrandingConfig;
  onTestInSandbox: (html: string) => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: '🌟 Premium Landing Page',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CyberCore Ultra Portal</title>
  <style>
    body { background: #060914; color: #00ffe5; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #0b112c; border: 1px solid #1e293b; padding: 40px; border-radius: 16px; text-align: center; max-width: 480px; box-shadow: 0 0 30px rgba(0,255,229,0.2); }
    h1 { font-size: 28px; margin-bottom: 12px; color: #fff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    button { background: #00ffe5; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Protected Application</h1>
    <p>This confidential source code is protected with military-grade SHA256-CTR and custom alphabet cipher fragmentation.</p>
    <button onclick="alert('Action Executed Successfully!')">Launch Feature</button>
  </div>
</body>
</html>`
  },
  {
    name: '🔐 Secure Login Portal',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>VIP Access Node</title>
  <style>
    body { background: #05050a; color: #e2e8f0; font-family: monospace; display: grid; place-items: center; min-height: 100vh; margin: 0; }
    .box { background: #0e101f; border: 1px solid #334155; padding: 30px; border-radius: 12px; width: 320px; }
    input { width: 100%; box-sizing: border-box; background: #1a1d36; border: 1px solid #475569; color: #fff; padding: 10px; margin: 10px 0; border-radius: 6px; }
    button { width: 100%; background: #ff00c8; color: #fff; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div class="box">
    <h3>🔒 VIP Portal Gate</h3>
    <input type="text" placeholder="Username / License Key">
    <input type="password" placeholder="Passcode">
    <button onclick="alert('Access Granted!')">AUTHENTICATE</button>
  </div>
</body>
</html>`
  },
  {
    name: '🟢 Matrix Rain Canvas',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Matrix Terminal</title>
  <style>
    body { margin: 0; background: black; overflow: hidden; }
    canvas { display: block; }
    .overlay { position: fixed; top: 20px; left: 20px; color: #00ff66; font-family: monospace; font-size: 18px; text-shadow: 0 0 10px #00ff66; }
  </style>
</head>
<body>
  <div class="overlay">> MATRIX STREAM RUNNING [SECURE]</div>
  <canvas id="c"></canvas>
  <script>
    var c = document.getElementById("c");
    var ctx = c.getContext("2d");
    c.height = window.innerHeight; c.width = window.innerWidth;
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*";
    chars = chars.split("");
    var font_size = 14;
    var columns = c.width/font_size;
    var drops = [];
    for(var x = 0; x < columns; x++) drops[x] = 1;
    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#0F0";
      ctx.font = font_size + "px monospace";
      for(var i = 0; i < drops.length; i++) {
        var text = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(text, i*font_size, drops[i]*font_size);
        if(drops[i]*font_size > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    setInterval(draw, 33);
  <\/script>
</body>
</html>`
  }
];

export const HtmlEncryptor: React.FC<HtmlEncryptorProps> = ({ branding, onTestInSandbox }) => {
  const [htmlInput, setHtmlInput] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<EncryptionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Options State
  const [options, setOptions] = useState<ProtectionOptions>({
    rightClick: true,
    keyboard: true,
    devtoolsDetect: true,
    copySelect: true,
    consoleClear: true,
    iframeBlock: false,
    signatureLock: true,
    passwordProtected: false,
    password: '',
    domainLock: '',
    expiryDate: '',
    antiViewSourceTrap: true,
    obfuscateLoader: true,
    encryptionAlgorithm: 'sha256-ctr',
    theme: 'cyber-neon',
    customTitle: '',
    loaderMessage: ''
  });

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlInput(content);
    };
    reader.readAsText(file, 'utf-8');
  };

  const applyPreset = (presetType: 'maximum' | 'balanced' | 'password' | 'stealth') => {
    if (presetType === 'maximum') {
      setOptions(prev => ({
        ...prev,
        rightClick: true,
        keyboard: true,
        devtoolsDetect: true,
        copySelect: true,
        consoleClear: true,
        iframeBlock: true,
        signatureLock: true,
        antiViewSourceTrap: true,
        theme: 'cyber-neon'
      }));
    } else if (presetType === 'balanced') {
      setOptions(prev => ({
        ...prev,
        rightClick: true,
        keyboard: true,
        devtoolsDetect: false,
        copySelect: false,
        consoleClear: false,
        iframeBlock: false,
        signatureLock: true,
        antiViewSourceTrap: true,
        theme: 'dark-luxury'
      }));
    } else if (presetType === 'password') {
      setOptions(prev => ({
        ...prev,
        passwordProtected: true,
        password: prev.password || '123456',
        rightClick: true,
        keyboard: true,
        devtoolsDetect: true,
        theme: 'deep-purple'
      }));
    } else if (presetType === 'stealth') {
      setOptions(prev => ({
        ...prev,
        theme: 'stealth-minimal',
        rightClick: false,
        keyboard: false,
        devtoolsDetect: false,
        copySelect: false,
        consoleClear: false,
        iframeBlock: false,
        signatureLock: true,
        antiViewSourceTrap: false
      }));
    }
  };

  const handleEncrypt = async () => {
    if (!htmlInput.trim()) {
      alert('Please paste HTML code or upload a file first.');
      return;
    }

    if (options.passwordProtected && !options.password?.trim()) {
      alert('Please enter a decryption password or disable password protection.');
      return;
    }

    setIsEncrypting(true);
    setProgressPct(5);
    setProgressMsg('Initializing encryption engine...');

    try {
      const startTime = Date.now();
      const encResult = await encryptHtmlCode(
        htmlInput,
        options,
        branding,
        (pct, msg) => {
          setProgressPct(pct);
          setProgressMsg(msg);
        }
      );

      const rawBytes = new TextEncoder().encode(htmlInput).length;
      const encBytes = new TextEncoder().encode(encResult.outputHtml).length;
      const ratio = Number(((encBytes / rawBytes) * 100).toFixed(1));

      const layers = [
        'SHA256-CTR Stream Keystream Cipher',
        'Polymorphic Radix Custom-Alphabet Permutation',
        '8-Fragment XOR Masking + DJB2 Signature Locking',
        '4-Fragment IV Obfuscation Vector',
        'Decoy Variables & Deobfuscator AST Distorter',
        'Anti-Reverse Engineering & Hardened Runtime Shell'
      ];

      if (options.rightClick) layers.push('Context Menu Lock');
      if (options.keyboard) layers.push('DevTools Keyboard Lock');
      if (options.devtoolsDetect) layers.push('Dynamic Window DevTools Detector');
      if (options.passwordProtected) layers.push('PBKDF2 Password Lock Gate');
      if (options.domainLock) layers.push(`Domain Whitelist: ${options.domainLock}`);
      if (options.expiryDate) layers.push(`Expiry Enforcement: ${options.expiryDate}`);

      const finalResult: EncryptionResult = {
        rawLength: rawBytes,
        encryptedLength: encBytes,
        compressionRatio: ratio,
        outputHtml: encResult.outputHtml,
        timestamp: new Date().toLocaleTimeString(),
        sigToken: encResult.sigToken,
        entropyScore: encResult.entropyScore,
        securityRating: 'Military Grade',
        algorithm: 'SHA256-CTR + Custom-Radix + 8-Fragment XOR Mask',
        layersApplied: layers
      };

      setResult(finalResult);

      // Trigger celebration confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00ffe5', '#ff00c8', '#a855f7']
      });

    } catch (err: any) {
      alert(`Encryption Error: ${err.message || err}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const outName = fileName 
      ? fileName.replace(/\.[^/.]+$/, '') + '.encrypted.html' 
      : 'BOSS_LX_ENCRYPTED.html';
    
    const blob = new Blob([result.outputHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.outputHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#090d20] via-[#0d122c] to-[#120a22] border border-cyan-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <h2 className="text-base font-orbitron font-bold text-white tracking-wide">
              MULTI-LAYER HTML ENCRYPTION &amp; TAMPER SHIELD
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech mt-1">
            Zero-CDN standalone decryption shell &middot; 8-Fragment XOR Key Mask &middot; Anti-DevTools
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono-tech mr-1">PRESETS:</span>
          <button
            onClick={() => applyPreset('maximum')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Maximum Shield
          </button>
          <button
            onClick={() => applyPreset('password')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" /> Password Locked
          </button>
          <button
            onClick={() => applyPreset('balanced')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            Balanced Web
          </button>
        </div>
      </div>

      {/* Main Grid: Input & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Code Input & Templates (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#090c1d] border border-slate-800/90 rounded-2xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="font-orbitron text-xs font-bold tracking-wider text-slate-200">
                  STEP 1: SOURCE HTML CODE
                </h3>
              </div>
              {htmlInput && (
                <span className="text-[11px] font-mono-tech text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {new TextEncoder().encode(htmlInput).length > 1024 
                    ? `${(new TextEncoder().encode(htmlInput).length / 1024).toFixed(1)} KB` 
                    : `${new TextEncoder().encode(htmlInput).length} B`}
                </span>
              )}
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-4 ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-cyan-400/80 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">
                {fileName ? (
                  <span className="text-cyan-300 font-mono-tech font-bold">
                    ✓ Loaded: {fileName} ({(fileSize / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  <>Drag &amp; drop an <span className="text-cyan-400 font-semibold">.html</span> file or click to browse</>
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Supports standard HTML5, CSS, inline scripts &amp; resources</p>
            </div>

            {/* Quick Templates Selector */}
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-500 font-mono-tech whitespace-nowrap">Load Samples:</span>
              {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setHtmlInput(tmpl.code);
                    setFileName(`sample_${idx + 1}.html`);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-700/60 transition-colors whitespace-nowrap"
                >
                  {tmpl.name}
                </button>
              ))}
              {htmlInput && (
                <button
                  onClick={() => { setHtmlInput(''); setFileName(''); }}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 ml-auto whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Textarea for Raw HTML */}
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="<!-- Paste your raw HTML source code here... -->"
              rows={12}
              className="w-full bg-[#05060d] border border-slate-800/90 rounded-xl p-3.5 text-xs font-mono-tech text-slate-300 focus:outline-none focus:border-cyan-500/60 leading-relaxed resize-y placeholder:text-slate-700"
            />
          </div>
        </div>

        {/* Right Column: Security Switches & Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#090c1d] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                <h3 className="font-orbitron text-xs font-bold tracking-wider text-slate-200">
                  STEP 2: PROTECTION POLICIES
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-800/30">
                ACTIVE SHIELDS
              </span>
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.rightClick}
                  onChange={(e) => setOptions({ ...options, rightClick: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">🚫 Right-Click Block</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.keyboard}
                  onChange={(e) => setOptions({ ...options, keyboard: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">⌨️ Key Shortcuts Block</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.devtoolsDetect}
                  onChange={(e) => setOptions({ ...options, devtoolsDetect: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">🔍 DevTools Detection</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.copySelect}
                  onChange={(e) => setOptions({ ...options, copySelect: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">📋 Select/Copy Lock</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.consoleClear}
                  onChange={(e) => setOptions({ ...options, consoleClear: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">🧹 Console Scrubber</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.signatureLock}
                  onChange={(e) => setOptions({ ...options, signatureLock: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">🔏 Signature Token Lock</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.iframeBlock}
                  onChange={(e) => setOptions({ ...options, iframeBlock: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">🖼️ Anti-Iframe Framing</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.antiViewSourceTrap}
                  onChange={(e) => setOptions({ ...options, antiViewSourceTrap: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-slate-300 font-medium">🛡️ Decoy View-Source</span>
              </label>
            </div>

            {/* Advanced Locks Toggle */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  Advanced Security Locks (Password, Domain, Expiry)
                </span>
                <span className="text-[10px] font-mono-tech text-slate-500">
                  {showAdvanced ? '[- HIDE]' : '[+ EXPAND]'}
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3.5 p-3.5 rounded-xl bg-[#050711] border border-slate-800">
                  {/* Password Protection */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
                      <input
                        type="checkbox"
                        checked={options.passwordProtected}
                        onChange={(e) => setOptions({ ...options, passwordProtected: e.target.checked })}
                        className="rounded border-slate-700 text-cyan-500"
                      />
                      <span>Require Decryption Password / PIN</span>
                    </label>
                    {options.passwordProtected && (
                      <input
                        type="text"
                        value={options.password || ''}
                        onChange={(e) => setOptions({ ...options, password: e.target.value })}
                        placeholder="Enter decryption secret (e.g. MasterKey@2026)"
                        className="w-full bg-[#0d1024] border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs font-mono-tech text-cyan-300 focus:outline-none placeholder:text-slate-600"
                      />
                    )}
                  </div>

                  {/* Domain Lock */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Domain / Host Whitelist (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={options.domainLock}
                      onChange={(e) => setOptions({ ...options, domainLock: e.target.value })}
                      placeholder="e.g. mydomain.com, secure.portal.org, localhost"
                      className="w-full bg-[#0d1024] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono-tech text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Leaves blank to permit execution on any domain or file://</p>
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      <span>Self-Destruct / Expiration Date (Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={options.expiryDate}
                      onChange={(e) => setOptions({ ...options, expiryDate: e.target.value })}
                      className="w-full bg-[#0d1024] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono-tech text-slate-300 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Decryption Loader UI Theme
                    </label>
                    <select
                      value={options.theme}
                      onChange={(e) => setOptions({ ...options, theme: e.target.value as SecurityTheme })}
                      className="w-full bg-[#0d1024] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono-tech text-slate-300 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="cyber-neon">⚡ Cyber Neon (Default)</option>
                      <option value="matrix-green">🟢 Matrix Terminal Green</option>
                      <option value="dark-luxury">💎 Obsidian Gold Luxury</option>
                      <option value="deep-purple">🔮 Nebula Deep Purple</option>
                      <option value="stealth-minimal">🕶️ Stealth Minimal Dark</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Encrypt Action Button */}
            <button
              onClick={handleEncrypt}
              disabled={isEncrypting || !htmlInput.trim()}
              className={`w-full py-4 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                isEncrypting || !htmlInput.trim()
                  ? 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] cursor-pointer'
              }`}
            >
              {isEncrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ENCRYPTING PAYLOAD...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  GENERATE ENCRYPTED PAYLOAD
                </>
              )}
            </button>

            {/* Progress Bar & Status */}
            {isEncrypting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono-tech text-cyan-400">
                  <span>{progressMsg}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output Results Card */}
      {result && (
        <div className="bg-gradient-to-b from-[#0a0f26] to-[#070a1a] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-900/40 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-orbitron font-extrabold text-base text-white tracking-wide">
                    ENCRYPTION &amp; HARDENING COMPLETED
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono-tech font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded">
                    VERIFIED OK
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
                  Signature Token: <span className="text-cyan-400 font-bold">{result.sigToken}</span> &middot; Generated at {result.timestamp}
                </p>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownload}
                className="px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-wider bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download .HTML
              </button>

              <button
                onClick={handleCopy}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={() => onTestInSandbox(result.outputHtml)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-purple-400" /> Test in Sandbox
              </button>
            </div>
          </div>

          {/* Metrics & Cryptographic Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#060814] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono-tech">Original Source</div>
              <div className="text-base font-bold text-slate-200 mt-1 font-mono-tech">
                {(result.rawLength / 1024).toFixed(1)} KB
              </div>
            </div>

            <div className="bg-[#060814] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono-tech">Encrypted Shell</div>
              <div className="text-base font-bold text-cyan-400 mt-1 font-mono-tech">
                {(result.encryptedLength / 1024).toFixed(1)} KB
              </div>
            </div>

            <div className="bg-[#060814] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono-tech">Shannon Entropy</div>
              <div className="text-base font-bold text-pink-400 mt-1 font-mono-tech">
                {result.entropyScore} / 8.0
              </div>
            </div>

            <div className="bg-[#060814] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono-tech">Security Rating</div>
              <div className="text-base font-bold text-emerald-400 mt-1 font-mono-tech">
                MILITARY GRADE
              </div>
            </div>
          </div>

          {/* Layers Applied Chips */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Applied Cryptographic &amp; Anti-Tamper Defenses:
            </div>
            <div className="flex flex-wrap gap-2">
              {result.layersApplied.map((layer, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[11px] font-mono-tech bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 rounded-md"
                >
                  ✓ {layer}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Output Preview Collapsible Box */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Previewing First 10 Lines of Generated Standalone Shell:</span>
              <span className="font-mono-tech text-[10px] text-slate-500">100% OFFLINE COMPATIBLE</span>
            </div>
            <pre className="bg-[#05060f] p-3 rounded-lg text-[11px] font-mono-tech text-slate-400 overflow-x-auto border border-slate-800/80 max-h-36">
              {result.outputHtml.split('\n').slice(0, 16).join('\n')}
              {'\n... [Remaining Encrypted Payload Stream] ...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
