"use client";

import { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';

interface FormPersistenceContextType {
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  saveData: (data: any) => Promise<void>;
  clearData: () => void;
  restoreData: () => any | null;
  markAsDirty: () => void;
  markAsClean: () => void;
}

const FormPersistenceContext = createContext<FormPersistenceContextType | null>(null);

interface FormPersistenceProviderProps {
  children: ReactNode;
  formKey: string;
  initialData?: any;
  onSave?: (data: any) => Promise<void>;
  autoSaveInterval?: number;
  confirmOnLeave?: boolean;
}

export default function FormPersistenceProvider({
  children,
  formKey,
  initialData = {},
  onSave,
  autoSaveInterval = 10000, // 10 seconds
  confirmOnLeave = true
}: FormPersistenceProviderProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentData, setCurrentData] = useState(initialData);

  // Storage keys
  const DATA_KEY = `form_data_${formKey}`;
  const TIMESTAMP_KEY = `form_timestamp_${formKey}`;
  const UNSAVED_KEY = `form_unsaved_${formKey}`;

  // Get cached data
  const getCachedData = useCallback((): any => {
    // Check if we're on the client side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const cached = localStorage.getItem(DATA_KEY);
      const timestamp = localStorage.getItem(TIMESTAMP_KEY);
      
      if (!cached || !timestamp) return null;

      // Check if cache is expired (1 hour)
      const age = Date.now() - parseInt(timestamp);
      if (age > 3600000) {
        localStorage.removeItem(DATA_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
        localStorage.removeItem(UNSAVED_KEY);
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }, [formKey]);

  // Save data to cache
  const saveToCache = useCallback(async (saveData: any, isAutoSave = false) => {
    // Check if we're on the client side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const timestamp = Date.now().toString();
      localStorage.setItem(DATA_KEY, JSON.stringify(saveData));
      localStorage.setItem(TIMESTAMP_KEY, timestamp);
      
      if (!isAutoSave) {
        localStorage.removeItem(UNSAVED_KEY);
        setIsDirty(false);
      }
      
      setLastSaved(new Date());
      setCurrentData(saveData);
      
      if (onSave) {
        await onSave(saveData);
      }
      
      console.log(`✅ Form data ${isAutoSave ? 'auto-saved' : 'saved'}:`, formKey);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [formKey, onSave]);

  // Check if has unsaved changes
  const hasUnsavedChanges = useCallback((checkData?: any) => {
    // Check if we're on the client side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    const dataToCheck = checkData || currentData;
    const cachedData = getCachedData();
    const hasUnsavedFlag = localStorage.getItem(UNSAVED_KEY) === 'true';
    
    if (hasUnsavedFlag) return true;
    
    if (cachedData && dataToCheck) {
      const currentJson = JSON.stringify(dataToCheck);
      const cachedJson = JSON.stringify(cachedData);
      return currentJson !== cachedJson;
    }
    
    return false;
  }, [currentData, getCachedData]);

  // Auto-save with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (hasUnsavedChanges()) {
        localStorage.setItem(UNSAVED_KEY, 'true');
        setIsDirty(true);
        await saveToCache(currentData, true);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [currentData, hasUnsavedChanges, saveToCache]);

  // Periodic auto-save
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (hasUnsavedChanges()) {
        await saveToCache(currentData, true);
      }
    }, autoSaveInterval);

    return () => clearInterval(intervalId);
  }, [currentData, hasUnsavedChanges, saveToCache, autoSaveInterval]);

  // Prevent data loss on page unload
  useEffect(() => {
    if (!confirmOnLeave) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'Bạn có dữ liệu chưa lưu. Bạn có chắc muốn rời đi?';
        
        // Emergency save
        saveToCache(currentData, true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedChanges()) {
        saveToCache(currentData, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentData, hasUnsavedChanges, saveToCache, confirmOnLeave]);

  // Context value
  const contextValue: FormPersistenceContextType = {
    isDirty,
    hasUnsavedChanges: hasUnsavedChanges(),
    lastSaved,
    saveData: async (data) => {
      setCurrentData(data);
      await saveToCache(data, false);
    },
    clearData: () => {
      // Check if we're on the client side
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(DATA_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
        localStorage.removeItem(UNSAVED_KEY);
      }
      setCurrentData(initialData);
      setIsDirty(false);
      setLastSaved(null);
    },
    restoreData: () => {
      const cached = getCachedData();
      if (cached) {
        setCurrentData(cached);
        setIsDirty(true);
        // Check if we're on the client side
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem(UNSAVED_KEY, 'true');
        }
      }
      return cached;
    },
    markAsDirty: () => {
      setIsDirty(true);
      // Check if we're on the client side
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(UNSAVED_KEY, 'true');
      }
    },
    markAsClean: () => {
      setIsDirty(false);
      // Check if we're on the client side
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(UNSAVED_KEY);
      }
    }
  };

  return (
    <FormPersistenceContext.Provider value={contextValue}>
      {children}
    </FormPersistenceContext.Provider>
  );
}

export function useFormPersistence() {
  const context = useContext(FormPersistenceContext);
  if (!context) {
    throw new Error('useFormPersistence must be used within FormPersistenceProvider');
  }
  return context;
}
