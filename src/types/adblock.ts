/**
 * Ad Blocking Types
 * Based on uBlock Origin and AdGuard architectures
 */

export type FilterType = 
  | 'network'      // Block network requests
  | 'cosmetic'     // Hide DOM elements
  | 'scriptlet'    // Inject blocking scripts
  | 'html'         // Filter HTML content
  | 'header';      // Modify HTTP headers

export type FilterAction = 'block' | 'allow' | 'redirect' | 'modify';

export type FilterPriority = 'high' | 'medium' | 'low';

export interface FilterRule {
  id: string;
  type: FilterType;
  action: FilterAction;
  pattern: string;
  isRegex: boolean;
  domains?: string[];
  excludeDomains?: string[];
  priority: FilterPriority;
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkFilterRule extends FilterRule {
  type: 'network';
  // Pattern matching
  urlPattern: string;
  // Resource types to block
  resourceTypes?: ('script' | 'image' | 'stylesheet' | 'xhr' | 'fetch' | 'media' | 'font' | 'websocket')[];
  // Request modifiers
  important?: boolean;
  thirdParty?: boolean;
}

export interface CosmeticFilterRule extends FilterRule {
  type: 'cosmetic';
  // CSS selector
  selector: string;
  // Procedural filtering
  procedural?: boolean;
  // Hide vs Remove
  removeElement?: boolean;
}

export interface ScriptletFilterRule extends FilterRule {
  type: 'scriptlet';
  // Scriptlet name (e.g., 'prevent-fetch', 'abort-on-property-read')
  scriptletName: string;
  // Scriptlet arguments
  args?: string[];
}

export interface FilterList {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  homepage?: string;
  enabled: boolean;
  rules: FilterRule[];
  updateUrl?: string;
  lastUpdated: string;
  stats: {
    totalRules: number;
    activeRules: number;
    blockedRequests: number;
    hiddenElements: number;
  };
}

export interface FilterStats {
  totalBlocked: number;
  blockedByType: Record<FilterType, number>;
  blockedDomains: Record<string, number>;
  recentBlocks: BlockEvent[];
}

export interface BlockEvent {
  id: string;
  timestamp: string;
  type: FilterType;
  url: string;
  domain: string;
  ruleId: string;
  ruleName: string;
}

// Scriptlet definitions based on uBlock Origin
export type ScriptletName = 
  // Prevent methods
  | 'prevent-fetch'
  | 'prevent-xhr'
  | 'prevent-setTimeout'
  | 'prevent-setInterval'
  | 'prevent-addEventListener'
  | 'prevent-eval-if'
  // Abort methods
  | 'abort-on-property-read'
  | 'abort-on-property-write'
  | 'abort-current-inline-script'
  // Set constants
  | 'set-constant'
  | 'set-cookie'
  | 'set-local-storage-item'
  // Remove elements
  | 'remove-attr'
  | 'remove-class'
  | 'remove-node-text'
  // Google IMA
  | 'google-ima3'
  // JSON manipulation
  | 'json-prune'
  | 'json-prune-xhr-response';

export interface ScriptletDefinition {
  name: ScriptletName;
  description: string;
  args: {
    name: string;
    description: string;
    optional?: boolean;
  }[];
  code: string;
}
