"use client";

import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { AlertTriangle, Save, X } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onSaveAndLeave: () => void;
}

export default function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
  onSaveAndLeave
}: UnsavedChangesDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndLeave = async () => {
    setIsSaving(true);
    try {
      await onSaveAndLeave();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      size="md"
      backdrop="blur"
      hideCloseButton={false}
      classNames={{
        backdrop: "bg-black/50",
        base: "text-white"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Dữ liệu chưa lưu</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Bạn có thay đổi chưa được lưu. Bạn có muốn lưu trước khi rời đi?
          </p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Cảnh báo mất dữ liệu
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Nếu bạn rời đi bây giờ, tất cả thay đổi sẽ bị mất.
                    Chúng tôi khuyên bạn nên lưu lại trước khi rời đi.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                <strong>Lựa chọn:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <span className="text-blue-400">Lưu lại và tiếp tục</span> - Lưu tất cả thay đổi và thực hiện hành động của bạn
                </li>
                <li>
                  <span className="text-red-400">Không lưu và rời đi</span> - Bỏ qua tất cả thay đổi
                </li>
                <li>
                  <span className="text-gray-400">Hủy</span> - Ở lại và tiếp tục chỉnh sửa
                </li>
              </ul>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter className="gap-3">
          <Button
            variant="bordered"
            onPress={onCancel}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          
          <Button
            color="danger"
            onPress={onConfirm}
            className="flex-1"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Không lưu
          </Button>
          
          <Button
            color="primary"
            onPress={handleSaveAndLeave}
            isLoading={isSaving}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Đang lưu...' : 'Lưu lại'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
