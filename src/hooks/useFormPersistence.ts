import { useEffect, useRef, useCallback, useState } from 'react';

interface FormPersistenceOptions {
  formKey: string; // Unique key for this form
  data: any; // Current form data
  onSave?: (data: any) => Promise<void>; // Save callback
  autoSave?: boolean; // Enable auto-save (default: true)
  autoSaveInterval?: number; // Auto-save interval (default: 10000 = 10s)
  debounceDelay?: number; // Debounce delay (default: 1000 = 1s)
  maxAge?: number; // Cache max age (default: 3600000 = 1h)
  confirmOnLeave?: boolean; // Show confirm dialog before leaving (default: true)
}

export function useFormPersistenceFIXED({
  formKey,
  data,
  onSave,
  autoSave = true,
  autoSaveInterval = 10000,
  debounceDelay = 1000,
  maxAge = 3600000,
  confirmOnLeave = true
}: FormPersistenceOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');
  const hasUnsavedRef = useRef<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);

  // Storage keys
  const DATA_KEY = `form_data_${formKey}`;
  const TIMESTAMP_KEY = `form_timestamp_${formKey}`;
  const UNSAVED_KEY = `form_unsaved_${formKey}`;

  // Get cached data - FIXED with proper dependencies
  const getCachedData = useCallback((): any => {
    try {
      const cached = localStorage.getItem(DATA_KEY);
      const timestamp = localStorage.getItem(TIMESTAMP_KEY);
      
      if (!cached || !timestamp) return null;

      // Check if cache is expired - FIXED with safe parsing
      const timestampNum = parseInt(timestamp);
      if (isNaN(timestampNum)) {
        console.warn('Invalid timestamp in cache:', timestamp);
        clearCache();
        return null;
      }

      const age = Date.now() - timestampNum;
      if (age > maxAge) {
        clearCache();
        return null;
      }

      // FIXED: Safe JSON parsing
      try {
        return JSON.parse(cached);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        clearCache();
        return null;
      }
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }, [formKey, maxAge]); // ✅ Added dependencies

  // Save data to cache - FIXED with proper dependencies
  const saveToCache = useCallback(async (saveData: any, isAutoSave = false) => {
    try {
      const timestamp = Date.now().toString();
      localStorage.setItem(DATA_KEY, JSON.stringify(saveData));
      localStorage.setItem(TIMESTAMP_KEY, timestamp);
      
      if (!isAutoSave) {
        localStorage.removeItem(UNSAVED_KEY);
        hasUnsavedRef.current = false;
        setIsDirty(false);
      }
      
      lastSaveRef.current = JSON.stringify(saveData);
      
      if (onSave) {
        await onSave(saveData);
      }
      
      console.log(`✅ Form data ${isAutoSave ? 'auto-saved' : 'saved'}:`, formKey);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [formKey, onSave]); // ✅ Added dependencies

  // Clear cache - FIXED with proper dependencies
  function clearCache() {
    try {
      localStorage.removeItem(DATA_KEY);
      localStorage.removeItem(TIMESTAMP_KEY);
      localStorage.removeItem(UNSAVED_KEY);
      lastSaveRef.current = '';
      hasUnsavedRef.current = false;
      setIsDirty(false);
      console.log('🗑️ Cache cleared for:', formKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Mark as having unsaved changes - FIXED with proper dependencies
  const markAsUnsaved = useCallback(() => {
    localStorage.setItem(UNSAVED_KEY, 'true');
    hasUnsavedRef.current = true;
    setIsDirty(true);
  }, [formKey]); // ✅ Added dependencies

  // Check if has unsaved changes - FIXED with proper dependencies
  const hasUnsavedChanges = useCallback((currentData: any) => {
    const cachedData = getCachedData();
    const hasUnsavedFlag = localStorage.getItem(UNSAVED_KEY) === 'true';
    
    if (hasUnsavedFlag) return true;
    
    if (cachedData && currentData) {
      const currentJson = JSON.stringify(currentData);
      const cachedJson = JSON.stringify(cachedData);
      return currentJson !== cachedJson;
    }
    
    return false;
  }, [getCachedData]); // ✅ Added dependencies

  // FIXED: Debounced auto-save with proper cleanup
  const debouncedSave = useCallback((saveData: any) => {
    // FIXED: Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(async () => {
      if (autoSave && onSave) {
        await saveToCache(saveData, true);
      }
    }, debounceDelay);
  }, [autoSave, debounceDelay, saveToCache, onSave]); // ✅ Added dependencies

  // Auto-save on data change - FIXED with proper cleanup
  useEffect(() => {
    if (!autoSave || !data) return;

    if (hasUnsavedChanges(data)) {
      hasUnsavedRef.current = true;
      debouncedSave(data);
    }
  }, [data, autoSave, hasUnsavedChanges, debouncedSave]);

  // FIXED: Periodic auto-save with proper cleanup
  useEffect(() => {
    if (!autoSave || !data) return;

    intervalRef.current = setInterval(async () => {
      if (hasUnsavedChanges(data)) {
        await saveToCache(data, true);
      }
    }, autoSaveInterval);

    // ✅ Added proper cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoSave, data, autoSaveInterval, hasUnsavedChanges, saveToCache]);

  // FIXED: Prevent accidental navigation with proper cleanup
  useEffect(() => {
    if (!confirmOnLeave) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current) {
        e.preventDefault();
        e.returnValue = 'Bạn có dữ liệu chưa lưu. Bạn có chắc muốn rời đi?';
        
        // FIXED: Try one last save with error handling
        if (data && onSave) {
          saveToCache(data, true).catch(error => {
            console.error('Emergency save failed:', error);
          });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedRef.current) {
        // FIXED: Safe save with error handling
        if (data && onSave) {
          saveToCache(data, true).catch(error => {
            console.error('Visibility change save failed:', error);
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    // ✅ Added proper cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // FIXED: Clear all timers on cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [confirmOnLeave, data, saveToCache, onSave]);

  return {
    getCachedData,
    saveToCache,
    clearCache,
    markAsUnsaved,
    hasUnsavedChanges,
    isDirty
  };
}
