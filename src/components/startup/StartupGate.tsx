import { useEffect, useRef, useState, type ReactNode } from 'react';
import { checkBackend, checkS3, type ServiceStatus } from '../../api/health';
import styles from './StartupGate.module.css';

type Phase = 'checking' | 'maintenance' | 'error';

function statusClass(s: ServiceStatus): string {
  if (s.status === 'operational' || (s.ok && !s.status)) return styles.ok;
  if (s.status === 'maintenance') return styles.maint;
  return styles.fail;
}

function statusLabel(s: ServiceStatus): { text: string; cls: string } {
  if (s.status === 'operational' || (s.ok && !s.status)) return { text: 'РАБОТАЕТ',   cls: styles.labelOk   };
  if (s.status === 'maintenance')                         return { text: 'ТЕХ. РАБОТЫ', cls: styles.labelMaint };
  return                                                         { text: 'НЕДОСТУПЕН', cls: styles.labelFail  };
}

function CheckingView() {
  return (
    <div className={styles.checking}>
      <div className={styles.infinity}>∞</div>
      <div className={styles.brand}>Infinity</div>
      <div className={styles.checkLabel}>Проверяем подключение к серверам</div>
      <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}

function MaintenanceView({ statuses }: { statuses: ServiceStatus[] }) {
  return (
    <div className={styles.maintenance}>
      <div className={styles.maintIconWrap}>🔧</div>
      <div className={styles.maintTitle}>Технические работы</div>
      <div className={styles.maintSub}>
        Сервер временно недоступен — мы уже работаем над этим.
        <br />Попробуйте зайти чуть позже.
      </div>
      <div className={styles.serviceList}>
        {statuses.map((s) => {
          const lbl = statusLabel(s);
          return (
            <div key={s.id} className={styles.serviceRow}>
              <span className={`${styles.statusDot} ${statusClass(s)}`} />
              <span className={styles.serviceName}>{s.label}</span>
              <span className={lbl.cls}>{lbl.text}</span>
            </div>
          );
        })}
      </div>
      <button className={styles.retryBtn} onClick={() => window.location.reload()}>
        Обновить страницу
      </button>
    </div>
  );
}

function ErrorView({ statuses, onRetry }: { statuses: ServiceStatus[]; onRetry: () => void }) {
  return (
    <div className={styles.error}>
      <div className={styles.errorIconWrap}>⚠</div>
      <div className={styles.errorTitle}>Сервис недоступен</div>
      <div className={styles.errorSub}>
        Один или несколько компонентов платформы не отвечают.
        <br />Проверьте подключение к сети и попробуйте снова.
      </div>
      <div className={styles.serviceList}>
        {statuses.map((s) => {
          const lbl = statusLabel(s);
          return (
            <div key={s.id} className={styles.serviceRow}>
              <span className={`${styles.statusDot} ${statusClass(s)}`} />
              <span className={styles.serviceName}>{s.label}</span>
              <span className={lbl.cls}>{lbl.text}</span>
            </div>
          );
        })}
      </div>
      <button className={styles.retryBtn} onClick={onRetry}>
        Попробовать снова
      </button>
    </div>
  );
}

export function StartupGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [overlayMounted, setOverlayMounted] = useState(true);
  const [overlayFading, setOverlayFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function runChecks() {
    setPhase('checking');
    setStatuses([]);
    setOverlayFading(false);
    setOverlayMounted(true);

    const [backend, s3] = await Promise.all([checkBackend(), checkS3()]);
    const results = [backend, s3].filter(Boolean) as ServiceStatus[];
    setStatuses(results);

    const backendStatus = backend.status;

    if (results.every((s) => s.ok)) {
      setOverlayFading(true);
      fadeTimer.current = setTimeout(() => setOverlayMounted(false), 480);
    } else if (backendStatus === 'maintenance') {
      setPhase('maintenance');
    } else {
      setPhase('error');
    }
  }

  useEffect(() => {
    runChecks();
    return () => { if (fadeTimer.current) clearTimeout(fadeTimer.current); };
  }, []);

  return (
    <>
      {overlayMounted && (
        <div className={`${styles.overlay} ${overlayFading ? styles.overlayFading : ''}`}>
          {phase === 'checking'    && <CheckingView />}
          {phase === 'maintenance' && <MaintenanceView statuses={statuses} />}
          {phase === 'error'       && <ErrorView statuses={statuses} onRetry={runChecks} />}
        </div>
      )}
      {children}
    </>
  );
}
