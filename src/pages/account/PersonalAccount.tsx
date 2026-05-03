import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "../../components/ui/badge/Badge";
import { Button } from "../../components/ui/button/Button";
import { Card } from "../../components/ui/card/Card";
import { FormField } from "../../components/ui/form/FormField";
import { logout, getSessions, revokeSession, logoutOthers } from "../../api/auth";
import { getMe, changeNickname, changeEmail, changePassword, sendVerificationCode } from "../../api/user";
import { getCatalog, changeCosmetics, addFromCatalog, publishToCatalog, removeWardrobeItem, renameWardrobeItem, renameCatalogItem, removeCatalogItem } from "../../api/wardrobe";
import { friendlyError } from "../../api/client";
import { SkinViewer } from "../../components/ui/skin-viewer/SkinViewer";
import type { WardrobeItemResponse } from "../../api/user";
import type { CatalogItemResponse } from "../../api/wardrobe";
import { useAppStore } from "../../store/useAppStore";
import { UploadTextureModal } from "./UploadTextureModal";
import { PublishTextureModal } from "./PublishTextureModal";
import styles from "./PersonalAccount.module.css";

type AccountTab = "profile" | "wardrobe" | "settings" | "sessions";
type WardrobeTab = "mine" | "catalog";
type CatalogFilter = "Все" | "Скины" | "Плащи";
type ItemKind = "wardrobe" | "catalog";
type EditingState = { id: number; kind: ItemKind; value: string };
type ConfirmingState = { id: number; kind: ItemKind };

const ACCOUNT_TABS: Array<{ id: AccountTab; label: string; icon: string; path: string }> = [
  { id: "profile",  label: "Профиль",   icon: "👤", path: "/account/profile"  },
  { id: "wardrobe", label: "Гардероб",  icon: "👕", path: "/account/wardrobe" },
  { id: "settings", label: "Настройки", icon: "⚙",  path: "/account/settings" },
  { id: "sessions", label: "Сессии",    icon: "🖥",  path: "/account/sessions" },
];

const CATALOG_FILTERS: CatalogFilter[] = ["Все", "Скины", "Плащи"];

function accountTabFromPath(pathname: string): AccountTab {
  if (pathname.includes("/wardrobe"))  return "wardrobe";
  if (pathname.includes("/settings"))  return "settings";
  if (pathname.includes("/sessions"))  return "sessions";
  return "profile";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function deviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Неизвестное устройство";
  if (userAgent.includes("Launcher")) return userAgent;
  const browser = userAgent.includes("Firefox") ? "Firefox" : userAgent.includes("Safari") && !userAgent.includes("Chrome") ? "Safari" : "Chrome";
  const os = userAgent.includes("Windows") ? "Windows" : userAgent.includes("macOS") ? "macOS" : userAgent.includes("Linux") ? "Linux" : "";
  return `${browser}${os ? " — " + os : ""}`;
}

function deviceIcon(userAgent: string | null): string {
  if (!userAgent) return "🖥";
  if (userAgent.includes("Launcher")) return "⚡";
  if (userAgent.includes("Firefox")) return "🦊";
  return "🌐";
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}>
      <span />
    </button>
  );
}

export function PersonalAccount() {
  const user = useAppStore((s) => s.user)!;
  const setUser = useAppStore((s) => s.setUser);
  const setToken = useAppStore((s) => s.setToken);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tab = accountTabFromPath(location.pathname);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: getSessions });
  const { data: catalog = [], isLoading: catalogLoading, isError: catalogError } = useQuery({ queryKey: ["catalog"], queryFn: getCatalog });

  const wardrobe = me?.minecraft_profile.wardrobe ?? [];
  const activeSkin = me?.minecraft_profile.active_skin ?? null;
  const activeCape = me?.minecraft_profile.active_cape ?? null;
  const activeSkinUrl = activeSkin?.texture.url ?? null;
  const activeCapeUrl = activeCape?.texture.url ?? null;

  const [nick, setNick] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [notification, setNotification] = useState<{ msg: string; err: boolean } | null>(null);

  function notify(msg: string, err = false) {
    setNotification({ msg, err });
    window.setTimeout(() => setNotification(null), 2800);
  }
  const [wardrobeTab, setWardrobeTab] = useState<WardrobeTab>("mine");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("Все");
  const [query, setQuery] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [logoutPassword, setLogoutPassword] = useState("");

  useEffect(() => {
    if (location.pathname === "/account" || location.pathname === "/account/") {
      navigate("/account/profile", { replace: true });
    }
  }, [location.pathname, navigate]);


  const ownedHashes = useMemo(() => new Set(wardrobe.map((i) => i.texture.hash)), [wardrobe]);
  const catalogHashes = useMemo(() => new Set(catalog.map((i) => i.texture.hash)), [catalog]);

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .filter((item) => {
        if (catalogFilter === "Скины" && item.texture.type !== "skin") return false;
        if (catalogFilter === "Плащи" && item.texture.type !== "cape") return false;
        if (q) return item.title.toLowerCase().includes(q);
        return true;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [catalog, catalogFilter, query]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      await changeNickname(nick);
      await changeEmail(email);
    },
    onSuccess: () => {
      setUser({ ...user, username: nick, email });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      notify("Профиль сохранён");
    },
    onError: (err) => notify(friendlyError(err), true),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword(oldPassword, newPassword),
    onSuccess: () => {
      notify("Пароль изменён");
      setOldPassword("");
      setNewPassword("");
    },
    onError: (err) => notify(friendlyError(err), true),
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });

  const logoutOthersMutation = useMutation({
    mutationFn: (password: string) => logoutOthers(password),
    onSuccess: () => {
      setLogoutPassword("");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err) => notify(friendlyError(err), true),
  });

  const changeCosmeticsMutation = useMutation({
    mutationFn: (itemId: number | null) => changeCosmetics(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
    onError: (err) => notify(friendlyError(err), true),
  });

  const addFromCatalogMutation = useMutation({
    mutationFn: (catalogItemId: number) => addFromCatalog(catalogItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      notify("Добавлено в гардероб");
    },
    onError: (err) => notify(friendlyError(err), true),
  });

  const addAndEquipMutation = useMutation({
    mutationFn: async (catalogItemId: number) => {
      const item = await addFromCatalog(catalogItemId);
      await changeCosmetics(item.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      notify("Текстура надета");
    },
    onError: (err) => notify(friendlyError(err), true),
  });

  const publishMutation = useMutation({
    mutationFn: ({ itemId, title }: { itemId: number; title: string }) => publishToCatalog(itemId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      notify("Опубликовано в каталог");
    },
    onError: (err) => notify(friendlyError(err), true),
  });

  const renameWardrobeMutation = useMutation({
    mutationFn: ({ id, label }: { id: number; label: string }) => renameWardrobeItem(id, label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
    onError: (err) => notify(friendlyError(err), true),
  });

  const removeWardrobeMutation = useMutation({
    mutationFn: (id: number) => removeWardrobeItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
    onError: (err) => notify(friendlyError(err), true),
  });

  const renameCatalogMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => renameCatalogItem(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
    onError: (err) => notify(friendlyError(err), true),
  });

  const removeCatalogMutation = useMutation({
    mutationFn: (id: number) => removeCatalogItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
    onError: (err) => notify(friendlyError(err), true),
  });

  function saveEdit() {
    if (!editing) return;
    const value = editing.value.trim();
    if (!value) { setEditing(null); return; }
    if (editing.kind === 'wardrobe') {
      renameWardrobeMutation.mutate({ id: editing.id, label: value });
    } else {
      renameCatalogMutation.mutate({ id: editing.id, title: value });
    }
    setEditing(null);
  }

  async function handleLogout() {
    await logout();
    setToken(null);
    setUser(null);
    navigate("/");
  }

  const [uploadModal, setUploadModal] = useState<{ type: 'skin' | 'cape'; file?: File } | null>(null);
  const [publishModal, setPublishModal] = useState<WardrobeItemResponse | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [confirming, setConfirming] = useState<ConfirmingState | null>(null);
  const [activating, setActivating] = useState(false);
  async function handleActivate() {
    setActivating(true);
    try {
      const res = await sendVerificationCode('activation');
      navigate('/verify-email', { state: { email: res.email, expiresAt: res.expires_at } });
    } finally {
      setActivating(false);
    }
  }

  const tabBtn = ({ id, label, icon, path }: (typeof ACCOUNT_TABS)[number]): ReactNode => (
    <Button variant="unstyled" onClick={() => navigate(path)}
      className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`}>
      <span>{icon}</span>{label}
    </Button>
  );

  const renderWardrobeCard = (item: WardrobeItemResponse) => {
    const isSkin = item.texture.type === 'skin';
    const isActive = isSkin ? item.id === activeSkin?.id : item.id === activeCape?.id;
    const isPublished = catalogHashes.has(item.texture.hash);
    const previewSkinUrl = isSkin ? item.texture.url : activeSkinUrl;
    const previewCapeUrl = isSkin ? null : item.texture.url;
    const isEditing = editing?.kind === 'wardrobe' && editing.id === item.id;
    const isConfirming = confirming?.kind === 'wardrobe' && confirming.id === item.id;
    return (
      <Card key={item.id} className={`${styles.skinCard} ${isActive ? styles.skinCardActive : ""}`}>
        <div className={styles.skinCardPreview}>
          <SkinViewer skinUrl={previewSkinUrl} capeUrl={previewCapeUrl}
            width={110} height={148} animate={false} />
          {isActive && <Badge className={styles.activeSkinBadge}>Активен</Badge>}
          <span className={styles.textureTypePill}>{isSkin ? "Скин" : "Плащ"}</span>
          <div className={styles.skinOverlay}>
            <div className={styles.overlayActions}>
              <Button variant="primary" size="sm" disabled={isActive || changeCosmeticsMutation.isPending}
                onClick={() => changeCosmeticsMutation.mutate(item.id)} className={styles.overlayButton}>
                {isActive ? "Активен" : "Надеть"}
              </Button>
              {isPublished ? (
                <span className={styles.overlayOwned}>Опубликован</span>
              ) : (
                <Button variant="unstyled" size="sm" className={styles.overlayButtonGhost}
                  onClick={() => setPublishModal(item)}>
                  Опубликовать
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className={styles.skinCardBody}>
          {isEditing ? (
            <form className={styles.inlineEdit} onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
              <input className={styles.inlineEditInput} value={editing!.value}
                onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
                onKeyDown={(e) => e.key === 'Escape' && setEditing(null)} autoFocus />
              <button type="submit" className={styles.inlineConfirm}>✓</button>
              <button type="button" className={styles.inlineCancel} onClick={() => setEditing(null)}>✕</button>
            </form>
          ) : isConfirming ? (
            <div className={styles.deleteConfirm}>
              <span>Удалить?</span>
              <button className={styles.deleteYes}
                onClick={() => { removeWardrobeMutation.mutate(item.id); setConfirming(null); }}>Да</button>
              <button className={styles.deleteNo} onClick={() => setConfirming(null)}>Нет</button>
            </div>
          ) : (
            <div className={styles.cardNameRow}>
              <div className={styles.cardNameMeta}>
                <p className={styles.skinName}>{item.label}</p>
                <p className={styles.skinAuthor}>#{item.id}</p>
              </div>
              <div className={styles.cardIconBtns}>
                <button className={styles.cardIconBtn} title="Переименовать"
                  onClick={() => setEditing({ id: item.id, kind: 'wardrobe', value: item.label })}>✎</button>
                <button className={`${styles.cardIconBtn} ${styles.cardIconBtnDanger}`} title="Удалить"
                  onClick={() => setConfirming({ id: item.id, kind: 'wardrobe' })}>✕</button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderCatalogCard = (item: CatalogItemResponse) => {
    const isSkin = item.texture.type === "skin";
    const previewSkinUrl = isSkin ? item.texture.url : activeSkinUrl;
    const previewCapeUrl = isSkin ? null : item.texture.url;
    const ownedItem = wardrobe.find((w) => w.texture.hash === item.texture.hash) ?? null;
    const isOwned = ownedItem !== null;
    const isActive = isOwned && (isSkin ? ownedItem!.id === activeSkin?.id : ownedItem!.id === activeCape?.id);
    const busy = addFromCatalogMutation.isPending || addAndEquipMutation.isPending || changeCosmeticsMutation.isPending;
    const isAuthor = item.author_id === me?.id;
    const isEditing = editing?.kind === 'catalog' && editing.id === item.id;
    const isConfirming = confirming?.kind === 'catalog' && confirming.id === item.id;
    return (
      <Card key={item.id} className={`${styles.skinCard} ${isActive ? styles.skinCardActive : ""}`}>
        <div className={styles.skinCardPreview}>
          <SkinViewer skinUrl={previewSkinUrl} capeUrl={previewCapeUrl}
            width={110} height={148} animate={false} />
          {isActive && <Badge className={styles.activeSkinBadge}>Активен</Badge>}
          {isAuthor
            ? <Badge className={styles.yourBadge}>Ваш</Badge>
            : isOwned && !isActive && <Badge className={styles.ownedBadge}>Есть</Badge>}
          <span className={styles.textureTypePill}>{isSkin ? "Скин" : "Плащ"}</span>
          <div className={styles.skinOverlay}>
            {isActive ? (
              <span className={styles.overlayOwned}>Активен</span>
            ) : isOwned ? (
              <Button variant="primary" size="sm" className={styles.overlayButton}
                disabled={busy}
                onClick={() => changeCosmeticsMutation.mutate(ownedItem!.id)}>
                Надеть
              </Button>
            ) : (
              <div className={styles.overlayActions}>
                <Button variant="primary" size="sm" className={styles.overlayButton}
                  disabled={busy}
                  onClick={() => addAndEquipMutation.mutate(item.id)}>
                  Надеть
                </Button>
                <Button variant="unstyled" size="sm" className={styles.overlayButtonGhost}
                  disabled={busy}
                  onClick={() => addFromCatalogMutation.mutate(item.id)}>
                  В гардероб
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.skinCardBody}>
          {isEditing ? (
            <form className={styles.inlineEdit} onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
              <input className={styles.inlineEditInput} value={editing!.value}
                onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
                onKeyDown={(e) => e.key === 'Escape' && setEditing(null)} autoFocus />
              <button type="submit" className={styles.inlineConfirm}>✓</button>
              <button type="button" className={styles.inlineCancel} onClick={() => setEditing(null)}>✕</button>
            </form>
          ) : isConfirming ? (
            <div className={styles.deleteConfirm}>
              <span>Удалить?</span>
              <button className={styles.deleteYes}
                onClick={() => { removeCatalogMutation.mutate(item.id); setConfirming(null); }}>Да</button>
              <button className={styles.deleteNo} onClick={() => setConfirming(null)}>Нет</button>
            </div>
          ) : (
            <div className={styles.cardNameRow}>
              <div className={styles.cardNameMeta}>
                <p className={styles.skinName}>{item.title}</p>
                <p className={styles.skinAuthor}>{new Date(item.published_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</p>
              </div>
              {isAuthor && (
                <div className={styles.cardIconBtns}>
                  <button className={styles.cardIconBtn} title="Переименовать"
                    onClick={() => setEditing({ id: item.id, kind: 'catalog', value: item.title })}>✎</button>
                  <button className={`${styles.cardIconBtn} ${styles.cardIconBtnDanger}`} title="Удалить"
                    onClick={() => setConfirming({ id: item.id, kind: 'catalog' })}>✕</button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const registeredAt = me?.registered_at ? formatDate(me.registered_at) : user.registeredAt ? formatDate(user.registeredAt) : "—";

  const isActiveBanned = user.isBanned && (
    user.isPermanent || (user.bannedTill != null && new Date(user.bannedTill) > new Date())
  );

  return (
    <div className={`page ${styles.page}`}>
      {uploadModal && (
        <UploadTextureModal
          type={uploadModal.type}
          initialFile={uploadModal.file}
          onClose={() => setUploadModal(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['me'] })}
        />
      )}
      {publishModal && (
        <PublishTextureModal
          item={publishModal}
          onClose={() => setPublishModal(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['catalog'] })}
        />
      )}
      <section className={styles.accountHero}>
        <div className={styles.coverGrid} />
        <div className={styles.header}>
          <div className={`${styles.avatar} ${activeSkin?.texture.avatar_url ? styles.avatarHasImg : ''}`}>
            {activeSkin?.texture.avatar_url
              ? <img src={activeSkin.texture.avatar_url} alt={user.username} className={styles.avatarImg} />
              : user.username[0]?.toUpperCase()}
          </div>
          <div className={styles.playerMeta}>
            <div className={styles.titleRow}>
              <h1 className={styles.name}>{me?.minecraft_profile.nickname ?? user.username}</h1>
              {/*<Badge className={styles.premiumBadge}>Premium</Badge>*/}
            </div>
            <span className={styles.email}>{user.email} · на проекте с {registeredAt}</span>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} className={styles.logout}>Выйти</Button>
        </div>
      </section>

      {isActiveBanned ? (
        <div className={styles.banBanner}>
          <span className={styles.banBannerIcon}>🚫</span>
          <div className={styles.banBannerText}>
            <strong>
              {user.isPermanent ? 'Аккаунт заблокирован навсегда' : 'Аккаунт заблокирован'}
            </strong>
            <span>
              {user.isPermanent
                ? 'Обратитесь в поддержку, если считаете это ошибкой'
                : user.bannedTill
                  ? `Блокировка действует до ${formatDate(user.bannedTill)}`
                  : 'Обратитесь в поддержку для уточнения деталей'}
            </span>
          </div>
        </div>
      ) : !user.isActive && (
        <div className={styles.verifyBanner}>
          <span className={styles.verifyBannerIcon}>✉</span>
          <div className={styles.verifyBannerText}>
            <strong>Email не подтверждён</strong>
            <span>Подтвердите адрес, чтобы получить полный доступ к платформе</span>
          </div>
          <Button variant="ghost" size="sm" className={styles.verifyBannerBtn}
            disabled={activating} onClick={handleActivate}>
            {activating ? 'Отправляем…' : 'Подтвердить →'}
          </Button>
        </div>
      )}

      <div className={styles.accountShell}>
        <aside className={styles.sidebar}>
          <nav className={styles.sideNav}>{ACCOUNT_TABS.map((item) => tabBtn(item))}</nav>
        </aside>

        <main className={styles.content}>
          <div className={styles.mobileTabs}>{ACCOUNT_TABS.map((item) => tabBtn(item))}</div>

          {tab === "profile" && (
            <div className={styles.profileStack}>
              <div className={styles.profileGrid}>
                <Card className={styles.panel}>
                  <h3 className={styles.panelTitle}>Скин и плащ</h3>
                  <div className={styles.skinPreview}>
                    <div className={styles.skinGlow} />
                    <div className={styles.previewCenter}>
                      {activeSkinUrl
                        ? <>
                            <SkinViewer skinUrl={activeSkinUrl} width={120} height={220} />
                            <div className={styles.previewLabel}>
                              Предпросмотр · {activeSkin?.label}
                            </div>
                          </>
                        : <div className={styles.noSkinHint}>
                            <span>🧍</span>
                            <p>Скин не установлен</p>
                            <Button variant="ghost" size="sm" onClick={() => navigate("/account/wardrobe")}>
                              Выбрать →
                            </Button>
                          </div>}
                    </div>
                  </div>
                  <Button variant="ghost" block className={styles.manageTexturesBtn}
                    onClick={() => navigate("/account/wardrobe")}>
                    Управлять текстурами →
                  </Button>
                </Card>

                <div className={styles.rightColumn}>
                  <Card className={styles.panel}>
                    <h3 className={`${styles.panelTitle} ${styles.panelTitleCompact}`}>Профиль игрока</h3>
                    <p className={styles.panelCopy}>Данные, которые видны в чате, профиле и лаунчере.</p>
                    <FormField label="Никнейм">
                      <input value={nick} onChange={(e) => setNick(e.target.value)} className={styles.nickInput} />
                    </FormField>
                    <FormField label="E-mail">
                      <input value={email} onChange={(e) => setEmail(e.target.value)} className={styles.nickInput} />
                    </FormField>
                    <Button variant="primary" block className={styles.saveButton}
                      onClick={() => saveProfileMutation.mutate()}
                      disabled={saveProfileMutation.isPending}>
                      {saveProfileMutation.isPending ? "Сохраняем…" : "Сохранить профиль"}
                    </Button>
                    {notification && (
                      <div className={notification.err ? styles.savedError : styles.saved}>
                        {notification.msg}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}

          {tab === "wardrobe" && (
            <div className={styles.profileStack}>
              <Card className={styles.activeSkinPanel}>
                <div className={styles.activeSkinPreview}>
                  {activeSkinUrl || activeCapeUrl
                    ? <SkinViewer skinUrl={activeSkinUrl} capeUrl={activeCapeUrl} width={180} height={220} />
                    : <div className={styles.noSkinHint}>
                        <span>🧍</span>
                        <p>Нет текстур</p>
                      </div>}
                </div>
                <div className={styles.activeSkinInfo}>
                  <div className={styles.activeTextureRows}>
                    <div>
                      <p className={styles.eyebrow}>Скин</p>
                      <p className={styles.activeTextureName}>{activeSkin?.label ?? <span className={styles.noneLabel}>Не выбран</span>}</p>
                    </div>
                    <div>
                      <p className={styles.eyebrow}>Плащ</p>
                      <p className={styles.activeTextureName}>{activeCape?.label ?? <span className={styles.noneLabel}>Не выбран</span>}</p>
                    </div>
                  </div>
                  <div className={styles.wardrobeActions}>
                    <Button variant="primary" onClick={() => setUploadModal({ type: 'skin' })}>+ Скин</Button>
                    <Button variant="ghost" onClick={() => setUploadModal({ type: 'cape' })}>+ Плащ</Button>
                  </div>
                </div>
              </Card>

              <div className={styles.wardrobeTabs}>
                <Button variant="unstyled" className={wardrobeTab === "mine" ? styles.wardrobeTabActive : ""} onClick={() => setWardrobeTab("mine")}>
                  Мой гардероб
                </Button>
                <Button variant="unstyled" className={wardrobeTab === "catalog" ? styles.wardrobeTabActive : ""} onClick={() => setWardrobeTab("catalog")}>
                  Каталог сообщества
                </Button>
              </div>

              {wardrobeTab === "mine" && (
                <div>
                  <div className={styles.listHeader}>
                    <span>
                      {wardrobe.filter(i => i.texture.type === 'skin').length} скин · {wardrobe.filter(i => i.texture.type === 'cape').length} плащ
                    </span>
                    <div className={styles.listHeaderActions}>
                      <Button variant="ghost" size="sm" onClick={() => setUploadModal({ type: 'skin' })}>+ Скин</Button>
                      <Button variant="ghost" size="sm" onClick={() => setUploadModal({ type: 'cape' })}>+ Плащ</Button>
                    </div>
                  </div>
                  <div className={styles.skinsGrid}>
                    {wardrobe.map((item) => renderWardrobeCard(item))}
                    <Button variant="unstyled" className={styles.uploadSlot} onClick={() => setUploadModal({ type: 'skin' })}>
                      <span>＋</span><p>Загрузить</p>
                    </Button>
                  </div>
                </div>
              )}

              {wardrobeTab === "catalog" && (
                <div>
                  <div className={styles.filtersRow}>
                    <input value={query} onChange={(e) => setQuery(e.target.value)}
                      placeholder="Поиск по названию…" className={styles.searchInput} />
                    <div className={styles.filterButtons}>
                      {CATALOG_FILTERS.map((f) => (
                        <Button variant="unstyled" size="sm" key={f} onClick={() => setCatalogFilter(f)}
                          className={`${styles.filterBtn} ${catalogFilter === f ? styles.filterActive : ""}`}>
                          {f}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {catalogLoading ? (
                    <p className={styles.emptyState}>Загружаем каталог…</p>
                  ) : catalogError ? (
                    <p className={styles.catalogError}>Не удалось загрузить каталог</p>
                  ) : (
                    <>
                      <div className={styles.catalogMeta}>
                        {filteredCatalog.length} {filteredCatalog.length === 1 ? "текстура" : filteredCatalog.length < 5 ? "текстуры" : "текстур"}
                      </div>
                      <div className={styles.skinsGrid}>
                        {filteredCatalog.map((item) => renderCatalogCard(item))}
                      </div>
                      {filteredCatalog.length === 0 && <p className={styles.emptyState}>Ничего не найдено</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className={styles.profileStack}>
              <Card className={styles.settingsSection}>
                <div className={styles.settingsHeader}><span>👤</span><h3>Аккаунт</h3></div>
                <div className={styles.settingsBody}>
                  <div className={styles.settingRow}>
                    <div>
                      <strong>Статус</strong>
                      <p>Текущее состояние аккаунта</p>
                    </div>
                    <div className={`${styles.statusBadge} ${
                      isActiveBanned ? styles.statusBlocked :
                      user.isActive ? styles.statusActive :
                      styles.statusInactive
                    }`}>
                      <span className={styles.statusDot} />
                      {isActiveBanned
                        ? (user.isPermanent ? 'Заблокирован навсегда' : 'Заблокирован')
                        : user.isActive ? 'Активен' : 'Не активен'}
                    </div>
                  </div>
                  {isActiveBanned && (
                    <div className={styles.blockNotice}>
                      {user.isPermanent
                        ? 'Аккаунт заблокирован без срока действия.'
                        : user.bannedTill
                          ? `Блокировка действует до ${formatDate(user.bannedTill)}.`
                          : 'Срок блокировки не указан.'}
                      {' '}Обратитесь в поддержку, если считаете это ошибкой.
                    </div>
                  )}
                  {!user.isActive && !user.isBanned && (
                    <div className={styles.inactiveNotice}>
                      Аккаунт ожидает подтверждения почты.
                    </div>
                  )}
                  {me?.roles && me.roles.length > 0 && (
                    <div className={styles.settingRow}>
                      <div>
                        <strong>Роли</strong>
                        <p>Уровень доступа на платформе</p>
                      </div>
                      <div className={styles.rolesList}>
                        {me.roles.map((r) => (
                          <Badge key={r} variant="muted" size="md">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className={styles.settingsSection}>
                <div className={styles.settingsHeader}><span>🛡</span><h3>Безопасность</h3></div>
                <div className={styles.settingsBody}>
                  <div className={styles.settingRow}>
                    <div><strong>Текущий пароль</strong><p>Нужен для подтверждения изменений</p></div>
                    <input type="password" placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                  </div>
                  <div className={styles.settingRow}>
                    <div><strong>Новый пароль</strong><p>Минимум 8 символов</p></div>
                    <input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <Button variant="primary" onClick={() => changePasswordMutation.mutate()}
                    disabled={!oldPassword || !newPassword || changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? "Сохраняем…" : "Сменить пароль"}
                  </Button>
                  {notification && (
                      <div className={notification.err ? styles.savedError : styles.saved}>
                        {notification.msg}
                      </div>
                    )}
                  {/*<div className={styles.settingRow}>*/}
                  {/*  <div><strong>Двухфакторная аутентификация</strong><p>Дополнительная защита входа</p></div>*/}
                  {/*  <Button variant="ghost">Подключить</Button>*/}
                  {/*</div>*/}
                </div>
              </Card>
            </div>
          )}

          {tab === "sessions" && (
            <div>
              <div className={styles.sessionsTop}>
                <p className={styles.sessionsCount}>{sessions.length} активных сессии</p>
                <div className={styles.logoutOthersRow}>
                  <input
                    type="password"
                    placeholder="Пароль для подтверждения"
                    value={logoutPassword}
                    onChange={(e) => setLogoutPassword(e.target.value)}
                    className={styles.logoutPasswordInput}
                  />
                  <Button variant="ghost" size="sm" className={styles.compactGhost}
                    onClick={() => logoutOthersMutation.mutate(logoutPassword)}
                    disabled={!logoutPassword || logoutOthersMutation.isPending}>
                    {logoutOthersMutation.isPending ? "Завершаем…" : "Завершить все другие"}
                  </Button>
                </div>
              </div>
              <div className={styles.sessionList}>
                {sessions.map((session, index) => (
                  (!session.is_revoked && <Card key={session.id} className={styles.sessionCard}>
                    <div className={`${styles.sessionIcon} ${index === 0 ? styles.sessionIconCurrent : ""}`}>
                      {deviceIcon(session.user_agent)}
                    </div>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionDevice}>
                        {deviceLabel(session.user_agent)}
                        {index === 0 && <Badge className={styles.currentBadge}>ТЕКУЩАЯ</Badge>}
                      </div>
                      <div className={styles.sessionMeta}>
                        IP {session.ip_address ?? "—"} · {session.last_used_at ? formatDate(session.last_used_at) : "—"}
                      </div>
                    </div>
                    {index !== 0 && (
                      <Button variant="danger" size="sm" className={styles.endButton}
                        onClick={() => revokeSessionMutation.mutate(session.id)}
                        disabled={revokeSessionMutation.isPending}>
                        Завершить
                      </Button>
                    )}
                  </Card>)
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
