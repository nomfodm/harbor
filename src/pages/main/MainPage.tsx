import {useEffect, useState, type CSSProperties} from "react";
import {FadeIn} from "../../components/fade/FadeIn";
import {FeatureCard} from "../../components/card/FeatureCard";
import {HeroBg} from "../../components/background/HeroBg";
import {HeroVisual} from "../../components/background/HeroVisual";
import {Button} from "../../components/ui/button/Button";
import {useAppStore} from "../../store/useAppStore";
import type {Navigate} from "../../types";
import styles from "./MainPage.module.css";

interface MainPageProps {
    setPage: Navigate;
}

export function MainPage({setPage}: MainPageProps) {
    const user = useAppStore((s) => s.user);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timeout = window.setTimeout(() => setMounted(true), 60);
        return () => window.clearTimeout(timeout);
    }, []);

    const anim = (delay: number): CSSProperties => ({
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(28px)",
        transition: `opacity .7s ${delay}s cubic-bezier(.16,1,.3,1), transform .7s ${delay}s cubic-bezier(.16,1,.3,1)`,
    });

    return (
        <div>
            <section className={styles.hero}>
                <HeroBg/>
                <HeroVisual/>

                <div className={styles.heroInner}>
                    <div className={styles.cosmicGrid}>
                        <div className={styles.cosmicContent}>
                            <div
                                className={`${styles.badge} ${styles.badgeCosmic}`}
                                style={anim(0.05)}
                            >
                                <span className={styles.badgeText}>ГЛОБАЛЬНОЕ ОБНОВЛЕНИЕ</span>
                            </div>
                            <h1
                                className={`${styles.title} ${styles.cosmicTitle}`}
                                style={anim(0.1)}
                            >
                                Добро
                                <br/>
                                пожаловать
                                <br/>
                                на <span className="grad-text">Infinity</span>
                            </h1>
                            <p
                                className={`${styles.copy} ${styles.cosmicCopy}`}
                                style={anim(0.2)}
                            >
                                Создавайте грандиозные постройки, исследуйте бескрайние миры и
                                сражайтесь с опасностями вместе с друзьями.
                            </p>
                            <div className={styles.heroActions} style={anim(0.28)}>
                                <Button variant="primary" onClick={() => setPage("launcher")}>
                                    Играть
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setPage(user ? "pa" : "login")}
                                >
                                    {user ? "Личный кабинет" : "Войти"}
                                </Button>
                            </div>
                        </div>
                        <div className={styles.visualSpacer}/>
                    </div>
                </div>

                <div className={styles.scrollCue}>
                    <span className={styles.scrollText}>SCROLL</span>
                    <div className={styles.scrollLine}/>
                </div>
            </section>

            <section className={styles.section}>
                <FadeIn>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Всё что нужно для игры</h2>
                        <p className={styles.sectionCopy}>
                            Простая регистрация, собственный лаунчер и полная персонализация
                        </p>
                    </div>
                </FadeIn>
                <div className={styles.featuresGrid}>
                    <FeatureCard
                        delay={0}
                        icon="🚀"
                        title="Собственный лаунчер"
                        desc="Скачайте лаунчер и заходите в игру в один клик. Автообновление и лёгкая настройка без лишних шагов."
                    />
                    <FeatureCard
                        delay={0.1}
                        icon="🎨"
                        title="Персонализация"
                        desc="Загрузите свой скин и плащ. Ваш персонаж будет выглядеть именно так, как вы хотите."
                    />
                    <FeatureCard
                        delay={0.2}
                        icon="🔒"
                        title="Защищённый аккаунт"
                        desc="Надёжная аутентификация, управление сессиями и двухфакторная защита."
                    />
                </div>
            </section>

            <section className={styles.ctaSection}>
                <FadeIn>
                    <div className={styles.cta}>
                        <div className={styles.ctaOrbLeft}/>
                        <div className={styles.ctaOrbRight}/>
                        <div className={styles.ctaContent}>
                            <div>
                                <h2 className={styles.ctaTitle}>Готовы начать?</h2>
                                <p className={styles.ctaCopy}>
                                    Зарегистрируйтесь и скачайте лаунчер прямо сейчас
                                </p>
                            </div>
                            <div className={styles.ctaActions}>
                                {!user && (
                                    <Button
                                        variant="unstyled"
                                        onClick={() => setPage("register")}
                                        className={styles.createButton}
                                    >
                                        Создать аккаунт
                                    </Button>
                                )}
                                <Button
                                    variant="unstyled"
                                    onClick={() => setPage("launcher")}
                                    className={styles.launcherButton}
                                >
                                    Лаунчер ↓
                                </Button>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </section>
        </div>
    );
}
