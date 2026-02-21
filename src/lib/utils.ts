import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a number to its English word representation.
 * Optimized for professional currency values (Rupees) using the International Numbering System (Millions).
 */
export function numberToWords(num: number): string {
  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return "ZERO RUPEES ONLY";
  if (isNaN(integerPart)) return "";

  const units = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  const teens = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  const scales = ["", "THOUSAND", "MILLION", "BILLION"];

  function convertChunk(n: number): string {
    let chunk = "";
    if (n >= 100) {
      chunk += units[Math.floor(n / 100)] + " HUNDRED ";
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      chunk += teens[n - 10] + " ";
    } else {
      if (n >= 20) {
        chunk += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        chunk += units[n] + " ";
      }
    }
    return chunk.trim();
  }

  let words = "";
  let scaleIndex = 0;
  let remaining = integerPart;

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const chunkStr = convertChunk(chunk);
      words = chunkStr + (scales[scaleIndex] ? " " + scales[scaleIndex] : "") + " " + words;
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex++;
  }

  return words.trim().toUpperCase() + " RUPEES ONLY";
}
