import { useEffect, useRef } from 'react';

import { getNodeHeight, NODE_WIDTH } from '#/lib/layout/elkLayout';

import type { PointerEvent as ReactPointerEvent } from 'react';

import type { IElkLayoutResult } from '#/lib/layout/interfaces/IElkLayoutResult';

export interface IMinimapViewport {
  screenHeight: number;
  screenWidth: number;
  scale: number;
  x: number;
  y: number;
}

interface IPixiMinimapProps {
  layout: IElkLayoutResult;
  onNavigate: (x: number, y: number) => void;
  theme: 'light' | 'dark';
  viewport: IMinimapViewport;
}

const PADDING = 8;

const getProjection = (layout: IElkLayoutResult, viewport: IMinimapViewport, width: number, height: number) => {
  const viewportLeft = -viewport.x / viewport.scale;
  const viewportTop = -viewport.y / viewport.scale;
  const viewportRight = viewportLeft + viewport.screenWidth / viewport.scale;
  const viewportBottom = viewportTop + viewport.screenHeight / viewport.scale;
  const left = Math.min(0, viewportLeft);
  const top = Math.min(0, viewportTop);
  const right = Math.max(layout.bounds.width, viewportRight);
  const bottom = Math.max(layout.bounds.height, viewportBottom);
  const contentWidth = right - left;
  const contentHeight = bottom - top;
  const scale = Math.min(
    Math.max(1, width - PADDING * 2) / Math.max(1, contentWidth),
    Math.max(1, height - PADDING * 2) / Math.max(1, contentHeight),
  );
  return {
    offsetX: (width - contentWidth * scale) / 2 - left * scale,
    offsetY: (height - contentHeight * scale) / 2 - top * scale,
    scale,
  };
};

export const PixiMinimap = ({ layout, onNavigate, theme, viewport }: IPixiMinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return undefined;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
      const context = canvas.getContext('2d');
      if (context == null) return;
      context.scale(pixelRatio, pixelRatio);
      context.clearRect(0, 0, rect.width, rect.height);

      const styles = getComputedStyle(document.documentElement);
      const nodeColor = styles.getPropertyValue(theme === 'dark' ? '--color-gray-500' : '--color-gray-400').trim();
      const viewportColor = styles.getPropertyValue(theme === 'dark' ? '--color-blue-300' : '--color-blue-600').trim();
      const { offsetX, offsetY, scale } = getProjection(layout, viewport, rect.width, rect.height);

      context.fillStyle = nodeColor;
      for (const node of layout.nodes) {
        context.fillRect(
          offsetX + node.position.x * scale,
          offsetY + node.position.y * scale,
          Math.max(1, NODE_WIDTH * scale),
          Math.max(1, getNodeHeight(node) * scale),
        );
      }

      const viewportLeft = -viewport.x / viewport.scale;
      const viewportTop = -viewport.y / viewport.scale;
      context.strokeStyle = viewportColor;
      context.lineWidth = 1.5;
      context.strokeRect(
        offsetX + viewportLeft * scale,
        offsetY + viewportTop * scale,
        (viewport.screenWidth / viewport.scale) * scale,
        (viewport.screenHeight / viewport.scale) * scale,
      );
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [layout, theme, viewport]);

  const navigate = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { offsetX, offsetY, scale } = getProjection(layout, viewport, rect.width, rect.height);
    onNavigate((event.clientX - rect.left - offsetX) / scale, (event.clientY - rect.top - offsetY) / scale);
  };

  return (
    <canvas
      ref={canvasRef}
      aria-label="Graph minimap"
      className="absolute right-3 bottom-24 z-10 h-20 w-30 touch-none rounded-md border bg-card/90 shadow-lg md:h-24 md:w-36 workspace-wide:bottom-3"
      onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
      onPointerDown={(event) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        navigate(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) navigate(event);
      }}
    />
  );
};
