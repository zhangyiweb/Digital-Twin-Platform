import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';

type ResizeOptions = {
  axis: 'x' | 'y';
  initial: number;
  min: number;
  max: number;
  storageKey: string;
  reverse?: boolean;
  percentage?: boolean;
};

export function usePanelResize({ axis, initial, min, max, storageKey, reverse = false, percentage = false }: ResizeOptions) {
  const [size, setSize] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const stored = raw === null ? NaN : Number(raw);
      return Number.isFinite(stored) && stored >= min && stored <= max ? stored : initial;
    } catch {
      return initial;
    }
  });
  const dragRef = useRef<{ pointerId: number; parent: HTMLElement; start: number; size: number } | null>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const handleRef = useRef<HTMLElement | null>(null);

  const constrain = useCallback((next: number, parent: HTMLElement | null) => {
    let upper = max;
    if (axis === 'x' && parent) {
      // Keep room for the opposite panel and at least 160px of canvas.
      const panels = Array.from(parent.children).filter((child) => child.tagName === 'ASIDE');
      const opposite = reverse ? panels[0] : panels[panels.length - 1];
      upper = Math.min(upper, parent.clientWidth - (opposite?.getBoundingClientRect().width ?? 0) - 162);
    }
    const lower = Math.min(min, Math.max(0, upper));
    return Math.min(Math.max(lower, upper), Math.max(lower, next));
  }, [axis, max, min, reverse]);

  const stopDragging = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    document.body.classList.remove('panel-resizing-x', 'panel-resizing-y');
    try { localStorage.setItem(storageKey, String(sizeRef.current)); } catch { /* Storage is optional. */ }
  }, [storageKey]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = (axis === 'x' ? event.clientX : event.clientY) - drag.start;
      const extent = axis === 'x' ? drag.parent.clientWidth : drag.parent.clientHeight;
      if (extent <= 0) return;
      let next = drag.size + delta * (reverse ? -1 : 1) * (percentage ? 100 / extent : 1);
      if (percentage && Math.abs(next - 50) < 1) next = 50;
      const clamped = constrain(Math.round(next * 100) / 100, drag.parent);
      sizeRef.current = clamped;
      setSize(clamped);
    };
    const end = (event: PointerEvent) => {
      if (event.pointerId === dragRef.current?.pointerId) stopDragging();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', stopDragging);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', stopDragging);
      stopDragging();
    };
  }, [axis, constrain, percentage, reverse, stopDragging]);

  const commitSize = useCallback((next: number) => {
    const clamped = constrain(next, handleRef.current?.parentElement ?? null);
    sizeRef.current = clamped;
    setSize(clamped);
    try { localStorage.setItem(storageKey, String(clamped)); } catch { /* Storage is optional. */ }
  }, [constrain, storageKey]);

  // Clamp remembered widths when the window shrinks or a hidden workspace is shown.
  const [parent, setParent] = useState<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLDivElement | null) => {
    handleRef.current = node;
    const nextParent = node?.parentElement ?? null;
    setParent(nextParent);
  }, []);
  useEffect(() => {
    if (!parent || percentage) return;
    const observer = new ResizeObserver(() => {
      if (parent.clientWidth <= 0 || parent.clientHeight <= 0 || dragRef.current) return;
      const clamped = constrain(sizeRef.current, parent);
      if (clamped !== sizeRef.current) {
        sizeRef.current = clamped;
        setSize(clamped);
      }
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [constrain, parent, percentage]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary) return;
    const parent = event.currentTarget.parentElement;
    if (!parent) return;
    event.preventDefault();
    event.currentTarget.focus();
    const panel = reverse ? event.currentTarget.nextElementSibling : event.currentTarget.previousElementSibling;
    const actual = axis === 'x' ? panel?.getBoundingClientRect().width : undefined;
    dragRef.current = {
      pointerId: event.pointerId,
      parent,
      start: axis === 'x' ? event.clientX : event.clientY,
      size: actual ?? sizeRef.current,
    };
    document.body.classList.add(axis === 'x' ? 'panel-resizing-x' : 'panel-resizing-y');
  }, [axis, reverse]);

  const onKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    const negative = axis === 'x' ? 'ArrowLeft' : 'ArrowUp';
    const positive = axis === 'x' ? 'ArrowRight' : 'ArrowDown';
    const step = (percentage ? 1 : 10) * (event.shiftKey ? 5 : 1);
    if (event.key === negative || event.key === positive) {
      event.preventDefault();
      event.stopPropagation();
      commitSize(sizeRef.current + (event.key === positive ? 1 : -1) * (reverse ? -1 : 1) * step);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      event.stopPropagation();
      commitSize(event.key === 'Home' ? min : max);
    }
  }, [axis, commitSize, max, min, percentage, reverse]);

  return { size, handleProps: { ref, onPointerDown, onKeyDown, onDoubleClick: () => commitSize(initial) } };
}
