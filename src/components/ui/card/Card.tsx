import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className = '', interactive: _interactive, ...props }: CardProps) {
  return <div className={`${styles.card} ${className}`} {...props} />;
}
