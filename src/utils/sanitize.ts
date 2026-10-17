import DOMPurify from 'dompurify';

/**
 * Sanitizes rich text / synopsis HTML from Google Books API to mitigate XSS attacks.
 * Allows safe formatting tags like p, b, i, em, strong, br, ul, ol, li.
 */
export function sanitizeHtml(rawHtml: string | undefined | null): string {
  if (!rawHtml) return '';

  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Strips all HTML tags and returns clean plain text
 */
export function stripHtml(rawHtml: string | undefined | null): string {
  if (!rawHtml) return '';
  const sanitized = DOMPurify.sanitize(rawHtml, { ALLOWED_TAGS: [] });
  return sanitized.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
