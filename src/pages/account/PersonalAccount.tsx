import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/badge/Badge";
import { Button } from "../../components/ui/button/Button";
import { Card } from "../../components/ui/card/Card";
import { FormField } from "../../components/ui/form/FormField";
import { ACHIEVEMENTS, ACTIVITY, SKINS, type SkinItem } from "../../data/account";
import type { Navigate, SetUser, User } from "../../types";
import styles from "./PersonalAccount.module.css";

interface PersonalAccountProps {
  user: User;
  setUser: SetUser;
  setPage: Navigate;
}

type AccountTab = "profile" | "wardrobe" | "settings" | "sessions";
type WardrobeTab = "mine" | "catalog";
type CatalogFilter = "Все" | "Популярные" | "Новые" | "Мои лайки";

const ACCOUNT_TABS: Array<{
  id: AccountTab;
  label: string;
  icon: string;
  path: string;
}> = [
  { id: "profile", label: "Профиль", icon: "👤", path: "/account/profile" },
  {
    id: "wardrobe",
    label: "Гардероб",
    icon: "👕",
    path: "/account/wardrobe",
  },
  {
    id: "settings",
    label: "Настройки",
    icon: "⚙",
    path: "/account/settings",
  },
  { id: "sessions", label: "Сессии", icon: "🖥", path: "/account/sessions" },
];

const CATALOG_FILTERS: CatalogFilter[] = [
  "Все",
  "Популярные",
  "Новые",
  "Мои лайки",
];

function accountTabFromPath(pathname: string): AccountTab {
  if (pathname.includes("/wardrobe")) return "wardrobe";
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/sessions")) return "sessions";
  return "profile";
}

interface DropZoneProps {
  label: string;
  icon: string;
  active: boolean;
  setActive: (active: boolean) => void;
}

function MiniSkinPreview({
  tone = "#25c3e8",
  large = false,
}: {
  tone?: string;
  large?: boolean;
}) {
  return (
    <div
      className={`${styles.figure} ${large ? styles.figureLarge : ""}`}
      style={{ "--skin-tone": tone } as CSSProperties}
    >
      <div className={styles.head}>
        <div className={styles.eyes} />
      </div>
      <div className={styles.body}>
        <span className={styles.infinityMark}>∞</span>
      </div>
      <div className={styles.legs}>
        {[0, 1].map((item) => (
          <div key={item} className={styles.leg} />
        ))}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
    >
      <span />
    </button>
  );
}

export function PersonalAccount({
  user,
  setUser,
  setPage,
}: PersonalAccountProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = accountTabFromPath(location.pathname);

  const [nick, setNick] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [about, setAbout] = useState(
    "Люблю строить базы, фармить редкости и играть командой.",
  );
  const [saved, setSaved] = useState("");
  const [skinDrop, setSkinDrop] = useState(false);
  const [capeDrop, setCapeDrop] = useState(false);
  const [wardrobeTab, setWardrobeTab] = useState<WardrobeTab>("mine");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("Все");
  const [query, setQuery] = useState("");
  const [activeSkinId, setActiveSkinId] = useState(
    SKINS.find((skin) => skin.active)?.id ?? SKINS[0].id,
  );
  const [notifications, setNotifications] = useState({
    news: true,
    events: true,
    security: true,
    messages: false,
  });

  useEffect(() => {
    if (location.pathname === "/account" || location.pathname === "/account/") {
      navigate("/account/profile", { replace: true });
    }
  }, [location.pathname, navigate]);

  const sessions = [
    {
      id: 1,
      device: "Chrome — Windows 11",
      ip: "91.185.xx.xx",
      time: "Сейчас",
      current: true,
      icon: "🌐",
    },
    {
      id: 2,
      device: "Firefox — macOS",
      ip: "185.220.xx.xx",
      time: "2 дня назад",
      current: false,
      icon: "🦊",
    },
    {
      id: 3,
      device: "Лаунчер 2.1.0",
      ip: "91.185.xx.xx",
      time: "5 дней назад",
      current: false,
      icon: "⚡",
    },
  ];

  const activeSkin = SKINS.find((skin) => skin.id === activeSkinId) ?? SKINS[0];
  const mySkins = SKINS.filter((skin) => skin.isOwn);
  const catalogSkins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return SKINS.filter((skin) => {
      if (catalogFilter === "Популярные" && skin.likes < 1500) return false;
      if (catalogFilter === "Новые" && skin.id < 5) return false;
      if (catalogFilter === "Мои лайки" && skin.likes < 2000) return false;
      if (!normalizedQuery) return true;
      return (
        skin.name.toLowerCase().includes(normalizedQuery) ||
        skin.author.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [catalogFilter, query]);

  async function saveProfile() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setUser((currentUser) =>
      currentUser ? { ...currentUser, username: nick, email } : currentUser,
    );
    setSaved("Профиль сохранён");
    window.setTimeout(() => setSaved(""), 2400);
  }

  const DropZone = ({ label, icon, active, setActive }: DropZoneProps) => {
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setActive(false);
      setSaved(`${label}: файл принят`);
      window.setTimeout(() => setSaved(""), 2200);
    };

    return (
      <div
        onDragEnter={() => setActive(true)}
        onDragLeave={() => setActive(false)}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className={`${styles.dropZone} ${active ? styles.dropZoneActive : ""}`}
      >
        <div className={styles.dropIcon}>{active ? "⬇️" : icon}</div>
        <div className={styles.dropTitle}>{label}</div>
        <div className={styles.dropMeta}>PNG · 64×64 или 128×128</div>
      </div>
    );
  };

  const tabBtn = ({
    id,
    label,
    icon,
    path,
  }: (typeof ACCOUNT_TABS)[number]): ReactNode => (
    <Button
      variant="unstyled"
      onClick={() => navigate(path)}
      className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`}
    >
      <span>{icon}</span>
      {label}
    </Button>
  );

  const renderSkinCard = (skin: SkinItem, owned: boolean) => {
    const isActive = skin.id === activeSkinId;

    return (
      <Card
        key={`${owned ? "own" : "catalog"}-${skin.id}`}
        className={`${styles.skinCard} ${isActive ? styles.skinCardActive : ""}`}
      >
        <div
          className={styles.skinCardPreview}
          style={{ "--skin-tone": skin.tone } as CSSProperties}
        >
          <MiniSkinPreview tone={skin.tone} />
          {isActive && (
            <Badge className={styles.activeSkinBadge}>Активен</Badge>
          )}
        </div>
        <div className={styles.skinCardBody}>
          <div>
            <p className={styles.skinName}>{skin.name}</p>
            <p className={styles.skinAuthor}>{skin.author}</p>
          </div>
          <span className={styles.likes}>
            ♥ {skin.likes.toLocaleString("ru-RU")}
          </span>
        </div>
        <div className={styles.skinOverlay}>
          {owned ? (
            <Button
              variant="primary"
              size="sm"
              disabled={isActive}
              onClick={() => setActiveSkinId(skin.id)}
              className={styles.overlayButton}
            >
              {isActive ? "Выбран" : "Применить"}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className={styles.overlayButton}
            >
              В гардероб
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className={`page ${styles.page}`}>
      <section className={styles.accountHero}>
        <div className={styles.coverGrid} />
        <div className={styles.header}>
          <div className={styles.avatar}>{user.username[0]?.toUpperCase()}</div>
          <div className={styles.playerMeta}>
            <div className={styles.titleRow}>
              <h1 className={styles.name}>{user.username}</h1>
              <Badge className={styles.premiumBadge}>Premium</Badge>
            </div>
            <span className={styles.email}>
              {user.email} · на платформе с 12 марта 2022
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setUser(null);
              setPage("main");
            }}
            className={styles.logout}
          >
            Выйти
          </Button>
        </div>
      </section>

      <div className={styles.accountShell}>
        <aside className={styles.sidebar}>
          <nav className={styles.sideNav}>
            {ACCOUNT_TABS.map((item) => tabBtn(item))}
          </nav>
          {/*<div className={styles.balanceCard}>*/}
          {/*  <p>Баланс</p>*/}
          {/*  <strong>2 450 монет</strong>*/}
          {/*  <Button variant="plain" size="sm" className={styles.balanceButton}>*/}
          {/*    Пополнить →*/}
          {/*  </Button>*/}
          {/*</div>*/}
        </aside>

        <main className={styles.content}>
          <div className={styles.mobileTabs}>
            {ACCOUNT_TABS.map((item) => tabBtn(item))}
          </div>

          {/*<div className={styles.mobileBalanceCard}>*/}
          {/*  <p>Баланс</p>*/}
          {/*  <strong>2 450 монет</strong>*/}
          {/*  <Button variant="plain" size="sm" className={styles.balanceButton}>*/}
          {/*    Пополнить →*/}
          {/*  </Button>*/}
          {/*</div>*/}

          {tab === "profile" && (
            <div className={styles.profileStack}>
              {/*<div className={styles.statsGrid}>*/}
              {/*  {[*/}
              {/*    ["⚔", "2 847", "Убийств"],*/}
              {/*    ["🛡", "312", "Смертей"],*/}
              {/*    ["⏱", "1 640", "Часов наиграно"],*/}
              {/*    ["🏆", "5/8", "Достижений"],*/}
              {/*  ].map(([icon, value, label]) => (*/}
              {/*    <Card key={label} className={styles.statBox}>*/}
              {/*      <span>{icon}</span>*/}
              {/*      <div>*/}
              {/*        <strong>{value}</strong>*/}
              {/*        <p>{label}</p>*/}
              {/*      </div>*/}
              {/*    </Card>*/}
              {/*  ))}*/}
              {/*</div>*/}

              <div className={styles.profileGrid}>
                <Card className={styles.panel}>
                  <h3 className={styles.panelTitle}>Скин и плащ</h3>
                  <div className={styles.skinPreview}>
                    <div className={styles.skinGlow} />
                    <div className={styles.previewCenter}>
                      <MiniSkinPreview tone={activeSkin.tone} large />
                      <div className={styles.previewLabel}>
                        Предпросмотр · {activeSkin.name}
                      </div>
                    </div>
                  </div>
                  <div className={styles.dropList}>
                    <DropZone
                      label="Загрузить скин"
                      icon="🧍"
                      active={skinDrop}
                      setActive={setSkinDrop}
                    />
                    <DropZone
                      label="Загрузить плащ"
                      icon="🦸"
                      active={capeDrop}
                      setActive={setCapeDrop}
                    />
                  </div>
                </Card>

                <div className={styles.rightColumn}>
                  <Card className={styles.panel}>
                    <h3
                      className={`${styles.panelTitle} ${styles.panelTitleCompact}`}
                    >
                      Профиль игрока
                    </h3>
                    <p className={styles.panelCopy}>
                      Данные, которые видны в чате, профиле и лаунчере.
                    </p>
                    <FormField label="Никнейм">
                      <input
                        value={nick}
                        onChange={(event) => setNick(event.target.value)}
                        className={styles.nickInput}
                      />
                    </FormField>
                    <FormField label="E-mail">
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={styles.nickInput}
                      />
                    </FormField>
                    <Button
                      variant="primary"
                      block
                      className={styles.saveButton}
                      onClick={saveProfile}
                    >
                      Сохранить профиль
                    </Button>
                    {saved && <div className={styles.saved}>{saved}</div>}
                  </Card>
                  {/*<Card className={styles.panel}>*/}
                  {/*  <h3 className={styles.panelTitle}>Недавняя активность</h3>*/}
                  {/*  <div className={styles.activityList}>*/}
                  {/*    {ACTIVITY.map((item) => (*/}
                  {/*      <div key={item.id} className={styles.activityItem}>*/}
                  {/*        <span>*/}
                  {/*          {item.type === "kill"*/}
                  {/*            ? "⚔"*/}
                  {/*            : item.type === "achievement"*/}
                  {/*              ? "🏆"*/}
                  {/*              : item.type === "purchase"*/}
                  {/*                ? "💎"*/}
                  {/*                : "🎮"}*/}
                  {/*        </span>*/}
                  {/*        <p>{item.text}</p>*/}
                  {/*        <time>{item.time}</time>*/}
                  {/*      </div>*/}
                  {/*    ))}*/}
                  {/*  </div>*/}
                  {/*</Card>*/}
                </div>
              </div>

              {/*<Card className={styles.panel}>*/}
              {/*  <h3 className={styles.panelTitle}>Достижения</h3>*/}
              {/*  <div className={styles.achievementGrid}>*/}
              {/*    {ACHIEVEMENTS.map((achievement) => (*/}
              {/*      <div*/}
              {/*        key={achievement.id}*/}
              {/*        className={`${styles.achievement} ${!achievement.earned ? styles.achievementLocked : ""}`}*/}
              {/*      >*/}
              {/*        <div>{achievement.icon}</div>*/}
              {/*        <strong>{achievement.name}</strong>*/}
              {/*        <p>{achievement.desc}</p>*/}
              {/*      </div>*/}
              {/*    ))}*/}
              {/*  </div>*/}
              {/*</Card>*/}
            </div>
          )}

          {tab === "wardrobe" && (
            <div className={styles.profileStack}>
              <Card className={styles.activeSkinPanel}>
                <div className={styles.activeSkinPreview}>
                  <MiniSkinPreview tone={activeSkin.tone} large />
                </div>
                <div className={styles.activeSkinInfo}>
                  <p className={styles.eyebrow}>Текущий скин</p>
                  <h2>{activeSkin.name}</h2>
                  <p>Автор: {activeSkin.author}</p>
                  <div className={styles.skinBadges}>
                    <Badge variant="muted" size="md">
                      Активен на серверах
                    </Badge>
                    <Badge variant="muted" size="md">
                      {activeSkin.likes.toLocaleString("ru-RU")} лайков
                    </Badge>
                  </div>
                  <div className={styles.wardrobeActions}>
                    <Button variant="primary">Загрузить новый</Button>
                    <Button variant="ghost">Поделиться</Button>
                  </div>
                </div>
              </Card>

              <div className={styles.wardrobeTabs}>
                <Button
                  variant="unstyled"
                  className={
                    wardrobeTab === "mine" ? styles.wardrobeTabActive : ""
                  }
                  onClick={() => setWardrobeTab("mine")}
                >
                  Мой гардероб
                </Button>
                <Button
                  variant="unstyled"
                  className={
                    wardrobeTab === "catalog" ? styles.wardrobeTabActive : ""
                  }
                  onClick={() => setWardrobeTab("catalog")}
                >
                  Каталог сообщества
                </Button>
              </div>

              {wardrobeTab === "mine" && (
                <div>
                  <div className={styles.listHeader}>
                    <span>{mySkins.length} скина</span>
                    <Button variant="ghost" size="sm">
                      Загрузить скин
                    </Button>
                  </div>
                  <div className={styles.skinsGrid}>
                    {mySkins.map((skin) => renderSkinCard(skin, true))}
                    <Button variant="unstyled" className={styles.uploadSlot}>
                      <span>＋</span>
                      <p>Загрузить</p>
                    </Button>
                  </div>
                </div>
              )}

              {wardrobeTab === "catalog" && (
                <div>
                  <div className={styles.filtersRow}>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Поиск по имени или автору..."
                    />
                    <div>
                      {CATALOG_FILTERS.map((filter) => (
                        <Button
                          variant="unstyled"
                          size="sm"
                          key={filter}
                          onClick={() => setCatalogFilter(filter)}
                          className={
                            catalogFilter === filter ? styles.filterActive : ""
                          }
                        >
                          {filter}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.skinsGrid}>
                    {catalogSkins.map((skin) => renderSkinCard(skin, false))}
                  </div>
                  {catalogSkins.length === 0 && (
                    <p className={styles.emptyState}>Ничего не найдено</p>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className={styles.profileStack}>
              <Card className={styles.settingsSection}>
                <div className={styles.settingsHeader}>
                  <span>🛡</span>
                  <h3>Безопасность</h3>
                </div>
                <div className={styles.settingsBody}>
                  <div className={styles.settingRow}>
                    <div>
                      <strong>Текущий пароль</strong>
                      <p>Нужен для подтверждения изменений</p>
                    </div>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <div className={styles.settingRow}>
                    <div>
                      <strong>Новый пароль</strong>
                      <p>Минимум 8 символов</p>
                    </div>
                    <input type="password" placeholder="Новый пароль" />
                  </div>
                  <div className={styles.settingRow}>
                    <div>
                      <strong>Двухфакторная аутентификация</strong>
                      <p>Дополнительная защита входа</p>
                    </div>
                    <Button variant="ghost">Подключить</Button>
                  </div>
                </div>
              </Card>

              {/*<Card className={styles.settingsSection}>*/}
              {/*  <div className={styles.settingsHeader}>*/}
              {/*    <span>🔔</span>*/}
              {/*    <h3>Уведомления</h3>*/}
              {/*  </div>*/}
              {/*  <div className={styles.settingsBody}>*/}
              {/*    {[*/}
              {/*      [*/}
              {/*        "news",*/}
              {/*        "Новости платформы",*/}
              {/*        "Патч-ноты, анонсы и обновления",*/}
              {/*      ],*/}
              {/*      [*/}
              {/*        "events",*/}
              {/*        "Ивенты и турниры",*/}
              {/*        "Старт соревнований и сезонных событий",*/}
              {/*      ],*/}
              {/*      [*/}
              {/*        "security",*/}
              {/*        "Активность аккаунта",*/}
              {/*        "Вход с нового устройства и покупки",*/}
              {/*      ],*/}
              {/*      [*/}
              {/*        "messages",*/}
              {/*        "Сообщения игроков",*/}
              {/*        "Личные сообщения и упоминания",*/}
              {/*      ],*/}
              {/*    ].map(([key, title, desc]) => (*/}
              {/*      <div key={key} className={styles.notificationRow}>*/}
              {/*        <div>*/}
              {/*          <strong>{title}</strong>*/}
              {/*          <p>{desc}</p>*/}
              {/*        </div>*/}
              {/*        <Toggle*/}
              {/*          checked={*/}
              {/*            notifications[key as keyof typeof notifications]*/}
              {/*          }*/}
              {/*          onChange={(checked) =>*/}
              {/*            setNotifications((current) => ({*/}
              {/*              ...current,*/}
              {/*              [key]: checked,*/}
              {/*            }))*/}
              {/*          }*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*    ))}*/}
              {/*  </div>*/}
              {/*</Card>*/}

              {/*<div className={styles.dangerZone}>*/}
              {/*  <div>*/}
              {/*    <h3>Удаление аккаунта</h3>*/}
              {/*    <p>*/}
              {/*      Это действие необратимо. Все данные профиля, история игр и*/}
              {/*      покупки будут удалены навсегда.*/}
              {/*    </p>*/}
              {/*  </div>*/}
              {/*  <Button variant="danger">Удалить аккаунт</Button>*/}
              {/*</div>*/}
            </div>
          )}

          {tab === "sessions" && (
            <div>
              <div className={styles.sessionsTop}>
                <p className={styles.sessionsCount}>
                  {sessions.length} активных сессии
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.compactGhost}
                >
                  Завершить все другие
                </Button>
              </div>
              <div className={styles.sessionList}>
                {sessions.map((session) => (
                  <Card key={session.id} className={styles.sessionCard}>
                    <div
                      className={`${styles.sessionIcon} ${session.current ? styles.sessionIconCurrent : ""}`}
                    >
                      {session.icon}
                    </div>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionDevice}>
                        {session.device}
                        {session.current && (
                          <Badge className={styles.currentBadge}>ТЕКУЩАЯ</Badge>
                        )}
                      </div>
                      <div className={styles.sessionMeta}>
                        IP {session.ip} · {session.time}
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="danger"
                        size="sm"
                        className={styles.endButton}
                      >
                        Завершить
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
