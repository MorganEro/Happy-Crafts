import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a price in USD
 * @param price - The price to format (in cents)
 * @returns Formatted price string (e.g., "$19.99")
 */
export function formatPrice(price: number): string {
  // Convert cents to dollars and format with 2 decimal places
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price / 100)
}
