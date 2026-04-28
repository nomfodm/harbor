import { useState, type FormEvent } from 'react';
import { AuthShell } from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/button/Button';
import { FormField } from '../../components/ui/form/FormField';
import type { Navigate, SetUser } from '../../types';
import styles from './AuthForm.module.css';

interface LoginPageProps {
  setPage: Navigate;
  setUser: SetUser;
}

export function LoginPage({ setPage, setUser }: LoginPageProps) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!form.username || !form.password) {
      setError('Заполните все поля');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Пароль слишком короткий');
      setLoading(false);
      return;
    }

    setUser({ username: form.username, email: `${form.username}@infinity.gg` });
    setPage('pa');
    setLoading(false);
  }

  return (
    <AuthShell title="Добро пожаловать!" sub="Нет аккаунта?" linkLabel="Создайте же его!" onLink={() => setPage('register')}>
      <form onSubmit={submit}>
        <FormField label="Имя пользователя">
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="thebestplayer" autoFocus />
        </FormField>
        <FormField label="Пароль" spacious>
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" />
        </FormField>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        <Button variant="primary" size="md" block className={`${styles.submit} ${loading ? styles.loading : ''}`} type="submit">
          {loading ? 'Входим…' : 'Войти'}
        </Button>
      </form>
    </AuthShell>
  );
}
