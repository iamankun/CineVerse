/**
 * VidSrc Caption Delay Fix
 * Fixes 5-second caption delay by adjusting subtitle timing in real-time
 */

// Inject this script into the page to fix caption delay
function fixVidSrcCaptionDelay(delaySeconds = 5) {
    console.log(`🔧 Applying ${delaySeconds}s delay to VidSrc captions...`);
    
    // Function to adjust subtitle timing
    function adjustSubtitleTiming() {
        const videoElement = document.querySelector('video');
        if (!videoElement) {
            console.log('⏳ Waiting for video element...');
            setTimeout(adjustSubtitleTiming, 1000);
            return;
        }
        
        // Get all text tracks
        const textTracks = videoElement.textTracks;
        if (textTracks.length === 0) {
            console.log('⏳ Waiting for text tracks...');
            setTimeout(adjustSubtitleTiming, 1000);
            return;
        }
        
        // Find the Vietnamese subtitle track
        let vietnameseTrack = null;
        for (let i = 0; i < textTracks.length; i++) {
            const track = textTracks[i];
            if (track.language === 'vi' || track.label.toLowerCase().includes('vietnamese')) {
                vietnameseTrack = track;
                break;
            }
        }
        
        if (!vietnameseTrack) {
            console.log('❌ Vietnamese subtitle track not found');
            return;
        }
        
        console.log('✅ Found Vietnamese subtitle track, applying delay...');
        
        // Enable the track
        vietnameseTrack.mode = 'showing';
        
        // Store original cues
        const originalCues = [];
        for (let i = 0; i < vietnameseTrack.cues.length; i++) {
            const cue = vietnameseTrack.cues[i];
            originalCues.push({
                startTime: cue.startTime,
                endTime: cue.endTime,
                text: cue.text
            });
        }
        
        // Clear existing cues
        while (vietnameseTrack.cues.length > 0) {
            vietnameseTrack.removeCue(vietnameseTrack.cues[0]);
        }
        
        // Add adjusted cues with delay
        originalCues.forEach(originalCue => {
            const newCue = new VTTCue(
                originalCue.startTime + delaySeconds,
                originalCue.endTime + delaySeconds,
                originalCue.text
            );
            vietnameseTrack.addCue(newCue);
        });
        
        console.log(`✅ Applied ${delaySeconds}s delay to ${originalCues.length} subtitle cues`);
    }
    
    // Start the process
    adjustSubtitleTiming();
}

// Auto-execute for bookmarklet
if (typeof window !== 'undefined') {
    fixVidSrcCaptionDelay();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fixVidSrcCaptionDelay };
}
