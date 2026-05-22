'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, UpdateTask } from '@/types/task';
import ContextMenu, { type ContextMenuItem } from './ContextMenu';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: UpdateTask) => void;
  onDelete: (id: string) => void;
  showDatePicker?: boolean;
}

export default function TaskItem({ task, onUpdate, onDelete, showDatePicker = false }: TaskItemProps) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { section: showDatePicker ? 'then' : 'now', task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems: ContextMenuItem[] = [
    {
      label: showDatePicker ? '날짜 지정' : '날짜 변경',
      type: 'date-picker',
      onDateSelect: (date) => onUpdate(task.id, { target_date: date }),
    },
    { label: '삭제', onClick: () => onDelete(task.id), danger: true },
  ];

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 py-2 border-b border-gray-300 last:border-0 cursor-grab active:cursor-grabbing touch-none bg-[#F5F0E8]"
      onContextMenu={handleContextMenu}
    >
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
      )}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.is_completed}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onUpdate(task.id, { is_completed: !task.is_completed })}
        className={`w-4 h-4 flex-shrink-0 border cursor-pointer flex items-center justify-center transition-colors ${
          showDatePicker
            ? task.is_completed
              ? 'bg-[#6B7280] border-[#6B7280]'
              : 'border-[#6B7280] bg-transparent hover:bg-[#6B7280]/10'
            : task.is_completed
              ? 'bg-[#1A1A1A] border-[#1A1A1A]'
              : 'border-[#1A1A1A] bg-transparent hover:bg-[#1A1A1A]/10'
        }`}
      >
        {task.is_completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 font-mono text-sm ${
          task.is_completed ? 'line-through text-gray-500' : 'text-[#1A1A1A]'
        }`}
      >
        {task.title}
      </span>
    </li>
  );
}
