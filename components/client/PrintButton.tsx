"use client";
/** Opens the browser's print dialog. Used by the printable calendar (DESIGN_SYSTEM.md §6.19). */
export default function PrintButton({ label }: { label: string }) {
  return <button type="button" className="btn-primary" onClick={() => window.print()}>{label}</button>;
}
