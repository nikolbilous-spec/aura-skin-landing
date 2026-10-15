import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* 1. Cursor highlight — a white dot (inverts over any background)     */
/*    plus a soft cyan halo that trails behind. Mouse/trackpad only.   */
/* ------------------------------------------------------------------ */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current!;
    const halo = haloRef.current!;
    let x = -100, y = -100, hx = -100, hy = -100, raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      dot.classList.add("is-visible");
      halo.classList.add("is-visible");
      const interactive = (e.target as Element)?.closest?.(
        "a, button, input, label, .bottle, .hero-orb"
      );
      dot.classList.toggle("is-active", Boolean(interactive));
    };
    const onLeave = () => {
      dot.classList.remove("is-visible");
      halo.classList.remove("is-visible");
    };
    const tick = () => {
      hx += (x - hx) * 0.14;
      hy += (y - hy) * 0.14;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      halo.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={haloRef} className="cursor-halo" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Hero orb — bubbles rise from wherever the cursor moves and pop.  */
/* ------------------------------------------------------------------ */
type Bubble = { id: number; x: number; y: number; size: number; dur: number; drift: number; rise: number };

export function BubbleOrb({ src, alt }: { src: string; alt: string }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const lastSpawn = useRef(0);
  const nextId = useRef(0);

  const spawn = useCallback((x: number, y: number, count: number, spread: number) => {
    const fresh: Bubble[] = Array.from({ length: count }, () => ({
      id: nextId.current++,
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread * 0.4,
      size: Math.random() < 0.15 ? 14 + Math.random() * 14 : 3 + Math.random() * 11,
      dur: 2.2 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 30,
      rise: 50 + Math.random() * 110,
    }));
    setBubbles((prev) => [...prev, ...fresh].slice(-45));
  }, []);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const now = performance.now();
    if (now - lastSpawn.current < 65) return;
    lastSpawn.current = now;
    const r = e.currentTarget.getBoundingClientRect();
    spawn(e.clientX - r.left, e.clientY - r.top, Math.random() < 0.4 ? 2 : 1, 26);
  };

  const onEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    spawn(r.width / 2, r.height * 0.82, 7, r.width * 0.5);
  };

  return (
    <div className="hero-orb" onPointerMove={onMove} onPointerEnter={onEnter}>
      <img src={src} alt={alt} />
      <div className="orb-glow" />
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="bubble"
          style={
            {
              left: b.x,
              top: b.y,
              width: b.size,
              height: b.size,
              "--dur": `${b.dur}s`,
              "--drift": `${b.drift}px`,
              "--rise": `${b.rise}px`,
            } as CSSProperties
          }
          onAnimationEnd={() => setBubbles((prev) => prev.filter((p) => p.id !== b.id))}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Count-up stat — counts from 0 when scrolled into view (once).    */
/* ------------------------------------------------------------------ */
export function CountUp({ to, suffix = "%", duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current!;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (prefersReducedMotion()) return setValue(to);
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          setValue(Math.round(to * eased));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <strong ref={ref} aria-label={`${to}${suffix}`}>
      {value}
      {suffix}
    </strong>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Serum bottle — tilts toward the cursor; drag to spin it a full   */
/*    360°. The label wraps around the glass like a real cylinder and  */
/*    a back label appears when it turns away.                         */
/* ------------------------------------------------------------------ */
export function SpinBottle() {
  const bottleRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, lastX: 0 });
  const state = useRef({ angle: 0, vel: 0, yaw: 0, yawTarget: 0, rx: 0, rxTarget: 0, rz: 0, rzTarget: 0 });

  useEffect(() => {
    const el = bottleRef.current!;
    const stage = el.closest(".product-stage") as HTMLElement;
    const reduce = prefersReducedMotion();
    let raf = 0;
    let running = false;

    const onMove = (e: PointerEvent) => {
      const s = state.current;
      const r = stage.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (drag.current.active) {
        const dx = e.clientX - drag.current.lastX;
        drag.current.lastX = e.clientX;
        s.angle += dx * 0.55;
        s.vel = dx * 0.55;
      }
      if (inside || drag.current.active) {
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        s.yawTarget = drag.current.active ? s.yawTarget : nx * 50;
        s.rxTarget = -ny * 28;
        s.rzTarget = -nx * 8;
      } else {
        s.yawTarget = s.rxTarget = s.rzTarget = 0;
      }
    };
    const onUp = () => {
      drag.current.active = false;
      el.classList.remove("is-dragging");
    };

    const render = () => {
      const s = state.current;
      if (!drag.current.active) {
        s.angle += s.vel;
        s.vel *= 0.94;
      }
      const k = reduce ? 1 : 0.08;
      s.yaw += (s.yawTarget - s.yaw) * k;
      s.rx += (s.rxTarget - s.rx) * k;
      s.rz += (s.rzTarget - s.rz) * k;

      const a = ((s.angle + s.yaw) * Math.PI) / 180;
      const sin = Math.sin(a);
      const cos = Math.cos(a);
      el.style.setProperty("--rx", `${s.rx}deg`);
      el.style.setProperty("--rz", `${s.rz}deg`);
      el.style.setProperty("--ry", `${sin * 10}deg`);
      el.style.setProperty("--front-x", `${sin * 46}%`);
      el.style.setProperty("--front-sx", `${Math.max(cos, 0.001)}`);
      el.style.setProperty("--front-o", `${Math.min(Math.max(cos * 3, 0), 1)}`);
      el.style.setProperty("--back-x", `${-sin * 46}%`);
      el.style.setProperty("--back-sx", `${Math.max(-cos, 0.001)}`);
      el.style.setProperty("--back-o", `${Math.min(Math.max(-cos * 3, 0), 1)}`);
      el.style.setProperty("--shine", `${50 + sin * 38}%`);
      raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(render);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(stage);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, lastX: e.clientX };
    state.current.vel = 0;
    e.currentTarget.classList.add("is-dragging");
  };

  return (
    <div className="bottle-wrap">
      <div className="bottle-shadow" />
      <div
        ref={bottleRef}
        className="bottle"
        onPointerDown={onDown}
        role="img"
        aria-label="Aura Formula 01 serum bottle. Drag to spin."
      >
        <div className="bottle-cap" />
        <div className="bottle-shoulder" />
        <div className="bottle-body">
          <div className="bottle-label label-front">
            <span>AURA</span>
            <span className="mono">FORMULA 01</span>
            <strong>THE SERUM</strong>
            <span className="mono">30 ML</span>
          </div>
          <div className="bottle-label label-back" aria-hidden="true">
            <span className="mono">HYDRATE + REPAIR</span>
            <span className="mono back-list">
              ECTOIN + PEPTIDES
              <br />
              TRI-HA COMPLEX
              <br />
              CERAMIDE NP
            </span>
            <span className="mono">AURA LABS™ / NYC</span>
          </div>
        </div>
      </div>
      <span className="bottle-hint mono" aria-hidden="true">DRAG TO SPIN</span>
    </div>
  );
}
