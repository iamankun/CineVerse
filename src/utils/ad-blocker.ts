/**
 * CineVerse Ad Blocker Utility
 * Blocks ads, popups, and tracking from third-party player embeds
 */

export class AdBlocker {
  private static instance: AdBlocker;
  private observer: MutationObserver | null = null;
  private blockedDomains: string[] = [
    'doubleclick.net',
    'googlesyndication.com',
    'googletagservices.com',
    'google-analytics.com',
    'googleadservices.com',
    'facebook.net',
    'taboola.com',
    'outbrain.com',
    'mgid.com',
    'propellerads.com',
    'popads.net',
    'popcash.net',
    'adnow.com',
    'revcontent.com',
    'ads-twitter.com',
  ];

  private constructor() {}

  static getInstance(): AdBlocker {
    if (!AdBlocker.instance) {
      AdBlocker.instance = new AdBlocker();
    }
    return AdBlocker.instance;
  }

  /**
   * Initialize ad blocker with all protections
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Block ad scripts
    this.blockAdScripts();
    
    // Block ad elements
    this.blockAdElements();
    
    // Prevent popups and redirects
    this.preventPopups();
    
    // Watch for new ad elements
    this.startObserver();
    
    // Block tracking
    this.blockTracking();

    console.log('🛡️ CineVerse Ad Blocker activated');
  }

  /**
   * Block ad scripts from loading
   */
  private blockAdScripts(): void {
    const originalAppendChild = Node.prototype.appendChild;
    const originalInsertBefore = Node.prototype.insertBefore;

    Node.prototype.appendChild = function<T extends Node>(node: T): T {
      if (AdBlocker.getInstance().isAdScript(node)) {
        console.log('🚫 Blocked ad script:', node);
        return node;
      }
      return originalAppendChild.call(this, node) as T;
    };

    Node.prototype.insertBefore = function<T extends Node>(node: T, child: Node | null): T {
      if (AdBlocker.getInstance().isAdScript(node)) {
        console.log('🚫 Blocked ad script:', node);
        return node;
      }
      return originalInsertBefore.call(this, node, child) as T;
    };
  }

  /**
   * Check if element is an ad script
   */
  private isAdScript(node: Node): boolean {
    if (node.nodeName !== 'SCRIPT') return false;
    
    const script = node as HTMLScriptElement;
    const src = script.src?.toLowerCase() || '';
    
    return this.blockedDomains.some(domain => src.includes(domain));
  }

  /**
   * Remove ad elements from DOM
   */
  private blockAdElements(): void {
    const adSelectors = [
      '[class*="ad-"]',
      '[id*="ad-"]',
      '[class*="advertisement"]',
      '[id*="advertisement"]',
      'iframe[src*="ads"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="googlesyndication"]',
      '.ad-container',
      '.ads-container',
      '#ad-banner',
      '.ad-banner',
    ];

    adSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (this.isLikelyAd(el as HTMLElement)) {
          (el as HTMLElement).remove();
        }
      });
    });
  }

  /**
   * Check if element is likely an ad
   */
  private isLikelyAd(element: HTMLElement): boolean {
    const className = element.className?.toString().toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    
    // Don't block if it's part of player controls
    if (className.includes('player') || id.includes('player')) {
      return false;
    }

    return (
      className.includes('ad-') ||
      className.includes('advertisement') ||
      id.includes('ad-') ||
      id.includes('advertisement')
    );
  }

  /**
   * Prevent popups and unwanted redirects
   */
  private preventPopups(): void {
    // Override window.open
    const originalOpen = window.open;
    window.open = function(...args): Window | null {
      console.log('🚫 Blocked popup:', args[0]);
      return null;
    };

    // Block onclick redirects
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const href = target.getAttribute?.('href');
      
      if (href && (
        href.includes('redirect') ||
        href.includes('click') ||
        href.includes('ad')
      )) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 Blocked redirect:', href);
      }
    }, true);

    // Prevent beforeunload popups
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
    });
  }

  /**
   * Start mutation observer to block dynamically loaded ads
   */
  private startObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;
            
            // Check if it's an ad iframe
            if (element.tagName === 'IFRAME') {
              const src = element.getAttribute('src') || '';
              if (this.blockedDomains.some(domain => src.includes(domain))) {
                element.remove();
                console.log('🚫 Blocked ad iframe:', src);
              }
            }

            // Check for ad elements
            if (this.isLikelyAd(element)) {
              element.remove();
              console.log('🚫 Blocked dynamic ad');
            }
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Block tracking scripts and pixels
   */
  private blockTracking(): void {
    // Block tracking images (1x1 pixels)
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('img[width="1"][height="1"]').forEach(el => {
        el.remove();
      });
    });

    // Override analytics functions
    (window as any).gtag = () => {};
    (window as any).ga = () => {};
    (window as any)._gaq = { push: () => {} };
    (window as any).fbq = () => {};
  }

  /**
   * Stop observer and cleanup
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  AdBlocker.getInstance().init();
}

export default AdBlocker;
