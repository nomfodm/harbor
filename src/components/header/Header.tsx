import { useState } from 'react';
import type { PageId, Theme, User } from '../../types';
import { InfinityLogo } from '../logo/InfinityLogo';
import { Button } from '../ui/button/Button';
import styles from './Header.module.css';

interface HeaderProps {
  page: PageId;
  setPage: (page: PageId) => void;
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
}

const navItems: Array<{ id: PageId; label: string }> = [
  { id: 'main', label: 'Главная' },
  { id: 'launcher', label: 'Лаунчер' },
];

export function Header({ page, setPage, theme, toggleTheme, user }: HeaderProps) {
  const isDark = theme === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (p: PageId) => {
    setPage(p);
    setMenuOpen(false);
  };

  return (
    <header className={`${styles.header} ${isDark ? styles.dark : styles.light}`}>
      <div className={styles.inner}>
        <Button variant="unstyled" onClick={() => navigate('main')} className={styles.brand}>
          <InfinityLogo size={34} />
          <span className={styles.brandText}>Infinity</span>
        </Button>

        <div className={styles.actions}>
          {navItems.map((item) => (
            <Button
              variant="unstyled"
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`${styles.navButton} ${page === item.id ? styles.navButtonActive : ''}`}
            >
              {item.label}
            </Button>
          ))}
          <div className={styles.divider} />
          {user ? (
            <Button
              variant="unstyled"
              onClick={() => navigate('pa')}
              className={`${styles.profileButton} ${page === 'pa' ? styles.profileButtonActive : ''}`}
            >
              <div className={styles.avatar}>
                {user.username[0]?.toUpperCase()}
              </div>
              <span className={styles.username}>{user.username}</span>
            </Button>
          ) : (
            <Button variant="primary" size="sm" className={styles.loginButton} onClick={() => navigate('login')}>Войти</Button>
          )}
          <Button variant="unstyled" onClick={toggleTheme} className={styles.themeButton}>{isDark ? '☀️' : '🌙'}</Button>

          <button
            className={styles.burgerButton}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Открыть меню"
          >
            <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerTop : ''}`} />
            <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerMid : ''}`} />
            <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerBot : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={`${styles.mobileMenu} ${isDark ? styles.dark : styles.light}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`${styles.mobileNavItem} ${page === item.id ? styles.mobileNavItemActive : ''}`}
            >
              {item.label}
            </button>
          ))}
          {user ? (
            <button
              onClick={() => navigate('pa')}
              className={`${styles.mobileNavItem} ${page === 'pa' ? styles.mobileNavItemActive : ''}`}
            >
              👤 {user.username}
            </button>
          ) : (
            <button onClick={() => navigate('login')} className={styles.mobileNavLogin}>
              Войти
            </button>
          )}
        </div>
      )}
    </header>
  );
}
