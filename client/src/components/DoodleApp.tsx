import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrayMenu } from '@/components/TrayMenu';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useLocalStorage from '@/hooks/useLocalStorage';
import { usePreventBackExit } from '@/hooks/usePreventBackExit';
import { getSharedAudioContext } from '../lib/sharedAudioContext';

// ----- Soft synth pop for control taps (shared AudioContext, same recipe as playVocabTapPop) -----
const playControlPop = () => {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
};

// ----- Vanishing-ink timing: points are fully opaque, then fade tail-first like a comet -----
const FADE_START_MS = 2600;
const FADE_END_MS = 4600;
const MAX_STROKES = 1500;
const MIN_POINT_DISTANCE = 1.5;

const TRACE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

const SOLID_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#38bdf8', '#8b5cf6'];
const STROKE_SIZES = [6, 14, 26];

// The global index.css "transition: all 1000ms" rule on button/div/span would
// make selection rings (box-shadow) crawl in over a full second — override
// with explicit fast transitions. Transform is deliberately excluded so it
// never fights framer-motion's whileTap.
const CONTROL_TRANSITION =
  'box-shadow 150ms ease-out, background-color 150ms ease-out, opacity 200ms ease-out, filter 200ms ease-out';

interface DoodlePoint {
  x: number;
  y: number;
}

interface DoodleStroke {
  points: DoodlePoint[];
  color: string; // 'rainbow' or a css color
  size: number;
  seed: number;
  /** When the finger lifted — the fade countdown starts from HERE, so a stroke
   *  stays fully drawn until it's finished. null while the finger is still down. */
  endedAt: number | null;
}

// A whole stroke fades as one unit, and only after the finger has lifted: it
// stays fully opaque while being drawn (endedAt null) and for FADE_START_MS
// after release, then fades out by FADE_END_MS.
const strokeAlpha = (s: DoodleStroke, now: number): number => {
  if (s.endedAt == null) return 1;
  const age = now - s.endedAt;
  if (age < FADE_START_MS) return 1;
  if (age >= FADE_END_MS) return 0;
  return 1 - (age - FADE_START_MS) / (FADE_END_MS - FADE_START_MS);
};

const segmentColor = (s: DoodleStroke, i: number): string =>
  s.color === 'rainbow' ? `hsl(${(s.seed + i * 5) % 360}, 90%, 55%)` : s.color;

// Smooth stroke rendering: quadratic curves through the midpoints of the
// sampled polyline, drawn per-segment so each segment can carry its own
// rainbow hue and its own fade alpha (min of its two points' alphas).
const drawStroke = (
  ctx: CanvasRenderingContext2D,
  s: DoodleStroke,
  now: number,
  vanishing: boolean,
) => {
  const pts = s.points;
  const n = pts.length;
  if (n === 0) return;
  // One fade value for the whole stroke (see strokeAlpha).
  const a = vanishing ? strokeAlpha(s, now) : 1;
  if (a <= 0.004) return;
  ctx.globalAlpha = a;
  ctx.lineWidth = s.size;

  if (n === 1) {
    ctx.fillStyle = segmentColor(s, 0);
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, s.size / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  for (let i = 1; i < n; i++) {
    const sx = i === 1 ? pts[0].x : (pts[i - 1].x + pts[i].x) / 2;
    const sy = i === 1 ? pts[0].y : (pts[i - 1].y + pts[i].y) / 2;
    const ex = i === n - 1 ? pts[i].x : (pts[i].x + pts[i + 1].x) / 2;
    const ey = i === n - 1 ? pts[i].y : (pts[i].y + pts[i + 1].y) / 2;
    ctx.strokeStyle = segmentColor(s, i);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, ex, ey);
    ctx.stroke();
  }
};

// Paint a single dot the instant a finger touches down.
const paintDot = (ctx: CanvasRenderingContext2D, s: DoodleStroke, p: DoodlePoint) => {
  ctx.globalAlpha = 1;
  ctx.fillStyle = segmentColor(s, 0);
  ctx.beginPath();
  ctx.arc(p.x, p.y, s.size / 2, 0, Math.PI * 2);
  ctx.fill();
};

// Paint one fresh segment synchronously as the finger moves — this is what
// keeps the ink glued to the fingertip. Straight line (not the smoothed
// quadratic) so it lands with zero latency; the vanish loop's full redraw
// (when active) repaints it smoothly a frame later.
const paintLiveSegment = (
  ctx: CanvasRenderingContext2D,
  s: DoodleStroke,
  from: DoodlePoint,
  to: DoodlePoint,
  segIndex: number,
) => {
  ctx.globalAlpha = 1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = s.size;
  ctx.strokeStyle = segmentColor(s, segIndex);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
};

const DoodleApp = () => {
  usePreventBackExit();

  const { speak, stop, preferredVoice } = useSpeechSynthesis();
  // Latest voice without retriggering callbacks when voices load
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  voiceRef.current = preferredVoice ?? null;

  const [color, setColor] = useLocalStorage<string>('doodleColor', 'rainbow');
  const [size, setSize] = useLocalStorage<number>('doodleSize', 14);
  const [vanish, setVanish] = useLocalStorage<boolean>('doodleVanish', true);
  const [traceChar, setTraceChar] = useState<string | null>(null);

  // Mirrors for the rAF loop and pointer handlers (which must not re-bind per render)
  const colorRef = useRef(color);
  colorRef.current = color;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const traceCharRef = useRef<string | null>(traceChar);
  traceCharRef.current = traceChar;
  const vanishRef = useRef(vanish);
  const lastPickRef = useRef<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null); // cached 2D context
  const rectRef = useRef({ left: 0, top: 0 }); // cached canvas offset (avoids getBoundingClientRect per move)
  const viewRef = useRef({ w: 0, h: 0 }); // CSS-pixel viewport size
  const strokesRef = useRef<DoodleStroke[]>([]);
  const activeRef = useRef(new Map<number, DoodleStroke>()); // pointerId -> in-flight stroke (multi-touch)
  const rafRef = useRef<number | null>(null);

  // Huge faint tracing glyph, drawn straight onto the canvas UNDER the ink
  // each frame. Letters render as an Aa pair (like the phonics page), digits
  // render alone. Scales down if a wide pair (e.g. "Ww") would overflow.
  const drawGlyph = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const ch = traceCharRef.current;
    if (!ch) return;
    const isLetter = ch >= 'A' && ch <= 'Z';
    const lower = ch.toLowerCase();

    const measure = (base: number) => {
      const upperFont = `900 ${base}px Nunito, sans-serif`;
      const lowerFont = `900 ${base * 0.72}px Nunito, sans-serif`;
      ctx.font = upperFont;
      const mUpper = ctx.measureText(ch);
      let totalW = mUpper.width;
      let ascent = mUpper.actualBoundingBoxAscent ?? base * 0.72;
      let descent = mUpper.actualBoundingBoxDescent ?? 0;
      const gap = base * 0.08;
      let lowerW = 0;
      if (isLetter) {
        ctx.font = lowerFont;
        const mLower = ctx.measureText(lower);
        lowerW = mLower.width;
        totalW += gap + lowerW;
        ascent = Math.max(ascent, mLower.actualBoundingBoxAscent ?? base * 0.5);
        descent = Math.max(descent, mLower.actualBoundingBoxDescent ?? 0);
      }
      return { upperFont, lowerFont, upperW: mUpper.width, lowerW, gap, totalW, ascent, descent };
    };

    ctx.save();
    let base = Math.min(w, h) * 0.62;
    let m = measure(base);
    if (m.totalW > w * 0.92) {
      base *= (w * 0.92) / m.totalW;
      m = measure(base);
    }

    const x = (w - m.totalW) / 2;
    const baselineY = h / 2 + (m.ascent - m.descent) / 2;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = m.upperFont;
    ctx.fillText(ch, x, baselineY);
    if (isLetter) {
      ctx.font = m.lowerFont;
      ctx.fillText(lower, x + m.upperW + m.gap, baselineY);
    }
    ctx.restore();
  }, []);

  // Full redraw: clear, trace glyph, then strokes (with vanish aging + culling).
  const render = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { w, h } = viewRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      drawGlyph(ctx, w, h);

      const isVanishing = vanishRef.current;
      const strokes = strokesRef.current;

      if (isVanishing && strokes.length > 0) {
        // Remove strokes that have fully faded out. A stroke still being drawn
        // (endedAt null) has no fade clock yet, so it's never culled.
        for (let i = strokes.length - 1; i >= 0; i--) {
          const s = strokes[i];
          if (s.endedAt != null && now - s.endedAt >= FADE_END_MS) {
            strokes.splice(i, 1);
          }
        }
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const s of strokes) drawStroke(ctx, s, now, isVanishing);
      ctx.globalAlpha = 1;
    },
    [drawGlyph],
  );

  // rAF full-redraw loop runs ONLY to age vanishing ink. Live drawing does NOT
  // depend on it: each new segment is painted synchronously in the pointer
  // handler (see handlePointerMove), so the line stays glued to the finger
  // even if a full redraw would drop frames. With vanish OFF there is no loop
  // at all — pure incremental painting, zero per-frame cost.
  const loop = useCallback(
    function loopFn() {
      rafRef.current = null;
      render(performance.now());
      if (vanishRef.current && strokesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(loopFn);
      }
    },
    [render],
  );

  const scheduleFrame = useCallback(() => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  // DPR-aware resize that never loses strokes: stroke geometry lives in
  // CSS-pixel state, so we just rescale the backing store and redraw.
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    viewRef.current = { w, h };
    const box = canvas.getBoundingClientRect();
    rectRef.current = { left: box.left, top: box.top };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(performance.now());
  }, [render]);

  // ----- Drawing pointer handlers (multi-touch: one stroke per pointerId) -----
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}
      // Refresh the cached offset once per touch-down (cheap here, never per-move)
      const box = canvas.getBoundingClientRect();
      rectRef.current = { left: box.left, top: box.top };
      const p = { x: e.clientX - box.left, y: e.clientY - box.top };
      const stroke: DoodleStroke = {
        points: [p],
        color: colorRef.current,
        size: sizeRef.current,
        seed: Math.floor(Math.random() * 360),
        endedAt: null, // still drawing — fade clock starts on pointer-up
      };
      strokesRef.current.push(stroke);
      if (strokesRef.current.length > MAX_STROKES) {
        // Evict the oldest stroke nobody is still drawing — shifting blindly
        // could orphan a stroke a held finger keeps appending to invisibly.
        const active = new Set(activeRef.current.values());
        const idx = strokesRef.current.findIndex((s) => !active.has(s));
        if (idx !== -1) strokesRef.current.splice(idx, 1);
      }
      activeRef.current.set(e.pointerId, stroke);
      // Paint the starting dot immediately (no waiting for a frame)
      const ctx = ctxRef.current;
      if (ctx) paintDot(ctx, stroke, p);
      // Only the vanish loop needs a rAF; plain drawing is fully incremental
      if (vanishRef.current) scheduleFrame();
    },
    [scheduleFrame],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = activeRef.current.get(e.pointerId);
    if (!stroke) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    const { left, top } = rectRef.current;
    // Coalesced events keep fast toddler scribbles smooth where supported
    const native = e.nativeEvent;
    const events =
      typeof native.getCoalescedEvents === 'function' && native.getCoalescedEvents().length > 0
        ? native.getCoalescedEvents()
        : [native];
    for (const ev of events) {
      const x = ev.clientX - left;
      const y = ev.clientY - top;
      const last = stroke.points[stroke.points.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) < MIN_POINT_DISTANCE) continue;
      const point = { x, y };
      stroke.points.push(point);
      // Draw the new segment RIGHT NOW so the line tracks the fingertip
      if (ctx && last) paintLiveSegment(ctx, stroke, last, point, stroke.points.length - 1);
    }
  }, []);

  const handlePointerEnd = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const stroke = activeRef.current.get(e.pointerId);
      if (!stroke) return;
      activeRef.current.delete(e.pointerId);
      // Finger lifted → NOW the fade countdown for this stroke begins.
      stroke.endedAt = performance.now();
      try {
        canvasRef.current?.releasePointerCapture(e.pointerId);
      } catch (err) {}
      // Vanish mode ages it via the loop; plain mode leaves the ink as-is
      if (vanishRef.current) scheduleFrame();
    },
    [scheduleFrame],
  );

  // ----- Control actions -----
  const clearAll = useCallback(() => {
    // Fingers still on the glass keep painting seamlessly: each active
    // pointer gets a fresh stroke continuing from its current position.
    const now = performance.now();
    const fresh: DoodleStroke[] = [];
    const replacements = new Map<number, DoodleStroke>();
    activeRef.current.forEach((old, pointerId) => {
      const last = old.points[old.points.length - 1];
      const restart: DoodleStroke = {
        points: last ? [{ x: last.x, y: last.y }] : [],
        color: old.color,
        size: old.size,
        seed: old.seed,
        endedAt: null, // still being drawn
      };
      replacements.set(pointerId, restart);
      fresh.push(restart);
    });
    strokesRef.current = fresh;
    activeRef.current = replacements;
    // Wipe the canvas RIGHT NOW (synchronous) rather than waiting for a rAF —
    // clearing should feel instant, and a backgrounded tab's rAF may not fire.
    render(now);
    if (vanishRef.current) scheduleFrame();
  }, [render, scheduleFrame]);

  const toggleVanish = useCallback(() => {
    setVanish((prev) => !prev);
  }, [setVanish]);

  const pickTraceChar = useCallback(() => {
    // Fresh page for a fresh letter — wipe the old doodle so the new
    // glyph isn't buried under previous scribbles
    clearAll();
    let next = TRACE_CHARS[Math.floor(Math.random() * TRACE_CHARS.length)];
    while (next === lastPickRef.current) {
      next = TRACE_CHARS[Math.floor(Math.random() * TRACE_CHARS.length)];
    }
    lastPickRef.current = next;
    setTraceChar(next);
    stop();
    speak(next === 'Z' ? 'Zee' : next, { voice: voiceRef.current });
  }, [clearAll, speak, stop]);

  const hideTrace = useCallback(() => {
    stop();
    setTraceChar(null);
  }, [stop]);

  // Trace glyph changed — repaint the static frame (the loop may be idle)
  useEffect(() => {
    scheduleFrame();
  }, [traceChar, scheduleFrame]);

  // Vanish toggled: when turned back ON, restart the fade clock on every
  // already-finished stroke so nothing pops out the instant aging resumes.
  // Strokes still being drawn (endedAt null) keep waiting for their release.
  useEffect(() => {
    const was = vanishRef.current;
    vanishRef.current = vanish;
    if (vanish && !was) {
      const now = performance.now();
      for (const s of strokesRef.current) {
        if (s.endedAt != null) s.endedAt = now;
      }
    }
    scheduleFrame();
  }, [vanish, scheduleFrame]);

  // Guard against pull-to-refresh / edge-swipe navigation while finger-painting
  useEffect(() => {
    const docEl = document.documentElement;
    const prevOverscroll = docEl.style.overscrollBehavior;
    const prevBodyOverflow = document.body.style.overflow;
    docEl.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';
    return () => {
      docEl.style.overscrollBehavior = prevOverscroll;
      document.body.style.overflow = prevBodyOverflow;
      stop();
    };
  }, [stop]);

  // Canvas sizing + resize/orientation listeners + rAF teardown
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [resizeCanvas]);

  // Nunito loads async — repaint the glyph once the real font is in
  useEffect(() => {
    let cancelled = false;
    try {
      document.fonts
        ?.load('900 100px Nunito')
        .then(() => {
          if (!cancelled) scheduleFrame();
        })
        .catch(() => {});
    } catch (e) {}
    return () => {
      cancelled = true;
    };
  }, [scheduleFrame]);

  // Desktop-testing keyboard shortcuts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never hijack browser chords (Ctrl+C copy!) or machine-gun on key repeat
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (e.key === 'c' || e.key === 'C') {
        clearAll();
      } else if (e.key === 't' || e.key === 'T') {
        pickTraceChar();
      } else if (e.key === 'v' || e.key === 'V') {
        toggleVanish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearAll, pickTraceChar, toggleVanish]);

  // Every control fires on pointer-down (toddler taps), stops propagation so
  // taps never reach the canvas, pops, and buzzes gently.
  const controlDown = (action: () => void) => (e: React.PointerEvent) => {
    e.stopPropagation();
    playControlPop();
    if (navigator.vibrate) navigator.vibrate(5);
    action();
  };
  const stopClick = (e: React.MouseEvent) => e.stopPropagation();

  const selectedRing = 'ring-4 ring-offset-2 ring-sky-400 dark:ring-offset-zinc-900';

  return (
    <div className="fixed inset-0 overflow-hidden select-none bg-[#FFFDF9] dark:bg-[#0a0a0a]">
      {/* Full-bleed painting surface — never shrunk; controls float over it */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      />

      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="doodle" />
      </header>

      {/* Floating controls pill */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 rounded-3xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md shadow-xl px-3 py-2 flex flex-wrap justify-center items-center gap-2 pointer-events-auto"
        style={{ maxWidth: 'min(94vw, 640px)', touchAction: 'none' }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={stopClick}
      >
        {/* Rainbow swatch */}
        <motion.button
          aria-label="Rainbow ink"
          onPointerDown={controlDown(() => setColor('rainbow'))}
          onClick={stopClick}
          whileTap={{ scale: 0.9 }}
          animate={{ scale: color === 'rainbow' ? 1.1 : 1 }}
          className={`w-11 h-11 rounded-full focus:outline-none ${
            color === 'rainbow' ? selectedRing : ''
          }`}
          style={{
            background:
              'conic-gradient(from 0deg, #ef4444, #f59e0b, #facc15, #22c55e, #38bdf8, #8b5cf6, #ec4899, #ef4444)',
            transition: CONTROL_TRANSITION,
          }}
        />

        {/* Solid color swatches */}
        {SOLID_COLORS.map((c) => (
          <motion.button
            key={c}
            aria-label={`Ink color ${c}`}
            onPointerDown={controlDown(() => setColor(c))}
            onClick={stopClick}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: color === c ? 1.1 : 1 }}
            className={`w-11 h-11 rounded-full focus:outline-none ${
              color === c ? selectedRing : ''
            }`}
            style={{ backgroundColor: c, transition: CONTROL_TRANSITION }}
          />
        ))}

        {/* Brush size dots */}
        {STROKE_SIZES.map((s) => (
          <motion.button
            key={s}
            aria-label={`Brush size ${s}`}
            onPointerDown={controlDown(() => setSize(s))}
            onClick={stopClick}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: size === s ? 1.1 : 1 }}
            className={`w-11 h-11 rounded-full flex items-center justify-center focus:outline-none bg-zinc-100 dark:bg-zinc-800 ${
              size === s ? selectedRing : ''
            }`}
            style={{ transition: CONTROL_TRANSITION }}
          >
            <span
              className="rounded-full bg-zinc-800 dark:bg-zinc-100 block"
              style={{ width: `${s}px`, height: `${s}px` }}
            />
          </motion.button>
        ))}

        {/* Trace dice */}
        <motion.button
          aria-label="Trace a letter or number"
          onPointerDown={controlDown(pickTraceChar)}
          onClick={stopClick}
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full flex items-center justify-center text-2xl focus:outline-none bg-zinc-100 dark:bg-zinc-800"
          style={{ transition: CONTROL_TRANSITION }}
        >
          🎲
        </motion.button>

        {/* Hide trace glyph — only while trace is active */}
        {traceChar !== null && (
          <motion.button
            aria-label="Hide trace letter"
            onPointerDown={controlDown(hideTrace)}
            onClick={stopClick}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-2xl focus:outline-none bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-black"
            style={{ transition: CONTROL_TRANSITION }}
          >
            ✕
          </motion.button>
        )}

        {/* Vanishing ink toggle */}
        <motion.button
          aria-label={vanish ? 'Vanishing ink on' : 'Vanishing ink off'}
          onPointerDown={controlDown(toggleVanish)}
          onClick={stopClick}
          whileTap={{ scale: 0.9 }}
          className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl focus:outline-none ${
            vanish
              ? 'bg-amber-100 dark:bg-amber-400/20 ring-4 ring-offset-2 ring-amber-400 dark:ring-offset-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 grayscale opacity-50'
          }`}
          style={{ transition: CONTROL_TRANSITION }}
        >
          ✨
        </motion.button>

        {/* Clear — only when ink doesn't vanish by itself */}
        {!vanish && (
          <motion.button
            aria-label="Clear the canvas"
            onPointerDown={controlDown(clearAll)}
            onClick={stopClick}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-2xl focus:outline-none bg-zinc-100 dark:bg-zinc-800"
            style={{ transition: CONTROL_TRANSITION }}
          >
            🧽
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default DoodleApp;
