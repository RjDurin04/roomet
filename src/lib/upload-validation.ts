/**
 * Shared upload validation utilities.
 * SEC-004: Client-side defense-in-depth for file uploads.
 * Server-side validation (magic bytes) should be added as a Convex action.
 */

export const UPLOAD_LIMITS = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Maximum number of property gallery images */
  MAX_PROPERTY_IMAGES: 20,
  /** Maximum number of chat attachment images */
  MAX_CHAT_IMAGES: 5,
  /** Maximum profile image size in bytes (5MB) */
  MAX_PROFILE_IMAGE_SIZE: 5 * 1024 * 1024,
  /** Allowed MIME types for image uploads — SVG intentionally excluded (XSS vector) */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as readonly string[],
} as const;

/**
 * Validate a single file for upload.
 * Returns an error message string, or null if valid.
 */
export function validateImageFile(
  file: File,
  maxSize: number = UPLOAD_LIMITS.MAX_FILE_SIZE
): string | null {
  if (!UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Invalid file type: "${file.name}". Allowed: JPEG, PNG, WebP.`;
  }
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return `File too large: "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum ${maxMB}MB.`;
  }
  return null;
}

/**
 * Validate an array of files for upload.
 * Returns an array of error messages (empty if all valid).
 */
export function validateImageFiles(
  files: File[],
  maxSize: number = UPLOAD_LIMITS.MAX_FILE_SIZE
): string[] {
  return files
    .map((f) => validateImageFile(f, maxSize))
    .filter((err): err is string => err !== null);
}
