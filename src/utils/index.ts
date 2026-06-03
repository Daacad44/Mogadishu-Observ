import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercent(num: number): string {
  return `${num >= 0 ? "+" : ""}${formatNumber(num, 1)}%`;
}

export function formatArea(km2: number): string {
  if (km2 >= 1000) return `${formatNumber(km2 / 1000, 1)}k km²`;
  return `${formatNumber(km2, 2)} km²`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getYearRange(start = 2014, end = 2026): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function interpolateColor(
  value: number,
  min: number,
  max: number
): string {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = Math.round(0 + ratio * 0);
  const g = Math.round(180 + ratio * 75);
  const b = Math.round(170 - ratio * 50);
  return `rgb(${r}, ${g}, ${b})`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
