# VidSrc Caption Delay Fix - Quick Solutions

## 🎯 Problem: Caption runs 5 seconds fast

VidSrc Vietnamese subtitles appear 5 seconds earlier than the video content.

## 🛠️ Quick Solutions

### Solution 1: Browser Bookmarklet (Easiest)
Create a bookmark with this URL:
```
javascript:(function(){var script=document.createElement('script');script.src='https://raw.githubusercontent.com/cineverse/cineverse/main/scripts/vidsrc-caption-fix.js';document.head.appendChild(script);})();
```

**Usage:** Click the bookmark when watching a video with fast captions.

### Solution 2: Manual Script Injection
1. Press `F12` to open Developer Tools
2. Go to Console tab
3. Paste and run:
```javascript
// Load and execute the caption fix script
fetch('https://raw.githubusercontent.com/cineverse/cineverse/main/scripts/vidsrc-caption-fix.js')
  .then(response => response.text())
  .then(code => eval(code));
```

### Solution 3: Use Fixed Caption Option
Select "VidSrc (Fixed Caption)" from the player options (if available).

### Solution 4: Local Testing
1. Download the script: `vidsrc-caption-fix.js`
2. Open Developer Tools Console
3. Paste the entire script content and press Enter

## 🔧 Technical Details

The script works by:
1. Finding the video element and Vietnamese subtitle track
2. Extracting all subtitle cues
3. Adding 4 seconds delay to each cue timestamp
4. Replacing the original cues with adjusted ones

## 📝 Notes

- The fix applies only to the current video session
- Refreshing the page will require re-running the script
- Works with most VidSrc embedded players
- Automatically detects Vietnamese subtitle tracks

## 🚀 For Developers

To integrate this into your application:
```javascript
import { fixVidSrcCaptionDelay } from './vidsrc-caption-fix.js';

// Apply fix when video loads
fixVidSrcCaptionDelay(4); // 4 seconds delay
```
