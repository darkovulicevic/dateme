"use client";

import { useEffect } from "react";

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

// Frames slower than this (about 28 fps) count as "slow".
const SLOW_FRAME_MS = 36;
const SLOW_STREAK_TO_THIN = 5;
const MIN_QUALITY = 0.3;

export function Confetti() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Phones and small laptops get a lighter show from the start.
    const compact = window.innerWidth < 700 || (navigator.hardwareConcurrency ?? 8) <= 4;
    let quality = compact ? 0.5 : 1;

    // The canvas lives directly on <body>, away from the animated card, so the browser
    // does not have to re-composite the card while the pieces move.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;z-index:30;pointer-events:none;";
    document.body.appendChild(canvas);

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      canvas.remove();
      return;
    }

    // Pause the drifting background glows while the confetti runs.
    document.documentElement.dataset.confetti = "on";

    const ratio = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2);
    let viewWidth = window.innerWidth;
    let viewHeight = window.innerHeight;

    const fit = () => {
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;
      canvas.width = Math.floor(viewWidth * ratio);
      canvas.height = Math.floor(viewHeight * ratio);
    };
    fit();

    // The soft glow is drawn once and then only scaled, instead of building a gradient every frame.
    const sprite = document.createElement("canvas");
    sprite.width = 128;
    sprite.height = 128;
    const spriteContext = sprite.getContext("2d");
    if (spriteContext) {
      const gradient = spriteContext.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 226, 214, 1)");
      gradient.addColorStop(0.55, "rgba(246, 184, 196, 0.5)");
      gradient.addColorStop(1, "rgba(246, 184, 196, 0)");
      spriteContext.fillStyle = gradient;
      spriteContext.fillRect(0, 0, 128, 128);
    }

    let pieces: Piece[] = [];
    let glows: Glow[] = [];
    let raf = 0;
    let alive = true;
    let nextBurst = 0;
    let nextTrickle = TRICKLE_START;
    let last = 0;
    let tick = 0;
    let slowStreak = 0;
    const t0 = performance.now();

    const fire = (burst: Burst) => {
      const originX = viewWidth * burst.x;
      const originY = viewHeight * burst.y;
      const reach = Math.min(Math.max(viewWidth * burst.reach, 150), 540);
      glows.push({ x: originX, y: originY, radius: reach * 0.85, age: 0, max: 80 });

      const count = Math.max(12, Math.round(burst.count * quality));
      for (let index = 0; index < count; index += 1) {
        const distance = reach * (0.22 + 0.78 * Math.sqrt(Math.random()));
        const angle =
          burst.kind === "bloom"
            ? Math.random() * Math.PI * 2
            : burst.kind === "right"
              ? -1.25 + Math.random() * 1.85
              : Math.PI + 1.25 - Math.random() * 1.85;
        const shape = shapeAt(index, compact);
        const palette = shape === "star" ? GOLD : pick(PALETTE);
        pieces.push({
          ox: originX,
          oy: originY,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance * 0.8,
          frames: burst.frames * BURST_PACE * (0.85 + Math.random() * 0.3),
          delay: Math.random() * 14,
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
          x: Math.random() * viewWidth,
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

    // If the phone struggles, drop half of the pieces and spawn fewer from now on.
    const thin = () => {
      quality = Math.max(MIN_QUALITY, quality * 0.6);
      let toggle = false;
      for (const piece of pieces) {
        if (piece.dead) continue;
        toggle = !toggle;
        if (toggle) piece.dead = true;
      }
    };

    const stop = () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      delete document.documentElement.dataset.confetti;
      canvas.remove();
    };

    const draw = (now: number) => {
      const elapsed = now - t0;
      const frameMs = last === 0 ? 16.667 : now - last;
      const dt = Math.min(frameMs / 16.667, 2.5);
      last = now;
      tick += 1;

      if (frameMs > SLOW_FRAME_MS) slowStreak += 1;
      else slowStreak = Math.max(0, slowStreak - 1);
      if (slowStreak >= SLOW_STREAK_TO_THIN && quality > MIN_QUALITY) {
        thin();
        slowStreak = 0;
      }

      while (nextBurst < BURSTS.length && BURSTS[nextBurst].at <= elapsed) {
        fire(BURSTS[nextBurst]);
        nextBurst += 1;
      }
      while (nextTrickle <= elapsed && nextTrickle < TRICKLE_END) {
        trickle(Math.max(1, Math.round(5 * quality)));
        nextTrickle += TRICKLE_EVERY;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.globalAlpha = 1;
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      for (const glow of glows) {
        glow.age += dt;
        const p = glow.age / glow.max;
        if (p >= 1) continue;
        const radius = glow.radius * (0.25 + 0.75 * (1 - (1 - p) * (1 - p)));
        context.globalAlpha = 0.34 * (1 - p) * (1 - p);
        context.drawImage(sprite, glow.x - radius, glow.y - radius, radius * 2, radius * 2);
      }

      const drag = Math.pow(0.975, dt);
      let active = 0;

      for (const piece of pieces) {
        if (piece.dead) continue;
        piece.age += dt;
        if (piece.age > piece.maxLife) {
          piece.dead = true;
          continue;
        }
        active += 1;

        const local = piece.age - piece.delay;
        if (local < 0) continue;

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
          piece.vx *= drag;
          piece.vy = piece.vy * drag + FALL_GRAVITY * dt;
          piece.x += (piece.vx + Math.sin(piece.wobble) * 0.5) * dt;
          piece.y += piece.vy * dt;
          if (piece.y > viewHeight + 80) {
            piece.dead = true;
            active -= 1;
            continue;
          }
        }

        piece.wobble += piece.wobbleSpeed * dt;
        piece.rot += piece.vr * dt;
        piece.flip += piece.flipSpeed * dt;

        // Pieces that are off screen are still simulated, but not drawn.
        if (piece.x < -40 || piece.x > viewWidth + 40 || piece.y < -40 || piece.y > viewHeight + 40) continue;

        const fadeStart = piece.maxLife * 0.85;
        const fade = piece.age < fadeStart ? 1 : 1 - (piece.age - fadeStart) / (piece.maxLife - fadeStart);
        context.globalAlpha = Math.max(0, intro * fade);
        paint(context, piece, scale, ratio);
      }

      if (tick % 90 === 0) {
        pieces = pieces.filter((piece) => !piece.dead);
        glows = glows.filter((glow) => glow.age < glow.max);
      }

      const running = elapsed < TRICKLE_END || active > 0;
      if (alive && running) raf = requestAnimationFrame(draw);
      else if (alive) stop();
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", fit);

    return stop;
  }, []);

  return null;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function shapeAt(index: number, compact: boolean): Shape {
  if (index % 9 === 0) return "star";
  // Curved ribbons are the most expensive shape to draw, so phones get plain pieces instead.
  if (!compact && index % 6 === 1) return "ribbon";
  if (index % 5 === 2) return "circle";
  return "rect";
}

// One transform per piece (no save/restore), which is noticeably cheaper on phones.
function paint(context: CanvasRenderingContext2D, piece: Piece, scale: number, ratio: number) {
  const cos = Math.cos(piece.rot);
  const sin = Math.sin(piece.rot);

  if (piece.shape === "star") {
    const twinkle = 0.65 + 0.35 * Math.abs(Math.sin(piece.wobble * 2));
    const radius = piece.w * 0.95 * scale * twinkle;
    context.setTransform(cos * ratio, sin * ratio, -sin * ratio, cos * ratio, piece.x * ratio, piece.y * ratio);
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
  const sx = scale;
  const sy = scale * flat;
  context.setTransform(
    cos * sx * ratio,
    sin * sx * ratio,
    -sin * sy * ratio,
    cos * sy * ratio,
    piece.x * ratio,
    piece.y * ratio,
  );
  const color = facing >= 0 ? piece.front : piece.back;
  context.fillStyle = color;

  if (piece.shape === "circle") {
    context.beginPath();
    context.arc(0, 0, piece.w * 0.5, 0, Math.PI * 2);
    context.fill();
    return;
  }

  if (piece.shape === "ribbon") {
    const length = piece.h * 1.7;
    const bend = Math.sin(piece.wobble) * length * 0.32;
    context.strokeStyle = color;
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
