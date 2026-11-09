"use client";

import { useSyncExternalStore } from "react";
import { ConfirmScreen } from "@/components/ConfirmScreen";

const subscribe = () => () => {};

export default function Preview() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;

  return (
    <main className="mx-auto max-w-[32rem] px-4 py-12">
      <ConfirmScreen
        plan={{
          activityId: "bowling",
          activity: "🎳 Bowling",
          date: "2026-11-14",
          time: "19:00",
          message: "",
        }}
      />
    </main>
  );
}
