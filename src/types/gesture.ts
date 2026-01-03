/**
 * Gesture Control Types
 * Types for hand gesture recognition feature
 */

export type GestureAction = 
  | 'play'
  | 'pause'
  | 'togglePlay'
  | 'volumeUp'
  | 'volumeDown'
  | 'mute'
  | 'unmute'
  | 'forward'
  | 'rewind'
  | 'toggleFullscreen'
  | 'favorite'
  | 'like'
  | 'nextEpisode'
  | 'prevEpisode'
  | 'scrollLeft'
  | 'scrollRight'
  | 'none';

export type GestureName = 
  | 'None'
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou'
  | 'Swipe_Left'
  | 'Swipe_Right';

export interface GestureMapping {
  enabled: boolean;
  action: GestureAction;
  description: string;
}

export interface GestureConfig {
  enabled: boolean;
  showDebugOverlay: boolean;
  confidenceThreshold: number;
  gestureDelay: number;
  gestures: Record<string, GestureMapping>;
  descriptions: Record<string, string>;
}

export interface GestureResult {
  gesture: GestureName;
  confidence: number;
  handedness: 'Left' | 'Right';
  landmarks: Array<{ x: number; y: number; z: number }>;
}

export interface GestureCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onTogglePlay?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onUnmute?: () => void;
  onForward?: () => void;
  onRewind?: () => void;
  onToggleFullscreen?: () => void;
  onFavorite?: () => void;
  onLike?: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  onGestureDetected?: (result: GestureResult) => void;
}
