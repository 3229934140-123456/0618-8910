import React, { useState } from 'react';
import type { FunnelStep, FilterCondition } from '@/types';
import { EVENT_CATALOG } from '@/services/mockData';
import { cn, generateId } from '@/utils/helpers';
import { GripVertical, Plus, Trash2, ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

interface FunnelEditorProps {
  steps: FunnelStep[];
  onChange: (steps: FunnelStep[]) => void;
  error?: string;
}

const FunnelEditor: React.FC<FunnelEditorProps> = ({ steps, onChange, error }) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [filterModal, setFilterModal] = useState<{ stepIndex: number; filters: FilterCondition[] } | null>(null);

  const eventOptions = EVENT_CATALOG.map((e) => ({
    value: e.eventName,
    label: e.eventLabel,
    description: e.category,
  }));

  const handleAddStep = () => {
    const newStep: FunnelStep = {
      id: generateId(),
      name: `步骤 ${steps.length + 1}`,
      eventName: 'page_view_home',
      order: steps.length,
    };
    onChange([...steps, newStep]);
  };

  const handleUpdateStep = (index: number, patch: Partial<FunnelStep>) => {
    const updated = [...steps];
    const selectedEvent = EVENT_CATALOG.find((e) => e.eventName === (patch.eventName || updated[index].eventName));
    updated[index] = {
      ...updated[index],
      ...patch,
      name: patch.eventName ? selectedEvent?.eventLabel || updated[index].name : updated[index].name,
    };
    onChange(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 2) return;
    const filtered = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    onChange(filtered);
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggingIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === idx) return;
    setDragOverIndex(idx);
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === idx) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...steps];
    const [moved] = updated.splice(draggingIndex, 1);
    updated.splice(idx, 0, moved);
    onChange(updated.map((s, i) => ({ ...s, order: i })));
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const openFilterModal = (index: number) => {
    setFilterModal({ stepIndex: index, filters: [...(steps[index].filter || [])] });
  };

  const saveFilters = () => {
    if (!filterModal) return;
    const updated = [...steps];
    updated[filterModal.stepIndex] = {
      ...updated[filterModal.stepIndex],
      filter: filterModal.filters.length > 0 ? filterModal.filters : undefined,
    };
    onChange(updated);
    setFilterModal(null);
  };

  const addFilter = () => {
    if (!filterModal) return;
    setFilterModal({
      ...filterModal,
      filters: [
        ...filterModal.filters,
        { field: 'city', operator: 'eq', value: 'beijing' },
      ],
    });
  };

  const removeFilter = (fIdx: number) => {
    if (!filterModal) return;
    setFilterModal({
      ...filterModal,
      filters: filterModal.filters.filter((_, i) => i !== fIdx),
    });
  };

  const updateFilter = (fIdx: number, patch: Partial<FilterCondition>) => {
    if (!filterModal) return;
    const updated = [...filterModal.filters];
    updated[fIdx] = { ...updated[fIdx], ...patch };
    setFilterModal({ ...filterModal, filters: updated });
  };

  const fieldOptions = [
    { value: 'city', label: '城市' },
    { value: 'channel', label: '来源渠道' },
    { value: 'device', label: '设备类型' },
    { value: 'userLevel', label: '用户等级' },
  ];

  const opOptions = [
    { value: 'eq', label: '等于' },
    { value: 'ne', label: '不等于' },
    { value: 'in', label: '包含' },
    { value: 'contains', label: '包含文字' },
  ];

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={() => {
              setDraggingIndex(null);
              setDragOverIndex(null);
            }}
            className={cn(
              'group relative flex items-center gap-3 p-4 bg-white border rounded-2xl transition-all duration-200',
              'hover:shadow-elevation-1',
              dragOverIndex === idx && draggingIndex !== idx
                ? 'border-orange-400 bg-orange-50/40 -translate-y-0.5'
                : 'border-navy-100',
              draggingIndex === idx ? 'opacity-50 scale-[0.99]' : ''
            )}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 flex items-center justify-center text-sm font-bold text-navy-700 font-display">
              {idx + 1}
            </div>

            <div className="cursor-grab active:cursor-grabbing text-navy-300 hover:text-navy-500 transition-colors p-1 -ml-1">
              <GripVertical size={16} />
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-3 min-w-0">
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-semibold text-navy-500 mb-1.5 tracking-wider uppercase">
                  步骤名称
                </label>
                <input
                  type="text"
                  value={step.name}
                  onChange={(e) => handleUpdateStep(idx, { name: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 transition-all"
                  placeholder="步骤名称"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-semibold text-navy-500 mb-1.5 tracking-wider uppercase">
                  埋点事件
                </label>
                <Select
                  value={step.eventName}
                  options={eventOptions}
                  onChange={(v) => handleUpdateStep(idx, { eventName: v })}
                  searchable
                />
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => openFilterModal(idx)}
                className={cn(
                  'h-9 px-2.5 flex items-center gap-1.5 rounded-xl text-xs font-medium transition-all',
                  step.filter && step.filter.length > 0
                    ? 'bg-violet-50 text-violet-700 border border-violet-100'
                    : 'text-navy-500 hover:bg-navy-50 hover:text-navy-700'
                )}
              >
                <Filter size={14} />
                {step.filter && step.filter.length > 0 ? `${step.filter.length} 条件` : '筛选'}
                <ChevronDown size={12} />
              </button>

              <button
                type="button"
                onClick={() => handleRemoveStep(idx)}
                disabled={steps.length <= 2}
                className={cn(
                  'h-9 w-9 flex items-center justify-center rounded-xl transition-all',
                  steps.length <= 2
                    ? 'text-navy-200 cursor-not-allowed'
                    : 'text-navy-400 hover:text-danger-600 hover:bg-red-50'
                )}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<Plus size={18} />}
          onClick={handleAddStep}
        >
          添加漏斗步骤
        </Button>
      </div>

      {filterModal && (
        <Modal
          open
          onClose={() => setFilterModal(null)}
          title={`${steps[filterModal.stepIndex].name} - 筛选条件`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setFilterModal(null)}>
                取消
              </Button>
              <Button onClick={saveFilters}>保存筛选</Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-navy-500 mb-4">
              设置此步骤的用户属性筛选条件，只有满足条件的用户才会被计入该步骤
            </p>

            {filterModal.filters.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-navy-100 rounded-xl">
                <Filter size={32} className="mx-auto text-navy-300 mb-2" />
                <p className="text-sm text-navy-400">暂无筛选条件，点击下方按钮添加</p>
              </div>
            )}

            {filterModal.filters.map((f, fIdx) => (
              <div
                key={fIdx}
                className="flex items-center gap-2 p-3 bg-navy-50 rounded-xl"
              >
                <Select
                  value={f.field}
                  options={fieldOptions}
                  onChange={(v) => updateFilter(fIdx, { field: v })}
                  size="sm"
                  className="!w-28"
                />
                <Select
                  value={f.operator}
                  options={opOptions}
                  onChange={(v) => updateFilter(fIdx, { operator: v as FilterCondition['operator'] })}
                  size="sm"
                  className="!w-28"
                />
                <input
                  type="text"
                  value={String(f.value)}
                  onChange={(e) => updateFilter(fIdx, { value: e.target.value })}
                  placeholder="输入值"
                  className="flex-1 h-8 px-3 text-sm border border-navy-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-200"
                />
                <button
                  type="button"
                  onClick={() => removeFilter(fIdx)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-navy-400 hover:text-danger-600 hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={addFilter}
              className="mt-2"
            >
              添加条件
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FunnelEditor;
