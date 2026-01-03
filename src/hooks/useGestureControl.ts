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

/**
 * Hook để điều khiển video bằng cử chỉ tay sử dụng MediaPipe
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
  const gestureRecognizerRef = useRef<any>(null);
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
      landmarks: landmarks.map((l: any) => ({ x: l.x, y: l.y, z: l.z })),
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

  // Initialize MediaPipe
  const initialize = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!enabled || !config.enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Dynamically import MediaPipe
      const { GestureRecognizer, FilesetResolver } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      gestureRecognizerRef.current = gestureRecognizer;
      videoRef.current = video;
      canvasRef.current = canvas;

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
      }));

      console.log('✅ Gesture Recognizer initialized successfully');
    } catch (err) {
      console.error('❌ Failed to initialize Gesture Recognizer:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to initialize gesture recognition',
      }));
    }
  }, [enabled, config.enabled]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setState(prev => ({ ...prev, cameraActive: true }));
      console.log('📷 Camera started');
    } catch (err) {
      console.error('❌ Failed to start camera:', err);
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
    console.log('📷 Camera stopped');
  }, []);

  // Detection loop
  const detectGestures = useCallback(() => {
    if (!gestureRecognizerRef.current || !videoRef.current || !state.cameraActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const results = gestureRecognizerRef.current.recognizeForVideo(video, performance.now());

      // Draw hand landmarks on canvas
      if (canvas && config.showDebugOverlay) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Mirror the canvas horizontally
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
          
          if (results.landmarks && results.landmarks.length > 0) {
            for (const landmarks of results.landmarks) {
              // Draw connections
              ctx.strokeStyle = '#00FF00';
              ctx.lineWidth = 2;
              
              // Draw points
              for (const landmark of landmarks) {
                ctx.beginPath();
                ctx.arc(
                  landmark.x * canvas.width,
                  landmark.y * canvas.height,
                  5,
                  0,
                  2 * Math.PI
                );
                ctx.fillStyle = '#FF0000';
                ctx.fill();
              }
            }
          }
          
          ctx.restore();
        }
      }

      // Process gestures
      if (results.gestures && results.gestures.length > 0) {
        const gesture = results.gestures[0][0];
        const handedness = results.handednesses[0][0];
        const landmarks = results.landmarks[0];

        processGesture(
          gesture.categoryName as GestureName,
          gesture.score,
          handedness.categoryName as 'Left' | 'Right',
          landmarks
        );
      } else {
        setState(prev => ({
          ...prev,
          currentGesture: 'None',
          confidence: 0,
          handDetected: false,
        }));
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectGestures);
  }, [state.cameraActive, config.showDebugOverlay, processGesture]);

  // Start detection
  const startDetection = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    await initialize(video, canvas);
    await startCamera();
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
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
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
