import { useCallback, useEffect } from "react";
import {
  Navigate as RouterNavigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./components/header/Header";
import { InfinityLogo } from "./components/logo/InfinityLogo";
import { LauncherPage } from "./pages/launcher/LauncherPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { MainPage } from "./pages/main/MainPage";
import { PersonalAccount } from "./pages/account/PersonalAccount";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { getMe, userFromResponse } from "./api/user";
import { PAGE_PATHS, pageFromPath } from "./routes";
import { useAppStore } from "./store/useAppStore";
import type { PageId } from "./types";
import styles from "./App.module.css";

export default function App() {
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);
  const setUser = useAppStore((s) => s.setUser);
  const theme = useAppStore((s) => s.theme);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!token,
  });

  useEffect(() => {
    if (!me) return;
    setUser(userFromResponse(me));
  }, [me, setUser]);
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
      <Header page={page} setPage={goPage} />

      <Routes>
        <Route path="/" element={<MainPage setPage={goPage} />} />
        <Route path="/main" element={<RouterNavigate to="/" replace />} />
        <Route path="/launcher" element={<LauncherPage />} />
        <Route path="/login" element={<LoginPage setPage={goPage} />} />
        <Route path="/register" element={<RegisterPage setPage={goPage} />} />
        <Route
          path="/account/*"
          element={
            user ? <PersonalAccount /> : <RouterNavigate to="/login" replace />
          }
        />
        <Route path="/pa" element={<RouterNavigate to="/account/profile" replace />} />
        <Route
          path="/verify-email"
          element={user ? <VerifyEmailPage /> : <RouterNavigate to="/login" replace />}
        />
        <Route path="*" element={<RouterNavigate to="/" replace />} />
      </Routes>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <InfinityLogo size={22} />
          <span className={styles.footerName}>Infinity</span>
        </div>
        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
