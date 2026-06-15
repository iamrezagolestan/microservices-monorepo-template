import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const cx = cn;

export function sortCx<T extends Record<string, unknown>>(classes: T): T {
  return classes;
}
