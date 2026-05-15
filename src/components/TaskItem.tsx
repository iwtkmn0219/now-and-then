'use client';

import { useState } from 'react';
import type { Task, UpdateTask } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: UpdateTask) => void;
  onDelete: (id: string) => void;
  showDatePicker?: boolean;
}

export default function TaskItem({ task, onUpdate, onDelete, showDatePicker = false }: TaskItemProps) {
  const [isPickingDate, setIsPickingDate] = useState(false);

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date) {
      onUpdate(task.id, { target_date: date });
      setIsPickingDate(false);
    }
  };

  return (
    <li className="flex items-center gap-3 py-2 group border-b border-gray-300 last:border-0">
      <input
        type="checkbox"
        checked={task.is_completed}
        onChange={(e) => onUpdate(task.id, { is_completed: e.target.checked })}
        className="w-4 h-4 accent-[#1A1A1A] cursor-pointer flex-shrink-0"
      />
      <span
        className={`flex-1 font-mono text-sm ${
          task.is_completed ? 'line-through text-gray-500' : 'text-[#1A1A1A]'
        }`}
      >
        {task.title}
      </span>

      {showDatePicker && (
        <div className="flex items-center gap-1">
          {isPickingDate ? (
            <input
              type="date"
              autoFocus
              onChange={handleDateSelect}
              onBlur={() => setIsPickingDate(false)}
              className="font-mono text-xs bg-transparent border-b border-gray-500 focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsPickingDate(true)}
              className="font-mono text-xs text-gray-600 hover:text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity border border-gray-400 hover:border-[#1A1A1A] px-2 py-0.5 cursor-pointer"
            >
              날짜 지정
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="font-mono text-xs text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1 cursor-pointer"
      >
        ✕
      </button>
    </li>
  );
}
