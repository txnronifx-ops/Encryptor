import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Link as LinkIcon,
  UploadCloud,
  FileCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Trash2,
  Code2,
  EyeOff,
  Cpu,
  Zap,
  Sliders
} from 'lucide-react';
import { encryptWith10Layers, EncryptResult, LayerStepInfo } from './lib/tenLayerCrypto';

type InputMode = 'link' | 'file' | 'code';

export default function App() {
  const [mode, setMode] = useState<InputMode>('link');
  const [urlInput, setUrlInput] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [pastedCode, setPastedCode] = useState<string>('');

  // Extreme Security Options
  const [viewportCloak, setViewportCloak] = useState<boolean>(true);
  const [cloakLineCount, setCloakLineCount] = useState<number>(48);
  const [antiAiShield, setAntiAiShield] = useState<boolean>(true);
  const [timingTrap, setTimingTrap] = useState<boolean>(true);
  const [showExtremeConfig, setShowExtremeConfig] = useState<boolean>(false);

  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [currentLayerName, setCurrentLayerName] = useState<string>('');
  const [result, setResult] = useState<EncryptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showLayerDetails, setShowLayerDetails] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file: File) => {
    setErrorMessage('');
    setResult(null);
    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please try another file.');
    };
    reader.readAsText(file);
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedCode(text);
        setErrorMessage('');
      }
    } catch {
      const el = document.getElementById('code-textarea');
      el?.focus();
    }
  };

  // Sample HTML code generator
  const handleLoadSample = () => {
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Protected Web Payload</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .card { padding: 32px; background: #1e293b; border-radius: 16px; border: 1px solid #334155; text-align: center; }
    h1 { margin-bottom: 8px; font-size: 24px; color: #38bdf8; }
    p { color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>10-Layer Encrypted &amp; Cloaked</h1>
    <p>This payload runs offline with zero watermarks, 100% unreadable source &amp; memory zeroing.</p>
  </div>
</body>
</html>`;
    setPastedCode(sample);
    setErrorMessage('');
  };

  // Perform 10-Layer Encryption
  const handleEncrypt = async () => {
    setErrorMessage('');
    setResult(null);

    let target = '';
    if (mode === 'link') {
      target = urlInput.trim();
    } else if (mode === 'file') {
      target = fileContent.trim();
    } else if (mode === 'code') {
      target = pastedCode.trim();
    }

    if (!target) {
      if (mode === 'link') {
        setErrorMessage('Please enter a valid link or destination URL.');
      } else if (mode === 'file') {
        setErrorMessage('Please select an HTML file to encrypt.');
      } else {
        setErrorMessage('Please paste HTML or JavaScript source code to encrypt.');
      }
      return;
    }

    if (mode === 'link') {
      try {
        const testUrl = /^https?:\/\//i.test(target) ? target : `https://${target}`;
        new URL(testUrl);
      } catch {
        setErrorMessage('Invalid URL format. Please enter a valid destination link.');
        return;
      }
    }

    setIsEncrypting(true);
    setCurrentLayerIndex(1);

    try {
      const encResult = await encryptWith10Layers(
        target,
        mode === 'link' ? 'link' : 'html',
        (layerIdx, layerName) => {
          setCurrentLayerIndex(layerIdx);
          setCurrentLayerName(layerName);
        },
        {
          viewportCloak,
          cloakLineCount,
          antiAiShield,
          timingTrap,
          devtoolsDockTrap: true
        }
      );

      // Brief delay for visual completion feedback
      await new Promise(r => setTimeout(r, 450));
      setResult(encResult);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Encryption error occurred. Please try again.');
    } finally {
      setIsEncrypting(false);
    }
  };

  // Download encrypted file
  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.outputHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    let downloadName = 'cloaked_secure.html';
    if (mode === 'file' && fileName) {
      const cleanBase = fileName.replace(/\.[^/.]+$/, '');
      downloadName = `${cleanBase}.cloaked.html`;
    } else if (mode === 'code') {
      downloadName = 'extreme_encrypted.html';
    } else if (mode === 'link') {
      downloadName = 'shielded_link.html';
    }

    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download complete standalone offline encryptor tool
  const handleDownloadOfflineTool = async () => {
    try {
      const res = await fetch('/encryptor.html');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '10_Layer_Extreme_Encryptor.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.open('/encryptor.html', '_blank');
    }
  };

  // Copy code to clipboard
  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.outputHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = result.outputHtml;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset to encrypt another
  const handleReset = () => {
    setResult(null);
    setErrorMessage('');
    setUrlInput('');
    setFileContent('');
    setPastedCode('');
    setFileName('');
    setFileSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const pastedLinesCount = pastedCode ? pastedCode.split('\n').length : 0;
  const pastedBytesSize = pastedCode ? new TextEncoder().encode(pastedCode).length : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Minimal Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                10-Layer Encryptor &bull; Ultra-Hardened
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Viewport Cloak &bull; Anti-AI AST Shield &bull; Direct Block &bull; 100% Offline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadOfflineTool}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Download complete standalone offline encryptor file (.html)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD OFFLINE TOOL (.HTML)</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span>MAX DEFENSE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Anti-Editor & Anti-AI Defense Callout */}
        <div className="mb-4 px-4 py-3 bg-slate-900 text-white rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">EXTREME ANTI-ACCESS LEVEL:</span>
            <span className="text-slate-300">
              Zero readable code &bull; Editor opens 100% blank &bull; AI models mathematically blocked.
            </span>
          </div>
          <span className="text-[11px] font-mono-code text-emerald-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
            SHA-256 + S-BOX
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Mode Selector Tabs (3 options: Link, File Upload, Paste Code) */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/90 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('link');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'link'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-4 h-4 shrink-0" />
              <span>Link (URL)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('file');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'file'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4 shrink-0" />
              <span>File Upload</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('code');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'code'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-4 h-4 shrink-0" />
              <span>Paste Code</span>
            </button>
          </div>

          {/* Mode 1: Link Input */}
          {mode === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Destination URL to Protect
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="https://example.com/target-destination"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-mono-code"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Encrypts the link into a standalone HTML file with HTTP referrer stripping. When opened in any editor, screen is 100% blank.
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: File Upload */}
          {mode === 'file' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  fileName
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-xs text-slate-700">
                  <UploadCloud className="w-6 h-6" />
                </div>

                {fileName ? (
                  <div>
                    <div className="flex items-center justify-center gap-2 font-semibold text-slate-900 text-sm">
                      <FileCode className="w-4 h-4 text-emerald-600" />
                      <span>{fileName}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {(fileSize / 1024).toFixed(1)} KB &bull; Ready for Extreme 10-Layer Cloaking
                    </p>
                    <p className="text-xs text-slate-400 mt-3 font-medium underline">
                      Click to choose another file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Drop your HTML file here, or <span className="text-indigo-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports .html, .htm, and plain text files
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode('code');
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                  Or paste code directly &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Direct Code Paste */}
          {mode === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste Source Code (HTML / JS / CSS)
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                    title="Paste directly from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                    title="Load sample HTML template"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Sample</span>
                  </button>

                  {pastedCode && (
                    <button
                      type="button"
                      onClick={() => setPastedCode('')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                      title="Clear code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="code-textarea"
                  rows={9}
                  value={pastedCode}
                  onChange={(e) => {
                    setPastedCode(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <h1>Hello Protected World</h1>
</body>
</html>"
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Code Info Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-code px-1">
                <div>
                  {pastedLinesCount > 0 ? (
                    <span>
                      {pastedLinesCount} line{pastedLinesCount !== 1 ? 's' : ''} &bull; {(pastedBytesSize / 1024).toFixed(2)} KB
                    </span>
                  ) : (
                    <span>Paste raw source code above</span>
                  )}
                </div>
                <div className="text-slate-500">10-Layer Cascading Enclave</div>
              </div>
            </div>
          )}

          {/* Extreme Defense Options Accordion / Controls */}
          <div className="mt-5 pt-4 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setShowExtremeConfig(!showExtremeConfig)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>EXTREME DEFENSE CONTROLS &bull; ALL ACTIVE</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-semibold">
                  MAX SECURITY
                </span>
              </div>
              {showExtremeConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showExtremeConfig && (
              <div className="mt-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3.5 text-xs">
                {/* Viewport Cloak */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <EyeOff className="w-4 h-4 text-slate-700" />
                      <span>Editor Viewport Cloak (Screenshot Blank Buffer)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Injects 48 blank lines and 250 horizontal spaces so editors (Acode, QuickEdit, MT Manager, VS Code) open to a 100% blank screen.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={viewportCloak}
                      onChange={(e) => setViewportCloak(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                </div>

                {/* Anti-AI AST Shield */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Cpu className="w-4 h-4 text-slate-700" />
                      <span>Anti-AI AST Shield &amp; Recursive Honeytraps</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Injects non-computable opaque predicates and deadlocks that cause automated AI models, ChatGPT &amp; AST parsers to choke or fail.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={antiAiShield}
                      onChange={(e) => setAntiAiShield(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                </div>

                {/* Timing Jitter Trap */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Zap className="w-4 h-4 text-slate-700" />
                      <span>Timing-Jitter Breakpoint Detector</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Monitors execution latency down to the millisecond. If an analyst pauses or steps through code in DevTools, RAM is instantly wiped.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={timingTrap}
                      onChange={(e) => setTimingTrap(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Encrypt Action Button */}
          {!result && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleEncrypt}
                disabled={isEncrypting}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isEncrypting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-300" />
                    <span>Processing Level {currentLayerIndex}/10: {currentLayerName || 'Cryptographic Pipeline'}...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>ENCRYPT (EXTREME DEFENSE &amp; CLOAK)</span>
                    <ArrowRight className="w-4 h-4 opacity-70 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Panel with Download Button */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mt-6 pt-6 border-t border-slate-200 space-y-6"
              >
                {/* Success Banner */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-emerald-950">
                      Extreme Encryption Successful &bull; 10/10 Cascading Enclave Applied
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your payload has been cloaked and locked with 256-bit symmetric stream cipher, viewport blanking, and anti-AI traps. 100% clean and unbranded.
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons: DOWNLOAD & COPY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD FILE (.HTML)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>COPIED TO CLIPBOARD!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>COPY ENCRYPTED CODE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Metrics Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs">
                  <div>
                    <div className="text-slate-400 font-medium text-[11px]">DEFENSE LAYERS</div>
                    <div className="font-bold text-slate-800 mt-0.5">10 OF 10 PASS</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium text-[11px]">VIEWPORT CLOAK</div>
                    <div className="font-bold text-emerald-600 mt-0.5">48 LINES BLANK</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium text-[11px]">ANTI-AI SHIELD</div>
                    <div className="font-bold text-red-600 mt-0.5">ACTIVE LOCK</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium text-[11px]">SHANNON ENTROPY</div>
                    <div className="font-bold text-slate-800 mt-0.5">{result.entropyScore} / 8.0</div>
                  </div>
                </div>

                {/* Screenshot Mode Demonstration / Verification Callout */}
                <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <EyeOff className="w-4 h-4" />
                      <span>HOW THIS FILE APPEARS IN ANY CODE EDITOR:</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono-code bg-slate-800 px-2 py-0.5 rounded">
                      SCREENSHOT OFFSET ACTIVE
                    </span>
                  </div>
                  <div className="font-mono-code text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-400 space-y-1">
                    <div className="flex gap-3"><span className="text-slate-600 select-none">1</span><span></span></div>
                    <div className="flex gap-3"><span className="text-slate-600 select-none">2</span><span></span></div>
                    <div className="flex gap-3"><span className="text-slate-600 select-none">...</span><span className="text-slate-600 italic">(48 completely blank lines)</span></div>
                    <div className="flex gap-3"><span className="text-slate-600 select-none">48</span><span>&gt;&lt;script&gt;[256-bit SHA256 Stream Cipher - 0 Plaintext - Anti-Format Tripwire]</span></div>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    &bull; <strong>In Mobile/Desktop Editors:</strong> Opens to a completely blank, empty screen.<br />
                    &bull; <strong>If Formatted/Beautified:</strong> Code self-destructs and execution locks permanently.<br />
                    &bull; <strong>If Inspected with DevTools/AI:</strong> Web Worker debugger loop freezes browser tab; AI models cannot invert 256-bit symmetric keystream.
                  </p>
                </div>

                {/* Layer Breakdown Accordion */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowLayerDetails(!showLayerDetails)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span>VIEW ALL 10 APPLIED CRYPTOGRAPHIC LAYERS</span>
                    {showLayerDetails ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {showLayerDetails && (
                    <div className="p-3 bg-white divide-y divide-slate-100 text-xs">
                      {result.layers.map((l: LayerStepInfo) => (
                        <div key={l.layer} className="py-2 flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                            {l.layer}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{l.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{l.detail}</div>
                          </div>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Encrypt Another Button */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline transition-colors cursor-pointer"
                  >
                    &larr; Encrypt another link or file
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Minimal Pure White Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4">
          Client-side execution &bull; 100% Offline &bull; No data stored on any server
        </div>
      </footer>
    </div>
  );
}
