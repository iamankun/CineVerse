"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Input, Select, SelectItem, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Tv, Plus, Edit, Trash2, Save, X } from "lucide-react";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { NextPage } from "next";

// Interface cho kênh TV
interface TiviChannel {
  id: string;
  name: string;
  logo: string;
  url: string;
  type: string;
  category: string;
  country: string;
  quality: string;
}

const AdminTiviPage: NextPage = () => {
  const [channels, setChannels] = useState<TiviChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingChannel, setEditingChannel] = useState<TiviChannel | null>(null);
  const [formData, setFormData] = useState<TiviChannel>({
    id: "",
    name: "",
    logo: "",
    url: "",
    type: "m3u8",
    category: "Tin Tức",
    country: "VN",
    quality: "HD"
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Load channels from API
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await fetch('/api/admin/tivi');
        const data = await response.json();
        setChannels(data);
      } catch (error) {
        console.error('Error loading channels:', error);
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };

    loadChannels();
  }, []);

  // Save channels to JSON via API
  const saveChannels = async (updatedChannels: TiviChannel[]) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/tivi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channels: updatedChannels }),
      });

      if (!response.ok) {
        throw new Error('Failed to save channels');
      }

      // Update local state
      setChannels(updatedChannels);
      
      // Show success message
      alert('✅ Đã lưu danh sách kênh thành công!');
    } catch (error) {
      console.error('Error saving channels:', error);
      alert('❌ Lỗi khi lưu danh sách kênh!');
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.name || !formData.url) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin kênh!');
      return;
    }

    let updatedChannels: TiviChannel[];

    if (editingChannel) {
      // Update existing channel
      updatedChannels = channels.map(ch => 
        ch.id === editingChannel.id ? formData : ch
      );
    } else {
      // Add new channel
      const newChannel = {
        ...formData,
        id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-')
      };
      updatedChannels = [...channels, newChannel];
    }

    saveChannels(updatedChannels);
    resetForm();
    onOpenChange();
  };

  // Delete channel
  const handleDelete = (channelId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kênh này?')) {
      const updatedChannels = channels.filter(ch => ch.id !== channelId);
      saveChannels(updatedChannels);
    }
  };

  // Edit channel
  const handleEdit = (channel: TiviChannel) => {
    setEditingChannel(channel);
    setFormData(channel);
    onOpen();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      logo: "",
      url: "",
      type: "m3u8",
      category: "Tin Tức",
      country: "VN",
      quality: "HD"
    });
    setEditingChannel(null);
  };

  // Open modal for new channel
  const handleAddNew = () => {
    resetForm();
    onOpen();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Đang tải danh sách kênh...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
      <div className="flex items-center justify-between">
        <SectionTitle
          color="primary"
          className="text-2xl md:text-3xl"
          classNames={{
            title:
              "bg-[linear-gradient(90deg,#3b82f6,#06b6d4,#10b981,#3b82f6,#06b6d4)] bg-[length:200%] animate-gradient bg-clip-text text-transparent",
          }}
        >
          <span className="flex items-center gap-2">
            <Tv className="text-blue-500" />
            Quản lý Kênh TV
          </span>
        </SectionTitle>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={handleAddNew}
        >
          Thêm kênh mới
        </Button>
      </div>

      <p className="text-gray-400 -mt-4">
        Quản lý danh sách các kênh truyền hình Việt Nam cho trang TV Streaming
      </p>

      {/* Channels List */}
      <Card>
        <CardBody className="p-0">
          {channels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Logo</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Tên kênh</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Thể loại</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Chất lượng</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Loại stream</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((channel) => (
                    <tr key={channel.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <Tv className="w-6 h-6 text-gray-400 hidden" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{channel.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{channel.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {channel.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {channel.quality}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {channel.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Edit className="w-3 h-3" />}
                            onPress={() => handleEdit(channel)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            startContent={<Trash2 className="w-3 h-3" />}
                            onPress={() => handleDelete(channel.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chưa có kênh nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Thêm kênh đầu tiên để bắt đầu quản lý TV streaming
              </p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={handleAddNew}
              >
                Thêm kênh đầu tiên
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">
                  {editingChannel ? "Sửa kênh" : "Thêm kênh mới"}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingChannel ? "Cập nhật thông tin kênh TV" : "Thêm kênh TV mới vào danh sách"}
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ID Kênh"
                    placeholder="ví dụ: vtv1"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    description="ID duy nhất cho kênh (tự động tạo nếu để trống)"
                  />
                  <Input
                    label="Tên Kênh"
                    placeholder="ví dụ: VTV1"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    isRequired
                  />
                  <Input
                    label="Logo URL"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    description="Link đến ảnh logo của kênh"
                  />
                  <Select
                    label="Thể loại"
                    selectedKeys={[formData.category]}
                    onSelectionChange={(keys) => setFormData({...formData, category: Array.from(keys)[0] as string})}
                  >
                    <SelectItem key="Tin Tức">Tin Tức</SelectItem>
                    <SelectItem key="Giải trí">Giải trí</SelectItem>
                    <SelectItem key="Thể thao">Thể thao</SelectItem>
                    <SelectItem key="Giáo dục">Giáo dục</SelectItem>
                    <SelectItem key="Thiếu nhi">Thiếu nhi</SelectItem>
                  </Select>
                  <Select
                    label="Chất lượng"
                    selectedKeys={[formData.quality]}
                    onSelectionChange={(keys) => setFormData({...formData, quality: Array.from(keys)[0] as string})}
                  >
                    <SelectItem key="HD">HD</SelectItem>
                    <SelectItem key="Full HD">Full HD</SelectItem>
                    <SelectItem key="4K">4K</SelectItem>
                    <SelectItem key="SD">SD</SelectItem>
                  </Select>
                  <Select
                    label="Loại Stream"
                    selectedKeys={[formData.type]}
                    onSelectionChange={(keys) => setFormData({...formData, type: Array.from(keys)[0] as string})}
                  >
                    <SelectItem key="m3u8">M3U8</SelectItem>
                    <SelectItem key="hls">HLS</SelectItem>
                    <SelectItem key="mp4">MP4</SelectItem>
                  </Select>
                  <Input
                    label="Quốc gia"
                    placeholder="VN"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <Textarea
                  label="Stream URL"
                  placeholder="https://example.com/stream.m3u8"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  description="Link đến stream của kênh (M3U8, HLS, hoặc trực tiếp)"
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  color="danger"
                  onPress={onClose}
                  startContent={<X className="w-4 h-4" />}
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={saving}
                  startContent={<Save className="w-4 h-4" />}
                >
                  {editingChannel ? "Cập nhật" : "Thêm"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminTiviPage;
