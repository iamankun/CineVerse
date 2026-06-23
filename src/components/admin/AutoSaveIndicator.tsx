"use client";

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@heroui/react';

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  onRestore?: () => void;
  hasCachedData?: boolean;
}

export default function AutoSaveIndicator({
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
  onSave,
  onDiscard,
  onRestore,
  hasCachedData = false
}: AutoSaveIndicatorProps) {
  const showRestorePrompt = hasCachedData && !lastSaved;

  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const lastSavedText = formatLastSaved(lastSaved);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Restore prompt */}
      {showRestorePrompt && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 shadow-lg max-w-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Phát hiện dữ liệu chưa lưu
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Chúng tôi đã tìm thấy dữ liệu từ phiên làm việc trước đó.
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  color="primary"
                  onPress={() => {
                    onRestore?.();
                  }}
                  className="text-xs"
                >
                  Khôi phục
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => {
                    onDiscard?.();
                  }}
                  className="text-xs text-yellow-700 dark:text-yellow-300"
                >
                  Bỏ qua
                </Button>
              </div>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => {}}
              className="text-yellow-600 dark:text-yellow-400"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Auto-save indicator */}
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          {/* Status icon */}
          <div className="flex-shrink-0">
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : hasUnsavedChanges ? (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            ) : (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </div>

          {/* Status text */}
          <div className="min-w-0">
            <p className="text-xs text-gray-300">
              {isSaving ? (
                'Đang lưu...'
              ) : hasUnsavedChanges ? (
                'Có thay đổi chưa lưu'
              ) : (
                'Đã lưu'
              )}
            </p>
            {lastSavedText && !hasUnsavedChanges && (
              <p className="text-xs text-gray-500">{lastSavedText}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            {hasUnsavedChanges && onSave && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onSave}
                className="text-gray-400 hover:text-white min-w-0 w-6 h-6"
              >
                <Save className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
