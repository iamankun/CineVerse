/**
 * Enhanced Ad Blocker for Player Iframe
 * Aggressively blocks ads in embedded video players
 */

'use client';

import { filterEngine } from './adblock/filters';
import { generateScriptletCode } from './adblock/scriptlets';

export class PlayerAdBlocker {
  private static instance: PlayerAdBlocker | null = null;
  private iframeObserver: MutationObserver | null = null;
  private blockedCount = 0;

  private constructor() {}

  static getInstance(): PlayerAdBlocker {
    if (!PlayerAdBlocker.instance) {
      PlayerAdBlocker.instance = new PlayerAdBlocker();
    }
    return PlayerAdBlocker.instance;
  }

  /**
   * Initialize ad blocker for player iframe
   */
  init(iframeRef?: HTMLIFrameElement) {
    console.log('🛡️ [Player AdBlock] Initializing...');

    // Apply global network blocking
    this.blockNetworkRequests();

    // Apply scriptlets globally
    this.injectGlobalScriptlets();

    // Monitor for iframes
    this.observeIframes(iframeRef);

    // Block common ad scripts
    this.blockAdScripts();

    console.log('✅ [Player AdBlock] Initialized');
  }

  /**
   * Block network requests to ad domains
   */
  private blockNetworkRequests() {
    // Intercept fetch
    const originalFetch = window.fetch;
    const self = this; // Preserve 'this' context
    window.fetch = async function(...args: Parameters<typeof fetch>) {
      const input = args[0];
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      const result = filterEngine.shouldBlockUrl(url);
      
      if (result.blocked) {
        console.log(`🚫 [Player AdBlock] Blocked fetch: ${url}`);
        self.blockedCount++;
        return Promise.resolve(new Response('', { 
          status: 200,
          statusText: 'Blocked by Player AdBlocker'
        }));
      }
      
      return originalFetch.apply(this, args);
    };

    // Intercept XMLHttpRequest
    const XHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true) {
      const urlStr = typeof url === 'string' ? url : url.href;
      const result = filterEngine.shouldBlockUrl(urlStr);
      
      if (result.blocked) {
        console.log(`🚫 [Player AdBlock] Blocked XHR: ${urlStr}`);
        PlayerAdBlocker.instance!.blockedCount++;
        return XHROpen.call(this, method, 'about:blank', async);
      }
      
      return XHROpen.call(this, method, url, async);
    };
  }

  /**
   * Inject scriptlets globally
   */
  private injectGlobalScriptlets() {
    const scriptlets = [
      // Block Google IMA3 (video ads SDK)
      { name: 'google-ima3', args: [] },
      
      // Prevent fetch to ad domains
      { name: 'prevent-fetch', args: ['pagead2.googlesyndication.com|doubleclick.net|imasdk.googleapis.com'] },
      
      // Disable common anti-adblock variables
      { name: 'set-constant', args: ['adBlockDetected', 'false'] },
      { name: 'set-constant', args: ['canRunAds', 'true'] },
      { name: 'set-constant', args: ['isAdBlockActive', 'false'] },
      
      // Prevent ad-related timeouts
      { name: 'prevent-setTimeout', args: ['adblock|advertisement|googlesyndication'] },
    ];

    scriptlets.forEach(({ name, args }) => {
      try {
        const code = generateScriptletCode(name, args);
        
        // Validate code is a non-empty string
        if (!code || typeof code !== 'string') {
          console.warn(`⚠️ [Player AdBlock] Invalid code for ${name}:`, typeof code);
          return;
        }
        
        // Execute code directly using Function constructor (no DOM manipulation)
        const fn = new Function(code);
        fn();
        console.log(`💉 [Player AdBlock] Injected: ${name}`);
      } catch {
        console.warn(`⚠️ [Player AdBlock] Failed to inject ${name}:`);
      }
    });
  }

  /**
   * Block ad scripts from loading
   */
  private blockAdScripts() {
    // Block script elements with ad URLs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            const src = script.src || '';
            
            if (this.isAdScript(src)) {
              console.log(`🚫 [Player AdBlock] Blocked script: ${src}`);
              script.remove();
              this.blockedCount++;
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Check if URL is an ad script
   */
  private isAdScript(url: string): boolean {
    const adPatterns = [
      'googlesyndication.com',
      'doubleclick.net',
      'google-analytics.com',
      'googletagmanager.com',
      'imasdk.googleapis.com',
      'securepubads.g.doubleclick.net',
      'popads.net',
      'popcash.net',
      'propellerads.com',
      'adservice.google.com',
    ];

    return adPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Observe and process iframes
   */
  private observeIframes(targetIframe?: HTMLIFrameElement) {
    // Process existing iframe
    if (targetIframe) {
      this.processIframe(targetIframe);
    }

    // Observe for new iframes
    this.iframeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME') {
            this.processIframe(node as HTMLIFrameElement);
          }
        });
      });
    });

    this.iframeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Process iframe - inject ad blocking into iframe content
   */
  private processIframe(iframe: HTMLIFrameElement) {
    console.log('🎯 [Player AdBlock] Processing iframe:', iframe.src);

    // Add sandbox attributes
    const currentSandbox = iframe.getAttribute('sandbox') || '';
    const sandboxAttrs = new Set(currentSandbox.split(' ').filter(Boolean));
    
    // Allow necessary permissions but restrict others
    sandboxAttrs.add('allow-scripts');
    sandboxAttrs.add('allow-same-origin');
    sandboxAttrs.delete('allow-popups'); // Block popups
    sandboxAttrs.delete('allow-popups-to-escape-sandbox');
    
    iframe.setAttribute('sandbox', Array.from(sandboxAttrs).join(' '));

    // Try to inject scripts into iframe (same-origin only)
    iframe.addEventListener('load', () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

        if (iframeDoc) {
          console.log('📄 [Player AdBlock] Injecting into iframe document');

          // Inject scriptlets into iframe
          this.injectIntoIframe(iframeDoc);

          // Apply cosmetic filters
          this.applyCosmeticFiltersToIframe(iframeDoc);
        }
      } catch {
        // Unsandboxed iframe, cannot attach
      }
    });

    // Block iframe src if it's an ad
    const src = iframe.src || '';
    const result = filterEngine.shouldBlockUrl(src);

    if (result.blocked) {
      console.log(`🚫 [Player AdBlock] Blocked iframe: ${src}`);
      iframe.src = 'about:blank';
      this.blockedCount++;
    }
  }

  /**
   * Inject scripts into iframe document
   */
  private injectIntoIframe(doc: Document) {
    const scriptlets = [
      { name: 'google-ima3', args: [] },
      { name: 'prevent-fetch', args: ['pagead2.googlesyndication.com'] },
      { name: 'set-constant', args: ['adBlockDetected', 'false'] },
    ];

    scriptlets.forEach(({ name, args }) => {
      try {
        const code = generateScriptletCode(name, args);
        const script = doc.createElement('script');
        script.textContent = code;
        (doc.head || doc.documentElement).appendChild(script);
        console.log(`💉 [Player AdBlock] Injected into iframe: ${name}`);
      } catch (error) {
        console.warn(`⚠️ [Player AdBlock] Failed to inject into iframe:`, error);
      }
    });
  }

  /**
   * Apply cosmetic filters to iframe
   */
  private applyCosmeticFiltersToIframe(doc: Document) {
    const rules = filterEngine.getCosmeticFilters();
    
    rules.forEach(rule => {
      try {
        const elements = doc.querySelectorAll(rule.selector);
        elements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
        
        if (elements.length > 0) {
          console.log(`👁️ [Player AdBlock] Hidden ${elements.length} elements in iframe: ${rule.selector}`);
        }
      } catch {
        console.warn(`⚠️ [Player AdBlock] Invalid selector in iframe: ${rule.selector}`);
      }
    });
  }

  /**
   * Get blocked count
   */
  getBlockedCount(): number {
    return this.blockedCount;
  }

  /**
   * Destroy ad blocker
   */
  destroy() {
    if (this.iframeObserver) {
      this.iframeObserver.disconnect();
      this.iframeObserver = null;
    }
    console.log('🛑 [Player AdBlock] Destroyed');
  }
}

// Export singleton instance
export const playerAdBlocker = PlayerAdBlocker.getInstance();

// Legacy export for compatibility
export class AdBlocker {
  static getInstance() {
    return PlayerAdBlocker.getInstance();
  }
}
