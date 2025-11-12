/**
 * Admin Filters Management Page
 * UI to create, view, update, and delete filter rules
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Switch,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab
} from '@heroui/react';
import { Plus, Trash2, Edit, Shield, Code, Eye, Filter } from 'lucide-react';
import type { FilterRule, NetworkFilterRule, CosmeticFilterRule, ScriptletFilterRule } from '@/types/adblock';

export default function FiltersPage() {
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterRule | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [filterType, setFilterType] = useState<'network' | 'cosmetic' | 'scriptlet'>('network');

  useEffect(() => {
    loadFilters();
  }, []);

  async function loadFilters() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/filters');
      const data = await res.json();
      if (data.success) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteFilter(id: string) {
    if (!confirm('Bạn có chắc muốn xóa filter này?')) return;

    try {
      const res = await fetch(`/api/admin/filters?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        setFilters(prev => prev.filter(f => f.id !== id));
        alert('Đã xóa filter thành công!');
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete filter:', error);
      alert('Có lỗi xảy ra khi xóa filter');
    }
  }

  async function toggleFilter(id: string, enabled: boolean) {
    try {
      const filter = filters.find(f => f.id === id);
      if (!filter) return;

      const res = await fetch('/api/admin/filters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filter, enabled })
      });

      const data = await res.json();
      if (data.success) {
        setFilters(prev => prev.map(f => f.id === id ? data.filter : f));
      }
    } catch (error) {
      console.error('Failed to toggle filter:', error);
    }
  }

  function openCreateModal(type: typeof filterType) {
    setFilterType(type);
    setSelectedFilter(null);
    onOpen();
  }

  const networkFilters = filters.filter(f => f.type === 'network');
  const cosmeticFilters = filters.filter(f => f.type === 'cosmetic');
  const scriptletFilters = filters.filter(f => f.type === 'scriptlet');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Filters</h1>
          <p className="text-default-500 mt-2">
            Tổng số: {filters.length} filters - Đang hoạt động: {filters.filter(f => f.enabled).length}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex gap-3">
          <Shield className="w-6 h-6" />
          <div className="flex flex-col">
            <p className="text-md">Ad Blocking System</p>
            <p className="text-small text-default-500">
              Hệ thống chặn quảng cáo dựa trên uBlock Origin và AdGuard
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              color="primary"
              startContent={<Filter />}
              onPress={() => openCreateModal('network')}
              className="h-24"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold">Network Filter</span>
                <span className="text-xs">Chặn request mạng</span>
              </div>
            </Button>
            
            <Button
              color="secondary"
              startContent={<Eye />}
              onPress={() => openCreateModal('cosmetic')}
              className="h-24"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold">Cosmetic Filter</span>
                <span className="text-xs">Ẩn element DOM</span>
              </div>
            </Button>
            
            <Button
              color="success"
              startContent={<Code />}
              onPress={() => openCreateModal('scriptlet')}
              className="h-24"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold">Scriptlet</span>
                <span className="text-xs">Inject blocking script</span>
              </div>
            </Button>
          </div>
        </CardBody>
      </Card>

      <Tabs aria-label="Filter types">
        <Tab key="network" title={`Network (${networkFilters.length})`}>
          <FilterList 
            filters={networkFilters} 
            onDelete={deleteFilter}
            onToggle={toggleFilter}
          />
        </Tab>
        <Tab key="cosmetic" title={`Cosmetic (${cosmeticFilters.length})`}>
          <FilterList 
            filters={cosmeticFilters} 
            onDelete={deleteFilter}
            onToggle={toggleFilter}
          />
        </Tab>
        <Tab key="scriptlet" title={`Scriptlet (${scriptletFilters.length})`}>
          <FilterList 
            filters={scriptletFilters} 
            onDelete={deleteFilter}
            onToggle={toggleFilter}
          />
        </Tab>
      </Tabs>

      <CreateFilterModal
        isOpen={isOpen}
        onClose={onClose}
        filterType={filterType}
        onSuccess={loadFilters}
      />
    </div>
  );
}

function FilterList({ 
  filters, 
  onDelete, 
  onToggle 
}: { 
  filters: FilterRule[];
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  if (filters.length === 0) {
    return (
      <Card className="mt-4">
        <CardBody className="text-center py-10">
          <p className="text-default-500">Chưa có filter nào</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {filters.map(filter => (
        <Card key={filter.id}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Chip
                    size="sm"
                    color={
                      filter.priority === 'high' ? 'danger' :
                      filter.priority === 'medium' ? 'warning' : 'default'
                    }
                  >
                    {filter.priority}
                  </Chip>
                  <Chip size="sm" variant="flat">
                    {filter.type}
                  </Chip>
                  <Chip size="sm" variant="flat" color={filter.action === 'block' ? 'danger' : 'success'}>
                    {filter.action}
                  </Chip>
                </div>
                
                <p className="font-mono text-sm mb-1">{filter.pattern}</p>
                
                {filter.description && (
                  <p className="text-sm text-default-500">{filter.description}</p>
                )}
                
                {filter.domains && filter.domains.length > 0 && (
                  <p className="text-xs text-default-400 mt-1">
                    Domains: {filter.domains.join(', ')}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  size="sm"
                  isSelected={filter.enabled}
                  onValueChange={(enabled) => onToggle(filter.id, enabled)}
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => onDelete(filter.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function CreateFilterModal({ 
  isOpen, 
  onClose, 
  filterType,
  onSuccess 
}: {
  isOpen: boolean;
  onClose: () => void;
  filterType: 'network' | 'cosmetic' | 'scriptlet';
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    pattern: '',
    description: '',
    priority: 'medium',
    action: 'block',
    domains: '',
    isRegex: false,
    // Network specific
    urlPattern: '',
    resourceTypes: '',
    thirdParty: false,
    // Cosmetic specific
    selector: '',
    removeElement: false,
    // Scriptlet specific
    scriptletName: '',
    args: ''
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        type: filterType,
        pattern: formData.pattern,
        description: formData.description,
        priority: formData.priority,
        action: formData.action,
        isRegex: formData.isRegex,
        domains: formData.domains.split(',').map(d => d.trim()).filter(Boolean)
      };

      if (filterType === 'network') {
        payload.urlPattern = formData.urlPattern || formData.pattern;
        payload.resourceTypes = formData.resourceTypes.split(',').map(t => t.trim()).filter(Boolean);
        payload.thirdParty = formData.thirdParty;
      } else if (filterType === 'cosmetic') {
        payload.selector = formData.selector || formData.pattern;
        payload.removeElement = formData.removeElement;
      } else if (filterType === 'scriptlet') {
        payload.scriptletName = formData.scriptletName;
        payload.args = formData.args.split(',').map(a => a.trim()).filter(Boolean);
      }

      const res = await fetch('/api/admin/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Đã tạo filter thành công!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          pattern: '',
          description: '',
          priority: 'medium',
          action: 'block',
          domains: '',
          isRegex: false,
          urlPattern: '',
          resourceTypes: '',
          thirdParty: false,
          selector: '',
          removeElement: false,
          scriptletName: '',
          args: ''
        });
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to create filter:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            Tạo {filterType === 'network' ? 'Network' : filterType === 'cosmetic' ? 'Cosmetic' : 'Scriptlet'} Filter
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Pattern"
                placeholder={
                  filterType === 'network' ? 'pagead2.googlesyndication.com' :
                  filterType === 'cosmetic' ? '.ad-container' :
                  'prevent-fetch'
                }
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                required
              />

              {filterType === 'scriptlet' && (
                <>
                  <Select
                    label="Scriptlet Name"
                    placeholder="Chọn scriptlet"
                    selectedKeys={[formData.scriptletName]}
                    onChange={(e) => setFormData({ ...formData, scriptletName: e.target.value })}
                  >
                    <SelectItem key="prevent-fetch" value="prevent-fetch">prevent-fetch</SelectItem>
                    <SelectItem key="prevent-xhr" value="prevent-xhr">prevent-xhr</SelectItem>
                    <SelectItem key="prevent-setTimeout" value="prevent-setTimeout">prevent-setTimeout</SelectItem>
                    <SelectItem key="abort-on-property-read" value="abort-on-property-read">abort-on-property-read</SelectItem>
                    <SelectItem key="set-constant" value="set-constant">set-constant</SelectItem>
                    <SelectItem key="google-ima3" value="google-ima3">google-ima3</SelectItem>
                  </Select>
                  <Input
                    label="Arguments (phân cách bởi dấu phẩy)"
                    placeholder="pagead2.googlesyndication.com, GET"
                    value={formData.args}
                    onChange={(e) => setFormData({ ...formData, args: e.target.value })}
                  />
                </>
              )}

              <Textarea
                label="Mô tả"
                placeholder="Mô tả filter này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  selectedKeys={[formData.priority]}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <SelectItem key="high" value="high">High</SelectItem>
                  <SelectItem key="medium" value="medium">Medium</SelectItem>
                  <SelectItem key="low" value="low">Low</SelectItem>
                </Select>

                <Select
                  label="Action"
                  selectedKeys={[formData.action]}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                >
                  <SelectItem key="block" value="block">Block</SelectItem>
                  <SelectItem key="allow" value="allow">Allow</SelectItem>
                </Select>
              </div>

              <Input
                label="Domains (tùy chọn, phân cách bởi dấu phẩy)"
                placeholder="example.com, test.com"
                value={formData.domains}
                onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
              />

              <Switch
                isSelected={formData.isRegex}
                onValueChange={(checked) => setFormData({ ...formData, isRegex: checked })}
              >
                Sử dụng Regex
              </Switch>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Hủy
            </Button>
            <Button color="primary" type="submit" isLoading={submitting}>
              Tạo Filter
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
