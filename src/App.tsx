import { useCallback, useEffect, useState } from "react";
import {
  Navigate as RouterNavigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Header } from "./components/header/Header";
import { InfinityLogo } from "./components/logo/InfinityLogo";
import { LauncherPage } from "./pages/launcher/LauncherPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { MainPage } from "./pages/main/MainPage";
import { PersonalAccount } from "./pages/account/PersonalAccount";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PAGE_PATHS, pageFromPath } from "./routes";
import type { PageId, Theme, User } from "./types";
import styles from "./App.module.css";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageFromPath(location.pathname);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const goPage = useCallback(
    (nextPage: PageId) => {
      navigate(PAGE_PATHS[nextPage]);
    },
    [navigate],
  );

  return (
    <div className={styles.root}>
      <Header
        page={page}
        setPage={goPage}
        theme={theme}
        toggleTheme={() =>
          setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark",
          )
        }
        user={user}
      />

      <Routes>
        <Route
          path="/"
          element={
            <MainPage
              setPage={goPage}
              user={user}
            />
          }
        />
        <Route path="/main" element={<RouterNavigate to="/" replace />} />
        <Route
          path="/launcher"
          element={<LauncherPage setPage={goPage} user={user} />}
        />
        <Route
          path="/login"
          element={<LoginPage setPage={goPage} setUser={setUser} />}
        />
        <Route
          path="/register"
          element={<RegisterPage setPage={goPage} setUser={setUser} />}
        />
        <Route
          path="/account/*"
          element={
            user ? (
              <PersonalAccount user={user} setUser={setUser} setPage={goPage} />
            ) : (
              <RouterNavigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pa"
          element={<RouterNavigate to="/account/profile" replace />}
        />
        <Route path="*" element={<RouterNavigate to="/" replace />} />
      </Routes>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <InfinityLogo size={22} />
          <span className={styles.footerName}>Infinity</span>
        </div>
        <span className={styles.copyright}>
          © 2026
        </span>
      </footer>
    </div>
  );
}
