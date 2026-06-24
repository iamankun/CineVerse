import { useRef, useEffect, useState } from "react";

const useDeviceVibration = () => {
  const [isVibrating, setIsVibrating] = useState(false);
  const vibrationStarted = useRef(false);

  const isVibrationSupported = () => "vibrate" in navigator;

  const startVibration = (pattern: VibratePattern) => {
    if (isVibrationSupported()) {
      navigator.vibrate(pattern);
      vibrationStarted.current = true;
      setIsVibrating(true);
    }
  };

  const stopVibration = () => {
    if (isVibrationSupported()) {
      navigator.vibrate(0);
      vibrationStarted.current = false;
      setIsVibrating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (vibrationStarted.current) {
        try { navigator.vibrate(0); } catch {}
      }
    };
  }, []);

  return {
    isVibrating,
    startVibration,
    stopVibration,
    isVibrationSupported,
  };
};

export default useDeviceVibration;
