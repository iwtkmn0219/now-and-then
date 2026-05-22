'use client';

import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function ScrollableSection({ children, className = '' }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const update = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const scrollable = scrollHeight > clientHeight;
    setIsScrollable(scrollable);
    if (scrollable) {
      const maxScroll = scrollHeight - clientHeight;
      setScrollPercent(maxScroll > 0 ? scrollTop / maxScroll : 0);
    }
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  // Click or drag on the track to scroll — ink at bottom = scroll start, at top = scroll end
  const handleTrackMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = contentRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const applyScroll = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      const percent = (clientY - rect.top) / rect.height;
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTop = Math.max(0, Math.min(maxScroll, percent * maxScroll));
    };

    applyScroll(e.clientY);

    const onMove = (e: MouseEvent) => applyScroll(e.clientY);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  return (
    <div className={`flex overflow-hidden ${className}`}>
      {/* Content — native scrollbar hidden */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto ink-scroll-content"
      >
        {children}
      </div>

      {/* Barometer-style scrollbar — border fixed, ink level tracks scroll */}
      <div className="w-[5px] flex-shrink-0">
        <div
          ref={trackRef}
          className="w-full border border-[#1A1A1A] overflow-hidden relative h-full"
          style={{ cursor: isScrollable ? 'pointer' : 'default' }}
          onMouseDown={isScrollable ? handleTrackMouseDown : undefined}
        >
          {/* Ink — rises from bottom as scroll increases */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A]"
            style={{
              height: `${(1 - scrollPercent) * 100}%`,
              transition: 'height 120ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
