import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FadeIn } from '../../components/fade/FadeIn';
import { Button } from '../../components/ui/button/Button';
import { Card } from '../../components/ui/card/Card';
import { useAppStore } from '../../store/useAppStore';
import { getLatestRelease, detectPlatform, formatFileSize, type LauncherPlatform } from '../../api/launcher';
import styles from './LauncherPage.module.css';

const PLATFORM_META: Record<LauncherPlatform, { label: string; icon: string; ext: string }> = {
  windows: { label: 'Windows', icon: '🪟', ext: '.exe' },
  macos:   { label: 'macOS',   icon: '🍎', ext: '.dmg' },
  linux:   { label: 'Linux',   icon: '🐧', ext: '.AppImage' },
};

const ALL_PLATFORMS: LauncherPlatform[] = ['windows', 'macos', 'linux'];

export function LauncherPage() {
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();
  const platform = useMemo(() => detectPlatform(), []);

  const { data: release, isLoading, isError } = useQuery({
    queryKey: ['launcher-release', platform],
    queryFn: () => getLatestRelease(platform),
  });

  const meta = PLATFORM_META[platform];
  const otherPlatforms = ALL_PLATFORMS.filter((p) => p !== platform);

  return (
    <div className={`page ${styles.page}`}>
      <FadeIn>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Infinity <span className="grad-text">Launcher</span>
          </h1>
          <p className={styles.copy}>
            Один клик — и вы в игре. Автообновления, античит и молниеносность.
          </p>

          <Card className={styles.mainCard}>
            <div className={styles.mainCardInner}>
              <div className={styles.mainPlatformIcon}>{meta.icon}</div>
              <div className={styles.mainPlatformInfo}>
                <div className={styles.mainPlatformName}>{meta.label}</div>
                {isLoading && <div className={styles.releaseLoading}>Загружаем информацию…</div>}
                {isError && <div className={styles.releaseError}>Не удалось загрузить версию</div>}
                {release && (
                  <div className={styles.releaseMeta}>
                    <span>v{release.version}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{formatFileSize(release.file_size)}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{meta.ext}</span>
                  </div>
                )}
              </div>
              <a
                href={release?.download_url}
                download
                className={`${styles.downloadBtn} ${!release ? styles.downloadBtnDisabled : ''}`}
                aria-disabled={!release}
                onClick={(e) => !release && e.preventDefault()}
              >
                ↓ Скачать
              </a>
            </div>
          </Card>

          <div className={styles.otherPlatforms}>
            <span className={styles.otherLabel}>Другие платформы</span>
            {otherPlatforms.map((p) => (
              <OtherPlatformLink key={p} platform={p} />
            ))}
          </div>

          {!user && (
            <p className={styles.registerNote}>
              Для игры необходим аккаунт.{' '}
              <Button variant="plain" size="sm" onClick={() => navigate('/register')} className={styles.registerLink}>
                Зарегистрироваться
              </Button>
            </p>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

function OtherPlatformLink({ platform }: { platform: LauncherPlatform }) {
  const meta = PLATFORM_META[platform];
  const { data } = useQuery({
    queryKey: ['launcher-release', platform],
    queryFn: () => getLatestRelease(platform),
  });

  return (
    <a
      href={data?.download_url}
      download
      className={`${styles.otherPlatformBtn} ${!data ? styles.otherPlatformBtnDisabled : ''}`}
      onClick={(e) => !data && e.preventDefault()}
    >
      {meta.icon} {meta.label}
    </a>
  );
}
