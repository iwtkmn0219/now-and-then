'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: string;
  onChange: (date: string) => void;
  taskCountByDate?: Record<string, number>;
}

function TaskDots({ count, inverted }: { count: number; inverted: boolean }) {
  const dots = Math.min(count, 3);
  const color = inverted ? 'bg-[#F5F0E8]' : 'bg-[#1A1A1A]';
  return (
    <span className="flex gap-[2px]">
      {Array.from({ length: dots }).map((_, i) => (
        <span key={i} className={`w-[3px] h-[3px] ${color}`} />
      ))}
    </span>
  );
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function Calendar({ selectedDate, onChange, taskCountByDate = {} }: CalendarProps) {
  const selected = parseISO(selectedDate);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected));

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isAlreadyToday = selectedDate === todayStr;

  const goToToday = () => {
    setViewMonth(startOfMonth(new Date()));
    onChange(todayStr);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });

  const startPad = getDay(startOfMonth(viewMonth));

  return (
    <div className="h-full font-mono select-none flex flex-col">
      {/* Month heading */}
      <div className="mb-4">
        <p className="text-4xl font-bold tracking-tight text-[#1A1A1A]">
          {format(viewMonth, 'M월', { locale: ko })}
        </p>
        <p className="text-xs text-gray-400 mt-1 tracking-widest">
          {format(viewMonth, 'yyyy', { locale: ko })}
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="text-gray-400 hover:text-[#1A1A1A] transition-colors text-lg leading-none cursor-pointer"
        >
          ←
        </button>
        <button
          onClick={goToToday}
          disabled={isAlreadyToday}
          className={`text-base tracking-widest uppercase transition-colors ${
            isAlreadyToday
              ? 'text-gray-300 cursor-default'
              : 'text-[#1A1A1A] hover:text-gray-400 cursor-pointer'
          }`}
        >
          today
        </button>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="text-gray-400 hover:text-[#1A1A1A] transition-colors text-lg leading-none cursor-pointer"
        >
          →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div
        className="flex-1 min-h-0 grid grid-cols-7"
        style={{ gridAutoRows: '1fr' }}
      >
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selected);
          const today = isToday(day);
          const count = taskCountByDate[dateStr] ?? 0;

          return (
            <button
              key={dateStr}
              onClick={() => onChange(dateStr)}
              className={`
                w-full h-full relative flex items-center justify-center text-sm transition-colors cursor-pointer
                ${isSelected
                  ? 'bg-[#1A1A1A] text-[#F5F0E8]'
                  : today
                  ? 'border border-[#1A1A1A] text-[#1A1A1A]'
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/10'
                }
              `}
            >
              {format(day, 'd')}
              {count > 0 && (
                <span className="absolute bottom-[3px] right-[3px]">
                  <TaskDots count={count} inverted={isSelected} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}