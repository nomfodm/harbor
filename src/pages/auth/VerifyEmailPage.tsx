import { useEffect, useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/button/Button';
import { sendVerificationCode, activateAccount } from '../../api/user';
import { friendlyError } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';
import styles from './VerifyEmailPage.module.css';

const CODE_LEN = 6;
const CODE_TTL = 300; // seconds, must match backend

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { email?: string; expiresAt?: string } | null };
  const setUser = useAppStore((s) => s.setUser);
  const user = useAppStore((s) => s.user);

  const email = state?.email ?? user?.email ?? '';
  const [expiresAt, setExpiresAt] = useState<string | null>(state?.expiresAt ?? null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [code, setCode] = useState<string[]>(Array(CODE_LEN).fill(''));
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown tick
  useEffect(() => {
    if (!expiresAt) { setSecondsLeft(0); return; }
    const end = new Date(expiresAt).getTime();
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  // Auto-focus first box on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Redirect if already active
  useEffect(() => {
    if (user?.isActive) navigate('/account/profile', { replace: true });
  }, [user?.isActive, navigate]);

  function handleChange(i: number, raw: string) {
    const char = raw.replace(/\s/g, '').slice(-1).toUpperCase();
    const next = [...code];
    next[i] = char;
    setCode(next);
    setHasError(false);
    if (char && i < CODE_LEN - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (code[i]) {
        const next = [...code];
        next[i] = '';
        setCode(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < CODE_LEN - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  }

  function handlePaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\s/g, '').toUpperCase();
    const next = [...code];
    let last = i;
    for (let j = 0; j < pasted.length && i + j < CODE_LEN; j++) {
      next[i + j] = pasted[j];
      last = i + j;
    }
    setCode(next);
    inputRefs.current[Math.min(last + 1, CODE_LEN - 1)]?.focus();
  }

  async function handleSubmit() {
    const full = code.join('');
    if (full.length < CODE_LEN) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await activateAccount(email, full);
      if (user) setUser({ ...user, isActive: true });
      navigate('/account/profile', { replace: true });
    } catch (err) {
      setHasError(true);
      setErrorMsg(friendlyError(err, 'Неверный или истёкший код'));
      setCode(Array(CODE_LEN).fill(''));
      setTimeout(() => { setHasError(false); inputRefs.current[0]?.focus(); }, 400);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setErrorMsg('');
    try {
      const res = await sendVerificationCode('activation');
      setExpiresAt(res.expires_at);
      setCode(Array(CODE_LEN).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(friendlyError(err));
    } finally {
      setResending(false);
    }
  }

  const isFull = code.every(Boolean);
  const expired = secondsLeft === 0;
  const progress = expiresAt ? (secondsLeft / CODE_TTL) * 100 : 0;

  return (
    <AuthShell
      title="Подтверждение почты"
      sub="Уже подтвердили?"
      linkLabel="Войти"
      onLink={() => navigate('/login')}
    >
      <span className={styles.icon}>✉</span>

      <p className={styles.emailHint}>
        Мы отправили 6-значный код на{' '}
        {email ? <span className={styles.emailAddress}>{email}</span> : 'вашу почту'}
      </p>

      <div className={styles.otpRow}>
        {code.map((ch, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            className={`${styles.otpBox} ${ch ? styles.filled : ''} ${hasError ? styles.error : ''}`}
            value={ch}
            maxLength={2}
            inputMode="text"
            autoComplete="one-time-code"
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
          />
        ))}
      </div>

      {expiresAt && (
        <div className={styles.timerWrap}>
          <div className={styles.timerTrack}>
            <div className={styles.timerBar} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.timerLabel}>
            {expired
              ? <span className={styles.timerExpired}>Код истёк</span>
              : <span>Код действует ещё {fmt(secondsLeft)}</span>
            }
          </div>
        </div>
      )}

      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <Button
        variant="primary"
        className={styles.submitBtn}
        disabled={!isFull || loading}
        onClick={handleSubmit}
      >
        {loading ? 'Проверяем…' : 'Подтвердить'}
      </Button>

      <div className={styles.resendRow}>
        <span>Не получили письмо?</span>
        <Button
          variant="plain"
          size="sm"
          disabled={!expired || resending}
          onClick={handleResend}
        >
          {resending ? 'Отправляем…' : 'Отправить повторно'}
        </Button>
      </div>
    </AuthShell>
  );
}
