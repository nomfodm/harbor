import { useState, type FormEvent, type HTMLInputTypeAttribute, type ReactNode } from 'react';
import { AuthShell } from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/button/Button';
import { FormField } from '../../components/ui/form/FormField';
import type { Navigate, SetUser } from '../../types';
import styles from './AuthForm.module.css';

interface RegisterPageProps {
  setPage: Navigate;
  setUser: SetUser;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export function RegisterPage({ setPage, setUser }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterForm>({ username: '', email: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!form.username || !form.email || !form.password) {
      setError('Заполните все поля');
      setLoading(false);
      return;
    }

    if (form.username.length < 5 || form.username.length > 13) {
      setError('Имя пользователя: 5–13 символов');
      setLoading(false);
      return;
    }

    if (!form.email.includes('@')) {
      setError('Некорректный e-mail');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Пароль: минимум 6 символов');
      setLoading(false);
      return;
    }

    if (form.password !== form.password2) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    setUser({ username: form.username, email: form.email });
    setPage('pa');
    setLoading(false);
  }

  const field = (id: keyof RegisterForm, label: string, placeholder: string, type: HTMLInputTypeAttribute = 'text'): ReactNode => (
    <FormField label={label}>
      <input type={type} placeholder={placeholder} value={form[id]} onChange={(event) => setForm({ ...form, [id]: event.target.value })} />
    </FormField>
  );

  return (
    <AuthShell title="Регистрация" sub="Уже есть аккаунт?" linkLabel="Войдите!" onLink={() => setPage('login')}>
      <form onSubmit={submit}>
        {field('username', 'Имя пользователя', 'thebestplayer')}
        {field('email', 'E-mail', 'player@infinity.gg', 'email')}
        {field('password', 'Пароль', '••••••••', 'password')}
        <FormField label="Повторите пароль" spacious>
          <input type="password" placeholder="••••••••" value={form.password2} onChange={(event) => setForm({ ...form, password2: event.target.value })} />
        </FormField>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        <Button variant="primary" size="md" block className={`${styles.submit} ${loading ? styles.loading : ''}`} type="submit">
          {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </Button>
      </form>
    </AuthShell>
  );
}
