import {useEffect, useRef, useState} from 'react';
import type {MarkdownHeading} from 'astro';
import './ReaderContents.css';

export default function ReaderContents({title, headings}: {title: string; headings: MarkdownHeading[]}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('reader-body');
  const panel = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const entries = headings.length ? headings : [{depth: 1, slug: 'reader-body', text: '正文'}];
  useEffect(() => {
    if (!open) return;
    close.current?.focus({preventScroll: true});
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus({preventScroll: true}); }
      if (event.key === 'Tab') {
        const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button, a') ?? []).filter(el => el.getClientRects().length);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);
  useEffect(() => {
    let frame = 0;
    const track = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const visible = entries.map(item => ({slug: item.slug, top: document.getElementById(item.slug)?.getBoundingClientRect().top})).filter(item => item.top !== undefined);
        const passed = visible.filter(item => item.top! < 180);
        setCurrent(passed.at(-1)?.slug ?? visible[0]?.slug ?? 'reader-body');
      });
    };
    document.addEventListener('scroll', track, true); track();
    return () => { cancelAnimationFrame(frame); document.removeEventListener('scroll', track, true); };
  }, [headings]);
  return <>
    <button ref={toggle} type="button" className="reader-toc-toggle" aria-label={open ? '收起文章目录' : '展开文章目录'} aria-expanded={open} aria-controls="reader-contents" onClick={() => setOpen(!open)}>
      <span className="reader-toc-toggle-icon" aria-hidden="true"><i/><i/><i/></span>
      <span className="reader-toc-toggle-copy"><strong>目录</strong><small>CONTENTS</small></span>
      <span className="reader-toc-count" aria-hidden="true">{String(entries.length).padStart(2, '0')}</span>
    </button>
    {open && <button type="button" className="reader-toc-backdrop" aria-label="关闭目录遮罩" onClick={() => setOpen(false)} />}
    <nav ref={panel} id="reader-contents" className="reader-contents" data-open={open} aria-label="文章目录">
      <header><div className="reader-toc-eyebrow">READING / CONTENTS · {String(entries.length).padStart(2, '0')}</div><h2>{title}</h2><button ref={close} type="button" aria-label="收起文章目录" onClick={() => {setOpen(false); toggle.current?.focus({preventScroll: true});}}><span aria-hidden="true">×</span></button></header>
      <div className="reader-toc-links">{entries.map(item => <a key={item.slug} href={`#${item.slug}`} target="_self" aria-current={current === item.slug ? 'location' : undefined} style={{paddingLeft: `${12 + Math.max(0, item.depth - 1) * 12}px`}} onClick={event => {
        event.preventDefault();
        const target = document.getElementById(item.slug);
        if (!target) return;
        history.pushState(history.state, '', `#${encodeURIComponent(item.slug)}`);
        target.scrollIntoView({block:'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
        setCurrent(item.slug); setOpen(false); toggle.current?.focus({preventScroll: true});
      }}>{item.text}</a>)}</div>
    </nav>
  </>;
}
