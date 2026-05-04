'use client';

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
}

export default function TaskList({
  tasks,
  onAdd,
  onUpdate,
  onDelete,
  emptyMessage,
  showDatePicker = false,
  inputPlaceholder,
}: TaskListProps) {
  return (
    <div>
      {tasks.length === 0 ? (
        <p className="font-mono text-sm text-gray-400 py-4">{emptyMessage}</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              showDatePicker={showDatePicker}
            />
          ))}
        </ul>
      )}
      <TaskInput onAdd={onAdd} placeholder={inputPlaceholder} />
    </div>
  );
}
