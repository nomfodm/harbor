import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/button/Button';
import { FormField } from '../../components/ui/form/FormField';
import { login } from '../../api/auth';
import { getMe, sendVerificationCode, userFromResponse } from '../../api/user';
import { friendlyError } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';
import type { Navigate } from '../../types';
import styles from './AuthForm.module.css';

interface LoginPageProps {
  setPage: Navigate;
}

export function LoginPage({ setPage }: LoginPageProps) {
  const setUser = useAppStore((s) => s.setUser);
  const setToken = useAppStore((s) => s.setToken);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!form.username || !form.password) {
      setError('Заполните все поля');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль слишком короткий');
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await login(form.username, form.password);
      setToken(access_token);
      const me = await getMe();
      setUser(userFromResponse(me));

      if (!me.is_active) {
        const code = await sendVerificationCode('activation');
        navigate('/verify-email', { state: { email: code.email, expiresAt: code.expires_at } });
      } else {
        setPage('pa');
      }
    } catch (err) {
      setError(friendlyError(err, 'Неверный логин или пароль'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Добро пожаловать!" sub="Нет аккаунта?" linkLabel="Создайте же его!" onLink={() => setPage('register')}>
      <form onSubmit={submit}>
        <FormField label="Имя пользователя">
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="thebestplayer" autoFocus />
        </FormField>
        <FormField label="Пароль" spacious>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </FormField>
        {error && <div className={styles.error}>{error}</div>}
        <Button variant="primary" size="md" block className={`${styles.submit} ${loading ? styles.loading : ''}`} type="submit">
          {loading ? 'Входим…' : 'Войти'}
        </Button>
      </form>
    </AuthShell>
  );
}
