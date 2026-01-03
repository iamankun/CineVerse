'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface GestureContextType {
  enabled: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const GestureContext = createContext<GestureContextType | undefined>(undefined);

export function GestureProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  const enable = useCallback(() => {
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
  }, []);

  return (
    <GestureContext.Provider value={{ enabled, toggle, enable, disable }}>
      {children}
    </GestureContext.Provider>
  );
}

export function useGestureContext() {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestureContext must be used within GestureProvider');
  }
  return context;
}
