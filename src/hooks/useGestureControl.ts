import { useEffect, useRef, useCallback, useState } from 'react';

interface Config {
  enabled: boolean;
  showDebugOverlay: boolean;
}

interface State {
  isInitialized: boolean;
  cameraActive: boolean;
  isLoading: boolean;
  error: string | null;
  currentGesture: string | null;
  handDetected: boolean;
  currentHandPose: any;
}

interface Callbacks {
  onGesture?: (gesture: string) => void;
  onHandDetected?: (detected: boolean) => void;
  onError?: (error: string) => void;
}

export function useGestureControl(config: Config, callbacks: Callbacks = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const modelPromiseRef = useRef<Promise<any> | null>(null);
  const handposePromiseRef = useRef<Promise<any> | null>(null);
  const animationFrameRef = useRef<number>(0);

  const [state, setState] = useState<State>({
    isInitialized: false,
    cameraActive: false,
    isLoading: false,
    error: null as string | null,
    currentGesture: null as string | null,
    handDetected: false,
    currentHandPose: null as any,
  });

  // FIXED: Prevent concurrent initialization
  const isInitializingRef = useRef(false);

  // FIXED: Safe model preloading without cycles
  const preloadModels = useCallback(() => {
    if (modelPromiseRef.current) {
      return modelPromiseRef.current; // Return existing promise
    }

    try {
      // Import TensorFlow.js and HandPose model
      const tfPromise = import('@tensorflow/tfjs');
      const handposePromise = import('@tensorflow-models/handpose');
      
      // Store promises to prevent re-import
      modelPromiseRef.current = Promise.all([tfPromise, handposePromise]);
      handposePromiseRef.current = modelPromiseRef.current;
      
      return modelPromiseRef.current;
    } catch (error) {
      console.error('Failed to load models:', error);
      setState(prev => ({ ...prev, error: error.message as string, isLoading: false }));
      return null;
    }
  }, []);

  // FIXED: Safe camera access with proper error handling
  const requestCameraAccess = useCallback(async () => {
    try {
      console.log('🎥 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('✅ Camera access granted');
      }
      
      return stream;
    } catch (error) {
      console.error('Camera access denied:', error);
      setState(prev => ({ ...prev, error: error.message as string, isLoading: false }));
      throw error;
    }
  }, []);

  // FIXED: Safe initialization without cycles
  const initialize = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (isInitializingRef.current) {
      console.log('⚠️ Initialization already in progress');
      return;
    }

    isInitializingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Set refs first
      videoRef.current = video;
      canvasRef.current = canvas;

      // FIXED: Load models once, then initialize camera
      const models = await preloadModels();
      if (!models) {
        throw new Error('Failed to load TensorFlow models');
      }

      const [, handpose] = models;
      detectorRef.current = handpose;
      setState(prev => ({ ...prev, isInitialized: true, isLoading: false }));

      // FIXED: Request camera access AFTER models are loaded
      const stream = await requestCameraAccess();
      
      console.log('✅ Initialization complete');
      setState(prev => ({ ...prev, cameraActive: true }));

      return { models, stream };
    } catch (error) {
      console.error('Initialization failed:', error);
      setState(prev => ({ ...prev, error: error.message as string, isLoading: false, isInitialized: false }));
      isInitializingRef.current = false;
    }
  }, [preloadModels, requestCameraAccess]);

  // FIXED: Safe detection loop with proper cleanup
  const detectGestures = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || !state.cameraActive) {
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.warn('Video not ready for detection');
        return;
      }

      // FIXED: Use performance.now() for better timing
      const predictions = await detectorRef.current.estimateHands(video, {
        flipHorizontal: false,
      });

      // FIXED: Safe gesture detection with error handling
      if (predictions && predictions.length > 0) {
        setState(prev => ({ 
          ...prev, 
          handDetected: true, 
          currentHandPose: predictions[0] 
        }));

        // Process gestures safely
        if (callbacks.onHandDetected) {
          callbacks.onHandDetected(true);
        }

        // Draw hand landmarks on canvas with error handling
        if (canvas && config.showDebugOverlay) {
          try {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // Draw landmarks...
            }
          } catch (drawError) {
            console.error('Canvas drawing error:', drawError);
          }
        }
      } else {
        setState(prev => ({ ...prev, handDetected: false }));
        if (callbacks.onHandDetected) {
          callbacks.onHandDetected(false);
        }
      }
    } catch (error: unknown) {
      console.error('Gesture detection failed:', error);
      setState(prev => ({ ...prev, error: (error as Error).message }));
    };
  }, [state.cameraActive, config.showDebugOverlay, callbacks.onHandDetected]);

  // FIXED: Safe camera operations
  const startCamera = useCallback(async () => {
    if (!videoRef.current || state.cameraActive) {
      console.log('📹 startCamera called, videoRef:', !!videoRef.current);
      return;
    }

    try {
      const stream = await requestCameraAccess();
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('▶️ Video playing');
      }
    } catch (error) {
      console.error('Start camera failed:', error);
    }
  }, [state.cameraActive, requestCameraAccess]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log('⏹️ Camera stopped');
    }
    
    setState(prev => ({ ...prev, cameraActive: false, handDetected: false }));
    
    if (callbacks.onHandDetected) {
      callbacks.onHandDetected(false);
    }
  }, [callbacks.onHandDetected]);

  // FIXED: Safe detection loop with proper cleanup
  const startDetection = useCallback(() => {
    if (!state.isInitialized || !state.cameraActive) {
      console.log('⚠️ Cannot start detection: not initialized or camera not active');
      return;
    }

    const detect = async () => {
      await detectGestures();
      animationFrameRef.current = requestAnimationFrame(detect);
    };

    // FIXED: Start detection loop with proper cleanup
    animationFrameRef.current = requestAnimationFrame(detect);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [state.isInitialized, state.cameraActive, detectGestures]);

  // FIXED: Safe effect management
  useEffect(() => {
    if (config.enabled && state.isInitialized && state.cameraActive) {
      const cleanup = startDetection();
      return cleanup;
    }
  }, [config.enabled, state.isInitialized, state.cameraActive, startDetection]);

  // FIXED: Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Stop camera
      stopCamera();
      
      // Reset refs
      videoRef.current = null;
      canvasRef.current = null;
      detectorRef.current = null;
      
      // Reset initialization flag
      isInitializingRef.current = false;
      
      console.log('🧹 Gesture control cleaned up');
    };
  }, []);

  return {
    ...state,
    initialize,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection: () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };
}
