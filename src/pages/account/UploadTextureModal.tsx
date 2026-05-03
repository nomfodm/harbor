import { useState, useRef, useEffect, type DragEvent } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/ui/button/Button';
import { FormField } from '../../components/ui/form/FormField';
import { SkinViewer } from '../../components/ui/skin-viewer/SkinViewer';
import { uploadTexture } from '../../api/wardrobe';
import { friendlyError } from '../../api/client';
import styles from './UploadTextureModal.module.css';

interface Props {
  type: 'skin' | 'cape';
  initialFile?: File;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadTextureModal({ type, initialFile, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [label, setLabel] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function pickFile(f: File) {
    if (!f.name.endsWith('.png') && f.type !== 'image/png') {
      setError('Только PNG файлы');
      return;
    }
    setError('');
    setFile(f);
    if (!label) setLabel(f.name.replace(/\.png$/i, ''));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  async function submit() {
    if (!file) { setError('Выберите файл'); return; }
    if (!label.trim()) { setError('Введите название'); return; }
    setError('');
    setLoading(true);
    try {
      await uploadTexture(file, label.trim(), type);
      onSuccess();
      onClose();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  const title = type === 'skin' ? 'Загрузить скин' : 'Загрузить плащ';

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        <div className={styles.body}>
          <div
            className={`${styles.dropArea} ${dragOver ? styles.dropAreaActive : ''} ${previewUrl ? styles.dropAreaFilled : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".png,image/png"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); e.target.value = ''; }}
            />

            {previewUrl && type === 'skin' && (
              <div className={styles.skinWrap}>
                <SkinViewer skinUrl={previewUrl} width={150} height={210} animate={false} />
              </div>
            )}
            {previewUrl && type === 'cape' && (
              <img src={previewUrl} className={styles.capeImg} alt="cape" />
            )}
            {!previewUrl && (
              <div className={styles.dropHint}>
                <span className={styles.dropIcon}>{type === 'skin' ? '🧍' : '🦸'}</span>
                <p className={styles.dropLabel}>Перетащите PNG или кликните</p>
                <p className={styles.dropMeta}>64×64 или 128×128</p>
              </div>
            )}

            {previewUrl && (
              <div className={styles.changeOverlay}>
                <span>Изменить</span>
              </div>
            )}
          </div>

          <div className={styles.form}>
            {file && (
              <p className={styles.fileName}>📎 {file.name}</p>
            )}
            <FormField label="Название">
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={type === 'skin' ? 'Мой скин' : 'Мой плащ'}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                autoFocus={!!file}
              />
            </FormField>
            {error && <p className={styles.error}>{error}</p>}
            <Button
              variant="primary"
              block
              disabled={loading || !file}
              onClick={submit}
              className={styles.submitBtn}
            >
              {loading ? 'Загружаем…' : title}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
