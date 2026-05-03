import { useState, type FormEvent, type HTMLInputTypeAttribute, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/button/Button';
import { FormField } from '../../components/ui/form/FormField';
import { signup } from '../../api/auth';
import { getMe, sendVerificationCode, userFromResponse } from '../../api/user';
import { friendlyError } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';
import type { Navigate } from '../../types';
import styles from './AuthForm.module.css';

interface RegisterPageProps {
  setPage: Navigate;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export function RegisterPage({ setPage }: RegisterPageProps) {
  const setUser = useAppStore((s) => s.setUser);
  const setToken = useAppStore((s) => s.setToken);
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ username: '', email: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password) {
      setError('Заполните все поля');
      return;
    }
    if (form.username.length < 5 || form.username.length > 13) {
      setError('Имя пользователя: 5–13 символов');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Некорректный e-mail');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль: минимум 6 символов');
      return;
    }
    if (form.password !== form.password2) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await signup(form.username, form.email, form.password);
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
      setError(friendlyError(err, 'Не удалось создать аккаунт'));
    } finally {
      setLoading(false);
    }
  }

  const field = (id: keyof RegisterForm, label: string, placeholder: string, type: HTMLInputTypeAttribute = 'text'): ReactNode => (
    <FormField label={label}>
      <input type={type} placeholder={placeholder} value={form[id]} onChange={(e) => setForm({ ...form, [id]: e.target.value })} />
    </FormField>
  );

  return (
    <AuthShell title="Регистрация" sub="Уже есть аккаунт?" linkLabel="Войдите!" onLink={() => setPage('login')}>
      <form onSubmit={submit}>
        {field('username', 'Имя пользователя', 'thebestplayer')}
        {field('email', 'E-mail', 'player@infinity.gg', 'email')}
        {field('password', 'Пароль', '••••••••', 'password')}
        <FormField label="Повторите пароль" spacious>
          <input type="password" placeholder="••••••••" value={form.password2} onChange={(e) => setForm({ ...form, password2: e.target.value })} />
        </FormField>
        {error && <div className={styles.error}>{error}</div>}
        <Button variant="primary" size="md" block className={`${styles.submit} ${loading ? styles.loading : ''}`} type="submit">
          {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </Button>
      </form>
    </AuthShell>
  );
}
