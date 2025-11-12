/**
 * Scriptlet Library
 * Based on uBlock Origin scriptlets
 * These run in the page context to prevent ad detection and block ads
 */

import type { ScriptletDefinition } from '@/types/adblock';

export const scriptlets: Record<string, ScriptletDefinition> = {
  'prevent-fetch': {
    name: 'prevent-fetch',
    description: 'Prevents fetch() calls to specified URLs',
    args: [
      { name: 'pattern', description: 'URL pattern to match (string or regex)' },
      { name: 'method', description: 'HTTP method to match (optional)', optional: true }
    ],
    code: `
(function(pattern, method) {
  const safe = window.fetch;
  const rePattern = pattern ? new RegExp(pattern) : null;
  window.fetch = new Proxy(window.fetch, {
    apply: function(target, thisArg, args) {
      const url = args[0];
      const urlStr = typeof url === 'string' ? url : url.url;
      const options = args[1] || {};
      
      if (rePattern && rePattern.test(urlStr)) {
        if (!method || options.method === method) {
          console.log('[CineVerse] Blocked fetch:', urlStr);
          return Promise.resolve(new Response('', { status: 200 }));
        }
      }
      return Reflect.apply(target, thisArg, args);
    }
  });
})(...args);
`
  },

  'prevent-xhr': {
    name: 'prevent-xhr',
    description: 'Prevents XMLHttpRequest to specified URLs',
    args: [
      { name: 'pattern', description: 'URL pattern to match (string or regex)' }
    ],
    code: `
(function(pattern) {
  const rePattern = new RegExp(pattern);
  const xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(...args) {
    const url = args[1];
    if (rePattern.test(url)) {
      console.log('[CineVerse] Blocked XHR:', url);
      args[1] = 'about:blank';
    }
    return xhrOpen.apply(this, args);
  };
})(...args);
`
  },

  'prevent-setTimeout': {
    name: 'prevent-setTimeout',
    description: 'Prevents setTimeout with matching callback content',
    args: [
      { name: 'pattern', description: 'Pattern to match in callback' }
    ],
    code: `
(function(pattern) {
  const rePattern = new RegExp(pattern);
  const nativeSetTimeout = window.setTimeout;
  window.setTimeout = function(callback, delay, ...args) {
    if (typeof callback === 'function') {
      const callbackStr = callback.toString();
      if (rePattern.test(callbackStr)) {
        console.log('[CineVerse] Blocked setTimeout');
        return nativeSetTimeout(() => {}, delay);
      }
    } else if (typeof callback === 'string' && rePattern.test(callback)) {
      console.log('[CineVerse] Blocked setTimeout string');
      return nativeSetTimeout('', delay);
    }
    return nativeSetTimeout(callback, delay, ...args);
  };
})(...args);
`
  },

  'prevent-setInterval': {
    name: 'prevent-setInterval',
    description: 'Prevents setInterval with matching callback content',
    args: [
      { name: 'pattern', description: 'Pattern to match in callback' }
    ],
    code: `
(function(pattern) {
  const rePattern = new RegExp(pattern);
  const nativeSetInterval = window.setInterval;
  window.setInterval = function(callback, delay, ...args) {
    if (typeof callback === 'function') {
      const callbackStr = callback.toString();
      if (rePattern.test(callbackStr)) {
        console.log('[CineVerse] Blocked setInterval');
        return nativeSetInterval(() => {}, delay);
      }
    } else if (typeof callback === 'string' && rePattern.test(callback)) {
      console.log('[CineVerse] Blocked setInterval string');
      return nativeSetInterval('', delay);
    }
    return nativeSetInterval(callback, delay, ...args);
  };
})(...args);
`
  },

  'abort-on-property-read': {
    name: 'abort-on-property-read',
    description: 'Throws error when property is read',
    args: [
      { name: 'property', description: 'Property path (e.g., "Object.prototype.ads")' }
    ],
    code: `
(function(property) {
  const props = property.split('.');
  let obj = window;
  for (let i = 0; i < props.length - 1; i++) {
    obj = obj[props[i]];
    if (!obj) return;
  }
  const prop = props[props.length - 1];
  delete obj[prop];
  Object.defineProperty(obj, prop, {
    get: function() {
      console.log('[CineVerse] Aborted property read:', property);
      throw new ReferenceError(property + ' is not defined');
    }
  });
})(...args);
`
  },

  'set-constant': {
    name: 'set-constant',
    description: 'Sets a property to a constant value',
    args: [
      { name: 'property', description: 'Property path' },
      { name: 'value', description: 'Value to set (noopFunc, trueFunc, falseFunc, true, false, null, undefined, emptyObj, emptyArr, number, string)' }
    ],
    code: `
(function(property, value) {
  const props = property.split('.');
  let obj = window;
  for (let i = 0; i < props.length - 1; i++) {
    obj = obj[props[i]] = obj[props[i]] || {};
  }
  const prop = props[props.length - 1];
  
  let setValue;
  switch(value) {
    case 'noopFunc': setValue = function(){}; break;
    case 'trueFunc': setValue = function(){return true;}; break;
    case 'falseFunc': setValue = function(){return false;}; break;
    case 'true': setValue = true; break;
    case 'false': setValue = false; break;
    case 'null': setValue = null; break;
    case 'undefined': setValue = undefined; break;
    case 'emptyObj': setValue = {}; break;
    case 'emptyArr': setValue = []; break;
    default: 
      // Try to parse as number or use as string
      setValue = isNaN(value) ? value : parseFloat(value);
  }
  
  Object.defineProperty(obj, prop, {
    value: setValue,
    writable: false,
    configurable: false
  });
  console.log('[CineVerse] Set constant:', property, '=', value);
})(...args);
`
  },

  'google-ima3': {
    name: 'google-ima3',
    description: 'Blocks Google IMA3 SDK',
    args: [],
    code: `
(function() {
  window.google = window.google || {};
  window.google.ima = window.google.ima || {};
  
  const noopFunc = function(){};
  const EventTarget = function(){};
  EventTarget.prototype.addEventListener = noopFunc;
  EventTarget.prototype.removeEventListener = noopFunc;
  EventTarget.prototype.dispatchEvent = noopFunc;
  
  const AdsLoader = function(){};
  AdsLoader.prototype = Object.create(EventTarget.prototype);
  AdsLoader.prototype.requestAds = noopFunc;
  AdsLoader.prototype.contentComplete = noopFunc;
  AdsLoader.prototype.destroy = noopFunc;
  
  const AdsManager = function(){};
  AdsManager.prototype = Object.create(EventTarget.prototype);
  AdsManager.prototype.init = noopFunc;
  AdsManager.prototype.start = noopFunc;
  AdsManager.prototype.stop = noopFunc;
  AdsManager.prototype.resize = noopFunc;
  AdsManager.prototype.destroy = noopFunc;
  
  window.google.ima.AdsLoader = AdsLoader;
  window.google.ima.AdsManager = AdsManager;
  window.google.ima.AdDisplayContainer = function(){};
  window.google.ima.AdsRequest = function(){};
  window.google.ima.ViewMode = { NORMAL: 'normal', FULLSCREEN: 'fullscreen' };
  
  console.log('[CineVerse] Google IMA3 blocked');
})();
`
  },

  'remove-node-text': {
    name: 'remove-node-text',
    description: 'Removes text content from nodes matching selector',
    args: [
      { name: 'selector', description: 'CSS selector or node type' },
      { name: 'pattern', description: 'Text pattern to match' }
    ],
    code: `
(function(selector, pattern) {
  const rePattern = new RegExp(pattern);
  const checkNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE && rePattern.test(node.textContent)) {
      node.textContent = '';
      console.log('[CineVerse] Removed text node');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (selector === 'script' && node.tagName === 'SCRIPT' && rePattern.test(node.textContent)) {
        node.remove();
        console.log('[CineVerse] Removed script node');
      }
    }
  };
  
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(checkNode);
    });
  });
  
  document.querySelectorAll(selector).forEach(checkNode);
  observer.observe(document, { childList: true, subtree: true });
})(...args);
`
  },

  'prevent-addEventListener': {
    name: 'prevent-addEventListener',
    description: 'Prevents addEventListener for specific events or patterns',
    args: [
      { name: 'eventType', description: 'Event type to block (e.g., "load", "DOMContentLoaded")' },
      { name: 'pattern', description: 'Pattern to match in handler', optional: true }
    ],
    code: `
(function(eventType, pattern) {
  const rePattern = pattern ? new RegExp(pattern) : null;
  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, handler, ...args) {
    if (type === eventType) {
      if (!rePattern || (typeof handler === 'function' && rePattern.test(handler.toString()))) {
        console.log('[CineVerse] Blocked addEventListener:', type);
        return;
      }
    }
    return nativeAddEventListener.call(this, type, handler, ...args);
  };
})(...args);
`
  },

  'json-prune': {
    name: 'json-prune',
    description: 'Removes properties from JSON responses',
    args: [
      { name: 'properties', description: 'Property paths to remove (comma-separated)' }
    ],
    code: `
(function(properties) {
  const props = properties.split(',').map(p => p.trim());
  const nativeParse = JSON.parse;
  JSON.parse = function(...args) {
    const obj = nativeParse.apply(this, args);
    props.forEach(prop => {
      const path = prop.split('.');
      let target = obj;
      for (let i = 0; i < path.length - 1; i++) {
        if (!target[path[i]]) return;
        target = target[path[i]];
      }
      if (target && path[path.length - 1] in target) {
        delete target[path[path.length - 1]];
        console.log('[CineVerse] Pruned JSON property:', prop);
      }
    });
    return obj;
  };
})(...args);
`
  }
};

export function getScriptlet(name: string): ScriptletDefinition | undefined {
  return scriptlets[name];
}

export function generateScriptletCode(name: string, args: string[]): string {
  const scriptlet = getScriptlet(name);
  if (!scriptlet) {
    throw new Error(`Scriptlet not found: ${name}`);
  }
  
  let code = scriptlet.code.trim();
  
  // Debug log
  console.log(`[Scriptlet] Generating code for: ${name}`, {
    hasArgs: code.includes('...args'),
    argsLength: args.length,
    codeLength: code.length
  });
  
  // Only replace ...args if it exists in the code
  if (code.includes('...args')) {
    // Convert args to JavaScript values
    const argsStr = args.map(arg => JSON.stringify(arg)).join(', ');
    code = code.replace('...args', argsStr);
    console.log(`[Scriptlet] Replaced ...args with: ${argsStr}`);
  }
  
  // Validate result
  if (!code || typeof code !== 'string') {
    throw new Error(`Invalid code generated for scriptlet: ${name}`);
  }
  
  return code;
}
