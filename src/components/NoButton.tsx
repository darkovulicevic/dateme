"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TAUNTS = [
  "Nice try! 😏",
  "Are you sure? 😂",
  "That button doesn't work!",
  "You know you want to say YES 😉",
];

type Spot = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const SLOT_CLASS = "h-14 w-full shrink-0 min-[370px]:w-[8.25rem]";

export function NoButton({ onTaunt }: { onTaunt: (message: string) => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const attempts = useRef(0);
  const lastJump = useRef(0);
  const cursor = useRef({ x: -9999, y: -9999 });
  const spotRef = useRef<Spot | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [ready, setReady] = useState(false);

  const commit = useCallback((next: Spot, animate: boolean) => {
    spotRef.current = next;
    setSpot(next);
    setReady(animate);
  }, []);

  const playBounce = useCallback(() => {
    requestAnimationFrame(() => {
      const node = buttonRef.current;
      if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      node.animate(
        [
          { transform: "rotate(0deg) scale(1)" },
          { transform: "rotate(-3deg) scale(1.05)", offset: 0.35 },
          { transform: "rotate(0deg) scale(1)" },
        ],
        { duration: 420, easing: "ease-out" },
      );
    });
  }, []);

  const jump = useCallback(
    (clientX?: number, clientY?: number) => {
      const button = buttonRef.current;
      if (!button) return;

      const now = performance.now();
      if (now - lastJump.current < 160) return;
      lastJump.current = now;

      if (clientX != null && clientY != null) {
        cursor.current = { x: clientX, y: clientY };
      }

      const rect = button.getBoundingClientRect();
      const width = spotRef.current?.width ?? rect.width;
      const height = spotRef.current?.height ?? rect.height;
      const next: Spot = { ...chooseSpot(width, height, cursor.current), width, height };

      attempts.current += 1;
      if (attempts.current >= 2) {
        onTaunt(TAUNTS[(attempts.current - 2) % TAUNTS.length]);
      }

      if (!spotRef.current) {
        commit({ x: rect.left, y: rect.top, width, height }, false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            commit(next, true);
            playBounce();
          });
        });
        return;
      }

      commit(next, true);
      playBounce();
    },
    [commit, onTaunt, playBounce],
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      cursor.current = { x: event.clientX, y: event.clientY };
      if (event.pointerType !== "mouse") return;
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const pad = 8;
      const over =
        event.clientX >= rect.left - pad &&
        event.clientX <= rect.right + pad &&
        event.clientY >= rect.top - pad &&
        event.clientY <= rect.bottom + pad;
      if (over) jump(event.clientX, event.clientY);
    };

    const onResize = () => {
      if (!spotRef.current) return;
      commit(clampSpot(spotRef.current), ready);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [commit, jump, ready]);

  const button = (
    <button
      ref={buttonRef}
      type="button"
      className={`no-button ${SLOT_CLASS} ${ready ? "is-away" : ""} inline-flex items-center justify-center rounded-full border border-[#ead8d2] bg-white/95 px-5 text-base font-semibold tracking-wide text-ink shadow-[0_10px_24px_-16px_rgba(63,42,48,0.55)] select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose`}
      style={
        spot
          ? {
              position: "fixed",
              left: spot.x,
              top: spot.y,
              width: spot.width,
              height: spot.height,
              zIndex: 50,
              touchAction: "none",
            }
          : { touchAction: "none" }
      }
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") jump(event.clientX, event.clientY);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") {
          event.preventDefault();
          jump(event.clientX, event.clientY);
        }
      }}
      onClick={(event) => {
        event.preventDefault();
        jump(cursor.current.x, cursor.current.y);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          jump();
        }
      }}
    >
      NO 😢
    </button>
  );

  return (
    <>
      {spot ? <span className={SLOT_CLASS} aria-hidden="true" /> : null}
      {spot ? createPortal(button, document.body) : button}
    </>
  );
}

function chooseSpot(width: number, height: number, pointer: { x: number; y: number }) {
  const margin = 16;
  const viewW = window.visualViewport?.width ?? window.innerWidth;
  const viewH = window.visualViewport?.height ?? window.innerHeight;
  const minX = margin;
  const minY = margin;
  const maxX = Math.max(minX, viewW - width - margin);
  const maxY = Math.max(minY, viewH - height - margin);
  const yes = document.getElementById("yes-button")?.getBoundingClientRect();

  const overlapsYes = (x: number, y: number) =>
    !!yes &&
    x < yes.right + 18 &&
    x + width > yes.left - 18 &&
    y < yes.bottom + 18 &&
    y + height > yes.top - 18;

  const nearPointer = (x: number, y: number) =>
    Math.hypot(x + width / 2 - pointer.x, y + height / 2 - pointer.y) < 120;

  let fallback = { x: minX, y: Math.min(maxY, viewH * 0.62) };
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (overlapsYes(x, y)) continue;
    fallback = { x, y };
    if (!nearPointer(x, y)) return fallback;
  }

  return fallback;
}

function clampSpot(spot: Spot): Spot {
  const margin = 16;
  const viewW = window.visualViewport?.width ?? window.innerWidth;
  const viewH = window.visualViewport?.height ?? window.innerHeight;
  const maxX = Math.max(margin, viewW - spot.width - margin);
  const maxY = Math.max(margin, viewH - spot.height - margin);
  return {
    ...spot,
    x: Math.min(Math.max(margin, spot.x), maxX),
    y: Math.min(Math.max(margin, spot.y), maxY),
  };
}
