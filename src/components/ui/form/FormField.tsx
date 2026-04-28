import type { ReactNode } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  spacious?: boolean;
  className?: string;
}

export function FormField({ label, children, spacious = false, className = '' }: FormFieldProps) {
  return (
    <div className={`${spacious ? styles.large : styles.field} ${className}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}
