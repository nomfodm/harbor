import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/ui/button/Button';
import { FormField } from '../../components/ui/form/FormField';
import { SkinViewer } from '../../components/ui/skin-viewer/SkinViewer';
import { publishToCatalog } from '../../api/wardrobe';
import { friendlyError } from '../../api/client';
import type { WardrobeItemResponse } from '../../api/user';
import styles from './PublishTextureModal.module.css';

interface Props {
  item: WardrobeItemResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function PublishTextureModal({ item, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(item.label);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isSkin = item.texture.type === 'skin';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit() {
    if (!title.trim()) { setError('Введите название'); return; }
    setError('');
    setLoading(true);
    try {
      await publishToCatalog(item.id, title.trim());
      onSuccess();
      onClose();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Опубликовать в каталог</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.preview}>
            {isSkin
              ? <SkinViewer skinUrl={item.texture.url} width={130} height={190} animate={false} />
              : <img src={item.texture.url} className={styles.capeImg} alt="cape" />}
          </div>

          <div className={styles.form}>
            <p className={styles.hint}>
              Текстура появится в каталоге сообщества. Другие игроки смогут добавить её в свой гардероб.
            </p>
            <FormField label="Название в каталоге">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название…"
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                autoFocus
              />
            </FormField>
            {error && <p className={styles.error}>{error}</p>}
            <Button variant="primary" block disabled={loading} onClick={submit} className={styles.submitBtn}>
              {loading ? 'Публикуем…' : 'Опубликовать'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
