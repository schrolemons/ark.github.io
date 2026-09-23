import { useEffect, useRef, useState } from 'react';
import { useMobileLayout } from './useMobileLayout';

type OrientationAPI = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};
const clamp = (value: number) => Math.max(-1, Math.min(1, value));
const angleDelta = (value: number, origin: number) => ((value - origin + 540) % 360) - 180;

export default function MediaTiltBackground({ imageUrl, active }: { imageUrl: string; active: boolean }) {
  const mobile = useMobileLayout();
  const background = useRef<HTMLDivElement>(null);
  const requestVersion = useRef(0);
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSupported(window.isSecureContext && typeof window.DeviceOrientationEvent !== 'undefined');
  }, []);
  useEffect(() => {
    if (!active || !mobile) { requestVersion.current++; setRequesting(false); }
    return () => { requestVersion.current++; };
  }, [active, mobile]);

  useEffect(() => {
    const element = background.current;
    if (!element || !enabled || !active || !mobile) return;
    let origin: { beta: number; gamma: number } | null = null;
    let targetX = 0, targetY = 0, x = 0, y = 0, frame = 0, lastFrame = 0;
    const write = () => {
      element.style.setProperty('--media-tilt-x', `${x.toFixed(3)}%`);
      element.style.setProperty('--media-tilt-y', `${y.toFixed(3)}%`);
    };
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0; lastFrame = 0;
      origin = null; targetX = targetY = x = y = 0; write();
    };
    const animate = (time: number) => {
      const blend = 1 - Math.exp(-Math.min(lastFrame ? time - lastFrame : 16, 64) / 95);
      lastFrame = time;
      x += (targetX - x) * blend; y += (targetY - y) * blend; write();
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .015) frame = requestAnimationFrame(animate);
      else { frame = 0; lastFrame = 0; }
    };
    // Some browsers expose the API even without a usable physical sensor.
    const sensorTimeout = window.setTimeout(() => {
      if (!origin && !document.hidden) {
        setEnabled(false); setMessage('暂时无法读取手机方向，背景保持静止。');
      }
    }, 5000);
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (document.hidden || event.beta === null || event.gamma === null || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
      clearTimeout(sensorTimeout);
      if (!origin) { origin = { beta: event.beta, gamma: event.gamma }; return; }
      const angle = (screen.orientation?.angle ?? (window as Window & { orientation?: number }).orientation ?? 0) * Math.PI / 180;
      const dx = angleDelta(event.gamma, origin.gamma), dy = angleDelta(event.beta, origin.beta);
      targetX = clamp((dx * Math.cos(angle) + dy * Math.sin(angle)) / 25) * 28;
      targetY = clamp((dy * Math.cos(angle) - dx * Math.sin(angle)) / 25) * 5;
      if (!frame) frame = requestAnimationFrame(animate);
    };
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    window.addEventListener('orientationchange', reset);
    screen.orientation?.addEventListener('change', reset);
    document.addEventListener('visibilitychange', reset);
    return () => {
      clearTimeout(sensorTimeout); reset();
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('orientationchange', reset);
      screen.orientation?.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [enabled, active, mobile, imageUrl]);

  const toggle = async () => {
    setMessage('');
    if (enabled) { setEnabled(false); return; }
    const version = ++requestVersion.current;
    setRequesting(true);
    try {
      const api = window.DeviceOrientationEvent as OrientationAPI;
      // Safari requires this call directly inside the user's click handler.
      const permission = api.requestPermission ? await api.requestPermission() : 'granted';
      if (version !== requestVersion.current) return;
      if (permission === 'granted') setEnabled(true);
      else setMessage('未获得方向访问权限，背景保持静止。');
    } catch {
      if (version === requestVersion.current) setMessage('未获得方向访问权限，背景保持静止。');
    } finally {
      if (version === requestVersion.current) setRequesting(false);
    }
  };

  return <>
    <div ref={background} className="media-background absolute inset-0 z-0" aria-hidden="true"
      data-tilt={enabled && active && mobile}
      style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: .3 }} />
    {mobile && supported && <div className="media-tilt-controls">
      <button type="button" onClick={toggle} disabled={requesting} aria-pressed={enabled}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M10 17h4M3 9l-2 3 2 3m18-6 2 3-2 3" /></svg>
        {requesting ? '等待授权…' : enabled ? '关闭随动背景' : '开启随动背景'}
        <span aria-hidden="true">{enabled ? 'ON' : 'OFF'}</span>
      </button>
      <p role="status">{message || (enabled ? '轻轻倾斜手机，探索画面' : '')}</p>
    </div>}
  </>;
}
