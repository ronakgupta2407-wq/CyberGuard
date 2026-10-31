/**
 * CyberGuard Data & Display Formatters
 */

/**
 * Extracts a clean hostname or readable label from a target string.
 * Strips http(s)://, www., query parameters, and trailing paths.
 */
export function cleanDomain(target) {
  if (!target || typeof target !== 'string') return 'General Audit';

  const trimmed = target.trim();

  // If it's a URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('://')) {
    try {
      const url = new URL(trimmed);
      return url.hostname.replace(/^www\./i, '');
    } catch {
      // Fallback regex if URL constructor fails
      const match = trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0];
      return match || trimmed;
    }
  }

  // If it looks like a domain without protocol (e.g. "github.com/login" or "google.com")
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return trimmed.split('/')[0].replace(/^www\./i, '');
  }

  // If it's an email address or "From: user@domain.com"
  const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    return emailMatch[1]; // Return domain of sender e.g. "paypal.com"
  }

  // If it's an email subject like "Urgent: Verify Your Account"
  if (trimmed.length > 32) {
    return trimmed.slice(0, 30) + '…';
  }

  return trimmed;
}

/**
 * Formats a timestamp into human readable relative or date format
 */
export function formatScanDate(timestamp) {
  if (!timestamp) return 'Just now';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}
