"use client";

import { useRef, useState } from "react";

/**
 * Side-by-side photo compare slider.
 * Drag the handle to morph between "before" (left) and "after" (right).
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Vorige",
  afterLabel = "Nu",
  alt = "progress",
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onMouseMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => {
        dragging.current = true;
        setFromClientX(e.touches[0].clientX);
      }}
      onTouchMove={(e) => {
        if (dragging.current) setFromClientX(e.touches[0].clientX);
      }}
      onTouchEnd={() => (dragging.current = false)}
      className="relative w-full aspect-[3/4] bg-stone-900 rounded-md overflow-hidden select-none cursor-ew-resize"
    >
      {/* before (full bleed) */}
      <img
        src={before}
        alt={`${alt} ${beforeLabel}`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* after (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${pos}%` }}
      >
        <img
          src={after}
          alt={`${alt} ${afterLabel}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${(100 / pos) * 100}%`, maxWidth: "none" }}
          draggable={false}
        />
      </div>
      {/* labels */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
        {afterLabel}
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
        {beforeLabel}
      </div>
      {/* handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-orange-500 pointer-events-none"
        style={{ left: `${pos}%` }}
      />
      <div
        className="absolute top-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full bg-orange-500 border-2 border-white pointer-events-none flex items-center justify-center"
        style={{ left: `${pos}%` }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l-3 4 3 4M11 3l3 4-3 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
