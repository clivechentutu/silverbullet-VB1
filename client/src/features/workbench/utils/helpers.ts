/**
 * Safely parse URLs that may or may not have a protocol
 */
export const safeGetHostname = (url: string): string => {
  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    return new URL(normalizedUrl).hostname.replace('www.', '');
  } catch {
    return url.replace('www.', '');
  }
};

/**
 * Normalize URL to ensure it has a protocol
 */
export const normalizeUrl = (url: string): string => {
  return url.startsWith('http') ? url : `https://${url}`;
};

/**
 * Format date for display in session groups
 */
export const getSessionGroup = (date: Date): 'Today' | 'Yesterday' | 'Previous' => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  return isToday ? 'Today' : isYesterday ? 'Yesterday' : 'Previous';
};

/**
 * Get days difference from date string for sorting
 */
export const getDaysFromDateString = (dateStr: string): number => {
  if (dateStr.includes('h ago')) return 0;
  if (dateStr === 'Yesterday') return 1;
  const match = dateStr.match(/(\d+) day/);
  if (match) return parseInt(match[1]);
  if (dateStr === '1 week ago') return 7;
  return 999;
};

/**
 * Format timezone for display
 */
export const formatTimezone = (tz: string): string => {
  return tz.replace('_', ' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
