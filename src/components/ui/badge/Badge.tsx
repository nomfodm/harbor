import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'cyan' | 'muted' | 'success' | 'danger';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({ variant = 'cyan', size = 'sm', className = '', ...props }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`} {...props} />;
}
