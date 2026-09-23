import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import config from '../../../arknights.config';
import { readyToTouch, viewIndex } from '../../components/store/rootLayoutStore';
import { identityDialogOpen } from '../../components/store/identityStore';
import { directions } from '../../components/store/lineDecoratorStore';
import { navigateRoute, useHashRoute } from '../../components/useHashRoute';
import '../../_styles/Operator/base.scss';

const subscribeMotionPreference = (notify: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

function OperatorArtwork({ operator, artStyle, active, loaded, reduced, onLoad }: {
  operator: (typeof config.rootPage.OPERATOR.data)[number];
  artStyle: CSSProperties;
  active: boolean;
  loaded: boolean;
  reduced: boolean | null;
  onLoad: () => void;
}) {
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    if (!active || !loaded) { controls.stop(); return; }
    // Replay on section entry as well as character changes, including cached images.
    controls.set({ opacity: reduced ? 1 : 0, x: reduced ? 0 : 80 });
    void controls.start({ opacity: 1, x: 0, transition: { duration: reduced ? 0 : .6, ease: [.22, .8, .24, 1] } });
    return () => controls.stop();
  }, [active, loaded, reduced, controls]);

  return <motion.div className="operator-art-frame" style={artStyle}
    initial={{ opacity: 0, x: reduced ? 0 : 80 }} animate={controls}
    exit={{ opacity: 0, transition: { duration: reduced ? 0 : .18 } }}>
    <div className="operator-echo-frame"><img className="operator-echo" src={operator.fullbody} alt="" /></div>
    <img className="operator-figure" src={operator.fullbody} alt={operator.cnName} onLoad={onLoad} />
  </motion.div>;
}

export default function Operator() {
  const active = useStore(viewIndex) === 2;
  const ready = useStore(readyToTouch);
  const choosingIdentity = useStore(identityDialogOpen);
  const route = useHashRoute();
  const reduced = useSyncExternalStore(subscribeMotionPreference,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => true);
  const operators = config.rootPage.OPERATOR.data;
  const lastIndex = useRef(0);
  const currentIndex = route.section === 'operator'
    ? Math.max(0, operators.findIndex(op => [op.id, op.cnName].includes(route.segments[0])))
    : lastIndex.current;
  useEffect(() => { if (route.section === 'operator') lastIndex.current = currentIndex; }, [route.section, currentIndex]);
  const current = operators[currentIndex];
  const select = (id: string) => navigateRoute('operator', [id]);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  // Alpha bounds measured from the original files; preserve the art, normalize its visible height and center.
  const bounds: Record<string, {height: number; center: number; bottom: number}> = {
    moxue: {height: 1, center: 511.5 / 1024, bottom: 0},
    ruifox: {height: 1024 / 886, center: 522 / 1024, bottom: 81 / 886},
    lifeng: {height: 1, center: .5, bottom: 0},
    fanxin: {height: 1, center: 464.5 / 1055, bottom: 0},
  };
  const art = bounds[current.id] ?? {height: 1, center: .5, bottom: 0};
  const artStyle = {'--art-height': `${art.height * 100}%`, '--art-center': `${-art.center * 100}%`, '--art-bottom': `${-art.bottom * 100}%`} as CSSProperties;
  useEffect(() => { if (active) directions.set({top: true, right: true, bottom: true, left: false}); }, [active]);
  return <section className="operator-view bg-layout" aria-label="角色档案">
    <span className="operator-watermark" aria-hidden="true">{current.name}</span>
    <div className="operator-mobile-eyebrow" aria-hidden="true">
      <span>SCHNIE ARCHIVE //</span>
      <strong>PROFILE</strong>
    </div>
    <div className="operator-art" aria-hidden="true" data-loading={!loaded[current.id]}>
      {!loaded[current.id] && <span className="operator-loading">LOADING / 载入立绘</span>}
      <AnimatePresence mode="wait">
        <OperatorArtwork key={current.id} operator={current} artStyle={artStyle} active={active && ready && !choosingIdentity}
          loaded={Boolean(loaded[current.id])} reduced={reduced}
          onLoad={() => setLoaded(previous => ({...previous, [current.id]: true}))} />
      </AnimatePresence>
    </div>
    <div className="operator-info">
      <div className="operator-eyebrow"><span>PROFILE</span><span>SCHNIE :// {String(currentIndex + 1).padStart(2, '0')}</span></div>
      <AnimatePresence mode="wait">
        <motion.div className="operator-biography" key={current.id} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: reduced ? 0 : .18}}>
          <div className="name-display">{current.name}</div>
          <h1 className="cn-name-display">{current.cnName}</h1>
          <div className="description-section">{current.desc.split('\n').filter(Boolean).map((line, i) => <p key={i} className="desc-text">{line}</p>)}</div>
          <a className="operator-record-link" href={current.url} target="_self">查看人物档案 <span>VIEW RECORD ↗</span></a>
        </motion.div>
      </AnimatePresence>
      <nav className="operator-roster" aria-label="选择角色">
        {operators.map((op, index) => <button key={op.id} type="button" aria-label={`选择${op.cnName}`} aria-pressed={index === currentIndex}
          data-portrait={op.id} className={`thumbnail ${index === currentIndex ? 'active' : 'inactive'}`} onClick={() => select(op.id)}>
          <img src={op.portrait} alt="" /><span className="operator-number">0{index + 1}</span><span className="name-label">{op.cnName}</span>
        </button>)}
      </nav>
      <div className="operator-roster-line"><span>OPERATOR ARCHIVE</span><span>{String(operators.length).padStart(2, '0')} RECORDS</span></div>
    </div>
  </section>;
}
