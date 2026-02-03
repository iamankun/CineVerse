/**
 * Filter Management System
 * Based on uBlock Origin and AdGuard filter architecture
 */

import type { 
  FilterRule, 
  NetworkFilterRule, 
  CosmeticFilterRule, 
  ScriptletFilterRule
} from '@/types/adblock';

// Common ad domains (similar to EasyList)
export const DEFAULT_BLOCKED_DOMAINS = [
  // Ad servers
  'pagead2.googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'adservice.google.com',
  
  // Analytics that slow down sites
  'google-analytics.com',
  'googletagmanager.com',
  'analytics.google.com',
  
  // Pop-ups and redirects
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'adsterra.com',
  'exoclick.com',
  
  // Video ads
  'imasdk.googleapis.com',
  'v.fwmrm.net',
  'static.adsafeprotected.com',
  
  // Tracking
  'facebook.com/tr/',
  'connect.facebook.net',
  'stats.g.doubleclick.net'
];

// CSS selectors for ad elements
export const DEFAULT_COSMETIC_FILTERS = [
  // Generic ad containers
  '.ad',
  '.ads',
  '.ad-container',
  '.ad-banner',
  '.advertisement',
  '[class*="ad-"]',
  '[id*="ad-"]',
  '[class*="ads-"]',
  
  // Pop-ups and overlays
  '.popup-ad',
  '.overlay-ad',
  '.modal-ad',
  
  // Social widgets
  '.fb-like',
  '.twitter-follow',
  
  // Anti-adblock messages
  '.adblock-notice',
  '.adblocker-message',
  '#adblock-modal'
];

export class FilterEngine {
  private networkRules: NetworkFilterRule[] = [];
  private cosmeticRules: CosmeticFilterRule[] = [];
  private scriptletRules: ScriptletFilterRule[] = [];
  private enabled = true;

  constructor() {
    this.loadDefaultFilters();
  }

  private loadDefaultFilters() {
    // Add default network filters
    DEFAULT_BLOCKED_DOMAINS.forEach((domain, index) => {
      this.networkRules.push({
        id: `network-default-${index}`,
        type: 'network',
        action: 'block',
        pattern: domain,
        isRegex: false,
        urlPattern: domain,
        priority: 'high',
        enabled: true,
        description: `Block ${domain}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Add default cosmetic filters
    DEFAULT_COSMETIC_FILTERS.forEach((selector, index) => {
      this.cosmeticRules.push({
        id: `cosmetic-default-${index}`,
        type: 'cosmetic',
        action: 'block',
        pattern: selector,
        isRegex: false,
        selector,
        priority: 'medium',
        enabled: true,
        description: `Hide ${selector}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  addNetworkRule(rule: Omit<NetworkFilterRule, 'id' | 'createdAt' | 'updatedAt'>): NetworkFilterRule {
    const newRule: NetworkFilterRule = {
      ...rule,
      id: `network-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.networkRules.push(newRule);
    return newRule;
  }

  addCosmeticRule(rule: Omit<CosmeticFilterRule, 'id' | 'createdAt' | 'updatedAt'>): CosmeticFilterRule {
    const newRule: CosmeticFilterRule = {
      ...rule,
      id: `cosmetic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.cosmeticRules.push(newRule);
    return newRule;
  }

  addScriptletRule(rule: Omit<ScriptletFilterRule, 'id' | 'createdAt' | 'updatedAt'>): ScriptletFilterRule {
    const newRule: ScriptletFilterRule = {
      ...rule,
      id: `scriptlet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.scriptletRules.push(newRule);
    return newRule;
  }

  shouldBlockUrl(url: string, domain?: string): { blocked: boolean; rule?: NetworkFilterRule } {
    if (!this.enabled) return { blocked: false };

    for (const rule of this.networkRules) {
      if (!rule.enabled) continue;

      // Check domain restrictions
      if (domain) {
        if (rule.domains && !rule.domains.includes(domain)) continue;
        if (rule.excludeDomains && rule.excludeDomains.includes(domain)) continue;
      }

      // Check URL pattern
      const matches = rule.isRegex
        ? new RegExp(rule.pattern).test(url)
        : url.includes(rule.pattern);

      if (matches) {
        return { blocked: rule.action === 'block', rule };
      }
    }

    return { blocked: false };
  }

  getCosmeticFilters(domain?: string): CosmeticFilterRule[] {
    if (!this.enabled) return [];

    return this.cosmeticRules.filter(rule => {
      if (!rule.enabled) return false;
      if (domain) {
        if (rule.domains && !rule.domains.includes(domain)) return false;
        if (rule.excludeDomains && rule.excludeDomains.includes(domain)) return false;
      }
      return true;
    });
  }

  getScriptletFilters(domain?: string): ScriptletFilterRule[] {
    if (!this.enabled) return [];

    return this.scriptletRules.filter(rule => {
      if (!rule.enabled) return false;
      if (domain) {
        if (rule.domains && !rule.domains.includes(domain)) return false;
        if (rule.excludeDomains && rule.excludeDomains.includes(domain)) return false;
      }
      return true;
    });
  }

  removeRule(id: string): boolean {
    const initialLength = 
      this.networkRules.length + 
      this.cosmeticRules.length + 
      this.scriptletRules.length;

    this.networkRules = this.networkRules.filter(r => r.id !== id);
    this.cosmeticRules = this.cosmeticRules.filter(r => r.id !== id);
    this.scriptletRules = this.scriptletRules.filter(r => r.id !== id);

    const newLength = 
      this.networkRules.length + 
      this.cosmeticRules.length + 
      this.scriptletRules.length;

    return newLength < initialLength;
  }

  getAllRules(): FilterRule[] {
    return [
      ...this.networkRules,
      ...this.cosmeticRules,
      ...this.scriptletRules
    ];
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  exportToJson(): string {
    return JSON.stringify({
      networkRules: this.networkRules,
      cosmeticRules: this.cosmeticRules,
      scriptletRules: this.scriptletRules
    }, null, 2);
  }

  importFromJson(json: string) {
    try {
      const data = JSON.parse(json);
      if (data.networkRules) this.networkRules = data.networkRules;
      if (data.cosmeticRules) this.cosmeticRules = data.cosmeticRules;
      if (data.scriptletRules) this.scriptletRules = data.scriptletRules;
    } catch (error) {
      console.error('Failed to import filters:', error);
      throw error;
    }
  }
}

// Singleton instance
export const filterEngine = new FilterEngine();
