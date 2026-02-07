"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import AutoSaveIndicator from './AutoSaveIndicator';

interface AdminFormWrapperProps {
  children: React.ReactNode;
  formKey: string; // Unique key for this form
  initialData?: any;
  onSave?: (data: any) => Promise<void>;
  autoSaveInterval?: number;
  debounceDelay?: number;
  enableAutoSave?: boolean;
}

export default function AdminFormWrapper({
  children,
  formKey,
  initialData = {},
  onSave,
  autoSaveInterval = 30000, // 30 seconds
  debounceDelay = 2000, // 2 seconds
  enableAutoSave = true
}: AdminFormWrapperProps) {
  const [formData, setFormData] = useState(initialData);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save hook
  const {
    getCachedData,
    clearCache,
    saveToCache
  } = useAutoSave({
    key: formKey,
    data: formData,
    onSave: enableAutoSave && onSave ? async (data) => {
      setIsSaving(true);
      try {
        await onSave(data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    } : undefined,
    interval: autoSaveInterval,
    debounce: debounceDelay,
    enabled: enableAutoSave
  });

  // Check for cached data on mount
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData && Object.keys(cachedData).length > 0) {
      // Don't automatically restore, let user decide
      console.log('Found cached data for form:', formKey, cachedData);
    }
  }, [formKey, getCachedData]);

  // Update form data
  const updateFormData = useCallback((newData: any) => {
    setFormData((prevData: any) => {
      const updated = { ...prevData, ...newData };
      setHasUnsavedChanges(JSON.stringify(updated) !== JSON.stringify(initialData));
      return updated;
    });
  }, [initialData]);

  // Manual save
  const handleManualSave = useCallback(async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(formData);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        clearCache(); // Clear cache after successful save
      } catch (error) {
        console.error('Manual save failed:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    }
  }, [formData, onSave, clearCache]);

  // Restore from cache
  const handleRestore = useCallback(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setFormData(cachedData);
      setHasUnsavedChanges(true);
      console.log('Restored cached data:', cachedData);
    }
  }, [getCachedData]);

  // Discard cached data
  const handleDiscard = useCallback(() => {
    clearCache();
    setHasUnsavedChanges(false);
  }, [clearCache]);

  // Reset form
  const handleReset = useCallback(() => {
    setFormData(initialData);
    setHasUnsavedChanges(false);
    clearCache();
  }, [initialData, clearCache]);

  // Check if there's cached data
  const hasCachedData = !!getCachedData();

  // Provide form context to children
  const formContext = {
    formData,
    setFormData: updateFormData,
    resetForm: handleReset,
    saveForm: handleManualSave,
    isSaving,
    hasUnsavedChanges,
    lastSaved
  };

  return (
    <div className="relative">
      {/* Auto-save indicator */}
      <AutoSaveIndicator
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleManualSave}
        onDiscard={handleDiscard}
        onRestore={handleRestore}
        hasCachedData={hasCachedData}
      />

      {/* Form content */}
      <div className="admin-form-content">
        {typeof children === 'function' 
          ? (children as any)(formContext)
          : children
        }
      </div>

      {/* Hidden form data for debugging (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg p-2 text-xs text-gray-400 max-w-xs">
          <div>Form: {formKey}</div>
          <div>Changes: {hasUnsavedChanges ? 'Yes' : 'No'}</div>
          <div>Cached: {hasCachedData ? 'Yes' : 'No'}</div>
          <div>Last Save: {lastSaved?.toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
}
