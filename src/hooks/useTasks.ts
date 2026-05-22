'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Task, NewTask, UpdateTask, DateTaskCount } from '@/types/task';

export function useTasks(selectedDate: string) {
  const [nowTasks, setNowTasks] = useState<Task[]>([]);
  const [thenTasks, setThenTasks] = useState<Task[]>([]);
  const [allPositions, setAllPositions] = useState<number[]>([]);
  const [taskCountByDate, setTaskCountByDate] = useState<Record<string, DateTaskCount>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*');

      if (fetchError) throw fetchError;

      const tasks = data as Task[];
      setNowTasks(
        tasks
          .filter((t) => t.target_date === selectedDate)
          .sort((a, b) => a.position - b.position)
      );
      setThenTasks(
        tasks
          .filter((t) => t.target_date === null)
          .sort((a, b) => b.position - a.position)
      );
      setAllPositions(tasks.map((t) => t.position));

      const countMap: Record<string, DateTaskCount> = {};
      tasks.forEach((t) => {
        if (t.target_date) {
          const prev = countMap[t.target_date] ?? { active: 0, completed: 0 };
          countMap[t.target_date] = t.is_completed
            ? { ...prev, completed: prev.completed + 1 }
            : { ...prev, active: prev.active + 1 };
        }
      });
      setTaskCountByDate(countMap);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('할 일을 불러오는데 실패했어요.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (newTask: NewTask) => {
    try {
      const maxPosition = allPositions.length > 0 ? Math.max(...allPositions) : 0;
      const position = maxPosition + 1;

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([{ ...newTask, is_completed: false, position }])
        .select()
        .single();

      if (insertError) throw insertError;

      const task = data as Task;
      if (task.target_date === selectedDate) {
        setNowTasks((prev) => [...prev, task].sort((a, b) => a.position - b.position));
      } else if (task.target_date === null) {
        setThenTasks((prev) => [task, ...prev].sort((a, b) => b.position - a.position));
      }
      setAllPositions((prev) => [...prev, task.position]);

      if (task.target_date) {
        setTaskCountByDate((prev) => {
          const existing = prev[task.target_date!] ?? { active: 0, completed: 0 };
          return { ...prev, [task.target_date!]: { ...existing, active: existing.active + 1 } };
        });
      }
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('할 일 추가에 실패했어요.');
    }
  };

  const updateTask = async (id: string, updates: UpdateTask) => {
    const prevNow = nowTasks;
    const prevThen = thenTasks;
    const prevCountByDate = taskCountByDate;

    const existing = [...nowTasks, ...thenTasks].find((t) => t.id === id);

    if ('is_completed' in updates && existing?.target_date) {
      const date = existing.target_date;
      const becomingCompleted = updates.is_completed!;
      setTaskCountByDate((prev) => {
        const old = prev[date] ?? { active: 0, completed: 0 };
        return becomingCompleted
          ? { ...prev, [date]: { active: Math.max(0, old.active - 1), completed: old.completed + 1 } }
          : { ...prev, [date]: { active: old.active + 1, completed: Math.max(0, old.completed - 1) } };
      });
    }

    if ('target_date' in updates) {
      const oldDate = existing?.target_date ?? null;
      const newDate = updates.target_date ?? null;
      const field = existing?.is_completed ? 'completed' : 'active';

      if (oldDate !== newDate) {
        setTaskCountByDate((prev) => {
          const next = { ...prev };
          if (oldDate) {
            const old = next[oldDate] ?? { active: 0, completed: 0 };
            const updated = { ...old, [field]: Math.max(0, old[field] - 1) };
            if (updated.active === 0 && updated.completed === 0) delete next[oldDate];
            else next[oldDate] = updated;
          }
          if (newDate) {
            const old = next[newDate] ?? { active: 0, completed: 0 };
            next[newDate] = { ...old, [field]: old[field] + 1 };
          }
          return next;
        });
      }
    }

    setNowTasks((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...updates } : t))
        .filter((t) => t.target_date === selectedDate)
        .sort((a, b) => a.position - b.position)
    );
    setThenTasks((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...updates } : t))
        .filter((t) => t.target_date === null)
        .sort((a, b) => b.position - a.position)
    );

    try {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updated = data as Task;
      if (updated.target_date === selectedDate) {
        setNowTasks((prev) => {
          const exists = prev.find((t) => t.id === id);
          const merged = exists ? prev.map((t) => (t.id === id ? updated : t)) : [...prev, updated];
          return merged.sort((a, b) => a.position - b.position);
        });
        setThenTasks((prev) => prev.filter((t) => t.id !== id));
      } else if (updated.target_date === null) {
        setThenTasks((prev) => {
          const exists = prev.find((t) => t.id === id);
          const merged = exists ? prev.map((t) => (t.id === id ? updated : t)) : [updated, ...prev];
          return merged.sort((a, b) => b.position - a.position);
        });
        setNowTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('할 일 수정에 실패했어요.');
      setNowTasks(prevNow);
      setThenTasks(prevThen);
      setTaskCountByDate(prevCountByDate);
    }
  };

  const deleteTask = async (id: string) => {
    const prevNow = nowTasks;
    const prevThen = thenTasks;
    const prevCountByDate = taskCountByDate;

    const existing = [...nowTasks, ...thenTasks].find((t) => t.id === id);

    setNowTasks((prev) => prev.filter((t) => t.id !== id));
    setThenTasks((prev) => prev.filter((t) => t.id !== id));

    if (existing?.target_date) {
      const date = existing.target_date;
      const field = existing.is_completed ? 'completed' : 'active';
      setTaskCountByDate((prev) => {
        const next = { ...prev };
        const old = next[date] ?? { active: 0, completed: 0 };
        const updated = { ...old, [field]: Math.max(0, old[field] - 1) };
        if (updated.active === 0 && updated.completed === 0) delete next[date];
        else next[date] = updated;
        return next;
      });
    }

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('할 일 삭제에 실패했어요.');
      setNowTasks(prevNow);
      setThenTasks(prevThen);
      setTaskCountByDate(prevCountByDate);
    }
  };

  // Drag-and-drop reorder. newTargetDate가 명시되면 섹션 이동도 함께 처리.
  const reorderTask = async (
    id: string,
    newPosition: number,
    newTargetDate?: string | null
  ) => {
    const prevNow = nowTasks;
    const prevThen = thenTasks;
    const prevCountByDate = taskCountByDate;

    const existing = [...nowTasks, ...thenTasks].find((t) => t.id === id);
    if (!existing) return;

    const oldDate = existing.target_date;
    const targetDate = newTargetDate !== undefined ? newTargetDate : oldDate;
    const sectionChanged = newTargetDate !== undefined && oldDate !== newTargetDate;

    const optimistic: Task = { ...existing, position: newPosition, target_date: targetDate ?? null };

    setNowTasks((prev) => {
      const without = prev.filter((t) => t.id !== id);
      if (optimistic.target_date === selectedDate) {
        return [...without, optimistic].sort((a, b) => a.position - b.position);
      }
      return without;
    });
    setThenTasks((prev) => {
      const without = prev.filter((t) => t.id !== id);
      if (optimistic.target_date === null) {
        return [...without, optimistic].sort((a, b) => b.position - a.position);
      }
      return without;
    });

    if (sectionChanged) {
      const field = existing.is_completed ? 'completed' : 'active';
      setTaskCountByDate((prev) => {
        const next = { ...prev };
        if (oldDate) {
          const old = next[oldDate] ?? { active: 0, completed: 0 };
          const updated = { ...old, [field]: Math.max(0, old[field] - 1) };
          if (updated.active === 0 && updated.completed === 0) delete next[oldDate];
          else next[oldDate] = updated;
        }
        if (targetDate) {
          const old = next[targetDate] ?? { active: 0, completed: 0 };
          next[targetDate] = { ...old, [field]: old[field] + 1 };
        }
        return next;
      });
    }

    try {
      const updates: UpdateTask = { position: newPosition };
      if (sectionChanged) updates.target_date = targetDate ?? null;

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Failed to reorder task:', err);
      setError('순서 변경에 실패했어요.');
      setNowTasks(prevNow);
      setThenTasks(prevThen);
      setTaskCountByDate(prevCountByDate);
    }
  };

  return {
    nowTasks,
    thenTasks,
    taskCountByDate,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    reorderTask,
  };
}
