'use client';

import { useState } from 'react';

interface TaskInputProps {
  onAdd: (title: string) => void;
  placeholder?: string;
}

export default function TaskInput({ onAdd, placeholder = '할 일을 입력하세요...' }: TaskInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 font-mono text-sm bg-transparent border-b border-gray-400 focus:border-[#1A1A1A] focus:outline-none py-1 placeholder:text-gray-500"
      />
      <button
        type="submit"
        className="font-mono text-sm px-3 py-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8] transition-colors"
      >
        +
      </button>
    </form>
  );
}
