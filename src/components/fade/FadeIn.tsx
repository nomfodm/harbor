import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './FadeIn.module.css';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  from?: 'bottom' | 'left' | 'right';
}

export function FadeIn({ children, delay = 0, from = 'bottom' }: FadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.12 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const ty = from === 'bottom' ? 24 : 0;
  const tx = from === 'left' ? -24 : from === 'right' ? 24 : 0;

  return (
    <div
      ref={ref}
      className={`${styles.root} ${visible ? styles.visible : ''}`}
      style={{
        '--fade-delay': `${delay}s`,
        '--fade-x': `${tx}px`,
        '--fade-y': `${ty}px`,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}
