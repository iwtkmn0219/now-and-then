'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Task, NewTask, UpdateTask } from '@/types/task';

export function useTasks(selectedDate: string) {
  const [nowTasks, setNowTasks] = useState<Task[]>([]);
  const [thenTasks, setThenTasks] = useState<Task[]>([]);
  const [taskCountByDate, setTaskCountByDate] = useState<Record<string, number>>({});
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
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
      );
      setThenTasks(
        tasks
          .filter((t) => t.target_date === null)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
      );

      const countMap: Record<string, number> = {};
      tasks.forEach((t) => {
        if (t.target_date) {
          countMap[t.target_date] = (countMap[t.target_date] ?? 0) + 1;
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
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([{ ...newTask, is_completed: false }])
        .select()
        .single();

      if (insertError) throw insertError;

      const task = data as Task;
      if (task.target_date === selectedDate) {
        setNowTasks((prev) => [...prev, task]);
      } else if (task.target_date === null) {
        setThenTasks((prev) => [task, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('할 일 추가에 실패했어요.');
    }
  };

  const updateTask = async (id: string, updates: UpdateTask) => {
    const prevNow = nowTasks;
    const prevThen = thenTasks;

    // Optimistic update
    setNowTasks((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...updates } : t))
        .filter((t) => t.target_date === selectedDate)
    );
    setThenTasks((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...updates } : t))
        .filter((t) => t.target_date === null)
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
          return exists ? prev.map((t) => (t.id === id ? updated : t)) : [...prev, updated];
        });
        setThenTasks((prev) => prev.filter((t) => t.id !== id));
      } else if (updated.target_date === null) {
        setThenTasks((prev) => {
          const exists = prev.find((t) => t.id === id);
          return exists ? prev.map((t) => (t.id === id ? updated : t)) : [updated, ...prev];
        });
        setNowTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('할 일 수정에 실패했어요.');
      setNowTasks(prevNow);
      setThenTasks(prevThen);
    }
  };

  const deleteTask = async (id: string) => {
    const prevNow = nowTasks;
    const prevThen = thenTasks;

    setNowTasks((prev) => prev.filter((t) => t.id !== id));
    setThenTasks((prev) => prev.filter((t) => t.id !== id));

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
    }
  };

  return { nowTasks, thenTasks, taskCountByDate, loading, error, addTask, updateTask, deleteTask };
}
