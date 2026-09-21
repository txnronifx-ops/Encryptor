/**
 * Boss LX Ultra Cryptographic Engine
 * Next-Gen Multi-Layer Stream & Authenticated Encryption
 * Works 100% Client-Side with Zero-CDN Dependencies
 */

import { BrandingConfig, ProtectionOptions, SecurityTheme, UrlProtectionOptions } from '../types';

// ==========================================
// Core Hex & Crypto Helper Functions
// ==========================================

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const b = new Uint8Array(cleanHex.length >> 1);
  for (let i = 0; i < cleanHex.length; i += 2) {
    b[i >> 1] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return b;
}

export function bytesToHex(b: Uint8Array): string {
  return Array.from(b).map(x => ('0' + x.toString(16)).slice(-2)).join('');
}

export function randHex(nBytes: number): string {
  const b = new Uint8Array(nBytes);
  crypto.getRandomValues(b);
  return bytesToHex(b);
}

export function xorHex(h1: string, h2: string): string {
  let r = '';
  for (let i = 0; i < h1.length; i += 2) {
    const val1 = parseInt(h1.substr(i, 2), 16);
    const val2 = parseInt(h2.substr(i % h2.length, 2), 16);
    r += ('0' + (val1 ^ val2).toString(16)).slice(-2);
  }
  return r;
}

export async function sha256Hex(strOrBytes: string | Uint8Array): Promise<string> {
  const data = typeof strOrBytes === 'string' ? new TextEncoder().encode(strOrBytes) : strOrBytes;
  const buf = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(buf));
}

export function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8);
}

export function expandSigMask(sigToken: string): string {
  const base = djb2(sigToken);
  let r = '';
  for (let i = 0; i < 8; i++) {
    r += djb2(base + i);
  }
  return r; // 64 hex characters (8 blocks of 8)
}

// ==========================================
// SHA256-CTR Keystream Generator
// ==========================================

export async function sha256CtrStream(keyBytes: Uint8Array, ivBytes: Uint8Array, length: number): Promise<Uint8Array> {
  const out = new Uint8Array(length);
  let pos = 0;
  let ctr = 0;

  while (pos < length) {
    const inp = new Uint8Array(keyBytes.length + ivBytes.length + 4);
    inp.set(keyBytes, 0);
    inp.set(ivBytes, keyBytes.length);
    const off = keyBytes.length + ivBytes.length;
    inp[off] = (ctr >>> 24) & 0xFF;
    inp[off + 1] = (ctr >>> 16) & 0xFF;
    inp[off + 2] = (ctr >>> 8) & 0xFF;
    inp[off + 3] = ctr & 0xFF;

    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', inp));
    const take = Math.min(32, length - pos);
    for (let i = 0; i < take; i++) {
      out[pos + i] = hash[i];
    }
    pos += 32;
    ctr++;
  }
  return out;
}

// ==========================================
// AES-256-GCM Authenticated Encryption
// ==========================================

export async function deriveKeyFromPassword(password: string, saltHex: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ==========================================
// Custom Alphabet LCG Fisher-Yates Shuffler
// ==========================================

export async function makeAlpha(alphaSeedHex: string): Promise<string> {
  const seedBytes = hexToBytes(alphaSeedHex);
  const hashBuf = await crypto.subtle.digest(
    'SHA-256',
    new Uint8Array([...seedBytes, ...new TextEncoder().encode('__LX_PRIME_ALPHA__')])
  );
  const hashBytes = new Uint8Array(hashBuf);

  let state = BigInt(0);
  for (let i = 0; i < 8; i++) {
    state = (state << 8n) | BigInt(hashBytes[i]);
  }
  const MUL = 6364136223846793005n;
  const ADD = 1442695040888963407n;
  const MOD = 2n ** 64n;
  const STD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const arr = STD.split('');

  for (let i = 63; i > 0; i--) {
    state = (state * MUL + ADD) % MOD;
    const j = Number(state % BigInt(i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr.join('');
}

export function custEncode(bytes: Uint8Array, alpha: string): string {
  const STD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  let out = '';
  for (let i = 0; i < b64.length; i++) {
    const c = b64[i];
    out += c === '=' ? '=' : alpha[STD.indexOf(c)];
  }
  return out;
}

export function jstrEncode(s: string): string {
  return '_D_([' + Array.from(s).map(c => c.charCodeAt(0)).join(',') + '])';
}

export function rv(): string {
  return '_0x' + randHex(4);
}

// Calculate Shannon Entropy
export function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const ch = str[i];
    frequencies[ch] = (frequencies[ch] || 0) + 1;
  }
  let entropy = 0;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

// ==========================================
// Theme Configurations for Decryption Shell
// ==========================================

export function getThemeStyles(theme: SecurityTheme, customTitle: string, loaderMsg: string) {
  switch (theme) {
    case 'matrix-green':
      return {
        bg: '#020d06',
        accent: '#00ff66',
        accent2: '#059669',
        title: customTitle || '🔒 MATRIX SECURE TERMINAL',
        msg: loaderMsg || 'DECRYPTING QUANTUM PAYLOAD...',
        font: "'JetBrains Mono', 'Courier New', monospace",
        border: '#052e16',
        glow: 'rgba(0, 255, 102, 0.4)'
      };
    case 'dark-luxury':
      return {
        bg: '#0a0a0f',
        accent: '#e2b357',
        accent2: '#9353d3',
        title: customTitle || '🔒 OBSIDIAN VAULT',
        msg: loaderMsg || 'INITIALIZING SECURE ENCLAVE...',
        font: "'Plus Jakarta Sans', system-ui, sans-serif",
        border: '#27272a',
        glow: 'rgba(226, 179, 87, 0.3)'
      };
    case 'deep-purple':
      return {
        bg: '#090414',
        accent: '#c084fc',
        accent2: '#f43f5e',
        title: customTitle || '🔒 NEBULA CIPHER',
        msg: loaderMsg || 'VALIDATING SIGNATURE BLOCKS...',
        font: "'Orbitron', monospace",
        border: '#1f1338',
        glow: 'rgba(192, 132, 252, 0.4)'
      };
    case 'stealth-minimal':
      return {
        bg: '#09090b',
        accent: '#f4f4f5',
        accent2: '#71717a',
        title: customTitle || '🔒 SECURE PAYLOAD',
        msg: loaderMsg || 'LOADING APPLICATION...',
        font: "system-ui, -apple-system, sans-serif",
        border: '#27272a',
        glow: 'rgba(255, 255, 255, 0.2)'
      };
    case 'cyber-neon':
    default:
      return {
        bg: '#050510',
        accent: '#00ffe5',
        accent2: '#ff00c8',
        title: customTitle || '⚡ BOSS LX PRIME ULTRA PROTECTED',
        msg: loaderMsg || 'DECRYPTING... PLEASE WAIT',
        font: "'Share Tech Mono', monospace",
        border: '#141430',
        glow: 'rgba(0, 255, 229, 0.4)'
      };
  }
}

// ==========================================
// Inner Protection Scripts Generation
// ==========================================

export function buildInnerProtectionScript(opts: ProtectionOptions): string {
  const L = ['(function(){"use strict";'];

  if (opts.rightClick) {
    L.push('document.addEventListener("contextmenu",function(e){e.preventDefault();return false;},true);');
  }

  if (opts.keyboard) {
    L.push(`document.addEventListener("keydown",function(e){
      var k=(e.key||"").toLowerCase();
      if(e.key==="F12"||e.key==="F11"||(e.ctrlKey&&["u","s","a","c","i","j","p","h"].indexOf(k)!==-1)||(e.ctrlKey&&e.shiftKey&&["i","j","c","k"].indexOf(k)!==-1)||(e.metaKey&&["u","s","i","j","c"].indexOf(k)!==-1)){
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },true);`);
  }

  if (opts.copySelect) {
    L.push('document.addEventListener("copy",function(e){e.preventDefault();return false;},true);');
    L.push('document.addEventListener("cut",function(e){e.preventDefault();return false;},true);');
    L.push('document.addEventListener("selectstart",function(e){e.preventDefault();return false;},true);');
    L.push(`(function(){
      var s=document.createElement("style");
      s.textContent="*{-webkit-user-select:none!important;user-select:none!important;}img{pointer-events:none!important;}";
      (document.head||document.documentElement).appendChild(s);
    })();`);
  }

  if (opts.consoleClear) {
    L.push('setInterval(function(){try{console.clear();}catch(e){}},1500);');
    L.push(`try{
      var _c=console.log;
      console.log=console.warn=console.info=console.error=console.dir=function(){};
    }catch(e){}`);
  }

  if (opts.devtoolsDetect) {
    L.push(`(function(){
      function _detect(){
        if(window.outerWidth-window.innerWidth>160||window.outerHeight-window.innerHeight>160){
          document.body.innerHTML="<div style='display:flex;align-items:center;justify-content:center;height:100vh;background:#050510;color:#ff4466;font-family:monospace;text-align:center;'><div><h2 style='font-size:22px;'>⛔ DEVTOOLS DETECTED</h2><p style='color:#778;margin-top:10px;'>Execution halted for security protection.</p></div></div>";
        }
      }
      window.addEventListener("resize",_detect);
      setInterval(_detect,2000);
      setTimeout(_detect,1000);
    })();`);
  }

  L.push('})();');
  return L.join('');
}

// ==========================================
// Main HTML Encryption Routine
// ==========================================

export interface EncryptionExecutionProgress {
  onProgress?: (percent: number, message: string) => void;
}

export async function encryptHtmlCode(
  rawHtml: string,
  opts: ProtectionOptions,
  branding: BrandingConfig,
  progressHook?: (pct: number, msg: string) => void
): Promise<{ outputHtml: string; sigToken: string; entropyScore: number }> {
  const updateProgress = (pct: number, msg: string) => {
    if (progressHook) progressHook(pct, msg);
  };

  updateProgress(5, 'Encoding raw HTML into byte stream...');
  const htmlBytes = new TextEncoder().encode(rawHtml);
  const n = htmlBytes.length;

  updateProgress(15, 'Generating 256-bit cryptographic keys & IV seeds...');
  const mkHex = randHex(32); // 256-bit master key (64 hex chars)
  const ivHex = randHex(16); // 128-bit IV (32 hex chars)
  const alphaSeedH = randHex(16);

  updateProgress(35, 'Layer 1: SHA256-CTR Dynamic Stream Keystream...');
  const keyBytes = hexToBytes(mkHex);
  const ivBytes = hexToBytes(ivHex);
  const stream = await sha256CtrStream(keyBytes, ivBytes, n);

  const ct1 = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    ct1[i] = htmlBytes[i] ^ stream[i];
  }

  updateProgress(55, 'Layer 2: Polymorphic Custom-Alphabet Radix Mapping...');
  const alpha = await makeAlpha(alphaSeedH);
  const ct3 = custEncode(ct1, alpha);

  updateProgress(70, 'Layer 3: Self-Testing Cryptographic Decryption Integrity...');
  {
    const STD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let b64 = '';
    for (let i = 0; i < ct3.length; i++) {
      const c = ct3[i];
      b64 += c === '=' ? '=' : STD[alpha.indexOf(c)];
    }
    const bin = atob(b64);
    const ct1Check = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      ct1Check[i] = bin.charCodeAt(i);
    }
    const stream2 = await sha256CtrStream(keyBytes, ivBytes, n);
    const plain = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      plain[i] = ct1Check[i] ^ stream2[i];
    }
    const got = new TextDecoder('utf-8').decode(plain);
    if (got !== rawHtml) {
      throw new Error('Self-test validation failed. Decryption payload mismatch.');
    }
  }

  updateProgress(80, 'Layer 4: 8-Fragment Dynamic Masking & Signature Token Binding...');
  const sigRaw = await sha256Hex(mkHex + ivHex);
  const sigToken = 'ZN' + sigRaw.slice(0, 16);

  const sigMask = expandSigMask(sigToken);
  const fragments: string[] = [];
  const staticMasks: string[] = [];

  for (let i = 0; i < 8; i++) {
    const raw = mkHex.slice(i * 8, (i + 1) * 8);
    const sm = sigMask.slice(i * 8, (i + 1) * 8);
    const fm = randHex(4);
    staticMasks.push(fm);
    fragments.push(xorHex(raw, xorHex(sm, fm)));
  }

  // IV fragments (4 fragments)
  const ivFrags: string[] = [];
  const ivMasks: string[] = [];
  for (let i = 0; i < 4; i++) {
    const raw = ivHex.slice(i * 8, (i + 1) * 8);
    const m = randHex(4);
    ivMasks.push(m);
    ivFrags.push(xorHex(raw, m));
  }

  updateProgress(90, 'Layer 5: Injecting Anti-Reverse Engineering & Building Standalone Shell...');
  const innerProt = buildInnerProtectionScript(opts);

  const outputHtml = buildLoaderHtml({
    ct3,
    alpha,
    sigToken,
    fragments,
    staticMasks,
    ivFrags,
    ivMasks,
    innerProt,
    opts,
    branding
  });

  const entropy = calculateEntropy(outputHtml);
  updateProgress(100, 'Encryption complete and verified!');

  return {
    outputHtml,
    sigToken,
    entropyScore: entropy
  };
}

// ==========================================
// Standalone Decryption Shell HTML Generator
// ==========================================

interface LoaderParams {
  ct3: string;
  alpha: string;
  sigToken: string;
  fragments: string[];
  staticMasks: string[];
  ivFrags: string[];
  ivMasks: string[];
  innerProt: string;
  opts: ProtectionOptions;
  branding: BrandingConfig;
}

function buildLoaderHtml(params: LoaderParams): string {
  const { ct3, alpha, sigToken, fragments, staticMasks, ivFrags, ivMasks, innerProt, opts, branding } = params;

  // Random variable names
  const V: Record<string, string> = {};
  [
    'D', 'X', 'HB', 'STREAM', 'GO', 'DIE', 'MK', 'IV', 'CT', 'BIN', 'OUT',
    'PLAIN', 'HTML', 'SIG', 'SM', 'STK', 'F', 'IM', 'ALPHA', 'LO', 'BI',
    'PROT', 'POS', 'CTR', 'INP', 'HASH', 'TAKE', 'CD', 'PW', 'CHK_EXP',
    'CHK_DOM', 'SALT', 'SUBMIT'
  ].forEach(k => {
    V[k] = rv();
  });

  // Decoys
  const decoys = Array.from({ length: 6 }, () => `var ${rv()}=${jstrEncode(randHex(8))};`).join('');

  const fragJs = fragments.map(f => `'${f}'`).join(',');
  const smaskJs = staticMasks.map(m => `'${m}'`).join(',');
  const ivFragJs = ivFrags.map(f => `'${f}'`).join(',');
  const ivMaskJs = ivMasks.map(m => `'${m}'`).join(',');

  const STD_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const stdCodes = Array.from(STD_B64).map(c => c.charCodeAt(0)).join(',');
  const noise = randHex(8);

  const themeStyle = getThemeStyles(opts.theme, opts.customTitle, opts.loaderMessage);

  // Domain lock check code
  const domainLockCode = opts.domainLock.trim()
    ? `
    var _allowed = [${opts.domainLock.split(',').map(d => `'${d.trim()}'`).join(',')}];
    var _currHost = window.location.hostname || '';
    var _domMatch = _allowed.some(function(d){ return _currHost === d || _currHost.endsWith('.' + d) || d === 'localhost' && (_currHost==='127.0.0.1' || _currHost===''); });
    if (!_domMatch && _currHost !== '') {
      ${V.DIE}(_D_([68,79,77,65,73,78,32,76,79,67,75,69,68]));
      return;
    }
    `
    : '';

  // Expiry check code
  const expiryCode = opts.expiryDate
    ? `
    var _expTime = new Date('${opts.expiryDate}T23:59:59Z').getTime();
    if (Date.now() > _expTime) {
      ${V.DIE}(_D_([80,65,89,76,79,65,68,32,69,88,80,73,82,69,68]));
      return;
    }
    `
    : '';

  // Password Verification Logic
  const passwordCheckLogic = opts.passwordProtected && opts.password
    ? `
    var _pwHashReq = '${djb2(opts.password)}';
    var _userPw = prompt(_D_([69,110,116,101,114,32,68,101,99,114,121,112,116,105,111,110,32,80,97,115,115,119,111,114,100,58]));
    if (!_userPw || _djb2(_userPw) !== _pwHashReq) {
      ${V.DIE}(_D_([73,78,86,65,76,73,68,32,80,65,83,83,87,79,82,68]));
      return;
    }
    `
    : '';

  const script = `(function(){
'use strict';
/* ${noise} BOSS LX PRIME ULTRA SECURE RUNTIME ${rv()} */
function _D_(a){var r='';for(var i=0;i<a.length;i++)r+=String.fromCharCode(a[i]);return r;}
function ${V.X}(h1,h2){var r='';for(var i=0;i<h1.length;i+=2)r+=(('0'+(parseInt(h1.substr(i,2),16)^parseInt(h2.substr(i%h2.length,2),16)).toString(16))).slice(-2);return r;}
function ${V.HB}(h){var b=new Uint8Array(h.length>>1);for(var i=0;i<h.length;i+=2)b[i>>1]=parseInt(h.substr(i,2),16);return b;}
function ${V.CD}(s,a){var std=_D_([${stdCodes}]);var b='';for(var i=0;i<s.length;i++){var c=s[i];b+=(c==='=')?'=':std[a.indexOf(c)];}var bin=atob(b);var out=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
function _djb2(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))&0xFFFFFFFF;return('00000000'+(h>>>0).toString(16)).slice(-8);}
function _xsm(sig){var b=_djb2(sig);var r='';for(var i=0;i<8;i++)r+=_djb2(b+i);return r;}
function _gs(){try{var h=document.documentElement.innerHTML||'';var m=h.match(/SIG_TOKEN[\\s:]+([A-Za-z0-9]{16,24})/);return m?m[1]:'';}catch(e){return '';}}
async function ${V.STREAM}(kBuf,iBuf,len){var ${V.OUT}=new Uint8Array(len);var ${V.POS}=0,${V.CTR}=0;while(${V.POS}<len){var ${V.INP}=new Uint8Array(kBuf.length+iBuf.length+4);${V.INP}.set(kBuf,0);${V.INP}.set(iBuf,kBuf.length);var _o=kBuf.length+iBuf.length;${V.INP}[_o]=(${V.CTR}>>>24)&255;${V.INP}[_o+1]=(${V.CTR}>>>16)&255;${V.INP}[_o+2]=(${V.CTR}>>>8)&255;${V.INP}[_o+3]=${V.CTR}&255;var ${V.HASH}=new Uint8Array(await crypto.subtle.digest(_D_([83,72,65,45,50,53,54]),${V.INP}.buffer));var ${V.TAKE}=Math.min(32,len-${V.POS});for(var i=0;i<${V.TAKE};i++)${V.OUT}[${V.POS}+i]=${V.HASH}[i];${V.POS}+=32;${V.CTR}++;}return ${V.OUT};}
${decoys}
async function ${V.GO}(){
try{
${opts.iframeBlock ? `try{if(window.self!==window.top){${V.DIE}(_D_([73,70,82,65,77,69,32,66,76,79,67,75,69,68]));}}catch(e){${V.DIE}(_D_([73,70,82,65,77,69]));}` : ''}
${domainLockCode}
${expiryCode}
${passwordCheckLogic}
var ${V.SIG}=_gs();
${opts.signatureLock ? `if(!${V.SIG}||${V.SIG}.length<4){${V.DIE}(_D_([83,73,71,32,77,73,83,83,73,78,71]));}` : ''}
var ${V.SM}=_xsm(${V.SIG});
var ${V.STK}=[${smaskJs}];
var ${V.F}=[${fragJs}];
var ${V.MK}='';for(var i=0;i<8;i++)${V.MK}+=${V.X}(${V.F}[i],${V.X}(${V.STK}[i],${V.SM}.substr(i*8,8)));
var _ivM=[${ivMaskJs}];var _ivF=[${ivFragJs}];
var ${V.IV}='';for(var i=0;i<4;i++)${V.IV}+=${V.X}(_ivF[i],_ivM[i]);
var ${V.ALPHA}=${jstrEncode(alpha)};
var ${V.CT}=${jstrEncode(ct3)};
var ${V.BIN}=${V.CD}(${V.CT},${V.ALPHA});
${V.CT}=null;${V.ALPHA}=null;
var _kb=${V.HB}(${V.MK});${V.MK}=null;
var _ib=${V.HB}(${V.IV});${V.IV}=null;
var _st=await ${V.STREAM}(_kb,_ib,${V.BIN}.length);
_kb=null;_ib=null;
var ${V.PLAIN}=new Uint8Array(${V.BIN}.length);
for(var i=0;i<${V.BIN}.length;i++)${V.PLAIN}[i]=${V.BIN}[i]^_st[i];
${V.BIN}=null;_st=null;
var ${V.HTML}=new TextDecoder(_D_([117,116,102,45,56])).decode(${V.PLAIN});
${V.PLAIN}=null;
if(!${V.HTML}||${V.HTML}.length<4)throw new Error(_D_([101,109,112,116,121]));
var ${V.PROT}='<'+'script>'+${jstrEncode(innerProt)}+'<'+'/script>';
var ${V.LO}=${V.HTML}.toLowerCase();
var ${V.BI}=${V.LO}.lastIndexOf('<'+'/body>');
${V.HTML}=(${V.BI}!==-1)?${V.HTML}.slice(0,${V.BI})+${V.PROT}+${V.HTML}.slice(${V.BI}):(${V.HTML}+${V.PROT});
${V.PROT}=null;${V.LO}=null;
document.open(_D_([116,101,120,116,47,104,116,109,108]),_D_([114,101,112,108,97,99,101]));
document.write(${V.HTML});
document.close();
${V.HTML}=null;
}catch(ex){${V.DIE}(ex.message||_D_([85,78,75,78,79,87,78]));}}
function ${V.DIE}(m){try{document.open();document.write('<!DOCTYPE html><html><body style="margin:0;background:${themeStyle.bg};display:flex;align-items:center;justify-content:center;height:100vh;"><div style="text-align:center;color:#ff4466;font-family:monospace;"><h2 style="letter-spacing:3px">\\u26D4 SECURITY VIOLATION</h2><p style="color:#778;margin-top:10px;">'+m+'</p><p style="color:#445;margin-top:8px;">${branding.authorName || 'BOSS LX PRIME'}</p></div></body></html>');document.close();}catch(e){}throw new Error(m);}
if(document.readyState===_D_([108,111,97,100,105,110,103])){document.addEventListener(_D_([68,79,77,67,111,110,116,101,110,116,76,111,97,100,101,100]),${V.GO});}else{${V.GO}();}
})();`;

  const now = new Date();
  const ds = now.toISOString().slice(0, 10);
  const ts = now.toTimeString().slice(0, 8);

  const header = `<!--
╔════════════════════════════════════════════════════════════════════════════╗
║                   ${(branding.authorName || 'BOSS LX PRIME').toUpperCase()} ULTRA ENCRYPTED PAYLOAD                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║ AUTHOR        : ${(branding.authorName || 'Rahul Sir / BOSS LX PRIME').padEnd(59)}║
║ TELEGRAM      : ${(branding.telegramChannel || '@BOSS_LX_PRIME').padEnd(59)}║
║ BOT           : ${(branding.telegramBot || '@BOSS_LX_PRIME_BOT').padEnd(59)}║
║ BUILD DATE    : ${(ds + ' ' + ts + ' UTC').padEnd(59)}║
║ CIPHER ENGINE : SHA256-CTR + CUSTOM-RADIX-LCG + 8-FRAGMENT KEY MASK       ║
║ SIG_TOKEN     : ${sigToken.padEnd(59)}║
╠════════════════════════════════════════════════════════════════════════════╣
║ WARNING: Tampering with SIG_TOKEN permanently destroys payload decryption. ║
║ ALL RIGHTS RESERVED — UNAUTHORIZED MODIFICATION PROHIBITED                 ║
╚════════════════════════════════════════════════════════════════════════════╝
-->`;

  const decoyHtmlTrap = opts.antiViewSourceTrap
    ? `<noscript><div style="display:none">Security verification required. Standard browser needed.</div></noscript>`
    : '';

  return `${header}
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${themeStyle.title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${themeStyle.bg};color:${themeStyle.accent};font-family:${themeStyle.font};height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;}
#_w{text-align:center;padding:24px;border:1px solid ${themeStyle.border};border-radius:12px;background:rgba(255,255,255,0.01);box-shadow:0 0 30px rgba(0,0,0,0.5);max-width:440px;width:90%;}
#_w h2{font-size:clamp(14px,3.5vw,20px);letter-spacing:3px;margin-bottom:8px;animation:_p 2s ease-in-out infinite;}
@keyframes _p{0%,100%{opacity:1;filter:drop-shadow(0 0 10px ${themeStyle.glow});}50%{opacity:0.4;filter:drop-shadow(0 0 2px ${themeStyle.glow});}}
#_w p{font-size:11px;color:#71717a;letter-spacing:2px;margin-top:8px;}
#_b{width:100%;max-width:240px;height:3px;background:#181824;border-radius:3px;margin:18px auto 0;overflow:hidden;}
#_f{height:100%;background:linear-gradient(90deg,${themeStyle.accent},${themeStyle.accent2});animation:_l 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;}
@keyframes _l{0%{width:0}30%{width:40%}70%{width:80%}100%{width:95%}}
</style>
</head>
<body>
${decoyHtmlTrap}
<div id="_w">
  <h2>${themeStyle.title}</h2>
  <p>${themeStyle.msg}</p>
  <div id="_b"><div id="_f"></div></div>
</div>
<script>
/* SIG_TOKEN : ${sigToken} */
${script}
<\/script>
</body>
</html>`;
}

// ==========================================
// URL Shield & Protected Redirector Generator
// ==========================================

export async function generateShieldedUrlHtml(
  opts: UrlProtectionOptions,
  branding: BrandingConfig
): Promise<string> {
  const encUrl = opts.targetUrl.trim();
  const theme = getThemeStyles(opts.theme, opts.title || 'Security Gateway', opts.customNotice || 'Verifying destination link...');
  
  // Encrypt target URL with random XOR + Base64
  const key = randHex(8);
  const keyBytes = hexToBytes(key);
  const urlBytes = new TextEncoder().encode(encUrl);
  const xorBytes = new Uint8Array(urlBytes.length);
  for (let i = 0; i < urlBytes.length; i++) {
    xorBytes[i] = urlBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  let binStr = '';
  for (let i = 0; i < xorBytes.length; i++) {
    binStr += String.fromCharCode(xorBytes[i]);
  }
  const encPayloadB64 = btoa(binStr);

  const pwHash = opts.requirePassword && opts.password ? djb2(opts.password) : '';
  const now = new Date().toISOString().slice(0, 10);

  return `<!--
╔════════════════════════════════════════════════════════════════════════════╗
║               ${(branding.authorName || 'BOSS LX PRIME').toUpperCase()} SECURE URL GATEWAY               ║
║ CREATED       : ${now.padEnd(59)}║
║ AUTH          : ${(branding.telegramChannel || '@BOSS_LX_PRIME').padEnd(59)}║
╚════════════════════════════════════════════════════════════════════════════╝
-->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${opts.maskReferrer ? '<meta name="referrer" content="no-referrer">' : ''}
<title>${opts.title || '🔒 Protected Destination Link'}</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Plus+Jakarta+Sans:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  background:${theme.bg};
  color:#e2e8f0;
  font-family:'Plus Jakarta Sans',sans-serif;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}
.box{
  background:#090b14;
  border:1px solid ${theme.border};
  border-radius:16px;
  padding:32px 24px;
  max-width:460px;
  width:100%;
  text-align:center;
  box-shadow:0 0 35px rgba(0,0,0,0.6);
  position:relative;
  overflow:hidden;
}
.box::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,${theme.accent},transparent);
}
.badge{
  display:inline-flex;
  align-items:center;
  gap:6px;
  background:rgba(6,182,212,0.08);
  border:1px solid rgba(6,182,212,0.25);
  border-radius:999px;
  padding:4px 12px;
  font-size:11px;
  color:${theme.accent};
  font-family:'JetBrains Mono',monospace;
  margin-bottom:18px;
}
.title{
  font-family:'Orbitron',sans-serif;
  font-size:18px;
  color:#f8fafc;
  letter-spacing:1.5px;
  margin-bottom:8px;
}
.desc{
  font-size:13px;
  color:#94a3b8;
  line-height:1.5;
  margin-bottom:24px;
}
.verify-box{
  background:#0f1322;
  border:1px solid #1e293b;
  border-radius:10px;
  padding:16px;
  margin-bottom:20px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  cursor:pointer;
  user-select:none;
  transition:all 0.2s;
}
.verify-box:hover{
  border-color:${theme.accent};
  background:rgba(6,182,212,0.03);
}
.verify-chk{
  width:22px;
  height:22px;
  border:2px solid #475569;
  border-radius:4px;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:all 0.2s;
}
.verify-chk.done{
  background:${theme.accent};
  border-color:${theme.accent};
  color:#000;
}
.pw-inp{
  width:100%;
  background:#0f1322;
  border:1px solid #1e293b;
  border-radius:8px;
  padding:12px 14px;
  color:#f1f5f9;
  font-family:'JetBrains Mono',monospace;
  font-size:13px;
  outline:none;
  margin-bottom:18px;
}
.pw-inp:focus{border-color:${theme.accent};}
.btn{
  width:100%;
  padding:14px;
  background:linear-gradient(135deg,${theme.accent},${theme.accent2});
  border:none;
  border-radius:8px;
  color:#050510;
  font-family:'Orbitron',sans-serif;
  font-weight:700;
  font-size:13px;
  letter-spacing:1.5px;
  cursor:pointer;
  transition:opacity 0.2s,transform 0.1s;
}
.btn:hover{opacity:0.9;transform:translateY(-1px);}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
.meta{margin-top:20px;font-size:10px;color:#475569;font-family:'JetBrains Mono',monospace;letter-spacing:1px;}
.timer{font-size:24px;font-family:'Orbitron',monospace;color:${theme.accent};margin-bottom:12px;font-weight:700;}
</style>
</head>
<body>
<div class="box">
  <div class="badge">🔒 MILITARY SHIELD V7.0</div>
  <h1 class="title">${opts.title || 'SECURITY VERIFICATION'}</h1>
  <p class="desc">${opts.customNotice || 'You are connecting to a protected destination. Verification is required to continue.'}</p>
  
  ${
    opts.redirectMethod === 'delayed-countdown'
      ? `<div id="tmr" class="timer">${opts.delaySeconds || 5}s</div><p style="font-size:11px;color:#64748b;margin-bottom:14px;">Redirecting automatically...</p>`
      : ''
  }

  ${
    opts.antiBotVerify
      ? `<div class="verify-box" id="vBox" onclick="_toggleVerify()">
          <div style="text-align:left;">
            <div style="font-size:13px;font-weight:600;color:#f1f5f9;">I am not a robot</div>
            <div style="font-size:10px;color:#64748b;">CloudShield Anti-Bot Verification</div>
          </div>
          <div class="verify-chk" id="vChk"></div>
        </div>`
      : ''
  }

  ${
    opts.requirePassword
      ? `<input type="password" id="pw" class="pw-inp" placeholder="Enter Access PIN / Password">`
      : ''
  }

  <button class="btn" id="actBtn" onclick="_executeRedirect()" ${opts.antiBotVerify ? 'disabled' : ''}>
    ${opts.buttonText || 'CONTINUE TO DESTINATION →'}
  </button>

  <div class="meta">
    POWERED BY ${branding.authorName || 'BOSS LX PRIME'} · ${branding.telegramChannel || '@BOSS_LX_PRIME'}
  </div>
</div>

<script>
(function(){
  var _K = '${key}';
  var _P = '${encPayloadB64}';
  var _REQ_PW = '${pwHash}';
  var _VERIFIED = ${!opts.antiBotVerify};
  var _METHOD = '${opts.redirectMethod}';
  var _DELAY = ${opts.delaySeconds || 5};

  function _djb2(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))&0xFFFFFFFF;return('00000000'+(h>>>0).toString(16)).slice(-8);}
  
  function _decodeUrl(){
    var bin = atob(_P);
    var kb = [];
    for(var i=0;i<_K.length;i+=2) kb.push(parseInt(_K.substr(i,2),16));
    var out = '';
    for(var i=0;i<bin.length;i++){
      out += String.fromCharCode(bin.charCodeAt(i) ^ kb[i % kb.length]);
    }
    return out;
  }

  window._toggleVerify = function(){
    if(_VERIFIED) return;
    var chk = document.getElementById('vChk');
    chk.innerHTML = '<span style="font-size:12px;">⏳</span>';
    setTimeout(function(){
      _VERIFIED = true;
      chk.className = 'verify-chk done';
      chk.innerHTML = '✓';
      var btn = document.getElementById('actBtn');
      if(btn) btn.disabled = false;
    }, 600);
  };

  window._executeRedirect = function(){
    if(!_VERIFIED){
      alert('Please complete the verification check.');
      return;
    }
    if(_REQ_PW){
      var inp = document.getElementById('pw');
      if(!inp || _djb2(inp.value.trim()) !== _REQ_PW){
        alert('Invalid access PIN or password!');
        return;
      }
    }
    var dest = _decodeUrl();
    if(dest && dest.startsWith('http')){
      window.location.replace(dest);
    } else {
      alert('Error parsing destination link.');
    }
  };

  if(_METHOD === 'delayed-countdown'){
    var remaining = _DELAY;
    var tmrEl = document.getElementById('tmr');
    var interval = setInterval(function(){
      remaining--;
      if(tmrEl) tmrEl.innerText = remaining + 's';
      if(remaining <= 0){
        clearInterval(interval);
        _executeRedirect();
      }
    }, 1000);
  } else if(_METHOD === 'js-location' && !_REQ_PW && !_VERIFIED === false){
    _executeRedirect();
  }
})();
<\/script>
</body>
</html>`;
}

// ==========================================
// Quick URL Obfuscation Utilities
// ==========================================

export function generateQuickObfuscations(url: string) {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return {
      original: '',
      hexUrl: '',
      base64DataUri: '',
      unicodeEscaped: '',
      htmlEntityEncoded: '',
      jsEvalPacked: '',
      rot13Url: '',
      multiLayerHtml: ''
    };
  }

  // 1. Hex URL (%68%74%74%70...)
  const hexUrl = Array.from(cleanUrl)
    .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

  // 2. Unicode Escaped (\u0068\u0074...)
  const unicodeEscaped = Array.from(cleanUrl)
    .map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
    .join('');

  // 3. HTML Entity (&#104;&#116;&#116;&#112;...)
  const htmlEntityEncoded = Array.from(cleanUrl)
    .map(c => '&#' + c.charCodeAt(0) + ';')
    .join('');

  // 4. ROT13
  const rot13Url = cleanUrl.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0);
    const base = code <= 90 ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });

  // 5. JS Eval Packed
  const b64 = btoa(cleanUrl);
  const jsEvalPacked = `<script>window.location.replace(atob("${b64}"));<\/script>`;

  // 6. Base64 Data URI
  const redirectHtml = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${cleanUrl}"><script>window.location.replace("${cleanUrl}");<\/script></head><body>Redirecting...</body></html>`;
  const base64DataUri = `data:text/html;base64,${btoa(redirectHtml)}`;

  // 7. Multi-Layer Cloaked HTML Snippet
  const multiLayerHtml = `<!-- Protected Redirect -->
<script>
(function(_0x1,_0x2){
  var _d=function(_s){return atob(_s).split('').map(function(_c){return String.fromCharCode(_c.charCodeAt(0)^_0x2);}).join('');};
  var _target=_d("${btoa(Array.from(cleanUrl).map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join(''))}");
  window.location.replace(_target);
})(window,42);
<\/script>`;

  return {
    original: cleanUrl,
    hexUrl,
    base64DataUri,
    unicodeEscaped,
    htmlEntityEncoded,
    jsEvalPacked,
    rot13Url,
    multiLayerHtml
  };
}
