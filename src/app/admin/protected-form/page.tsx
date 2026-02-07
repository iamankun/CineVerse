"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Textarea, Button, Card, CardBody, CardHeader } from '@heroui/react';
import FormPersistenceProvider, { useFormPersistence } from '@/components/admin/FormPersistenceProvider';
import UnsavedChangesDialog from '@/components/admin/UnsavedChangesDialog';

interface FormData {
  title: string;
  description: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export default function ProtectedForm() {
  const router = useRouter();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const initialData: FormData = {
    title: '',
    description: '',
    content: '',
    category: '',
    priority: 'medium'
  };

  const handleSave = async (data: FormData) => {
    console.log('Saving form data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Data saved successfully!');
  };

  const handleNavigation = (url: string) => {
    setPendingNavigation(url);
    setShowUnsavedDialog(true);
  };

  const handleConfirmLeave = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const handleSaveAndLeave = async () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const handleCancel = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Intercept navigation attempts
  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;

    const interceptNavigation = (url: string) => {
      // Check if there are unsaved changes
      const hasUnsaved = localStorage.getItem('form_unsaved_protected_form') === 'true';
      
      if (hasUnsaved) {
        handleNavigation(url);
        return false; // Prevent navigation
      }
      
      return true; // Allow navigation
    };

    // Override router methods
    router.push = (url: string) => {
      if (interceptNavigation(url)) {
        originalPush(url);
      }
    };

    router.replace = (url: string) => {
      if (interceptNavigation(url)) {
        originalReplace(url);
      }
    };

    router.back = () => {
      if (interceptNavigation('/')) {
        originalBack();
      }
    };

    return () => {
      // Restore original methods
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
    };
  }, [router]);

  return (
    <FormPersistenceProvider
      formKey="protected_form"
      initialData={initialData}
      onSave={handleSave}
      autoSaveInterval={8000} // 8 seconds
      confirmOnLeave={true}
    >
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Admin Form - Bảo vệ Dữ liệu
          </h1>
          
          <UnsavedChangesDialog
            isOpen={showUnsavedDialog}
            onConfirm={handleConfirmLeave}
            onCancel={handleCancel}
            onSaveAndLeave={handleSaveAndLeave}
          />
          
          {({ formData, setFormData, saveData, clearData, isDirty, lastSaved, restoreData, markAsDirty, markAsClean }) => (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Form Bảo vệ
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDirty ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {isDirty ? 'Chưa lưu' : 'Đã lưu'}
                    </div>
                    {lastSaved && (
                      <span className="text-gray-400 text-xs">
                        Lưu lúc: {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tiêu đề
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ title: e.target.value });
                        markAsDirty();
                      }}
                      placeholder="Nhập tiêu đề..."
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Danh mục
                    </label>
                    <Input
                      value={formData.category}
                      onChange={(e) => {
                        setFormData({ category: e.target.value });
                        markAsDirty();
                      }}
                      placeholder="Nhập danh mục..."
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ description: e.target.value });
                      markAsDirty();
                    }}
                    placeholder="Nhập mô tả..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nội dung chi tiết
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => {
                      setFormData({ content: e.target.value });
                      markAsDirty();
                    }}
                    placeholder="Nhập nội dung chi tiết..."
                    rows={6}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ưu tiên
                  </label>
                  <div className="flex gap-3">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <label key={priority} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={formData.priority === priority}
                          onChange={(e) => {
                            setFormData({ priority: e.target.value as any });
                            markAsDirty();
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-300 capitalize">
                          {priority === 'low' ? 'Thấp' : priority === 'medium' ? 'Trung bình' : 'Cao'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <Button
                    color="primary"
                    onPress={async () => {
                      await saveData(formData);
                      markAsClean();
                    }}
                    disabled={!isDirty}
                    className="flex-1"
                  >
                    Lưu thay đổi
                  </Button>
                  
                  <Button
                    variant="bordered"
                    onPress={() => {
                      if (isDirty) {
                        handleNavigation('/admin');
                      } else {
                        router.push('/admin');
                      }
                    }}
                    className="flex-1"
                  >
                    {isDirty ? 'Quay lại admin' : 'Về admin'}
                  </Button>
                  
                  <Button
                    variant="light"
                    onPress={clearData}
                    className="flex-1"
                  >
                    Reset form
                  </Button>
                  
                  <Button
                    variant="light"
                    onPress={() => {
                      const restored = restoreData();
                      if (restored) {
                        console.log('Restored data:', restored);
                        markAsDirty();
                      }
                    }}
                    className="flex-1"
                  >
                    Khôi phục
                  </Button>
                </div>

                {/* Status indicator */}
                <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Trạng thái bảo vệ:
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className={`ml-2 font-medium ${
                        isDirty ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {isDirty ? 'Có thay đổi chưa lưu' : 'Đã lưu'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tự động lưu:</span>
                      <span className="ml-2 font-medium text-green-400">
                        Bật (8s)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Chống rời:</span>
                      <span className="ml-2 font-medium text-green-400">
                        Bật
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lưu cuối:</span>
                      <span className="ml-2 font-medium">
                        {lastSaved ? lastSaved.toLocaleTimeString('vi-VN') : 'Chưa lưu'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </FormPersistenceProvider>
  );
}
