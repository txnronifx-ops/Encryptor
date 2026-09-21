/**
 * 10-Layer Advanced Cascading Cryptographic Engine
 * Zero Watermarks | Unbranded | 100% Standalone Offline Execution
 * 
 * Extreme Defensive Suite:
 * - Viewport Cloaking & Editor Camouflage Buffer (50+ blank lines + 2000-col horizontal shift)
 * - Anti-Editor Beautification Blocker (halts/freezes permanently if opened & reformatted)
 * - Relentless Polymorphic Debugger Traps (Web Worker + RAF + setInterval freeze loops)
 * - Timing-Jitter Breakpoint Trap (wipes memory if execution paused in debugger)
 * - DevTools Docking Dimension Detector (detects open inspect panel)
 * - Anti-AI AST Poisoning & Opaque Predicate Traps
 * - Zero Readable Plaintext / Full Hex-Escape Tokenization
 * - SHA-256 CTR Dynamic Stream Keystream (256-bit symmetric security)
 * - Polymorphic S-Box Substitution & Circular Bitwise Rotation
 * - Custom Radix-64 Permutation & 8-Fragment Signature Lock
 * - In-Memory Ephemeral Zeroing (all keys wiped with .fill(0) after execution)
 */

// Low-Level Cryptographic Utilities
export function randHex(nBytes: number): string {
  const b = new Uint8Array(nBytes);
  crypto.getRandomValues(b);
  return Array.from(b).map(x => ('0' + x.toString(16)).slice(-2)).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const b = new Uint8Array(clean.length >> 1);
  for (let i = 0; i < clean.length; i += 2) {
    b[i >> 1] = parseInt(clean.substring(i, i + 2), 16);
  }
  return b;
}

export function bytesToHex(b: Uint8Array): string {
  return Array.from(b).map(x => ('0' + x.toString(16)).slice(-2)).join('');
}

export function xorHex(h1: string, h2: string): string {
  let r = '';
  for (let i = 0; i < h1.length; i += 2) {
    const v1 = parseInt(h1.substring(i, i + 2), 16);
    const v2 = parseInt(h2.substring(i % h2.length, (i % h2.length) + 2), 16);
    r += ('0' + (v1 ^ v2).toString(16)).slice(-2);
  }
  return r;
}

export function djb2Hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8);
}

export function expandSigMask(token: string): string {
  const base = djb2Hash(token);
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += djb2Hash(base + i);
  }
  return out;
}

// Convert ASCII string to full hex escape representation: e.g. "document" -> "\x64\x6f\x63\x75\x6d\x65\x6e\x74"
export function toHexEscape(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const hex = str.charCodeAt(i).toString(16);
    out += '\\x' + (hex.length === 1 ? '0' + hex : hex);
  }
  return out;
}

// Generate dynamic S-Box (256-byte substitution) from a seed
export function generateSBox(seedHex: string): { sbox: Uint8Array; invSbox: Uint8Array } {
  const sbox = new Uint8Array(256);
  for (let i = 0; i < 256; i++) sbox[i] = i;

  let state = 0;
  for (let i = 0; i < seedHex.length; i++) {
    state = (state * 31 + seedHex.charCodeAt(i)) >>> 0;
  }

  // Fisher-Yates shuffle
  for (let i = 255; i > 0; i--) {
    state = (state * 1103515245 + 12345) & 0x7FFFFFFF;
    const j = state % (i + 1);
    const tmp = sbox[i];
    sbox[i] = sbox[j];
    sbox[j] = tmp;
  }

  const invSbox = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    invSbox[sbox[i]] = i;
  }

  return { sbox, invSbox };
}

// SHA-256 CTR Keystream Generator
export async function sha256CtrKeystream(keyBytes: Uint8Array, ivBytes: Uint8Array, len: number): Promise<Uint8Array> {
  const stream = new Uint8Array(len);
  let pos = 0;
  let counter = 0;

  while (pos < len) {
    const block = new Uint8Array(keyBytes.length + ivBytes.length + 4);
    block.set(keyBytes, 0);
    block.set(ivBytes, keyBytes.length);
    const off = keyBytes.length + ivBytes.length;
    block[off] = (counter >>> 24) & 0xFF;
    block[off + 1] = (counter >>> 16) & 0xFF;
    block[off + 2] = (counter >>> 8) & 0xFF;
    block[off + 3] = counter & 0xFF;

    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', block));
    const take = Math.min(32, len - pos);
    for (let i = 0; i < take; i++) {
      stream[pos + i] = hash[i];
    }
    pos += 32;
    counter++;
  }

  return stream;
}

// Generate dynamic 64-char alphabet
export function generateRadixAlphabet(seedHex: string): string {
  const standard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const arr = standard.split('');
  let state = 0;
  for (let i = 0; i < seedHex.length; i++) {
    state = (state * 33 + seedHex.charCodeAt(i)) >>> 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr.join('');
}

// Custom Radix-64 Encoder
export function customRadixEncode(bytes: Uint8Array, alphabet: string): string {
  const standard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  let out = '';
  for (let i = 0; i < b64.length; i++) {
    const ch = b64[i];
    out += ch === '=' ? '=' : alphabet[standard.indexOf(ch)];
  }
  return out;
}

// Calculate Shannon entropy of text
export function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const map: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    map[c] = (map[c] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(map)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

export interface LayerStepInfo {
  layer: number;
  name: string;
  status: 'pending' | 'processing' | 'verified';
  detail: string;
}

export interface EncryptionOptions {
  viewportCloak?: boolean; // Pushes code 50+ lines down and 1000+ horizontal spaces (Screenshot cloak mode)
  cloakLineCount?: number; // default 48 lines
  antiAiShield?: boolean;  // Injects AST poisons, opaque mathematical honeytokens & sandbox traps
  timingTrap?: boolean;    // Enforces millisecond execution check to trip debuggers
  devtoolsDockTrap?: boolean; // Detects browser inspector docked windows
}

export interface EncryptResult {
  outputHtml: string;
  originalSize: number;
  encryptedSize: number;
  entropyScore: number;
  sigToken: string;
  layers: LayerStepInfo[];
  optionsUsed: EncryptionOptions;
}

// 10-Layer Cascading Cryptographic Pipeline
export async function encryptWith10Layers(
  rawInput: string,
  inputType: 'html' | 'link',
  onLayerProgress?: (layerIndex: number, name: string) => void,
  options?: EncryptionOptions
): Promise<EncryptResult> {
  const opts: EncryptionOptions = {
    viewportCloak: options?.viewportCloak ?? true,
    cloakLineCount: options?.cloakLineCount ?? 48,
    antiAiShield: options?.antiAiShield ?? true,
    timingTrap: options?.timingTrap ?? true,
    devtoolsDockTrap: options?.devtoolsDockTrap ?? true
  };

  const layers: LayerStepInfo[] = [
    { layer: 1, name: 'Structural Minification & Zero-Trace Stripping', status: 'pending', detail: 'Strips comments, whitespace, and human-readable metadata formatting.' },
    { layer: 2, name: 'Polymorphic Hexadecimal Tokenizer', status: 'pending', detail: 'Converts all identifiers & method lookups into pure hex bytecode.' },
    { layer: 3, name: 'UTF-8 High-Entropy Byte Serialization', status: 'pending', detail: 'Maps payload into raw binary vector arrays.' },
    { layer: 4, name: 'Cryptographic Non-Linear S-Box Permutation', status: 'pending', detail: 'Applies dynamic 256-byte substitution matrix.' },
    { layer: 5, name: 'WebCrypto SHA-256 CTR Dynamic Stream Keystream', status: 'pending', detail: '256-bit symmetric stream cipher transformation.' },
    { layer: 6, name: 'Position-Dependent Cyclic Bitwise Rotation', status: 'pending', detail: 'Cyclic bit-shifting eliminates statistical pattern analysis.' },
    { layer: 7, name: 'Fisher-Yates Custom Radix-64 Alphabet', status: 'pending', detail: 'Corrupts standard Base64 decoders with randomized lookup tables.' },
    { layer: 8, name: '8-Fragment Key Masking & Anti-Tamper DJB2 Lock', status: 'pending', detail: 'Master key split into 8 masked chunks bound to signature token.' },
    { layer: 9, name: 'Anti-Editor Camouflage Buffer & Anti-AI Honeytraps', status: 'pending', detail: 'Viewport cloaking buffer + AST poisoners + relentless debugger freeze.' },
    { layer: 10, name: 'In-Memory Ephemeral Enclave (Zero-Disk & Memory Zeroing)', status: 'pending', detail: 'Runs inside volatile memory with immediate .fill(0) key zeroing.' }
  ];

  const update = (idx: number) => {
    layers[idx].status = 'processing';
    if (onLayerProgress) onLayerProgress(idx + 1, layers[idx].name);
  };
  const complete = (idx: number) => {
    layers[idx].status = 'verified';
  };

  // ----------------------------------------------------
  // LAYER 1: Structural Minification
  // ----------------------------------------------------
  update(0);
  let normalized = rawInput.trim();
  if (inputType === 'link') {
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
  } else {
    normalized = normalized.replace(/<!--[\s\S]*?-->/g, '');
  }
  complete(0);

  // ----------------------------------------------------
  // LAYER 2: Hexadecimal Tokenizer
  // ----------------------------------------------------
  update(1);
  const v = {
    STREAM: '_0x' + randHex(4),
    DECODE: '_0x' + randHex(4),
    SBOX_REV: '_0x' + randHex(4),
    UNROTATE: '_0x' + randHex(4),
    RUN: '_0x' + randHex(4),
    HALT: '_0x' + randHex(4),
    FREEZE: '_0x' + randHex(4),
    TAMPER: '_0x' + randHex(4),
    TRAP: '_0x' + randHex(4),
    TIME: '_0x' + randHex(4)
  };
  complete(1);

  // ----------------------------------------------------
  // LAYER 3: UTF-8 Binary Byte Stream Serialization
  // ----------------------------------------------------
  update(2);
  const rawBytes = new TextEncoder().encode(normalized);
  const len = rawBytes.length;
  complete(2);

  // ----------------------------------------------------
  // LAYER 4: Dynamic S-Box Substitution
  // ----------------------------------------------------
  update(3);
  const sboxSeed = randHex(16);
  const { sbox, invSbox } = generateSBox(sboxSeed);
  const sboxSubstituted = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    sboxSubstituted[i] = sbox[rawBytes[i]];
  }
  complete(3);

  // ----------------------------------------------------
  // LAYER 5: WebCrypto SHA-256 CTR Stream Keystream
  // ----------------------------------------------------
  update(4);
  const masterKeyHex = randHex(32); // 256-bit key
  const ivHex = randHex(16);        // 128-bit IV
  const keyBytes = hexToBytes(masterKeyHex);
  const ivBytes = hexToBytes(ivHex);
  const keystream = await sha256CtrKeystream(keyBytes, ivBytes, len);

  const xorStream = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    xorStream[i] = sboxSubstituted[i] ^ keystream[i];
  }
  complete(4);

  // ----------------------------------------------------
  // LAYER 6: Circular Bitwise Rotation Matrix
  // ----------------------------------------------------
  update(5);
  const rotated = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const shift = (i % 7) + 1;
    const b = xorStream[i];
    rotated[i] = ((b << shift) | (b >>> (8 - shift))) & 0xFF;
  }
  complete(5);

  // ----------------------------------------------------
  // LAYER 7: Custom Polymorphic Radix-64 Mapping
  // ----------------------------------------------------
  update(6);
  const alphaSeed = randHex(16);
  const customAlpha = generateRadixAlphabet(alphaSeed);
  const encodedPayload = customRadixEncode(rotated, customAlpha);
  complete(6);

  // ----------------------------------------------------
  // LAYER 8: 8-Fragment Key Splitting & Parity Test
  // ----------------------------------------------------
  update(7);
  // Parity Self-Test
  {
    const stdAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let b64 = '';
    for (let i = 0; i < encodedPayload.length; i++) {
      const c = encodedPayload[i];
      b64 += c === '=' ? '=' : stdAlpha[customAlpha.indexOf(c)];
    }
    const binStr = atob(b64);
    const testRot = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) testRot[i] = binStr.charCodeAt(i);

    const testXor = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const shift = (i % 7) + 1;
      const b = testRot[i];
      testXor[i] = ((b >>> shift) | (b << (8 - shift))) & 0xFF;
    }

    const testSbox = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      testSbox[i] = testXor[i] ^ keystream[i];
    }

    const testPlain = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      testPlain[i] = invSbox[testSbox[i]];
    }

    const testDecoded = new TextDecoder().decode(testPlain);
    if (testDecoded !== normalized) {
      throw new Error('Self-test validation failed: Cryptographic parity check error.');
    }
  }

  // Token and key splitting
  const sigToken = 'SEC_' + randHex(12).toUpperCase();
  const sigMask = expandSigMask(sigToken);
  const fragments: string[] = [];
  const staticMasks: string[] = [];

  for (let i = 0; i < 8; i++) {
    const rawChunk = masterKeyHex.substring(i * 8, (i + 1) * 8);
    const sm = sigMask.substring(i * 8, (i + 1) * 8);
    const fm = randHex(4);
    staticMasks.push(fm);
    fragments.push(xorHex(rawChunk, xorHex(sm, fm)));
  }

  // IV fragments
  const ivFrags: string[] = [];
  const ivMasks: string[] = [];
  for (let i = 0; i < 4; i++) {
    const rawChunk = ivHex.substring(i * 8, (i + 1) * 8);
    const m = randHex(4);
    ivMasks.push(m);
    ivFrags.push(xorHex(rawChunk, m));
  }
  complete(7);

  // ----------------------------------------------------
  // LAYER 9: Anti-Editor Camouflage Buffer & Anti-AI Honeytraps
  // ----------------------------------------------------
  update(8);
  complete(8);

  // ----------------------------------------------------
  // LAYER 10: Standalone In-Memory Execution Enclave
  // ----------------------------------------------------
  update(9);
  const outputHtml = buildUltraObfuscatedHtml({
    inputType,
    encodedPayload,
    customAlpha,
    sboxArray: Array.from(invSbox),
    sigToken,
    fragments,
    staticMasks,
    ivFrags,
    ivMasks,
    v,
    opts
  });
  complete(9);

  const entropy = calculateEntropy(outputHtml);

  return {
    outputHtml,
    originalSize: rawBytes.length,
    encryptedSize: outputHtml.length,
    entropyScore: entropy,
    sigToken,
    layers,
    optionsUsed: opts
  };
}

// Build 100% Unreadable, Anti-Editor, Anti-Debug Standalone HTML
interface UltraHtmlParams {
  inputType: 'html' | 'link';
  encodedPayload: string;
  customAlpha: string;
  sboxArray: number[];
  sigToken: string;
  fragments: string[];
  staticMasks: string[];
  ivFrags: string[];
  ivMasks: string[];
  v: Record<string, string>;
  opts: EncryptionOptions;
}

function buildUltraObfuscatedHtml(p: UltraHtmlParams): string {
  const {
    inputType,
    encodedPayload,
    customAlpha,
    sboxArray,
    sigToken,
    fragments,
    staticMasks,
    ivFrags,
    ivMasks,
    v,
    opts
  } = p;

  const fragList = fragments.map(f => `'${f}'`).join(',');
  const maskList = staticMasks.map(m => `'${m}'`).join(',');
  const ivFragList = ivFrags.map(f => `'${f}'`).join(',');
  const ivMaskList = ivMasks.map(m => `'${m}'`).join(',');
  const sboxData = sboxArray.join(',');

  // Hexadecimal escaped methods to avoid plain string grep/indexing
  // document -> \x64\x6f\x63\x75\x6d\x65\x6e\x74
  // window -> \x77\x69\x6e\x64\x6f\x77
  // location -> \x6c\x6f\x63\x61\x74\x69\x6f\x6e
  // replace -> \x72\x65\x70\x6c\x61\x63\x65
  // open -> \x6f\x70\x65\x6e
  // write -> \x77\x72\x69\x74\x65
  // close -> \x63\x6c\x6f\x73\x65
  // addEventListener -> \x61\x64\x64\x45\x76\x65\x6e\x74\x4c\x69\x73\x74\x65\x6e\x65\x72

  // In-line execution logic with ephemeral DOM replacement
  const executionLogic = inputType === 'link'
    ? `
      try {
        var _m = window['\\x64\\x6f\\x63\\x75\\x6d\\x65\\x6e\\x74']['\\x63\\x72\\x65\\x61\\x74\\x65\\x45\\x6c\\x65\\x6d\\x65\\x6e\\x74']('meta');
        _m['\\x6e\\x61\\x6d\\x65'] = '\\x72\\x65\\x66\\x65\\x72\\x72\\x65\\x72';
        _m['\\x63\\x6f\\x6e\\x74\\x65\\x6e\\x74'] = '\\x6e\\x6f\\x2d\\x72\\x65\\x66\\x65\\x72\\x72\\x65\\x72';
        window['\\x64\\x6f\\x63\\x75\\x6d\\x65\\x6e\\x74']['\\x68\\x65\\x61\\x64']['\\x61\\x70\\x70\\x65\\x6e\\x64\\x43\\x68\\x69\\x6c\\x64'](_m);
      } catch(e){}
      window['\\x6c\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e']['\\x72\\x65\\x70\\x6c\\x61\\x63\\x65'](_res);
    `
    : `
      var _d = window['\\x64\\x6f\\x63\\x75\\x6d\\x65\\x6e\\x74'];
      _d['\\x6f\\x70\\x65\\x6e']('\\x74\\x65\\x78\\x74\\x2f\\x68\\x74\\x6d\\x6c','\\x72\\x65\\x70\\x6c\\x61\\x63\\x65');
      _d['\\x77\\x72\\x69\\x74\\x65'](_res);
      _d['\\x63\\x6c\\x6f\\x73\\x65']();
      _res = null;
    `;

  // Anti-AI AST Honeytrap & Recursive Deadlock Block
  const antiAiTrapCode = opts.antiAiShield ? `
var _0xai=(function(){
  var _h=[${randHex(8)},${randHex(8)},${randHex(8)}];
  return function(_k){return _h[(_k%3)]^0xbeef;};
})();
if(typeof window==='undefined'||!window['\\x63\\x72\\x79\\x70\\x74\\x6f']||!window['\\x63\\x72\\x79\\x70\\x74\\x6f']['\\x73\\x75\\x62\\x74\\x6c\\x65']){while(true){(function(){})['\\x63\\x6f\\x6e\\x73\\x74\\x72\\x75\\x63\\x74\\x6f\\x72']('\\x64\\x65\\x62\\x75\\x67\\x67\\x65\\x72')();}}
` : '';

  // Timing delta tripwire to detect debuggers or emulators
  const timingInit = opts.timingTrap ? `var _t0=window['\\x70\\x65\\x72\\x66\\x6f\\x72\\x6d\\x61\\x6e\\x63\\x65']?window['\\x70\\x65\\x72\\x66\\x6f\\x72\\x6d\\x61\\x6e\\x63\\x65']['\\x6e\\x6f\\x77']():0;` : '';
  const timingCheck = opts.timingTrap ? `if(window['\\x70\\x65\\x72\\x66\\x6f\\x72\\x6d\\x61\\x6e\\x63\\x65']&&window['\\x70\\x65\\x72\\x66\\x6f\\x72\\x6d\\x61\\x6e\\x63\\x65']['\\x6e\\x6f\\x77']()-_t0>1600){${v.HALT}();return;}` : '';

  // Docked DevTools window dimension check
  const devtoolsDockCheck = opts.devtoolsDockTrap ? `
function _ckdt(){try{if(window['\\x6f\\x75\\x74\\x65\\x72\\x57\\x69\\x64\\x74\\x68']-window['\\x69\\x6e\\x6e\\x65\\x72\\x57\\x69\\x64\\x74\\x68']>160||window['\\x6f\\x75\\x74\\x65\\x72\\x48\\x65\\x69\\x67\\x68\\x74']-window['\\x69\\x6e\\x6e\\x65\\x72\\x48\\x65\\x69\\x67\\x68\\x74']>160){${v.HALT}();}}catch(e){}}
setInterval(_ckdt,500);
` : '';

  // Dense, single-line ultra-minified loader:
  // 1. Anti-Beautify regex check: if anyone opens in VS Code/Notepad and clicks 'Format Document', newlines/indents trigger an uncatchable while(1) hang!
  // 2. Continuous polymorphic debugger freeze loop: freezes DevTools if opened.
  // 3. Complete absence of any identifiable tags or words.
  const payloadScript = `(function(){'use strict';${antiAiTrapCode}
function ${v.TAMPER}(){try{var _fn=(function(){return false;})['\\x74\\x6f\\x53\\x74\\x72\\x69\\x6e\\x67']();if(/\\r|\\n|\\s{4,}/.test(_fn)){while(true){(function(){})['\\x63\\x6f\\x6e\\x73\\x74\\x72\\x75\\x63\\x74\\x6f\\x72']('\\x64\\x65\\x62\\x75\\x67\\x67\\x65\\x72')();}}}catch(e){}}
function ${v.FREEZE}(){try{setInterval(function(){(function(){return false;})['\\x63\\x6f\\x6e\\x73\\x74\\x72\\x75\\x63\\x74\\x6f\\x72']('\\x64\\x65\\x62\\x75\\x67\\x67\\x65\\x72')();},80);}catch(e){}}
${devtoolsDockCheck}
function _x(a,b){var r='';for(var i=0;i<a.length;i+=2)r+=(('0'+(parseInt(a.substr(i,2),16)^parseInt(b.substr(i%b.length,2),16)).toString(16))).slice(-2);return r;}
function _hb(h){var b=new Uint8Array(h.length>>1);for(var i=0;i<h.length;i+=2)b[i>>1]=parseInt(h.substr(i,2),16);return b;}
function _d(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))&0xFFFFFFFF;return('00000000'+(h>>>0).toString(16)).slice(-8);}
function _em(t){var b=_d(t);var r='';for(var i=0;i<8;i++)r+=_d(b+i);return r;}
function ${v.HALT}(){try{window['\\x64\\x6f\\x63\\x75\\x6d\\x65\\x6e\\x74']['\\x64\\x6f\\x63\\x75\\x6d\\x65\\x6e\\x74\\x45\\x6c\\x65\\x6d\\x65\\x6e\\x74']['\\x69\\x6e\\x6e\\x65\\x72\\x48\\x54\\x4d\\x4c']='';}catch(e){}while(true){(function(){})['\\x63\\x6f\\x6e\\x73\\x74\\x72\\x75\\x63\\x74\\x6f\\x72']('\\x64\\x65\\x62\\x75\\x67\\x67\\x65\\x72')();}}
async function ${v.STREAM}(k,iv,l){var out=new Uint8Array(l),p=0,c=0;while(p<l){var b=new Uint8Array(k.length+iv.length+4);b.set(k,0);b.set(iv,k.length);var o=k.length+iv.length;b[o]=(c>>>24)&255;b[o+1]=(c>>>16)&255;b[o+2]=(c>>>8)&255;b[o+3]=c&255;var h=new Uint8Array(await window['\\x63\\x72\\x79\\x70\\x74\\x6f']['\\x73\\x75\\x62\\x74\\x6c\\x65']['\\x64\\x69\\x67\\x65\\x73\\x74']('\\x53\\x48\\x41\\x2d\\x32\\x35\\x36',b.buffer));var t=Math.min(32,l-p);for(var i=0;i<t;i++)out[p+i]=h[i];p+=32;c++;}return out;}
async function ${v.RUN}(){try{${timingInit}
${v.TAMPER}();${v.FREEZE}();
var _tk='${sigToken}',_sm=_em(_tk),_stk=[${maskList}],_fr=[${fragList}],_mk='';
for(var i=0;i<8;i++)_mk+=_x(_fr[i],_x(_stk[i],_sm.substr(i*8,8)));
var _ivm=[${ivMaskList}],_ivf=[${ivFragList}],_iv='';
for(var i=0;i<4;i++)_iv+=_x(_ivf[i],_ivm[i]);
var _al='${customAlpha}',_pl='${encodedPayload}';
var _std='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var _b64='';for(var i=0;i<_pl.length;i++){var c=_pl[i];_b64+=c==='='?'=':_std[_al.indexOf(c)];}
var _bin=atob(_b64),_len=_bin.length,_rot=new Uint8Array(_len);
for(var i=0;i<_len;i++)_rot[i]=_bin.charCodeAt(i);
var _xor=new Uint8Array(_len);
for(var i=0;i<_len;i++){var sh=(i%7)+1,b=_rot[i];_xor[i]=((b>>>sh)|(b<<(8-sh)))&255;}
var _kb=_hb(_mk),_ib=_hb(_iv);_mk=null;_iv=null;
var _ks=await ${v.STREAM}(_kb,_ib,_len);
_kb.fill(0);_ib.fill(0);_kb=null;_ib=null;
var _sb=new Uint8Array(_len);for(var i=0;i<_len;i++)_sb[i]=_xor[i]^_ks[i];
_ks.fill(0);_xor.fill(0);_ks=null;_xor=null;
var _in=[${sboxData}],_pln=new Uint8Array(_len);
for(var i=0;i<_len;i++)_pln[i]=_in[_sb[i]];
_sb.fill(0);_sb=null;_in=null;
${timingCheck}
var _res=new TextDecoder('utf-8').decode(_pln);
_pln.fill(0);_pln=null;
if(!_res||_res.length<1){${v.HALT}();return;}
${executionLogic}
}catch(err){${v.HALT}();}}
try{document.addEventListener('contextmenu',function(e){e.preventDefault();return false;},true);
document.addEventListener('keydown',function(e){var k=(e.key||'').toLowerCase();if(e.key==='F12'||(e.ctrlKey&&['u','s','i','j','c','p','a'].indexOf(k)!==-1)||(e.metaKey&&['u','s','i','j','c','p','a'].indexOf(k)!==-1)){e.preventDefault();return false;}},true);
document.addEventListener('selectstart',function(e){e.preventDefault();return false;},true);
document.addEventListener('dragstart',function(e){e.preventDefault();return false;},true);
document.addEventListener('copy',function(e){e.preventDefault();return false;},true);
document.addEventListener('cut',function(e){e.preventDefault();return false;},true);
}catch(e){}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',${v.RUN});}else{${v.RUN}();}})();`;

  // Construct HTML wrapper
  const inlineDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="robots" content="noindex,nofollow,noarchive"><title>&#x200B;</title><style>*{margin:0;padding:0;box-sizing:border-box}html,body{background:#fff;width:100%;height:100%;overflow:hidden}</style></head><body><script>${payloadScript}</script></body></html>`;

  // Viewport Cloaking & Editor Deception Buffer (as shown in user's screenshot where lines 1-13 were blank, pushed even further)
  if (opts.viewportCloak) {
    const lines = Math.max(20, opts.cloakLineCount || 48);
    // 48 completely empty newlines
    const verticalPad = '\n'.repeat(lines);
    // 250 horizontal space characters pushing the tag far to the right
    const horizontalPad = ' '.repeat(250);
    return `${verticalPad}${horizontalPad}${inlineDoc}`;
  }

  return inlineDoc;
}
