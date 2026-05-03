import { apiFetch } from './client';

export interface TextureResponse {
  hash: string;
  type: 'skin' | 'cape';
  url: string;
  model: 'classic' | 'slim' | null;
  avatar_url: string | null;
}

export interface WardrobeItemResponse {
  id: number;
  label: string;
  author_id: number;
  acquired_at: string;
  texture: TextureResponse;
}

export interface MinecraftProfileResponse {
  id: number;
  uuid: string;
  nickname: string;
  wardrobe: WardrobeItemResponse[];
  active_skin: WardrobeItemResponse | null;
  active_cape: WardrobeItemResponse | null;
}

export interface BanStatusResponse {
  is_banned: boolean;
  is_permanent: boolean;
  banned_till: string | null;
  admin_user_id: number | null;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  is_active: boolean;
  ban_status: BanStatusResponse;
  registered_at: string;
  minecraft_profile: MinecraftProfileResponse;
}

export function userFromResponse(me: UserResponse): import('../types').User {
  return {
    username: me.username,
    email: me.email,
    registeredAt: me.registered_at,
    isActive: me.is_active,
    isBanned: me.ban_status.is_banned,
    isPermanent: me.ban_status.is_permanent,
    bannedTill: me.ban_status.banned_till,
    avatarUrl: me.minecraft_profile.active_skin?.texture.avatar_url ?? null,
  };
}

export function getMe(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/user/me');
}

export function changeNickname(nickname: string): Promise<void> {
  return apiFetch<void>('/user/me/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ new_nickname: nickname }),
  });
}

export function changeEmail(email: string): Promise<void> {
  return apiFetch<void>('/user/me/email', {
    method: 'PATCH',
    body: JSON.stringify({ new_email: email }),
  });
}

export function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  return apiFetch<void>('/user/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}

export interface VerificationCodeResponse {
  email: string;
  expires_at: string;
}

export function sendVerificationCode(purpose: 'activation' | 'password_reset'): Promise<VerificationCodeResponse> {
  return apiFetch<VerificationCodeResponse>('/user/me/verification-code', {
    method: 'POST',
    body: JSON.stringify({ purpose }),
  });
}

export function activateAccount(email: string, code: string): Promise<void> {
  return apiFetch<void>('/user/activate', {
    method: 'POST',
    body: JSON.stringify({ email, verification_code: code }),
  });
}
