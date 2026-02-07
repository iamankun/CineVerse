"use client";

import { useState } from 'react';
import { Input, Textarea, Button, Card, CardBody, CardHeader } from '@heroui/react';
import AdminFormWrapper from '@/components/admin/AdminFormWrapper';

interface FormData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  published: boolean;
}

export default function ExampleForm() {
  const [isClient, setIsClient] = useState(false);

  // Simulate initial data from API
  const initialData: FormData = {
    title: '',
    description: '',
    content: '',
    tags: [],
    published: false
  };

  // Handle save to database
  const handleSave = async (data: FormData) => {
    console.log('Saving data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would call your actual API
    // await fetch('/api/admin/content', {
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // });
    
    console.log('Data saved successfully!');
  };

  // Client-side hydration check
  useState(() => {
    setIsClient(true);
  });

  if (!isClient) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Admin Form - Auto Save Demo
        </h1>
        
        <AdminFormWrapper
          formKey="example-admin-form"
          initialData={initialData}
          onSave={handleSave}
          autoSaveInterval={15000} // 15 seconds for demo
          debounceDelay={1000} // 1 second for demo
        >
          {({ formData, setFormData, resetForm, saveForm, isSaving, hasUnsavedChanges }) => (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">
                  Nội dung Admin
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tiêu đề
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ title: e.target.value })}
                    placeholder="Nhập tiêu đề..."
                    className="w-full"
                    disabled={isSaving}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ description: e.target.value })}
                    placeholder="Nhập mô tả..."
                    rows={3}
                    className="w-full"
                    disabled={isSaving}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nội dung chi tiết
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ content: e.target.value })}
                    placeholder="Nhập nội dung chi tiết..."
                    rows={6}
                    className="w-full"
                    disabled={isSaving}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (ngăn cách bằng dấu phẩy)
                  </label>
                  <Input
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    })}
                    placeholder="tag1, tag2, tag3"
                    className="w-full"
                    disabled={isSaving}
                  />
                </div>

                {/* Published */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ published: e.target.checked })}
                    disabled={isSaving}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label 
                    htmlFor="published" 
                    className="text-sm font-medium text-gray-300"
                  >
                    Đăng bài viết
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <Button
                    color="primary"
                    onPress={saveForm}
                    isLoading={isSaving}
                    disabled={!hasUnsavedChanges}
                    className="flex-1"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  
                  <Button
                    variant="bordered"
                    onPress={resetForm}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Reset form
                  </Button>
                </div>

                {/* Form status */}
                <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Trạng thái form:
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Thay đổi chưa lưu:</span>
                      <span className={`ml-2 font-medium ${
                        hasUnsavedChanges ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {hasUnsavedChanges ? 'Có' : 'Không'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Đang lưu:</span>
                      <span className={`ml-2 font-medium ${
                        isSaving ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {isSaving ? 'Có' : 'Không'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </AdminFormWrapper>
      </div>
    </div>
  );
}
