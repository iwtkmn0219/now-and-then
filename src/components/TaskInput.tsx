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
    setValue('');
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    if (!value.trim()) close();
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#1A1A1A]/10">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={isOpen ? close : open}
        className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center font-mono text-xs cursor-pointer transition-all duration-200 ${
          isOpen
            ? 'border-[#1A1A1A] text-[#1A1A1A] rotate-45'
            : 'border-[#1A1A1A]/30 text-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
        }`}
      >
        +
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out flex-1 ${
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
            className="w-full font-mono text-sm bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-[#1A1A1A]/30"
          />
        </form>
      </div>
    </div>
  );
}
