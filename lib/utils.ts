import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(startDate: Date | null, endDate: Date | null) {
  if(!startDate || !endDate) return "N/A";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let result = "";

  if (hours > 0) result += `${hours}h`;
  if( minutes > 0 || hours > 0) result += `${minutes}m`;
  result += `${seconds}s`;

  return result;
}