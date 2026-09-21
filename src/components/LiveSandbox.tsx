import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, RefreshCw, Smartphone, Tablet, Monitor, 
  ExternalLink, Terminal, Shield, Code, Check
} from 'lucide-react';

interface LiveSandboxProps {
  initialHtml: string;
  onClose?: () => void;
}

export const LiveSandbox: React.FC<LiveSandboxProps> = ({ initialHtml }) => {
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'source' | 'console'>('preview');
  const [copied, setCopied] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setHtmlContent(initialHtml);
    setLogs([
      `[${new Date().toLocaleTimeString()}] Sandbox initialized with ${new TextEncoder().encode(initialHtml).length} bytes.`,
      `[${new Date().toLocaleTimeString()}] Secure iframe sandbox mounted.`
    ]);
  }, [initialHtml]);

  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Sandbox reload triggered.`]);
    }
  };

  const getContainerWidth = () => {
    switch (deviceView) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      case 'desktop':
      default: return 'w-full';
    }
  };

  return (
    <div className="space-y-4">
      {/* Sandbox Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#090c1d] border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron text-xs font-bold text-slate-200">
              SANDBOX ISOLATED PREVIEW &amp; TESTER
            </h3>
            <span className="text-[10px] font-mono-tech text-slate-400">
              Live Safe Execution Environment
            </span>
          </div>
        </div>

        {/* Device View Selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              deviceView === 'desktop' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              deviceView === 'tablet' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              deviceView === 'mobile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={reloadIframe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(htmlContent);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Main Sandbox Frame Container */}
      <div className="flex justify-center bg-[#05060f] border border-slate-800/90 rounded-2xl p-4 min-h-[560px] shadow-inner overflow-hidden">
        <div className={`transition-all duration-300 w-full ${getContainerWidth()} flex flex-col`}>
          <div className="flex items-center justify-between px-4 py-2 bg-[#0c1024] border border-slate-800 rounded-t-xl text-[11px] font-mono-tech text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              <span className="text-slate-300 font-bold ml-2">Sandbox Isolated VM</span>
            </div>
            <div className="text-cyan-400 text-[10px]">
              sandbox=&quot;allow-scripts allow-forms allow-same-origin allow-modals&quot;
            </div>
          </div>

          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            title="Encrypted Payload Sandbox Test"
            className="w-full flex-1 min-h-[500px] bg-[#050510] border-x border-b border-slate-800 rounded-b-xl shadow-2xl"
          />
        </div>
      </div>

      {/* Sandbox Log Stream */}
      <div className="bg-[#090c1d] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-orbitron font-bold text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-pink-400" />
          SANDBOX VM AUDIT LOG
        </div>
        <div className="bg-[#05060d] p-3 rounded-lg text-xs font-mono-tech text-slate-400 space-y-1 max-h-28 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-slate-400 font-mono-tech">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
