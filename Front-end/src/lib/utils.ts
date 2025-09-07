import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | string[] | Record<string, boolean> | undefined | null)[]): string {
  return twMerge(clsx(inputs));
}

