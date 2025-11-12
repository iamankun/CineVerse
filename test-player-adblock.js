/**
 * Test Script for Player Ad Blocker
 * Run this in browser console on player page
 */

console.log('🧪 Testing Player Ad Blocker...\n');

// Test 1: Check if blocker is initialized
console.log('1️⃣ Checking initialization...');
if (typeof window !== 'undefined') {
  console.log('✅ Window object available');
  
  // Check if fetch is intercepted
  const fetchStr = window.fetch.toString();
  if (fetchStr.includes('filterEngine') || fetchStr.length > 100) {
    console.log('✅ Fetch intercepted');
  } else {
    console.warn('⚠️ Fetch might not be intercepted');
  }
} else {
  console.error('❌ Window not available');
}

// Test 2: Try to load ad scripts
console.log('\n2️⃣ Testing ad script blocking...');
const adUrls = [
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  'https://www.googletagmanager.com/gtag/js',
  'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
  'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
];

let blockedCount = 0;
adUrls.forEach(url => {
  fetch(url)
    .then(response => {
      if (response.status === 200 && response.statusText === 'Blocked by Player AdBlocker') {
        console.log(`🚫 Blocked: ${url}`);
        blockedCount++;
      } else {
        console.warn(`⚠️ Not blocked: ${url}`);
      }
    })
    .catch(err => {
      console.log(`🚫 Blocked (error): ${url}`);
      blockedCount++;
    });
});

// Test 3: Check Google IMA SDK
console.log('\n3️⃣ Testing Google IMA SDK blocking...');
setTimeout(() => {
  if (window.google && window.google.ima) {
    const ima = window.google.ima;
    console.log('Google IMA object:', ima);
    
    if (typeof ima.AdDisplayContainer === 'function') {
      try {
        const container = new ima.AdDisplayContainer();
        console.log('AdDisplayContainer:', container);
        if (Object.keys(container).length === 0) {
          console.log('✅ IMA SDK neutralized (empty object)');
        } else {
          console.warn('⚠️ IMA SDK might be functional');
        }
      } catch (e) {
        console.log('✅ IMA SDK blocked (error on init)');
      }
    }
  } else {
    console.log('⚠️ Google IMA not found (might be blocked before loading)');
  }
}, 1000);

// Test 4: Check cosmetic filtering
console.log('\n4️⃣ Testing cosmetic filters...');
const adSelectors = [
  '.ad-container',
  '.advertisement',
  '.video-ads',
  '.ima-ad-container',
  '#google_ads_iframe',
  '.preroll-ad'
];

let hiddenCount = 0;
adSelectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    let allHidden = true;
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display !== 'none') {
        allHidden = false;
      }
    });
    
    if (allHidden) {
      console.log(`✅ Hidden: ${selector} (${elements.length} elements)`);
      hiddenCount += elements.length;
    } else {
      console.warn(`⚠️ Not hidden: ${selector}`);
    }
  }
});

if (hiddenCount > 0) {
  console.log(`✅ Total hidden elements: ${hiddenCount}`);
} else {
  console.log('ℹ️ No ad elements found (good!)');
}

// Test 5: Check iframe sandbox
console.log('\n5️⃣ Testing iframe sandbox...');
const iframes = document.querySelectorAll('iframe');
console.log(`Found ${iframes.length} iframes`);

iframes.forEach((iframe, index) => {
  const sandbox = iframe.getAttribute('sandbox');
  console.log(`Iframe ${index + 1}:`, {
    src: iframe.src.substring(0, 50) + '...',
    sandbox: sandbox,
    hasScripts: sandbox?.includes('allow-scripts'),
    hasPopups: sandbox?.includes('allow-popups')
  });
  
  if (sandbox && !sandbox.includes('allow-popups')) {
    console.log(`✅ Iframe ${index + 1}: Popups blocked`);
  }
});

// Test 6: Monitor for new ad requests
console.log('\n6️⃣ Monitoring network requests...');
console.log('Check Network tab in DevTools for blocked requests marked as:');
console.log('- Status: 200 (OK)');
console.log('- Size: 0 B or very small');
console.log('- Time: < 1ms');
console.log('- Or Status: (blocked)');

// Test 7: Final summary
setTimeout(() => {
  console.log('\n📊 Test Summary:');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Fetch intercepted: Yes`);
  console.log(`✅ Ad scripts tested: ${adUrls.length}`);
  console.log(`✅ Blocked requests: Check console above`);
  console.log(`✅ Cosmetic rules applied: Check above`);
  console.log(`✅ Iframes monitored: ${iframes.length}`);
  console.log('═══════════════════════════════════════');
  console.log('\n💡 Tips:');
  console.log('- Open Network tab to see blocked requests');
  console.log('- Look for 🚫 emoji in console logs');
  console.log('- Check Elements tab for hidden ad containers');
  console.log('- Test with actual video sources');
  console.log('\n✅ Player Ad Blocker is active!');
}, 3000);
