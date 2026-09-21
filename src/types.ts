export type SecurityTheme = 'cyber-neon' | 'matrix-green' | 'dark-luxury' | 'deep-purple' | 'stealth-minimal';

export interface ProtectionOptions {
  rightClick: boolean;
  keyboard: boolean;
  devtoolsDetect: boolean;
  copySelect: boolean;
  consoleClear: boolean;
  iframeBlock: boolean;
  signatureLock: boolean;
  passwordProtected: boolean;
  password?: string;
  domainLock: string;
  expiryDate: string;
  antiViewSourceTrap: boolean;
  obfuscateLoader: boolean;
  encryptionAlgorithm: 'sha256-ctr' | 'aes-gcm-256';
  theme: SecurityTheme;
  customTitle: string;
  loaderMessage: string;
}

export interface BrandingConfig {
  authorName: string;
  telegramChannel: string;
  telegramBot: string;
  customWatermark: string;
}

export type RedirectMethod = 'meta-refresh' | 'js-location' | 'interactive-gate' | 'click-button' | 'delayed-countdown';

export interface UrlProtectionOptions {
  targetUrl: string;
  redirectMethod: RedirectMethod;
  delaySeconds: number;
  requirePassword: boolean;
  password?: string;
  antiBotVerify: boolean;
  maskReferrer: boolean;
  title: string;
  expiryDate: string;
  allowedDomains: string;
  theme: SecurityTheme;
  buttonText: string;
  customNotice: string;
}

export interface EncryptionResult {
  rawLength: number;
  encryptedLength: number;
  compressionRatio: number;
  outputHtml: string;
  timestamp: string;
  sigToken: string;
  entropyScore: number;
  securityRating: 'A+' | 'A' | 'B' | 'Military Grade';
  algorithm: string;
  layersApplied: string[];
}

export interface QuickObfuscationFormats {
  original: string;
  hexUrl: string;
  base64DataUri: string;
  unicodeEscaped: string;
  htmlEntityEncoded: string;
  jsEvalPacked: string;
  rot13Url: string;
  multiLayerHtml: string;
}
