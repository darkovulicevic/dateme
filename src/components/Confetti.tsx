"use client";

import { useEffect, useRef } from "react";

type Shape = "rect" | "circle" | "ribbon" | "star";
type Kind = "bloom" | "left" | "right";

type Burst = {
  at: number;
  x: number;
  y: number;
  count: number;
  kind: Kind;
  reach: number;
  frames: number;
};

type Piece = {
  ox: number;
  oy: number;
  dx: number;
  dy: number;
  frames: number;
  delay: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  flip: number;
  flipSpeed: number;
  front: string;
  back: string;
  shape: Shape;
  age: number;
  maxLife: number;
  wobble: number;
  wobbleSpeed: number;
  dead: boolean;
};

type Glow = { x: number; y: number; radius: number; age: number; max: number };

const PALETTE = [
  { front: "#c2576b", back: "#8f3d4e" },
  { front: "#e58a99", back: "#c2576b" },
  { front: "#f5c1c9", back: "#e39aa7" },
  { front: "#f6d7a8", back: "#e0b270" },
  { front: "#fff1e8", back: "#ecd2c3" },
  { front: "#e9b872", back: "#c8913f" },
  { front: "#b84a60", back: "#7d2f40" },
];
const GOLD = { front: "#ffe9b0", back: "#f2c76b" };

// Every burst opens slowly, like a flower, and hangs in the air before it drifts down.
// Bursts sit in the upper part of the screen and are spread over several seconds.
const BURSTS: Burst[] = [
  { at: 0, x: 0.5, y: 0.27, count: 150, kind: "bloom", reach: 0.3, frames: 150 },
  { at: 700, x: 0.12, y: 0.32, count: 90, kind: "right", reach: 0.36, frames: 135 },
  { at: 700, x: 0.88, y: 0.32, count: 90, kind: "left", reach: 0.36, frames: 135 },
  { at: 1600, x: 0.3, y: 0.23, count: 90, kind: "bloom", reach: 0.22, frames: 125 },
  { at: 1600, x: 0.7, y: 0.23, count: 90, kind: "bloom", reach: 0.22, frames: 125 },
  { at: 2500, x: 0.5, y: 0.31, count: 120, kind: "bloom", reach: 0.34, frames: 145 },
  { at: 3400, x: 0.08, y: 0.22, count: 80, kind: "right", reach: 0.34, frames: 130 },
  { at: 3400, x: 0.92, y: 0.22, count: 80, kind: "left", reach: 0.34, frames: 130 },
  { at: 4300, x: 0.36, y: 0.3, count: 90, kind: "bloom", reach: 0.24, frames: 125 },
  { at: 4300, x: 0.64, y: 0.3, count: 90, kind: "bloom", reach: 0.24, frames: 125 },
  { at: 5300, x: 0.5, y: 0.22, count: 130, kind: "bloom", reach: 0.38, frames: 150 },
  { at: 6300, x: 0.18, y: 0.3, count: 70, kind: "right", reach: 0.3, frames: 130 },
  { at: 6300, x: 0.82, y: 0.3, count: 70, kind: "left", reach: 0.3, frames: 130 },
  { at: 7300, x: 0.5, y: 0.27, count: 140, kind: "bloom", reach: 0.4, frames: 155 },
];

// Lower BURST_PACE = bursts open faster. Higher FALL_GRAVITY = pieces drift down faster.
const BURST_PACE = 0.82;
const FALL_GRAVITY = 0.12;

const TRICKLE_START = 1800;
const TRICKLE_END = 12000;
const TRICKLE_EVERY = 220;

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let pieces: Piece[] = [];
    let glows: Glow[] = [];
    let raf = 0;
    let alive = true;
    let nextBurst = 0;
    let nextTrickle = TRICKLE_START;
    let last = 0;
    let tick = 0;
    const t0 = performance.now();

    const width = () => window.innerWidth;
    const height = () => window.innerHeight;

    const fit = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width() * ratio);
      canvas.height = Math.floor(height() * ratio);
      canvas.style.width = `${width()}px`;
      canvas.style.height = `${height()}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    fit();

    const fire = (burst: Burst) => {
      const originX = width() * burst.x;
      const originY = height() * burst.y;
      const reach = Math.min(Math.max(width() * burst.reach, 150), 540);
      glows.push({ x: originX, y: originY, radius: reach * 0.85, age: 0, max: 80 });

      for (let index = 0; index < burst.count; index += 1) {
        const distance = reach * (0.22 + 0.78 * Math.sqrt(Math.random()));
        const angle =
          burst.kind === "bloom"
            ? Math.random() * Math.PI * 2
            : burst.kind === "right"
              ? -1.25 + Math.random() * 1.85
              : Math.PI + 1.25 - Math.random() * 1.85;
        const shape = shapeAt(index);
        const palette = shape === "star" ? GOLD : pick(PALETTE);
        pieces.push({
          ox: originX,
          oy: originY,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance * 0.8,
          frames: burst.frames * BURST_PACE * (0.85 + Math.random() * 0.3),
          delay: Math.random() * 10,
          x: originX,
          y: originY,
          vx: 0,
          vy: 0,
          w: 6 + Math.random() * 6,
          h: 9 + Math.random() * 9,
          rot: Math.random() * Math.PI * 2,
          vr: -0.07 + Math.random() * 0.14,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: 0.05 + Math.random() * 0.1,
          front: palette.front,
          back: palette.back,
          shape,
          age: 0,
          maxLife: 2880 + Math.random() * 1620,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.035 + Math.random() * 0.04,
          dead: false,
        });
      }
    };

    const trickle = (count: number) => {
      for (let index = 0; index < count; index += 1) {
        const palette = pick(PALETTE);
        pieces.push({
          ox: 0,
          oy: 0,
          dx: 0,
          dy: 0,
          frames: 0,
          delay: 0,
          x: Math.random() * width(),
          y: -20,
          vx: -0.3 + Math.random() * 0.6,
          vy: 0.5 + Math.random() * 0.6,
          w: 5 + Math.random() * 5,
          h: 8 + Math.random() * 8,
          rot: Math.random() * Math.PI * 2,
          vr: -0.06 + Math.random() * 0.12,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: 0.05 + Math.random() * 0.08,
          front: palette.front,
          back: palette.back,
          shape: index % 4 === 0 ? "circle" : "rect",
          age: 0,
          maxLife: 2400 + Math.random() * 1200,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.03 + Math.random() * 0.04,
          dead: false,
        });
      }
    };

    const draw = (now: number) => {
      const elapsed = now - t0;
      const dt = last === 0 ? 1 : Math.min((now - last) / 16.667, 2.5);
      last = now;
      tick += 1;

      while (nextBurst < BURSTS.length && BURSTS[nextBurst].at <= elapsed) {
        fire(BURSTS[nextBurst]);
        nextBurst += 1;
      }
      while (nextTrickle <= elapsed && nextTrickle < TRICKLE_END) {
        trickle(5);
        nextTrickle += TRICKLE_EVERY;
      }

      context.clearRect(0, 0, width(), height());

      for (const glow of glows) {
        glow.age += dt;
        const p = glow.age / glow.max;
        if (p >= 1) continue;
        const radius = glow.radius * (0.25 + 0.75 * (1 - (1 - p) * (1 - p)));
        const alpha = 0.34 * (1 - p) * (1 - p);
        const gradient = context.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, radius);
        gradient.addColorStop(0, `rgba(255, 226, 214, ${alpha})`);
        gradient.addColorStop(0.55, `rgba(246, 184, 196, ${alpha * 0.5})`);
        gradient.addColorStop(1, "rgba(246, 184, 196, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(glow.x, glow.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      let waiting = 0;

      for (const piece of pieces) {
        if (piece.dead) continue;
        piece.age += dt;
        if (piece.age > piece.maxLife) {
          piece.dead = true;
          continue;
        }

        const local = piece.age - piece.delay;
        if (local < 0) {
          waiting += 1;
          continue;
        }

        let scale = 1;
        let intro = 1;

        if (local < piece.frames) {
          const p = local / piece.frames;
          const eased = 1 - (1 - p) * (1 - p);
          piece.x = piece.ox + piece.dx * eased;
          piece.y = piece.oy + piece.dy * eased;
          piece.vx = (piece.dx * 2 * (1 - p)) / piece.frames;
          piece.vy = (piece.dy * 2 * (1 - p)) / piece.frames;
          scale = 0.35 + 0.65 * Math.min(1, local / 18);
          intro = Math.min(1, local / 10);
        } else {
          const drag = Math.pow(0.975, dt);
          piece.vx *= drag;
          piece.vy = piece.vy * drag + FALL_GRAVITY * dt;
          piece.x += (piece.vx + Math.sin(piece.wobble) * 0.5) * dt;
          piece.y += piece.vy * dt;
          if (piece.y > height() + 80) {
            piece.dead = true;
            continue;
          }
        }

        piece.wobble += piece.wobbleSpeed * dt;
        piece.rot += piece.vr * dt;
        piece.flip += piece.flipSpeed * dt;

        const fadeStart = piece.maxLife * 0.85;
        const fade = piece.age < fadeStart ? 1 : 1 - (piece.age - fadeStart) / (piece.maxLife - fadeStart);

        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rot);
        context.globalAlpha = Math.max(0, intro * fade);
        paint(context, piece, scale);
        context.restore();
      }

      if (tick % 90 === 0) {
        pieces = pieces.filter((piece) => !piece.dead);
        glows = glows.filter((glow) => glow.age < glow.max);
      }

      const running =
        elapsed < TRICKLE_END || waiting > 0 || pieces.some((piece) => !piece.dead);
      if (alive && running) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", fit);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" aria-hidden="true" />;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function shapeAt(index: number): Shape {
  if (index % 9 === 0) return "star";
  if (index % 6 === 1) return "ribbon";
  if (index % 5 === 2) return "circle";
  return "rect";
}

function paint(context: CanvasRenderingContext2D, piece: Piece, scale: number) {
  if (piece.shape === "star") {
    const twinkle = 0.65 + 0.35 * Math.abs(Math.sin(piece.wobble * 2));
    const radius = piece.w * 0.95 * scale * twinkle;
    context.fillStyle = piece.front;
    context.beginPath();
    for (let point = 0; point < 8; point += 1) {
      const length = point % 2 === 0 ? radius : radius * 0.28;
      const angle = (Math.PI / 4) * point - Math.PI / 2;
      const px = Math.cos(angle) * length;
      const py = Math.sin(angle) * length;
      if (point === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.fill();
    return;
  }

  const facing = Math.cos(piece.flip);
  const flat = Math.max(0.16, Math.abs(facing));
  const color = facing >= 0 ? piece.front : piece.back;
  context.scale(scale, scale * flat);
  context.fillStyle = color;
  context.strokeStyle = color;

  if (piece.shape === "circle") {
    context.beginPath();
    context.arc(0, 0, piece.w * 0.5, 0, Math.PI * 2);
    context.fill();
    return;
  }

  if (piece.shape === "ribbon") {
    const length = piece.h * 1.7;
    const bend = Math.sin(piece.wobble) * length * 0.32;
    context.lineWidth = Math.max(2, piece.w * 0.34);
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(0, -length / 2);
    context.bezierCurveTo(bend, -length / 6, -bend, length / 6, 0, length / 2);
    context.stroke();
    return;
  }

  context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
}
