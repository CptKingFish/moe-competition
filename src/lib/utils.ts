import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function magicNumberToMimeType(buffer: Buffer): string | null {
  if (buffer.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    // JPEG
    return "image/jpeg";
  } else if (
    buffer
      .slice(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    // PNG
    return "image/png";
  } else {
    // Unknown format
    return null;
  }
}

export function transformEmptyToUndefined<T extends Record<string, unknown>>(
  data: T,
): T {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  ) as T;
}
