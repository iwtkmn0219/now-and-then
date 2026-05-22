'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';

type RegularItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  type?: undefined;
};

type DatePickerItem = {
  label: string;
  type: 'date-picker';
  onDateSelect: (date: string) => void;
};

export type ContextMenuItem = RegularItem | DatePickerItem;

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function MiniCalendar({ item, onClose }: { item: DatePickerItem; onClose: () => void }) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });
  const startPad = getDay(startOfMonth(viewMonth));

  return (
    <div className="p-3 font-mono select-none w-52">
      {/* Label */}
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">{item.label}</p>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="text-gray-400 hover:text-[#1A1A1A] transition-colors cursor-pointer leading-none"
        >
          ←
        </button>
        <span className="text-xs tracking-widest text-[#1A1A1A]">
          {format(viewMonth, 'yyyy. M', { locale: ko })}
        </span>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="text-gray-400 hover:text-[#1A1A1A] transition-colors cursor-pointer leading-none"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const today = isToday(day);
          return (
            <button
              key={dateStr}
              onClick={() => { item.onDateSelect(dateStr); onClose(); }}
              className={`aspect-square flex items-center justify-center text-xs transition-colors cursor-pointer ${
                today
                  ? 'border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/10'
              }`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeDateItem, setActiveDateItem] = useState<DatePickerItem | null>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 bg-[#F5F0E8] border border-[#1A1A1A]"
    >
      {activeDateItem ? (
        <MiniCalendar item={activeDateItem} onClose={onClose} />
      ) : (
        items.map((item, i) => {
          if (item.type === 'date-picker') {
            return (
              <button
                key={i}
                onClick={() => setActiveDateItem(item)}
                className="block w-full text-left px-4 py-2 font-mono text-xs text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors"
              >
                {item.label}
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => { item.onClick(); onClose(); }}
              className={`block w-full text-left px-4 py-2 font-mono text-xs transition-colors ${
                item.danger
                  ? 'text-red-500 hover:bg-red-500 hover:text-[#F5F0E8]'
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/10'
              }`}
            >
              {item.label}
            </button>
          );
        })
      )}
    </div>,
    document.body
  );
}
