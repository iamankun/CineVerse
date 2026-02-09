"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import { IoSearch, IoSave, IoRefresh, IoAdd, IoTrash, IoList, IoCreate, IoFilm, IoTv } from "react-icons/io5";
import AdminGuard from "@/components/AdminGuard";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: number;
  tmdb_id: number;
  title: string;
  year: number;
  sources: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export default function MediaManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvSeries, setTvSeries] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [formData, setFormData] = useState({
    tmdb_id: '',
    title: '',
    year: '',
    sources: '',
    metadata: ''
  });

  // Fetch data
  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/admin/dienanh');
      const data = await response.json();
      if (data.movies) {
        setMovies(data.movies);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      addToast({
        title: "Lỗi",
        description: "Không thể tải danh sách phim",
        color: "danger"
      });
    }
  };

  const fetchTvSeries = async () => {
    try {
      const response = await fetch('/api/admin/chuongtrinhtv');
      const data = await response.json();
      if (data.tvSeries) {
        setTvSeries(data.tvSeries);
      }
    } catch (error) {
      console.error('Error fetching TV series:', error);
      addToast({
        title: "Lỗi",
        description: "Không thể tải danh sách chương trình TV",
        color: "danger"
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'movies') {
      fetchMovies();
    } else {
      fetchTvSeries();
    }
  }, [activeTab]);

  // Handle CRUD operations
  const handleSave = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'movies' ? '/api/admin/dienanh' : '/api/admin/chuongtrinhtv';
      const method = editingItem ? 'PUT' : 'POST';
      const payload: any = {
        ...formData,
        tmdb_id: parseInt(formData.tmdb_id),
        year: parseInt(formData.year),
        sources: JSON.parse(formData.sources || '[]'),
        metadata: JSON.parse(formData.metadata || '{}')
      };

      if (editingItem) {
        payload.id = editingItem.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        addToast({
          title: "Thành công",
          description: editingItem ? "Cập nhật thành công" : "Thêm mới thành công",
          color: "success"
        });
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
          tmdb_id: '',
          title: '',
          year: '',
          sources: '',
          metadata: ''
        });
        
        if (activeTab === 'movies') {
          fetchMovies();
        } else {
          fetchTvSeries();
        }
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Không thể lưu dữ liệu",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
      const url = activeTab === 'movies' ? '/api/admin/dienanh' : '/api/admin/chuongtrinhtv';
      const response = await fetch(`${url}?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast({
          title: "Thành công",
          description: "Xóa thành công",
          color: "success"
        });
        
        if (activeTab === 'movies') {
          setMovies(movies.filter(item => item.id !== id));
        } else {
          setTvSeries(tvSeries.filter(item => item.id !== id));
        }
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Không thể xóa dữ liệu",
        color: "danger"
      });
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setFormData({
      tmdb_id: item.tmdb_id.toString(),
      title: item.title,
      year: item.year.toString(),
      sources: JSON.stringify(item.sources, null, 2),
      metadata: JSON.stringify(item.metadata, null, 2)
    });
    setIsModalOpen(true);
  };

  const filteredData = activeTab === 'movies' 
    ? movies.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tmdb_id.toString().includes(searchTerm)
      )
    : tvSeries.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tmdb_id.toString().includes(searchTerm)
      );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Media Management</h1>
            <p className="text-gray-400">Quản lý phim và chương trình truyền hình</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <Button
              color={activeTab === 'movies' ? 'primary' : 'default'}
              variant={activeTab === 'movies' ? 'solid' : 'bordered'}
              onClick={() => setActiveTab('movies')}
              startContent={<IoFilm />}
            >
              Phim (DienAnh)
            </Button>
            <Button
              color={activeTab === 'tv' ? 'primary' : 'default'}
              variant={activeTab === 'tv' ? 'solid' : 'bordered'}
              onClick={() => setActiveTab('tv')}
              startContent={<IoTv />}
            >
              TV Series (ChuongTrinhTV)
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <Input
                placeholder="Tìm kiếm theo tên hoặc TMDB ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<IoSearch />}
                className="max-w-md"
              />
              <Button
                color="default"
                variant="bordered"
                onClick={() => activeTab === 'movies' ? fetchMovies() : fetchTvSeries()}
                startContent={<IoRefresh />}
              >
                Làm mới
              </Button>
            </div>
            <Button
              color="primary"
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  tmdb_id: '',
                  title: '',
                  year: '',
                  sources: '[]',
                  metadata: '{}'
                });
                setIsModalOpen(true);
              }}
              startContent={<IoAdd />}
            >
              Thêm mới
            </Button>
          </div>

          {/* Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardBody>
              <Table aria-label="Media table">
                <TableHeader>
                  <TableColumn>ID</TableColumn>
                  <TableColumn>TMDB ID</TableColumn>
                  <TableColumn>Tên</TableColumn>
                  <TableColumn>Năm</TableColumn>
                  <TableColumn>Nguồn</TableColumn>
                  <TableColumn>Ngày tạo</TableColumn>
                  <TableColumn>Hành động</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.tmdb_id}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {item.sources?.length || 0} sources
                        </Chip>
                      </TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="bordered"
                            onClick={() => handleEdit(item)}
                            startContent={<IoCreate />}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="bordered"
                            onClick={() => handleDelete(item.id)}
                            startContent={<IoTrash />}
                          >
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          {/* Modal */}
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            size="4xl"
          >
            <ModalContent>
              <ModalHeader>
                <h2>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'movies' ? 'Phim' : 'Chương trình TV'}</h2>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="TMDB ID"
                      type="number"
                      value={formData.tmdb_id}
                      onChange={(e) => setFormData({...formData, tmdb_id: e.target.value})}
                      required
                    />
                    <Input
                      label="Năm"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      required
                    />
                  </div>
                  <Input
                    label="Tên"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                  <Textarea
                    label="Sources (JSON)"
                    value={formData.sources}
                    onChange={(e) => setFormData({...formData, sources: e.target.value})}
                    minRows={5}
                    placeholder='[{"provider": "youtube", "url": "...", "language": "vi"}]'
                  />
                  <Textarea
                    label="Metadata (JSON)"
                    value={formData.metadata}
                    onChange={(e) => setFormData({...formData, metadata: e.target.value})}
                    minRows={5}
                    placeholder='{"genre": ["Action"], "duration": 120}'
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="bordered"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onClick={handleSave}
                  isLoading={loading}
                >
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>
    </AdminGuard>
  );
}
