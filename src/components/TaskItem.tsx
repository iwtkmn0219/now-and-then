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
      <button
        type="button"
        role="checkbox"
        aria-checked={task.is_completed}
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
