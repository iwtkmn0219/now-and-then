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
        className="flex-1 font-mono text-sm bg-transparent border-b border-gray-400 focus:border-[#1A1A1A] focus:outline-none py-1 text-[#1A1A1A] placeholder:text-gray-500"
      />
      <button
        type="submit"
        className="font-mono text-sm w-8 h-8 bg-[#1A1A1A] text-[#F5F0E8] hover:bg-[#3a3a3a] transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center"
      >
        +
      </button>
    </form>
  );
}
