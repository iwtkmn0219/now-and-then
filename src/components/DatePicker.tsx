'use client';

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ selectedDate, onChange }: DatePickerProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="date-picker" className="text-sm font-mono text-gray-500 uppercase tracking-widest">
        Date
      </label>
      <input
        id="date-picker"
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-lg bg-transparent border-b border-[#1A1A1A] focus:outline-none cursor-pointer"
      />
    </div>
  );
}
