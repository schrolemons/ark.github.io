import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import config from '../../../arknights.config';
import { viewIndex } from '../../components/store/rootLayoutStore';
import { directions } from '../../components/store/lineDecoratorStore';
import { navigateRoute, useHashRoute } from '../../components/useHashRoute';
import '../../_styles/Operator/base.scss';

export default function Operator() {
  const active = useStore(viewIndex) === 2;
  const route = useHashRoute();
  const reduced = useReducedMotion();
  const operators = config.rootPage.OPERATOR.data;
  const currentIndex = Math.max(0, operators.findIndex(op => route.section === 'operator' && [op.id, op.cnName].includes(route.segments[0])));
  const current = operators[currentIndex];
  const select = (id: string) => {
    navigateRoute('operator', [id]);
    if (window.matchMedia('(max-width: 1024px), (orientation: portrait)').matches) {
      document.querySelector('.operator-view')?.scrollTo({top: 0, behavior: reduced ? 'instant' : 'smooth'});
    }
  };
  useEffect(() => { if (active) directions.set({top: true, right: true, bottom: true, left: false}); }, [active]);
  return <section className="operator-view bg-layout" aria-label="角色档案">
    <span className="operator-watermark" aria-hidden="true">{current.name}</span>
    <div className="operator-art" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div key={current.id} className="operator-art-frame" initial={{opacity: 0, x: reduced ? 0 : 55}} animate={{opacity: 1, x: 0}} exit={{opacity: 0}} transition={{duration: reduced ? 0 : .5}}>
          <img className="operator-echo" src={current.fullbody} alt="" />
          <img className="operator-figure" src={current.fullbody} alt={current.cnName} />
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="operator-info">
      <div className="operator-eyebrow"><span>PROFILE</span><span>SCHNIE :// {String(currentIndex + 1).padStart(2, '0')}</span></div>
      <AnimatePresence mode="wait">
        <motion.div key={current.id} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: reduced ? 0 : .18}}>
          <div className="name-display">{current.name}</div>
          <h1 className="cn-name-display">{current.cnName}</h1>
          <div className="description-section">{current.desc.split('\n').filter(Boolean).map((line, i) => <p key={i} className="desc-text">{line}</p>)}</div>
          <a className="operator-record-link" href={current.url} target="_self">查看人物档案 <span>VIEW RECORD ↗</span></a>
        </motion.div>
      </AnimatePresence>
      <nav className="operator-roster" aria-label="选择角色">
        {operators.map((op, index) => <button key={op.id} type="button" aria-label={`选择${op.cnName}`} aria-pressed={index === currentIndex}
          className={`thumbnail ${index === currentIndex ? 'active' : 'inactive'}`} onClick={() => select(op.id)}>
          <img src={op.portrait} alt="" /><span className="operator-number">0{index + 1}</span><span className="name-label">{op.cnName}</span>
        </button>)}
      </nav>
      <div className="operator-roster-line"><span>OPERATOR ARCHIVE</span><span>{String(operators.length).padStart(2, '0')} RECORDS</span></div>
    </div>
  </section>;
}
