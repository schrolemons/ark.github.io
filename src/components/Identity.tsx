import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { identity, identityDialogOpen, readIdentity, saveIdentity } from './store/identityStore';
import { IDENTITY_KEY, specialIdentity } from '../utils/identity';
import './Identity.css';

export function IdentityBrand() {
  const user = useStore(identity);
  const special = user?.kind === 'member' ? specialIdentity(user.name) : undefined;
  return <span className="identity-brand" data-special={Boolean(special)}>
    {(!user || user.kind === 'guest' || special) && <img src="/images/logo.png" alt="SCHNIE" />}
    {user?.kind === 'member' && <span className="identity-brand-name" title={user.name}>
      {!special && <span className="identity-welcome">欢迎回来：</span>}<strong>{special?.name ?? user.name}</strong>

      {special && <small>{special.english}</small>}
    </span>}
  </span>;
}

export default function IdentityDialog() {
  const open = useStore(identityDialogOpen);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const restore = () => {
      const user = readIdentity();
      identity.set(user);
      identityDialogOpen.set(!user);
      document.documentElement.dataset.identityPending = String(!user);
    };
    restore();
    const sync = (event: StorageEvent) => { if (event.key === IDENTITY_KEY || event.key === null) restore(); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const shell = document.getElementById('site-shell');
    if (shell) shell.inert = true;
    setName(''); setError('');
    input.current?.focus({preventScroll: true});
    const trap = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); }
      if (event.key !== 'Tab') return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('input, button') ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trap, true);
    return () => { if (shell) shell.inert = false; document.removeEventListener('keydown', trap, true); previous?.focus({preventScroll: true}); };
  }, [open]);

  if (!open) return null;
  return <div className="identity-overlay" onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
    <div className="identity-atmosphere" aria-hidden="true">
      <div className="identity-grid" /><div className="identity-orbit identity-orbit-one" /><div className="identity-orbit identity-orbit-two" />
    -
      <svg className="identity-pulse" viewBox="0 0 1200 200" preserveAspectRatio="none"><path d="M0 100H220L240 93L260 108L280 100H420L440 100L458 72L474 134L492 35L510 164L532 86L550 100H820L840 90L860 109L880 100H1200" /></svg>
      {Array.from({length: 9}, (_, i) => <i key={i} className="identity-node" style={{left: `${8 + i * 11}%`, top: `${20 + (i * 17) % 64}%`, animationDelay: `${i * .45}s`}} />)}
      <span className="identity-coordinate">NINTH EDGE<br />SIGNAL</span>
    </div>
    {/*<div className="identity-signal"><i />连接已建立，等待你的回应。<span>CONNECTION ESTABLISHED</span></div>*/}
    <div ref={panel} className="identity-dialog" role="dialog" aria-modal="true" aria-labelledby="identity-title" aria-describedby="identity-description">
      <div className="identity-kicker"><span>SCHNIE ARCHIVE</span><span>0X / IDENTITY</span></div>
      {/*<div className="identity-heading"><span className="identity-rule" /><span>很高兴，在这里遇见你。</span></div>*/}
      <h1 id="identity-title">该如何称呼你？</h1>
      {/*<p id="identity-description">远方的信号仍在传来，这段旅程，等你同行。<br />留下称呼，或以游客身份，加入我们。</p>*/}
      <form onSubmit={e => { e.preventDefault(); if (!saveIdentity(name)) setError('请输入称呼，或选择游客登录。'); }}>
        {/*<label htmlFor="identity-name">称呼 <span>YOUR NAME</span></label>*/}
        <input ref={input} id="identity-name" value={name} maxLength={80} autoComplete="nickname" placeholder="输入你的称呼" aria-invalid={Boolean(error)} aria-describedby="identity-error" onChange={e => { setName(e.target.value); setError(''); }} />
        <div id="identity-error" role="status" className="identity-error">{error}</div>
        <button type="submit" className="identity-primary">以此称呼进入 <span aria-hidden="true">→</span></button>
        <button type="button" className="identity-guest" onClick={() => saveIdentity(null)}>游客登录：CONTINUE AS GUEST</button>
      </form>
      <footer>称呼仅保存在当前浏览器，可随时切换身份。</footer>
    </div>
  </div>;
}
