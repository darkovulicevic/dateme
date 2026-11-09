"use client";

import { useEffect, useRef, useState } from "react";
import { NoButton } from "@/components/NoButton";

export function AskScreen({ onYes }: { onYes: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [taunt, setTaunt] = useState<string | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="screen-in invitation relative rounded-[1.75rem] border border-white/80 px-5 py-9 sm:px-10 sm:py-12">
      <div className="mx-auto mb-7 h-px w-16 bg-gradient-to-r from-transparent via-rose/60 to-transparent" />

      <p className="text-center text-[0.72rem] font-semibold tracking-[0.22em] text-rose uppercase">
        For Magdalena
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mx-auto mt-3 max-w-[16ch] text-center font-serif text-[2.15rem] leading-[1.12] font-medium tracking-tight text-balance text-ink outline-none sm:text-[2.75rem]"
      >
        Would you go on a date with me?
      </h1>
      <p className="mx-auto mt-4 max-w-[28ch] text-center text-base leading-relaxed text-pretty text-muted sm:text-lg">
        Just the two of us, and a small contest. May the better one win.
      </p>

      <div className="mt-8 flex flex-col gap-3 min-[370px]:flex-row min-[370px]:justify-center">
        <button
          id="yes-button"
          type="button"
          onClick={onYes}
          className="inline-flex h-14 w-full shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#d56b7d] to-[#c2576b] px-6 text-base font-semibold tracking-wide text-white shadow-[0_14px_30px_-12px_rgba(194,87,107,0.95)] transition duration-200 hover:-translate-y-0.5 hover:from-[#c95f72] hover:to-[#b3475d] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose min-[370px]:w-[9.5rem]"
        >
          YES
        </button>
        <NoButton onTaunt={setTaunt} />
      </div>

      <p className="mt-5 min-h-6 text-center text-sm text-muted" aria-live="polite">
        {taunt ? (
          <span key={taunt} className="taunt inline-block rounded-full bg-white/80 px-3 py-1 text-rose-deep">
            {taunt}
          </span>
        ) : (
          "I will be right here."
        )}
      </p>
    </section>
  );
}
