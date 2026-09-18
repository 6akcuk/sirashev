import type { NavItem } from '../types/NavItem';

/** Exactly three sections. The contact CTA is deliberately not one of them. */
export const navItems: NavItem[] = [
  { label: 'About', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Experience', href: '/experience' },
];
