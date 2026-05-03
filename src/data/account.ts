export interface SkinItem {
  id: number;
  name: string;
  author: string;
  likes: number;
  isOwn: boolean;
  active: boolean;
  tone: string;
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

