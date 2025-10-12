import { useCallback, useEffect, useRef, useState } from 'react';

import { GripVertical } from 'lucide-react';
import { tv } from 'tailwind-variants';

import { useAppStore } from '#/stores/appStore';

interface IResizerProps {
  orientation: 'horizontal' | 'vertical';
}

const variants = tv({
  variants: {
    dividerContainer: {
      vertical: [
        'md:flex',
        'w-4',
        'bg-transparent',
        'cursor-col-resize',
        'items-center',
        'justify-center',
        'transition-colors',
        'group',
        'relative',
        'z-[500]',
      ].join(' '),
      horizontal: [
        'flex',
        'md:hidden',
        'h-4',
        'bg-transparent',
        'cursor-row-resize',
        'items-center',
        'justify-center',
        'transition-colors',
        'group',
        'relative',
        'z-[500]',
      ].join(' '),
    },
    dividerHandle: {
      vertical: [
        'absolute',
        'w-8',
        'h-8',
        'rounded-full',
        'bg-background',
        'border-2',
        'border-border',
        'group-hover:border-primary',
        'flex',
        'items-center',
        'justify-center',
        'shadow-lg',
        'transition-all',
        'group-hover:scale-110',
        'pointer-events-none',
      ].join(' '),

      horizontal: [
        'absolute',
        'w-8',
        'h-8',
        'rounded-full',
        'bg-background',
        'border-2',
        'border-border',
        'group-hover:border-primary',
        'flex',
        'items-center',
        'justify-center',
        'shadow-lg',
        'transition-all',
        'group-hover:scale-110',
        'pointer-events-none',
      ].join(' '),
    },
  },
});

export const Resizer = ({ orientation }: IResizerProps) => {
  const { setEditorWidthPercent, setEditorHeightPercent } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (orientation === 'vertical') {
        // Desktop: adjust width
        const percent = Math.floor(((clientX - rect.left) / rect.width) * 100);
        setEditorWidthPercent(percent);
      } else {
        // Mobile: adjust height
        const percent = Math.floor(((clientY - rect.top) / rect.height) * 100);
        setEditorHeightPercent(percent);
      }
    },
    [isDragging, orientation, setEditorWidthPercent, setEditorHeightPercent],
  );

  const handleEnd = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMovePassive = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        handleMove(e as MouseEvent | TouchEvent);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMovePassive, { passive: false });
      document.addEventListener('touchend', handleEnd, { passive: false });
      document.body.style.cursor = orientation === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMovePassive);
        document.removeEventListener('touchend', handleEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';
      };
    }

    return () => {};
  }, [isDragging, handleMove, handleEnd, orientation]);

  // Single resizer that handles both orientations
  if (orientation === 'vertical') {
    // Desktop: vertical divider
    return (
      <button
        ref={containerRef}
        className={variants({ dividerContainer: 'vertical' })}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        type="button"
      >
        <div className={variants({ dividerHandle: 'vertical' })}>
          <GripVertical className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </button>
    );
  }

  // Mobile: horizontal divider
  return (
    <button
      ref={containerRef}
      className={variants({ dividerContainer: 'horizontal' })}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      type="button"
    >
      <div className={variants({ dividerHandle: 'horizontal' })}>
        <GripVertical className="h-5 w-5 rotate-90 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
};
