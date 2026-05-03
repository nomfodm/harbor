import { useEffect, useRef } from 'react';
import { SkinViewer as SV3D, WalkingAnimation } from 'skinview3d';

interface SkinViewerProps {
  skinUrl: string | null;
  capeUrl?: string | null;
  width?: number;
  height?: number;
  className?: string;
  animate?: boolean;
}

export function SkinViewer({ skinUrl, capeUrl, width = 200, height = 300, className, animate = true }: SkinViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SV3D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const viewer = new SV3D({ canvas: canvasRef.current, width, height });
    viewer.autoRotate = true;
    viewer.autoRotateSpeed = 0.6;
    if (animate) viewer.animation = new WalkingAnimation();
    viewerRef.current = viewer;
    return () => { viewer.dispose(); viewerRef.current = null; };
  }, [width, height, animate]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (skinUrl) viewer.loadSkin(skinUrl).catch(() => {});
  }, [skinUrl]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (capeUrl) {
      viewer.loadCape(capeUrl).catch(() => {});
    } else {
      viewer.loadCape(null);
    }
  }, [capeUrl]);

  return <canvas ref={canvasRef} className={className} style={{ display: 'block' }} />;
}
