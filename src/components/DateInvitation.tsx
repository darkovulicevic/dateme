"use client";

import { useState } from "react";
import { AskScreen } from "@/components/AskScreen";
import { Background } from "@/components/Background";
import { ConfirmScreen } from "@/components/ConfirmScreen";
import { PlanScreen } from "@/components/PlanScreen";
import type { DatePlan } from "@/lib/plan";

type Screen = "ask" | "plan" | "confirm";

export function DateInvitation() {
  const [screen, setScreen] = useState<Screen>("ask");
  const [plan, setPlan] = useState<DatePlan | null>(null);

  return (
    <main className="relative flex min-h-dvh flex-col">
      <Background />
      <div className="relative z-10 mx-auto my-auto w-full max-w-[32rem] px-4 py-8 sm:py-12">
        {screen === "ask" ? <AskScreen onYes={() => setScreen("plan")} /> : null}
        {screen === "plan" ? (
          <PlanScreen
            onBack={() => setScreen("ask")}
            onConfirmed={(next) => {
              setPlan(next);
              setScreen("confirm");
            }}
          />
        ) : null}
        {screen === "confirm" && plan ? (
          <ConfirmScreen
            plan={plan}
            onRestart={() => {
              setPlan(null);
              setScreen("ask");
            }}
          />
        ) : null}
        <p className="mt-5 text-center text-[0.68rem] font-semibold tracking-[0.18em] text-muted/80 uppercase">
          A little invitation
        </p>
      </div>
    </main>
  );
}
