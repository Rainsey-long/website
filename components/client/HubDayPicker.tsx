"use client";
/**
 * The sign hub renders yesterday/today/tomorrow (by the server's idea of the
 * visitor's date) and shows the one matching the browser's local date, so a
 * first visit before the tz cookie exists is still right (§8.5).
 */
import { useSyncExternalStore, type ReactNode } from "react";
import { localToday } from "@/lib/client";

export default function HubDayPicker({ days, serverToday, labels, children }: { days: string[]; serverToday: string; labels: Record<string, string>; children: ReactNode[] }) {
  const local = useSyncExternalStore(() => () => {}, localToday, () => serverToday);
  const active = days.includes(local) ? local : serverToday;
  return (
    <>
      <p className="mt-2 text-small text-muted">{`Horoscope for ${labels[active]}`}</p>
      {children.map((c, i) => <div key={days[i]} hidden={days[i] !== active}>{c}</div>)}
    </>
  );
}
