import type { NavItem } from '../types/NavItem';

/** A section is active when the current path is the item's page or below it. */
export const isActiveNavItem = (item: NavItem, pathname: string): boolean => {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  if (item.href === '/') {
    return path === '/';
  }

  return path === item.href || path.startsWith(`${item.href}/`);
};
