import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format movie runtime from minutes to hours and minutes
 */
export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format release date to year
 */
export function formatYear(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
}

/**
 * Format vote average to 1 decimal place
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Get image URL from TMDB path
 */
export function getImageUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "original"
): string {
  if (!path) return "/placeholder-movie.jpg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Get backdrop URL from TMDB path
 */
export function getBackdropUrl(
  path: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "original"
): string {
  if (!path) return "/placeholder-backdrop.jpg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

