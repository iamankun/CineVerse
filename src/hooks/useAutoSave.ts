import { useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions {
  key: string; // Unique key for this form
  data: any; // Data to save
  onSave?: (data: any) => void; // Optional save callback
  interval?: number; // Auto-save interval in ms (default: 30000 = 30s)
  debounce?: number; // Debounce delay in ms (default: 2000 = 2s)
  enabled?: boolean; // Enable/disable auto-save (default: true)
  maxAge?: number; // Cache max age in ms (default: 86400000 = 24h)
}

export function useAutoSave({
  key,
  data,
  onSave,
  interval = 30000,
  debounce = 2000,
  enabled = true,
  maxAge = 86400000
}: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  // Get cached data
  const getCachedData = useCallback((): any => {
    // Check if we're on the client side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const cached = localStorage.getItem(`autosave_${key}`);
      if (!cached) return null;

      const { data: cachedData, timestamp } = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`autosave_${key}`);
        return null;
      }

      return cachedData;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }, [key, maxAge]);

  // Save data to cache
  const saveToCache = useCallback((saveData: any) => {
    // Check if we're on the client side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const cacheData = {
        data: saveData,
        timestamp: Date.now()
      };
      localStorage.setItem(`autosave_${key}`, JSON.stringify(cacheData));
      lastSaveRef.current = JSON.stringify(saveData);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [key]);

  // Clear cache
  const clearCache = useCallback(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.removeItem(`autosave_${key}`);
      lastSaveRef.current = '';
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key]);

  // Debounced save function
  const debouncedSave = useCallback((saveData: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveToCache(saveData);
      if (onSave) {
        onSave(saveData);
      }
    }, debounce);
  }, [debounce, saveToCache, onSave]);

  // Check if data has changed
  const hasDataChanged = useCallback((currentData: any) => {
    const currentJson = JSON.stringify(currentData);
    return currentJson !== lastSaveRef.current;
  }, []);

  // Auto-save on data change
  useEffect(() => {
    if (!enabled || !data) return;

    if (hasDataChanged(data)) {
      debouncedSave(data);
    }
  }, [data, enabled, hasDataChanged, debouncedSave]);

  // Periodic auto-save
  useEffect(() => {
    if (!enabled || !data) return;

    intervalRef.current = setInterval(() => {
      if (hasDataChanged(data)) {
        saveToCache(data);
        if (onSave) {
          onSave(data);
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, data, interval, hasDataChanged, saveToCache, onSave]);

  // Save on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (enabled && data && hasDataChanged(data)) {
        saveToCache(data);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [enabled, data, hasDataChanged, saveToCache]);

  return {
    getCachedData,
    clearCache,
    saveToCache,
    hasDataChanged
  };
}
