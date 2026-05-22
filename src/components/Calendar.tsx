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
import type { DateTaskCount } from '@/types/task';

interface CalendarProps {
  selectedDate: string;
  onChange: (date: string) => void;
  taskCountByDate?: Record<string, DateTaskCount>;
}

function buildStairRows(count: number): number[] {
  // [3,2,1] 삼각형을 대각선(↘) 순서로 채움: [1]→[2]→[2,1]→[3,1]→[3,2]→[3,2,1]
  const MAX = [3, 2, 1];
  const rows = [0, 0, 0];
  let remaining = Math.min(count, 6);
  for (let d = 0; d <= 2 && remaining > 0; d++) {
    for (let r = 0; r <= d && remaining > 0; r++) {
      const c = d - r;
      if (r < 3 && c < MAX[r]) { rows[r]++; remaining--; }
    }
  }
  return rows.filter(n => n > 0);
}

function TaskDots({ count, inverted, variant = 'active' }: {
  count: number;
  inverted: boolean;
  variant?: 'active' | 'completed';
}) {
  const color = inverted ? 'bg-[#F5F0E8]' : 'bg-[#1A1A1A]';
  const textColor = inverted ? 'text-[#F5F0E8]' : 'text-[#1A1A1A]';

  // active는 completed의 역순(bottom-right 기준 대칭)
  const rows = variant === 'completed' ? buildStairRows(count) : [...buildStairRows(count)].reverse();
  const overflow = count > 6;
  const isActive = variant === 'active';

  return (
    <span className={`flex flex-col gap-[2px] ${isActive ? 'items-end' : 'items-start'}`}>
      {/* active: 숫자 위, completed: 숫자 아래 */}
      {overflow && isActive && (
        <span className={`font-mono text-[8px] leading-none mb-[3px] ${textColor}`}>{count}</span>
      )}
      {rows.map((n, rowIdx) => (
        <span key={rowIdx} className="flex gap-[2px]">
          {Array.from({ length: n }).map((_, i) => (
            <span key={i} className={`w-[4px] h-[4px] flex-shrink-0 ${color}`} />
          ))}
        </span>
      ))}
      {overflow && !isActive && (
        <span className={`font-mono text-[8px] leading-none mt-[3px] ${textColor}`}>{count}</span>
      )}
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
          const counts = taskCountByDate[dateStr];
          const activeCount = counts?.active ?? 0;
          const completedCount = counts?.completed ?? 0;

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
              {completedCount > 0 && (
                <span className="absolute top-[3px] left-[3px]">
                  <TaskDots count={completedCount} inverted={isSelected} variant="completed" />
                </span>
              )}
              {activeCount > 0 && (
                <span className="absolute bottom-[3px] right-[3px]">
                  <TaskDots count={activeCount} inverted={isSelected} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}