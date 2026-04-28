export interface SkinItem {
  id: number;
  name: string;
  author: string;
  likes: number;
  isOwn: boolean;
  active: boolean;
  tone: string;
}

export interface AchievementItem {
  id: number;
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

export interface ActivityItem {
  id: number;
  type: 'kill' | 'achievement' | 'purchase' | 'join';
  text: string;
  time: string;
}

export const SKINS: SkinItem[] = [
  { id: 1, name: 'Steve Classic', author: 'Mojang', likes: 1240, isOwn: true, active: true, tone: '#25c3e8' },
  { id: 2, name: 'Night Warrior', author: 'ShadowCrafter', likes: 876, isOwn: true, active: false, tone: '#5625e8' },
  { id: 3, name: 'Neon Punk', author: 'PixelKing', likes: 2341, isOwn: true, active: false, tone: '#272bf2' },
  { id: 4, name: 'Arctic Fox', author: 'IceQueen', likes: 445, isOwn: false, active: false, tone: '#25b2e8' },
  { id: 5, name: 'Dragon Rider', author: 'FireBorn', likes: 3102, isOwn: false, active: false, tone: '#c44444' },
  { id: 6, name: 'Galaxy Hopper', author: 'CosmicDev', likes: 1867, isOwn: false, active: false, tone: '#9b59b6' },
  { id: 7, name: 'Forest Spirit', author: 'NatureWalker', likes: 654, isOwn: false, active: false, tone: '#44c464' },
  { id: 8, name: 'Cyber Samurai', author: 'NeonCoder', likes: 2908, isOwn: false, active: false, tone: '#25c3e8' },
];

export const ACHIEVEMENTS: AchievementItem[] = [
  { id: 1, icon: '⚔', name: 'Первая кровь', desc: 'Убей первого игрока', earned: true },
  { id: 2, icon: '🏠', name: 'Домосед', desc: 'Построй дом с крышей', earned: true },
  { id: 3, icon: '💎', name: 'Алмазный рудокоп', desc: 'Добудь 64 алмаза', earned: true },
  { id: 4, icon: '🐉', name: 'Убийца дракона', desc: 'Победи дракона Края', earned: true },
  { id: 5, icon: '🏆', name: 'Топ-1 сезона', desc: 'Займи первое место в сезоне', earned: false },
  { id: 6, icon: '🌍', name: 'Путешественник', desc: 'Пройди 1 000 000 блоков', earned: false },
  { id: 7, icon: '💰', name: 'Миллионер', desc: 'Заработай миллион монет', earned: false },
  { id: 8, icon: '🎨', name: 'Художник', desc: 'Загрузи 10 скинов в гардероб', earned: true },
];

export const ACTIVITY: ActivityItem[] = [
  { id: 1, type: 'kill', text: 'Победил StormBlaze в PvP', time: '5 минут назад' },
  { id: 2, type: 'achievement', text: 'Получил достижение «Художник»', time: '2 часа назад' },
  { id: 3, type: 'purchase', text: 'Купил привилегию Premium', time: '1 день назад' },
  { id: 4, type: 'join', text: 'Зашёл на сервер «Выживание»', time: '1 день назад' },
];
