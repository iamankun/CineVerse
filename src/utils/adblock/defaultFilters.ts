/**
 * Default Ad Blocking Filters
 * Pre-configured filters based on common ad patterns
 */

export const defaultFilters = {
  networkRules: [
    // Google Ads
    {
      id: 'network-google-ads',
      type: 'network',
      action: 'block',
      pattern: 'pagead2.googlesyndication.com',
      isRegex: false,
      urlPattern: 'pagead2.googlesyndication.com',
      priority: 'high',
      enabled: true,
      description: 'Block Google AdSense',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'network-doubleclick',
      type: 'network',
      action: 'block',
      pattern: 'doubleclick.net',
      isRegex: false,
      urlPattern: 'doubleclick.net',
      priority: 'high',
      enabled: true,
      description: 'Block DoubleClick',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'network-google-ima',
      type: 'network',
      action: 'block',
      pattern: 'imasdk.googleapis.com',
      isRegex: false,
      urlPattern: 'imasdk.googleapis.com',
      priority: 'critical',
      enabled: true,
      description: 'Block Google IMA SDK (video ads)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'network-securepubads',
      type: 'network',
      action: 'block',
      pattern: 'securepubads.g.doubleclick.net',
      isRegex: false,
      urlPattern: 'securepubads.g.doubleclick.net',
      priority: 'critical',
      enabled: true,
      description: 'Block DoubleClick secure ads',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Pop ads networks
    {
      id: 'network-popads',
      type: 'network',
      action: 'block',
      pattern: 'popads.net',
      isRegex: false,
      urlPattern: 'popads.net',
      priority: 'critical',
      enabled: true,
      description: 'Block PopAds',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'network-popcash',
      type: 'network',
      action: 'block',
      pattern: 'popcash.net',
      isRegex: false,
      urlPattern: 'popcash.net',
      priority: 'critical',
      enabled: true,
      description: 'Block PopCash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'network-propeller-ads',
      type: 'network',
      action: 'block',
      pattern: 'propellerads.com',
      isRegex: false,
      urlPattern: 'propellerads.com',
      priority: 'critical',
      enabled: true,
      description: 'Block PropellerAds',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // VAST/VPAID video ad servers
    {
      id: 'network-vast-ads',
      type: 'network',
      action: 'block',
      pattern: '/vast|vpaid|preroll|midroll/i',
      isRegex: true,
      urlPattern: '/vast|vpaid|preroll|midroll/i',
      priority: 'critical',
      enabled: true,
      description: 'Block VAST/VPAID video ads',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'network-video-ads',
      type: 'network',
      action: 'block',
      pattern: 'adservice.google.com',
      isRegex: false,
      urlPattern: 'adservice.google.com',
      priority: 'critical',
      enabled: true,
      description: 'Block Google ad service',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Analytics that track ads
    {
      id: 'network-google-analytics',
      type: 'network',
      action: 'block',
      pattern: 'google-analytics.com',
      isRegex: false,
      urlPattern: 'google-analytics.com',
      priority: 'medium',
      enabled: true,
      description: 'Block Google Analytics',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'network-google-tag-manager',
      type: 'network',
      action: 'block',
      pattern: 'googletagmanager.com',
      isRegex: false,
      urlPattern: 'googletagmanager.com',
      priority: 'medium',
      enabled: true,
      description: 'Block Google Tag Manager',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  cosmeticRules: [
    // Generic ad containers
    {
      id: 'cosmetic-ad-container',
      type: 'cosmetic',
      action: 'block',
      pattern: '.ad-container',
      isRegex: false,
      selector: '.ad-container',
      priority: 'medium',
      enabled: true,
      description: 'Hide .ad-container elements',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cosmetic-advertisement',
      type: 'cosmetic',
      action: 'block',
      pattern: '.advertisement',
      isRegex: false,
      selector: '.advertisement',
      priority: 'medium',
      enabled: true,
      description: 'Hide .advertisement elements',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Video player ad overlays
    {
      id: 'cosmetic-video-ad-overlay',
      type: 'cosmetic',
      action: 'block',
      pattern: '.video-ads',
      isRegex: false,
      selector: '.video-ads, .video-ad, .player-ads, .player-ad',
      priority: 'high',
      enabled: true,
      description: 'Hide video ad overlays',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cosmetic-ima-container',
      type: 'cosmetic',
      action: 'block',
      pattern: '.ima-ad-container',
      isRegex: false,
      selector: '.ima-ad-container, #ima-ad-container, [id*="google_ads_iframe"]',
      priority: 'critical',
      enabled: true,
      description: 'Hide Google IMA ad containers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cosmetic-preroll-overlay',
      type: 'cosmetic',
      action: 'block',
      pattern: '.preroll',
      isRegex: false,
      selector: '.preroll, .preroll-ad, .ad-overlay, .overlay-ad',
      priority: 'high',
      enabled: true,
      description: 'Hide preroll ad overlays',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Skip buttons and countdowns
    {
      id: 'cosmetic-ad-countdown',
      type: 'cosmetic',
      action: 'block',
      pattern: '.ad-countdown',
      isRegex: false,
      selector: '.ad-countdown, .ad-timer, [class*="countdown"]',
      priority: 'medium',
      enabled: true,
      description: 'Hide ad countdown timers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  scriptletRules: [
    // Block Google IMA SDK
    {
      id: 'scriptlet-google-ima3',
      type: 'scriptlet',
      action: 'block',
      pattern: 'google-ima3',
      isRegex: false,
      scriptletName: 'google-ima3',
      args: [],
      priority: 'critical',
      enabled: true,
      description: 'Block Google IMA3 SDK (video ads)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Prevent fetch to ad domains
    {
      id: 'scriptlet-prevent-google-ads-fetch',
      type: 'scriptlet',
      action: 'block',
      pattern: 'prevent-fetch',
      isRegex: false,
      scriptletName: 'prevent-fetch',
      args: ['pagead2.googlesyndication.com|doubleclick.net|imasdk.googleapis.com|adservice.google.com'],
      priority: 'critical',
      enabled: true,
      description: 'Prevent fetch to ad domains',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Prevent XHR to ad domains
    {
      id: 'scriptlet-prevent-xhr',
      type: 'scriptlet',
      action: 'block',
      pattern: 'prevent-xhr',
      isRegex: false,
      scriptletName: 'prevent-xhr',
      args: ['popads|popcash|propellerads|exoclick'],
      priority: 'high',
      enabled: true,
      description: 'Prevent XHR to popup ad networks',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Disable adblock detection
    {
      id: 'scriptlet-disable-adblock-detection',
      type: 'scriptlet',
      action: 'block',
      pattern: 'set-constant',
      isRegex: false,
      scriptletName: 'set-constant',
      args: ['adBlockDetected', 'false'],
      priority: 'high',
      enabled: true,
      description: 'Disable adblock detection',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Enable ads flag
    {
      id: 'scriptlet-enable-ads-flag',
      type: 'scriptlet',
      action: 'block',
      pattern: 'set-constant',
      isRegex: false,
      scriptletName: 'set-constant',
      args: ['canRunAds', 'true'],
      priority: 'high',
      enabled: true,
      description: 'Set canRunAds to true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Prevent ad-related setTimeout
    {
      id: 'scriptlet-prevent-ad-timeout',
      type: 'scriptlet',
      action: 'block',
      pattern: 'prevent-setTimeout',
      isRegex: false,
      scriptletName: 'prevent-setTimeout',
      args: ['adblock|advertisement|banner'],
      priority: 'medium',
      enabled: true,
      description: 'Prevent ad-related timeouts',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Remove ad nodes
    {
      id: 'scriptlet-remove-ad-nodes',
      type: 'scriptlet',
      action: 'block',
      pattern: 'remove-node-text',
      isRegex: false,
      scriptletName: 'remove-node-text',
      args: ['script', 'googlesyndication|doubleclick|adservice'],
      priority: 'high',
      enabled: true,
      description: 'Remove ad script nodes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};
