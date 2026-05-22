'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Task, UpdateTask } from '@/types/task';
import TaskItem from './TaskItem';
import TaskInput from './TaskInput';

interface TaskListProps {
  tasks: Task[];
  onAdd: (title: string) => void;
  onUpdate: (id: string, updates: UpdateTask) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
  showDatePicker?: boolean;
  inputPlaceholder?: string;
  sectionId: 'now' | 'then';
}

export default function TaskList({
  tasks,
  onAdd,
  onUpdate,
  onDelete,
  emptyMessage,
  showDatePicker = false,
  inputPlaceholder,
  sectionId,
}: TaskListProps) {
  const activeTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  const { setNodeRef } = useDroppable({
    id: `${sectionId}-section`,
    data: { section: sectionId, isContainer: true },
  });

  const allIds = [...activeTasks, ...completedTasks].map((t) => t.id);

  return (
    <div ref={setNodeRef}>
      <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
        {tasks.length === 0 ? (
          <div className="min-h-[80px]">
            <p className="font-mono text-sm text-gray-600 py-4">{emptyMessage}</p>
          </div>
        ) : (
          activeTasks.length > 0 && (
            <ul className="min-h-[20px]">
              {activeTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  showDatePicker={showDatePicker}
                />
              ))}
            </ul>
          )
        )}
        <TaskInput onAdd={onAdd} placeholder={inputPlaceholder} />
        {completedTasks.length > 0 && (
          <>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 border-t border-gray-300" />
              <span className="font-mono text-xs text-gray-400">완료 {completedTasks.length}</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>
            <ul>
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  showDatePicker={showDatePicker}
                />
              ))}
            </ul>
          </>
        )}
      </SortableContext>
    </div>
  );
}
