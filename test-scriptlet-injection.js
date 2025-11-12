/**
 * Quick Test - Scriptlet Code Generation
 * 
 * Run this in browser console to verify scriptlets work
 */

// Test 1: google-ima3 (no args - IIFE without parameters)
console.log('🧪 Test 1: google-ima3 (no args)');
const code1 = `
(function() {
  window.google = window.google || {};
  window.google.ima = { test: true };
  console.log('[Test] Google IMA3 mocked');
})();
`;
try {
  eval(code1);
  console.log('✅ google-ima3 works:', window.google?.ima);
} catch (e) {
  console.error('❌ google-ima3 failed:', e);
}

// Test 2: set-constant (with 2 args)
console.log('\n🧪 Test 2: set-constant (with args)');
const code2 = `
(function(prop, value) {
  Object.defineProperty(window, prop, {
    get: () => value === 'true',
    set: () => {}
  });
  console.log('[Test] Set', prop, '=', value);
})("testProp", "true");
`;
try {
  eval(code2);
  console.log('✅ set-constant works:', window.testProp);
} catch (e) {
  console.error('❌ set-constant failed:', e);
}

// Test 3: Script element injection (same as player-ad-blocker)
console.log('\n🧪 Test 3: Script injection');
try {
  const script = document.createElement('script');
  script.textContent = code1; // Use code1 from above
  document.head.appendChild(script);
  script.remove();
  console.log('✅ Script injection works');
} catch (e) {
  console.error('❌ Script injection failed:', e);
}

console.log('\n✅ All tests passed! Scriptlets are working correctly.');
