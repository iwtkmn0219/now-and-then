'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Calendar from '@/components/Calendar';
import TaskList from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';
import type { Task } from '@/types/task';

export default function Home() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const { nowTasks, thenTasks, taskCountByDate, loading, error, addTask, updateTask, deleteTask, reorderTask } = useTasks(selectedDate);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAddNow = (title: string) => addTask({ title, target_date: selectedDate });
  const handleAddThen = (title: string) => addTask({ title, target_date: null });

  const formattedDate = format(parseISO(selectedDate), 'M월 d일 (eee)', { locale: ko });

  const findTaskSection = (id: string): 'now' | 'then' | null => {
    if (nowTasks.some((t) => t.id === id)) return 'now';
    if (thenTasks.some((t) => t.id === id)) return 'then';
    return null;
  };

  const computePosition = (
    list: Task[],
    insertIdx: number,
    sortDir: 'asc' | 'desc'
  ): number => {
    const prev = list[insertIdx - 1];
    const next = list[insertIdx];
    const delta = sortDir === 'asc' ? 1 : -1;

    if (prev && next) return (prev.position + next.position) / 2;
    if (prev) return prev.position + delta;
    if (next) return next.position - delta;
    return Date.now() / 1000;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromSection = findTaskSection(String(active.id));
    if (!fromSection) return;

    const overIdStr = String(over.id);
    const overData = over.data.current as { section?: 'now' | 'then'; isContainer?: boolean } | undefined;

    let toSection: 'now' | 'then';
    let overTaskId: string | null = null;

    if (overData?.isContainer && overData.section) {
      toSection = overData.section;
    } else {
      const overTaskSection = findTaskSection(overIdStr);
      if (!overTaskSection) return;
      toSection = overTaskSection;
      overTaskId = overIdStr;
    }

    const sameSection = fromSection === toSection;
    const sortDir: 'asc' | 'desc' = toSection === 'now' ? 'asc' : 'desc';
    const newTargetDate: string | null | undefined = sameSection
      ? undefined
      : toSection === 'now'
        ? selectedDate
        : null;

    let newPosition: number;

    if (sameSection) {
      const list = fromSection === 'now' ? nowTasks : thenTasks;
      const oldIdx = list.findIndex((t) => t.id === active.id);
      const newIdx = overTaskId ? list.findIndex((t) => t.id === overTaskId) : list.length - 1;
      if (oldIdx === -1 || newIdx === -1) return;

      const reordered = arrayMove(list, oldIdx, newIdx);
      const movedIdx = reordered.findIndex((t) => t.id === active.id);
      const prev = reordered[movedIdx - 1];
      const next = reordered[movedIdx + 1];

      if (prev && next) newPosition = (prev.position + next.position) / 2;
      else if (prev) newPosition = prev.position + (sortDir === 'asc' ? 1 : -1);
      else if (next) newPosition = next.position - (sortDir === 'asc' ? 1 : -1);
      else return;
    } else {
      const destList = toSection === 'now' ? nowTasks : thenTasks;
      const insertIdx = overTaskId
        ? destList.findIndex((t) => t.id === overTaskId)
        : destList.length;
      newPosition = computePosition(destList, insertIdx, sortDir);
    }

    reorderTask(String(active.id), newPosition, newTargetDate);
  };

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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
                sectionId="now"
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
                sectionId="then"
              />
            )}
          </section>

        </div>
      </DndContext>
    </div>
  );
}
