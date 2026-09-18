import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { navigateRoute, useHashRoute } from '../../../components/useHashRoute';
import { routeSegment } from '../../../utils/hash-route';
import { identityDialogOpen } from '../../../components/store/identityStore';
import { isOwnerInfoOpen, isNavMenuOpen } from '../../../components/store/rootLayoutStore';
import './GalleryDetails.css';

const galleryData = [
  { id: '01', year: '2026', title: 'Starry Sky', src: '/images/04-media/gallery/2-1.png', desc: 'The Starry Sky and the Soul' },
  { id: '02', year: '2025', title: 'meadow', src: '/images/04-media/gallery/2-2.png', desc: 'A View from the Meadow' },
  { id: '03', year: '2026', title: 'sea', src: '/images/04-media/gallery/2-3.png', desc: 'A View from the Sea' },
];
export default function GalleryDetails({ onBack, active = false }: {onBack?: () => void; active?: boolean}) {
  const route = useHashRoute();
  const index = Math.max(0, galleryData.findIndex(item => routeSegment(item.title) === route.segments[1]));
  const item = galleryData[index];
  const reduced = useReducedMotion();
  const select = (next: number) => navigateRoute('media', ['visual_archive', galleryData[(next + galleryData.length) % galleryData.length].title]);
  const touch = useRef({ x: 0, y: 0 });
  const wheelTime = useRef(0);
  useEffect(() => {
    if (!active) return;
    const key = (event: KeyboardEvent) => {
      if (identityDialogOpen.get() || isOwnerInfoOpen.get() || isNavMenuOpen.get() || (event.target as HTMLElement)?.matches('input, textarea, select')) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); select(index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [active, index]);
  return <section className="gallery-view" aria-label="画册" aria-hidden={!active} ref={element => { if (element) element.inert = !active; }} onWheel={e => {
    e.stopPropagation();
    if (window.matchMedia('(max-width: 1024px), (orientation: portrait)').matches) return;
    if (!active || Math.abs(e.deltaY) < 20 || performance.now() - wheelTime.current < 650) return;
    wheelTime.current = performance.now(); select(index + (e.deltaY > 0 ? 1 : -1));
  }} onTouchStart={e => { touch.current = {x: e.touches[0].clientX, y: e.touches[0].clientY}; }} onTouchEnd={e => {
    e.stopPropagation();
    if (!active || (e.target as HTMLElement).closest('button, nav')) return;
    const dx = touch.current.x - e.changedTouches[0].clientX, dy = touch.current.y - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) select(index + (dx > 0 ? 1 : -1));
  }}>
    <div className="gallery-backdrop" style={{backgroundImage: `url(${item.src})`}} aria-hidden="true" />
    <div className="gallery-topline"><span>VISUAL ARCHIVE <b>/ 画册</b></span><span>{item.id} — 0{galleryData.length}</span></div>
    <nav className="gallery-timeline" aria-label="画册时间索引">
      <span className="gallery-index-label">ARCHIVE INDEX</span>
      {galleryData.map((entry, i) => <button key={entry.id} type="button" aria-current={i === index ? 'true' : undefined} onClick={() => select(i)}>
        <span className="gallery-index-tick" /><span>{entry.id}</span><span>{entry.year}</span>
      </button>)}
    </nav>
    <div className="gallery-stage">
      <AnimatePresence mode="wait"><motion.img key={item.id} src={item.src} alt={item.desc} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: reduced ? 0 : .25}} /></AnimatePresence>
    </div>
    <footer className="gallery-bottom">
      <div className="gallery-caption"><span>{item.year} / ART COLLECTION</span><h1>{item.title}</h1><p>{item.desc}</p></div>
      <nav className="gallery-thumbnails" aria-label="选择画作">{galleryData.map((entry, i) => <button key={entry.id} type="button" aria-label={`查看 ${entry.title}`} aria-pressed={i === index} onClick={() => select(i)}><img src={entry.src} alt="" /><span>{entry.id}</span></button>)}</nav>
      <div className="gallery-controls"><button type="button" aria-label="上一幅画作" onClick={() => select(index - 1)}>←</button><button type="button" aria-label="下一幅画作" onClick={() => select(index + 1)}>→</button><button type="button" className="gallery-back" onClick={onBack}>返回 <span>BACK</span></button></div>
    </footer>
  </section>;
}
