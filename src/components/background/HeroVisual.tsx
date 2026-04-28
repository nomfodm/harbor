import type { CSSProperties } from 'react';
import { InfinityLogo } from '../logo/InfinityLogo';
import styles from './HeroVisual.module.css';

export function HeroVisual() {
  const cubes = [
    { size: 72, x: 55, y: 12, dur: 4.2, del: 0, rot: 'rotate3d(1,1,0,40deg)', col: 'var(--grad)' },
    { size: 48, x: 73, y: 38, dur: 3.6, del: 0.7, rot: 'rotate3d(0,1,1,50deg)', col: 'var(--grad-r)' },
    { size: 36, x: 62, y: 66, dur: 5.1, del: 1.3, rot: 'rotate3d(1,0,1,45deg)', col: 'var(--grad)' },
    { size: 60, x: 82, y: 20, dur: 4.7, del: 0.3, rot: 'rotate3d(1,1,1,35deg)', col: 'var(--grad-r)' },
    { size: 26, x: 67, y: 80, dur: 3.3, del: 1.8, rot: 'rotate3d(1,1,1,50deg)', col: 'var(--grad)' },
    { size: 42, x: 90, y: 50, dur: 4.4, del: 1.0, rot: 'rotate3d(0,1,0,40deg)', col: 'var(--grad-r)' },
    { size: 20, x: 78, y: 72, dur: 3.3, del: 1.8, rot: 'rotate3d(1,1,1,50deg)', col: 'var(--grad)' },
  ];

  return (
    <div className={styles.root}>
      {cubes.map((cube, index) => (
        <div
          key={index}
          className={styles.cube}
          style={{
            '--cube-x': `${cube.x}%`,
            '--cube-y': `${cube.y}%`,
            '--cube-size': `${cube.size}px`,
            '--cube-color': cube.col,
            '--cube-rotation': cube.rot,
            '--cube-animation': index % 2 ? 'float-y2' : 'float-y',
            '--cube-duration': `${cube.dur}s`,
            '--cube-delay': `${cube.del}s`,
          } as CSSProperties}
        />
      ))}
      <div className={styles.logoFloat}>
        <div className={styles.logoGlow}>
          <InfinityLogo size={180} />
        </div>
      </div>
    </div>
  );
}
