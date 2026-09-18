import type { ExternalLink } from '../types/ExternalLink';

/**
 * Upwork and the CV are absent rather than placeholders: no href on this site
 * may be `#`, so a link appears here only once its real URL is known.
 */
export const externalLinks: ExternalLink[] = [
  { label: 'GitHub', href: 'https://github.com/6akcuk' },
  { label: 'Telegram', href: 'https://t.me/denzel_w' },
  { label: 'Dev.to', href: 'https://dev.to/6akcuk' },
  { label: 'Medium', href: 'https://medium.com/@6akcuk' },
];
