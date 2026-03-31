import { UI_CONSTANTS } from './constants';

/**
 * Shared upload validation utilities.
 * SEC-004: Client-side defense-in-depth for file uploads.
 * Server-side validation (magic bytes) should be added as a Convex action.
 */

export const UPLOAD_LIMITS = {
  /** Maximum file size in bytes (10MB) */
  get MAX_FILE_SIZE() { return UI_CONSTANTS.MAX_FILE_SIZE; },
  /** Maximum number of property gallery images */
  get MAX_PROPERTY_IMAGES() { return UI_CONSTANTS.MAX_PROPERTY_IMAGES; },
  /** Maximum number of chat attachment images */
  get MAX_CHAT_IMAGES() { return UI_CONSTANTS.MAX_CHAT_IMAGES; },
  /** Maximum profile image size in bytes (5MB) */
  get MAX_PROFILE_IMAGE_SIZE() { return UI_CONSTANTS.MAX_PROFILE_IMAGE_SIZE; },
  /** Allowed MIME types for image uploads — SVG intentionally excluded (XSS vector) */
  get ALLOWED_IMAGE_TYPES() { return UI_CONSTANTS.ALLOWED_IMAGE_TYPES; },
} as const;

/**
 * Validate a single file for upload.
 * Returns an error message string, or null if valid.
 */
export function validateImageFile(
  file: File,
  maxSize: number = UI_CONSTANTS.MAX_FILE_SIZE
): string | null {
  if (!(UI_CONSTANTS.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `Invalid file type: "${file.name}". Allowed: JPEG, PNG, WebP.`;
  }
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (UI_CONSTANTS.MB_BYTES));
    return `File too large: "${file.name}" (${(file.size / (UI_CONSTANTS.MB_BYTES)).toFixed(1)}MB). Maximum ${maxMB}MB.`;
  }
  return null;
}

/**
 * Validate an array of files for upload.
 * Returns an array of error messages (empty if all valid).
 */
export function validateImageFiles(
  files: File[],
  maxSize: number = UI_CONSTANTS.MAX_FILE_SIZE
): string[] {
  return files
    .map((f: any) => validateImageFile(f, maxSize))
    .filter((err): err is string => err !== null);
}
