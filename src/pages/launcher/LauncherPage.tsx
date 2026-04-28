import type { CSSProperties } from 'react';
import { FadeIn } from '../../components/fade/FadeIn';
import { Button } from '../../components/ui/button/Button';
import { Card } from '../../components/ui/card/Card';
import type { Navigate, User } from '../../types';
import styles from './LauncherPage.module.css';

interface LauncherPageProps {
  setPage: Navigate;
  user: User | null;
}

export function LauncherPage({ setPage, user }: LauncherPageProps) {
  const platforms = [
    { name: 'Windows', icon: '🪟', ext: '.exe', size: '48 MB', col: 'rgba(0,120,215,0.15)' },
    { name: 'macOS', icon: '🍎', ext: '.dmg', size: '52 MB', col: 'rgba(255,80,80,0.12)' },
    { name: 'Linux', icon: '🐧', ext: '.AppImage', size: '50 MB', col: 'rgba(255,180,0,0.12)' },
  ];
  const changelog = [
    { ver: '2.1.0', date: '15 апр. 2026', notes: ['Новый интерфейс лаунчера', 'Автообновление игры', 'Улучшена стабильность соединения'] },
    { ver: '2.0.1', date: '2 апр. 2026', notes: ['Исправлен вылет на Windows 11', 'Исправлена потеря сессии при перезапуске'] },
    { ver: '2.0.0', date: '10 мар. 2026', notes: ['Полностью переработан интерфейс', 'Поддержка macOS Apple Silicon'] },
  ];

  return (
    <div className={`page ${styles.page}`}>
      <FadeIn>
        <div className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeText}>ВЕРСИЯ 2.1.0</span>
          </div>
          <h1 className={styles.title}>
            Infinity <span className="grad-text">Launcher</span>
          </h1>
          <p className={styles.copy}>
            Один клик — и вы в игре. Автообновления, управление версиями, поддержка модов.
          </p>

          <div className={styles.platforms}>
            {platforms.map((platform) => (
              <Card
                key={platform.name}
                className={styles.platformCard}
                style={{ '--platform-hover-bg': platform.col } as CSSProperties}
              >
                <div className={styles.platformIcon}>{platform.icon}</div>
                <div className={styles.platformName}>{platform.name}</div>
                <div className={styles.platformMeta}>{platform.size} · {platform.ext}</div>
                <div className={styles.download}>↓ Скачать</div>
              </Card>
            ))}
          </div>
          {!user && (
            <p className={styles.registerNote}>
              Для игры необходим аккаунт.{' '}
              <Button variant="plain" size="sm" onClick={() => setPage('register')} className={styles.registerLink}>Зарегистрироваться</Button>
            </p>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h2 className={styles.historyTitle}>История версий</h2>
        <div className={styles.changelog}>
          {changelog.map((change) => (
            <Card key={change.ver} className={styles.changeCard}>
              <div>
                <div className={styles.version}>
                  <span className="grad-text">v{change.ver}</span>
                </div>
                <div className={styles.date}>{change.date}</div>
              </div>
              <ul className={styles.notes}>
                {change.notes.map((note) => (
                  <li key={note} className={styles.note}>
                    <div className={styles.noteDot} />
                    {note}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
