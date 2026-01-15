#!/usr/bin/env python3
"""
Subtitle Delay Fix Script for VidSrc
Fixes 5-second caption delay in VidSrc embedded players
"""

import re
import sys
import os
from pathlib import Path

def fix_subtitle_delay(input_file, output_file, delay_seconds=5):
    """
    Fix subtitle delay by adjusting timestamps in WebVTT files
    
    Args:
        input_file: Path to input VTT file
        output_file: Path to output VTT file
        delay_seconds: Delay to apply (positive to delay subtitles, negative to advance)
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match WebVTT timestamps
        timestamp_pattern = r'(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})'
        
        def adjust_timestamp(match):
            start_h, start_m, start_s, start_ms, end_h, end_m, end_s, end_ms = match.groups()
            
            # Convert to milliseconds
            start_total = int(start_h) * 3600000 + int(start_m) * 60000 + int(start_s) * 1000 + int(start_ms)
            end_total = int(end_h) * 3600000 + int(end_m) * 60000 + int(end_s) * 1000 + int(end_ms)
            
            # Apply delay (positive to delay subtitles)
            start_total += delay_seconds * 1000
            end_total += delay_seconds * 1000
            
            # Ensure timestamps don't go negative
            start_total = max(0, start_total)
            end_total = max(0, end_total)
            
            # Convert back to timestamp format
            start_h = f"{start_total // 3600000:02d}"
            start_m = f"{(start_total % 3600000) // 60000:02d}"
            start_s = f"{(start_total % 60000) // 1000:02d}"
            start_ms = f"{start_total % 1000:03d}"
            
            end_h = f"{end_total // 3600000:02d}"
            end_m = f"{(end_total % 3600000) // 60000:02d}"
            end_s = f"{(end_total % 60000) // 1000:02d}"
            end_ms = f"{end_total % 1000:03d}"
            
            return f"{start_h}:{start_m}:{start_s}.{start_ms} --> {end_h}:{end_m}:{end_s}.{end_ms}"
        
        # Apply timestamp adjustments
        fixed_content = re.sub(timestamp_pattern, adjust_timestamp, content)
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print(f"✅ Fixed subtitle delay: {input_file} -> {output_file} (delay: {delay_seconds}s)")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {input_file}: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python fix-subtitle-delay.py input.vtt output.vtt")
        print("Example: python fix-subtitle-delay.py original.vtt fixed.vtt")
        sys.exit(1)
    
    fix_subtitle_delay(sys.argv[1], sys.argv[2])
