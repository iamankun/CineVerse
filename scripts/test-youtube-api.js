// Test YouTube API Loading
// Paste this in browser console to test if YouTube API can load

console.log('=== YouTube API Test ===');

// 1. Check if API already loaded
if (window.YT && window.YT.Player) {
  console.log('✅ YouTube API already loaded');
} else {
  console.log('❌ YouTube API not loaded');
}

// 2. Check if script tag exists
const scriptExists = document.querySelector('script[src*="youtube.com/iframe_api"]');
if (scriptExists) {
  console.log('✅ YouTube API script tag exists');
} else {
  console.log('❌ YouTube API script tag not found');
}

// 3. Try to load API
if (!scriptExists) {
  console.log('🔄 Loading YouTube API...');
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  tag.onload = () => console.log('✅ Script loaded successfully');
  tag.onerror = (err) => console.error('❌ Script failed to load:', err);
  document.head.appendChild(tag);
  
  window.onYouTubeIframeAPIReady = () => {
    console.log('✅ YouTube API ready!');
    console.log('window.YT:', window.YT);
    console.log('window.YT.Player:', window.YT.Player);
  };
  
  // Timeout check
  setTimeout(() => {
    if (window.YT && window.YT.Player) {
      console.log('✅ API loaded successfully within 5 seconds');
    } else {
      console.error('❌ API failed to load within 5 seconds');
      console.log('Check:');
      console.log('- Internet connection');
      console.log('- Firewall/proxy settings');
      console.log('- Ad blocker');
      console.log('- Browser console for network errors');
    }
  }, 5000);
} else {
  console.log('Script already exists, checking API status...');
  setTimeout(() => {
    if (window.YT && window.YT.Player) {
      console.log('✅ API is ready');
    } else {
      console.log('⚠️ Script exists but API not ready - may still be loading');
    }
  }, 1000);
}

// 4. Network test
console.log('Testing network access to YouTube...');
fetch('https://www.youtube.com/iframe_api', { method: 'HEAD' })
  .then(() => console.log('✅ Can reach YouTube API endpoint'))
  .catch(err => console.error('❌ Cannot reach YouTube API:', err));
