import type { ReactNode } from 'react';
import { HeroBg } from '../background/HeroBg';
import { InfinityLogo } from '../logo/InfinityLogo';
import { Button } from '../ui/button/Button';
import styles from './AuthShell.module.css';

interface AuthShellProps {
  title: string;
  sub: string;
  linkLabel: string;
  onLink: () => void;
  children: ReactNode;
}

export function AuthShell({ title, sub, linkLabel, onLink, children }: AuthShellProps) {
  return (
    <div className={`page ${styles.shell}`}>
      <HeroBg variant="cosmic" />
      <div className={styles.content}>
        <div className={styles.heading}>
          <div className={styles.logo}>
            <InfinityLogo size={52} />
          </div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            {sub}{' '}
            <Button variant="plain" size="sm" onClick={onLink} className={styles.linkButton}>{linkLabel}</Button>
          </p>
        </div>
        <div className={`glass ${styles.panel}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
