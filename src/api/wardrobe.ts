import { apiFetch } from './client';
import type { TextureResponse, WardrobeItemResponse } from './user';

export interface CatalogItemResponse {
  id: number;
  title: string;
  author_id: number;
  published_at: string;
  texture: TextureResponse;
}

export function getCatalog(): Promise<CatalogItemResponse[]> {
  return apiFetch<CatalogItemResponse[]>('/wardrobe/catalog');
}

export function addFromCatalog(catalogItemId: number): Promise<WardrobeItemResponse> {
  return apiFetch<WardrobeItemResponse>(`/wardrobe/items/from-catalog/${catalogItemId}`, { method: 'POST' });
}

export function changeCosmetics(itemId: number | null): Promise<void> {
  return apiFetch<void>('/wardrobe/cosmetics', {
    method: 'PATCH',
    body: JSON.stringify({ item_id: itemId }),
  });
}

export function removeWardrobeItem(itemId: number): Promise<void> {
  return apiFetch<void>(`/wardrobe/items/${itemId}`, { method: 'DELETE' });
}

export function renameWardrobeItem(itemId: number, label: string): Promise<void> {
  return apiFetch<void>(`/wardrobe/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ label }),
  });
}

export function renameCatalogItem(itemId: number, title: string): Promise<void> {
  return apiFetch<void>(`/wardrobe/catalog/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export function removeCatalogItem(itemId: number): Promise<void> {
  return apiFetch<void>(`/wardrobe/catalog/${itemId}`, { method: 'DELETE' });
}

export function uploadTexture(file: File, label: string, type: 'skin' | 'cape'): Promise<WardrobeItemResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('label', label);
  form.append('type', type);
  return apiFetch<WardrobeItemResponse>('/wardrobe/items', { method: 'POST', body: form });
}

export function publishToCatalog(itemId: number, title: string): Promise<CatalogItemResponse> {
  return apiFetch<CatalogItemResponse>('/wardrobe/catalog/items', {
    method: 'POST',
    body: JSON.stringify({ wardrobe_item_id: itemId, title }),
  });
}
