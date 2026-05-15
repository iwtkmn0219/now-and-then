'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import Calendar from '@/components/Calendar';
import TaskList from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';

export default function Home() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const { nowTasks, thenTasks, taskCountByDate, loading, error, addTask, updateTask, deleteTask } = useTasks(selectedDate);

  const handleAddNow = (title: string) => addTask({ title, target_date: selectedDate });
  const handleAddThen = (title: string) => addTask({ title, target_date: null });

  const formattedDate = format(parseISO(selectedDate), 'M월 d일 (eee)', { locale: ko });

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-mono flex flex-col">

      {/* Header */}
      <header className="px-10 py-5 border-b border-[#1A1A1A]/20 flex items-baseline gap-4">
        <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Now & Then</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Task Manager</p>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-10 mt-4 px-4 py-3 border border-red-300 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 3-column layout */}
      <div className="flex flex-1 divide-x divide-[#1A1A1A]/20 overflow-hidden">

        {/* Left: Calendar */}
        <section className="w-[38%] p-10 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-8">Calendar</p>
          <Calendar selectedDate={selectedDate} onChange={setSelectedDate} taskCountByDate={taskCountByDate} />
        </section>

        {/* Center: Now */}
        <section className="flex-1 p-10 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A] font-bold">Now</h2>
            <p className="text-xs text-gray-600 mt-1">{formattedDate}</p>
          </div>
          {loading ? (
            <p className="text-sm text-gray-600">불러오는 중...</p>
          ) : (
            <TaskList
              tasks={nowTasks}
              onAdd={handleAddNow}
              onUpdate={updateTask}
              onDelete={deleteTask}
              emptyMessage="오늘 할 일이 없어요. Then에서 날짜를 지정해보세요."
              inputPlaceholder="할 일을 추가하세요..."
            />
          )}
        </section>

        {/* Right: Then */}
        <section className="flex-1 p-10 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-[#6B7280] font-bold">Then</h2>
            <p className="text-xs text-gray-600 mt-1">날짜가 정해지지 않은 아이디어</p>
          </div>
          {loading ? (
            <p className="text-sm text-gray-600">불러오는 중...</p>
          ) : (
            <TaskList
              tasks={thenTasks}
              onAdd={handleAddThen}
              onUpdate={updateTask}
              onDelete={deleteTask}
              emptyMessage="보관된 아이디어가 없어요. 자유롭게 추가해보세요."
              showDatePicker
              inputPlaceholder="아이디어를 추가하세요..."
            />
          )}
        </section>

      </div>
    </div>
  );
}