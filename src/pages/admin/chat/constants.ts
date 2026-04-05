/* ============================================================
   CHAT CONSTANTS — QUICK REPLIES, CONFIG
   ============================================================ */

/** Max message length in characters */
export const MAX_MESSAGE_LENGTH = 2000;

/** How many messages to load per page */
export const MESSAGES_PAGE_SIZE = 30;

/** Debounce delay for search in ms */
export const SEARCH_DEBOUNCE_MS = 300;

/** Polling interval for conversation list refresh (ms) — used until WS is wired */
export const POLLING_INTERVAL_MS = 15_000;

/** Quick reply templates — admin can pick one to prefill the input */
export const QUICK_REPLIES: readonly string[] = [
  'Hello! How can I help you today?',
  'Thank you for reaching out to us.',
  'Your order is being processed, please wait a moment.',
  'We will get back to you within 24 business hours.',
  'Could you please provide your order ID for verification?',
  'We apologize for the inconvenience and will assist you right away.',
];

/** Avatar color map based on initial letter */
export const AVATAR_GRADIENT_MAP: Record<string, string> = {
  A: 'from-violet-500 to-purple-600',
  B: 'from-blue-500 to-cyan-600',
  C: 'from-emerald-500 to-teal-600',
  D: 'from-orange-500 to-red-600',
  E: 'from-pink-500 to-rose-600',
  F: 'from-amber-500 to-yellow-600',
  default: 'from-[#4988c4] to-[#3a73a8]',
};

/** Get avatar gradient class by first letter */
export function getAvatarGradient(name: string): string {
  const first = name.charAt(0).toUpperCase();
  return AVATAR_GRADIENT_MAP[first] ?? AVATAR_GRADIENT_MAP['default'];
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
