'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureCallbacks, GestureConfig, GestureName, GestureResult, GestureAction } from '@/types/gesture';

// Import gesture config
import gestureConfigData from '@/app/admin/gesture-config.json';

interface UseGestureControlOptions {
  enabled?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | HTMLIFrameElement | null>;
  callbacks?: GestureCallbacks;
}

interface GestureControlState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  currentGesture: GestureName;
  confidence: number;
  handDetected: boolean;
  cameraActive: boolean;
}

// Finger indices for hand landmarks (21 points)
const FINGER_TIPS = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
const FINGER_PIPS = [3, 6, 10, 14, 18]; // Proximal interphalangeal joints

// Hand position history for swipe detection
interface HandPositionHistory {
  x: number;
  timestamp: number;
}

const handPositionHistory: HandPositionHistory[] = [];
const SWIPE_THRESHOLD = 0.15; // Minimum horizontal movement (15% of screen width)
const SWIPE_TIME_WINDOW = 500; // Time window for swipe detection (ms)

/**
 * Detect swipe gesture based on hand movement
 */
function detectSwipe(currentX: number): GestureName | null {
  const now = Date.now();
  
  // Add current position
  handPositionHistory.push({ x: currentX, timestamp: now });
  
  // Remove old positions outside time window
  while (handPositionHistory.length > 0 && now - handPositionHistory[0].timestamp > SWIPE_TIME_WINDOW) {
    handPositionHistory.shift();
  }
  
  // Need at least 2 positions to detect swipe
  if (handPositionHistory.length < 2) return null;
  
  const firstPos = handPositionHistory[0];
  const lastPos = handPositionHistory[handPositionHistory.length - 1];
  const deltaX = lastPos.x - firstPos.x;
  const deltaTime = lastPos.timestamp - firstPos.timestamp;
  
  // Check if movement is significant enough and fast enough
  if (Math.abs(deltaX) > SWIPE_THRESHOLD && deltaTime < SWIPE_TIME_WINDOW) {
    // Clear history after detecting swipe
    handPositionHistory.length = 0;
    
    if (deltaX > 0) {
      return 'Swipe_Right';
    } else {
      return 'Swipe_Left';
    }
  }
  
  return null;
}

/**
 * Recognize gesture from hand landmarks using finger position analysis
 */
function recognizeGesture(landmarks: Array<{ x: number; y: number; z: number }>): { gesture: GestureName; confidence: number } {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'None', confidence: 0 };
  }

  // First check for swipe gesture based on hand movement
  const wrist = landmarks[0]; // Wrist is landmark 0
  const swipeGesture = detectSwipe(wrist.x);
  if (swipeGesture) {
    return { gesture: swipeGesture, confidence: 0.9 };
  }

  // Check which fingers are extended
  const fingersExtended = [false, false, false, false, false];
  
  // Thumb (special case - check horizontal distance)
  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  const isRightHand = landmarks[5].x < landmarks[17].x;
  
  if (isRightHand) {
    fingersExtended[0] = thumbTip.x < thumbMcp.x;
  } else {
    fingersExtended[0] = thumbTip.x > thumbMcp.x;
  }

  // Other fingers - check if tip is above PIP joint (lower y = higher position)
  for (let i = 1; i < 5; i++) {
    const tipY = landmarks[FINGER_TIPS[i]].y;
    const pipY = landmarks[FINGER_PIPS[i]].y;
    fingersExtended[i] = tipY < pipY;
  }

  const extendedCount = fingersExtended.filter(Boolean).length;

  // Open Palm: All 5 fingers extended
  if (extendedCount === 5) {
    return { gesture: 'Open_Palm', confidence: 0.9 };
  }

  // Closed Fist: No fingers extended
  if (extendedCount === 0) {
    return { gesture: 'Closed_Fist', confidence: 0.9 };
  }

  // Thumb Up: Only thumb extended, hand vertical
  if (fingersExtended[0] && extendedCount === 1) {
    const thumbTipY = landmarks[4].y;
    const indexMcpY = landmarks[5].y;
    if (thumbTipY < indexMcpY) {
      return { gesture: 'Thumb_Up', confidence: 0.85 };
    }
  }

  // Thumb Down: Only thumb extended, pointing down
  if (fingersExtended[0] && extendedCount === 1) {
    const thumbTipY = landmarks[4].y;
    const indexMcpY = landmarks[5].y;
    if (thumbTipY > indexMcpY) {
      return { gesture: 'Thumb_Down', confidence: 0.85 };
    }
  }

  // Victory (Peace sign): Index and Middle extended
  if (fingersExtended[1] && fingersExtended[2] && !fingersExtended[3] && !fingersExtended[4]) {
    return { gesture: 'Victory', confidence: 0.85 };
  }

  // Pointing Up: Only Index finger extended
  if (fingersExtended[1] && extendedCount === 1) {
    return { gesture: 'Pointing_Up', confidence: 0.85 };
  }

  // ILoveYou: Thumb, Index, and Pinky extended
  if (fingersExtended[0] && fingersExtended[1] && !fingersExtended[2] && !fingersExtended[3] && fingersExtended[4]) {
    return { gesture: 'ILoveYou', confidence: 0.85 };
  }

  return { gesture: 'None', confidence: 0 };
}

/**
 * Hook để điều khiển video bằng cử chỉ tay sử dụng TensorFlow.js
 */
export const useGestureControl = (options: UseGestureControlOptions = {}) => {
  const { enabled = true, callbacks } = options;
  
  const [config, setConfig] = useState<GestureConfig>(gestureConfigData as GestureConfig);
  const [state, setState] = useState<GestureControlState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    currentGesture: 'None',
    confidence: 0,
    handDetected: false,
    cameraActive: false,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Load config from API
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/gesture-config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load gesture config:', err);
    }
  }, []);

  // Execute action based on gesture
  const executeAction = useCallback((action: GestureAction) => {
    if (!callbacks) return;

    switch (action) {
      case 'play':
        callbacks.onPlay?.();
        break;
      case 'pause':
        callbacks.onPause?.();
        break;
      case 'togglePlay':
        callbacks.onTogglePlay?.();
        break;
      case 'volumeUp':
        callbacks.onVolumeUp?.();
        break;
      case 'volumeDown':
        callbacks.onVolumeDown?.();
        break;
      case 'mute':
        callbacks.onMute?.();
        break;
      case 'unmute':
        callbacks.onUnmute?.();
        break;
      case 'forward':
        callbacks.onForward?.();
        break;
      case 'rewind':
        callbacks.onRewind?.();
        break;
      case 'toggleFullscreen':
        callbacks.onToggleFullscreen?.();
        break;
      case 'favorite':
        callbacks.onFavorite?.();
        break;
      case 'like':
        callbacks.onLike?.();
        break;
      case 'nextEpisode':
        callbacks.onNextEpisode?.();
        break;
      case 'prevEpisode':
        callbacks.onPrevEpisode?.();
        break;
      case 'scrollLeft':
        callbacks.onScrollLeft?.();
        break;
      case 'scrollRight':
        callbacks.onScrollRight?.();
        break;
    }
  }, [callbacks]);

  // Process gesture result
  const processGesture = useCallback((gestureName: GestureName, confidence: number, handedness: 'Left' | 'Right', landmarks: any[]) => {
    const now = Date.now();
    
    // Check if enough time has passed since last gesture
    if (now - lastGestureTimeRef.current < config.gestureDelay) {
      return;
    }

    // Check confidence threshold
    if (confidence < config.confidenceThreshold) {
      return;
    }

    // Check if gesture is enabled
    const gestureConfig = config.gestures[gestureName];
    if (!gestureConfig?.enabled) {
      return;
    }

    lastGestureTimeRef.current = now;

    const result: GestureResult = {
      gesture: gestureName,
      confidence,
      handedness,
      landmarks: landmarks.map((l: any) => ({ x: l.x, y: l.y, z: l.z || 0 })),
    };

    setState(prev => ({
      ...prev,
      currentGesture: gestureName,
      confidence,
      handDetected: true,
    }));

    callbacks?.onGestureDetected?.(result);
    executeAction(gestureConfig.action);
  }, [config, callbacks, executeAction]);

  // Initialize TensorFlow.js Hand Pose Detection
  const initialize = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!enabled || !config.enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Dynamically import TensorFlow.js
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();

      const handpose = await import('@tensorflow-models/handpose');
      
      const model = await handpose.load();

      detectorRef.current = model;
      videoRef.current = video;
      canvasRef.current = canvas;

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
      }));

      console.log('✅ Gesture Control ready');
    } catch (err: any) {
      console.error('❌ Failed to initialize:', err);
      const errorMessage = err?.message || 'Không thể khởi tạo nhận diện cử chỉ. Vui lòng thử lại.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [enabled, config.enabled]);

  // Start camera
  const startCamera = useCallback(async () => {
    console.log('📹 startCamera called, videoRef:', !!videoRef.current);
    if (!videoRef.current) return;

    try {
      console.log('🎥 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      console.log('✅ Camera access granted');
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      console.log('▶️ Video playing');

      setState(prev => ({ ...prev, cameraActive: true }));
    } catch (err) {
      console.error('❌ Camera access denied:', err);
      setState(prev => ({
        ...prev,
        error: 'Không thể truy cập camera. Vui lòng cấp quyền camera.',
      }));
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setState(prev => ({ ...prev, cameraActive: false, handDetected: false }));
  }, []);

  // Detection loop
  const detectGestures = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || !state.cameraActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      try {
        const predictions = await detectorRef.current.estimateHands(video);

        // Draw hand landmarks on canvas
        if (canvas && config.showDebugOverlay) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Mirror the canvas horizontally
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            
            if (predictions && predictions.length > 0) {
              for (const prediction of predictions) {
                const landmarks = prediction.landmarks;
                
                // Draw connections
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 2;
                
                // Finger connections
                const connections = [
                  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                  [0, 5], [5, 6], [6, 7], [7, 8], // Index
                  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
                  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                  [5, 9], [9, 13], [13, 17], // Palm
                ];
                
                for (const [start, end] of connections) {
                  const startPoint = landmarks[start];
                  const endPoint = landmarks[end];
                  ctx.beginPath();
                  ctx.moveTo(startPoint[0], startPoint[1]);
                  ctx.lineTo(endPoint[0], endPoint[1]);
                  ctx.stroke();
                }
                
                // Draw points
                for (const point of landmarks) {
                  ctx.beginPath();
                  ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
                  ctx.fillStyle = '#FF0000';
                  ctx.fill();
                }
              }
            }
            
            ctx.restore();
          }
        }

        // Process gestures
        if (predictions && predictions.length > 0) {
          const prediction = predictions[0];
          const landmarks = prediction.landmarks;
          
          // Normalize landmarks to 0-1 range
          const normalizedLandmarks = landmarks.map((point: number[]) => ({
            x: point[0] / video.videoWidth,
            y: point[1] / video.videoHeight,
            z: point[2] / video.videoWidth,
          }));

          const { gesture, confidence } = recognizeGesture(normalizedLandmarks);
          
          if (gesture !== 'None') {
            processGesture(
              gesture,
              confidence,
              'Right',
              normalizedLandmarks
            );
          } else {
            // Only update state if it changed
            if (state.currentGesture !== 'None' || !state.handDetected) {
              setState(prev => ({
                ...prev,
                currentGesture: 'None',
                confidence: 0,
                handDetected: true,
              }));
            }
          }
        } else {
          // Only update state if it changed
          if (state.handDetected) {
            setState(prev => ({
              ...prev,
              currentGesture: 'None',
              confidence: 0,
              handDetected: false,
            }));
          }
        }
      } catch (err) {
        // Silent error - only log once
        if (!detectorRef.current.errorLogged) {
          console.error('Detection error:', err);
          detectorRef.current.errorLogged = true;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectGestures);
  }, [state.cameraActive, state.handDetected, state.currentGesture, config.showDebugOverlay, processGesture]);

  // Start detection
  const startDetection = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    console.log('🚀 startDetection called');
    await initialize(video, canvas);
    console.log('✅ Initialize complete, starting camera...');
    await startCamera();
    console.log('✅ Camera started');
  }, [initialize, startCamera]);

  // Stop detection
  const stopDetection = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  // Start detection loop when camera is active
  useEffect(() => {
    if (state.isInitialized && state.cameraActive) {
      detectGestures();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isInitialized, state.cameraActive, detectGestures]);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      if (detectorRef.current) {
        detectorRef.current.dispose?.();
      }
    };
  }, [stopDetection]);

  return {
    ...state,
    config,
    startDetection,
    stopDetection,
    startCamera,
    stopCamera,
    loadConfig,
    setConfig,
  };
};

export default useGestureControl;
