'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type RegularItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

type DatePickerItem = {
  label: string;
  type: 'date-picker';
  onDateSelect: (date: string) => void;
};

export type ContextMenuItem = RegularItem | DatePickerItem;

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeDateItem, setActiveDateItem] = useState<DatePickerItem | null>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date && activeDateItem) {
      activeDateItem.onDateSelect(date);
      onClose();
    }
  };

  return createPortal(
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 bg-[#F5F0E8] border border-[#1A1A1A] min-w-[160px] shadow-md"
    >
      {activeDateItem ? (
        <div className="px-3 py-2 flex flex-col gap-2">
          <span className="font-mono text-xs text-gray-500">{activeDateItem.label}</span>
          <input
            type="date"
            autoFocus
            onChange={handleDateChange}
            className="font-mono text-xs bg-transparent border-b border-[#1A1A1A] focus:outline-none w-full"
          />
        </div>
      ) : (
        items.map((item, i) => {
          if ('type' in item && item.type === 'date-picker') {
            return (
              <button
                key={i}
                onClick={() => setActiveDateItem(item)}
                className="block w-full text-left px-4 py-2 font-mono text-xs text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8] transition-colors"
              >
                {item.label}
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => { item.onClick(); onClose(); }}
              className={`block w-full text-left px-4 py-2 font-mono text-xs transition-colors ${
                item.danger
                  ? 'text-red-500 hover:bg-red-500 hover:text-[#F5F0E8]'
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
              }`}
            >
              {item.label}
            </button>
          );
        })
      )}
    </div>,
    document.body
  );
}
