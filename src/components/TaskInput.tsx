'use client';

import { useRef, useState } from 'react';

interface TaskInputProps {
  onAdd: (title: string) => void;
  placeholder?: string;
}

export default function TaskInput({ onAdd, placeholder = '할 일을 입력하세요...' }: TaskInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const close = () => {
    setIsOpen(false);
    setValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) { close(); return; }
    onAdd(trimmed);
    close();
  };

  const handleBlur = () => {
    if (!value.trim()) close();
  };

  return (
    <div className="mt-3 flex items-center gap-2 w-full">
      <div className={`overflow-hidden transition-all duration-500 ease-in-out flex-1 ${
        isOpen ? 'max-w-full opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
      }`}>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Escape' && close()}
            placeholder={placeholder}
            className="w-full font-mono text-sm bg-transparent border-b border-gray-400 focus:border-[#1A1A1A] focus:outline-none py-1 text-[#1A1A1A] placeholder:text-gray-500"
          />
        </form>
      </div>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={isOpen ? close : open}
        className={`w-8 h-8 flex-shrink-0 bg-[#1A1A1A] text-[#F5F0E8] hover:bg-[#3a3a3a] transition-all duration-200 cursor-pointer flex items-center justify-center font-mono text-sm ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        +
      </button>
    </div>
  );
}
