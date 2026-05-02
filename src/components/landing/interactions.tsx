"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ============ useInView ============ */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
  once = true,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) obs.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ref, inView } as const;
}

/* ============ CountUp ============ */
export function CountUp({
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [val, setVal] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    const tick = (t: number) => {
      if (startedAt.current == null) startedAt.current = t;
      const elapsed = t - startedAt.current;
      const p = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * to);
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [inView, to, duration]);

  const formatted = val.toLocaleString("nl-NL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ============ Typewriter ============ */
export function Typewriter({
  text,
  speedMs = 18,
  startDelayMs = 0,
  className = "",
  onDone,
}: {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
  className?: string;
  onDone?: () => void;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(0);
  const stopped = useRef(false);

  useEffect(() => {
    if (!inView) return;
    stopped.current = false;
    const start = setTimeout(() => {
      let i = 0;
      const step = () => {
        if (stopped.current) return;
        i += 1;
        setShown(i);
        if (i >= text.length) {
          onDone?.();
          return;
        }
        setTimeout(step, speedMs);
      };
      step();
    }, startDelayMs);
    return () => {
      stopped.current = true;
      clearTimeout(start);
    };
  }, [inView, text, speedMs, startDelayMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={ref} className={className}>
      {text.slice(0, shown)}
      {inView && shown < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 pulse-soft" />
      )}
    </span>
  );
}

/* ============ Self-drawing line chart ============ */
export function DrawChart({
  pathD,
  width = 400,
  height = 100,
  duration = 1400,
  delay = 0,
  className = "",
  fillId,
}: {
  pathD: string;
  width?: number;
  height?: number;
  duration?: number;
  delay?: number;
  className?: string;
  fillId?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const pathRef = useRef<SVGPathElement | null>(null);
  const [length, setLength] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pathRef.current) return;
    setLength(pathRef.current.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    if (!inView || length === 0) return;
    let raf: number;
    let started = 0;
    const tick = (t: number) => {
      if (!started) started = t + delay;
      const elapsed = t - started;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, length, duration, delay]);

  const offset = length * (1 - progress);

  return (
    <div ref={ref} className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        {fillId && (
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        {fillId && (
          <path
            d={`${pathD} L${width},${height} L0,${height} Z`}
            fill={`url(#${fillId})`}
            opacity={progress}
          />
        )}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="#f97316"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={length}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
}

/* ============ Cursor glow ============ */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (raf.current == null) {
        raf.current = requestAnimationFrame(loop);
      }
    };
    const loop = () => {
      cur.current.x += (target.current.x - cur.current.x) * 0.15;
      cur.current.y += (target.current.y - cur.current.y) * 0.15;
      if (ref.current) {
        ref.current.style.transform = `translate(${cur.current.x - 200}px, ${cur.current.y - 200}px)`;
      }
      const dx = target.current.x - cur.current.x;
      const dy = target.current.y - cur.current.y;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        raf.current = requestAnimationFrame(loop);
      } else {
        raf.current = null;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden md:block">
      <div
        ref={ref}
        className="absolute w-[400px] h-[400px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

/* ============ Hover tilt (3D card) ============ */
export function TiltCard({
  children,
  className = "",
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg)`;
    },
    [intensity],
  );
  const onLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform =
        "perspective(1000px) rotateY(0deg) rotateX(0deg)";
    }
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

/* ============ Reveal on scroll ============ */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: any;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <As
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </As>
  );
}
