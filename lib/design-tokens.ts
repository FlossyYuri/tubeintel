import { cn } from "./utils";

export const pageTitle = "text-xl sm:text-2xl font-extrabold tracking-tight font-display";
export const pageDescription = "text-sm text-[var(--text2)] mt-1";
export const sectionTitle = "text-[15px] font-bold font-display";

export const card =
  "bg-white/[0.02] border border-white/[0.06] rounded-xl";
export const cardHover =
  "hover:border-white/[0.1] hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-200";

export const input =
  "bg-[#0a0a0f] border border-white/[0.06] text-[var(--text)] px-4 py-3 text-sm rounded-xl outline-none focus:border-[#E8441C] focus-visible:ring-2 focus-visible:ring-[#E8441C]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-colors";
export const inputSm = "px-3.5 py-2 text-sm rounded-lg";

export const buttonPrimary =
  "bg-[#E8441C] text-white px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#FF6B3D] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(232,68,28,0.3)] disabled:hover:translate-y-0 disabled:hover:shadow-none font-display focus-visible:ring-2 focus-visible:ring-[#E8441C] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";
export const buttonSecondary =
  "bg-white/[0.04] border border-white/[0.06] text-[var(--text)] px-6 py-3 text-sm font-semibold rounded-xl hover:border-white/[0.1] hover:bg-white/[0.04] transition-colors duration-200 disabled:opacity-50 font-display focus-visible:ring-2 focus-visible:ring-[#E8441C] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

export const badge =
  "inline-block px-2 py-0.5 rounded text-[9.5px] uppercase tracking-wider font-mono";
export const badgeViral =
  "bg-[rgba(232,68,28,0.15)] text-[var(--accent)] border border-[rgba(232,68,28,0.3)]";
export const badgeShort =
  "bg-[rgba(155,110,232,0.15)] text-[var(--purple)] border border-[rgba(155,110,232,0.3)]";
export const badgeNew =
  "bg-[rgba(61,191,127,0.15)] text-[var(--green)] border border-[rgba(61,191,127,0.3)]";
export const badgeLongForm =
  "bg-[rgba(74,158,232,0.15)] text-[var(--blue2)] border border-[rgba(74,158,232,0.3)]";

export function cardClasses(className?: string) {
  return cn(card, cardHover, className);
}
