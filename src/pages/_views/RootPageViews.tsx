import {useEffect, useLayoutEffect, useState} from 'react';
import {viewIndex, isFooterVisible, isScrollLocked, isNavMenuOpen, isOwnerInfoOpen} from '../../components/store/rootLayoutStore';
import {identityDialogOpen} from '../../components/store/identityStore';
import config from '../../../arknights.config';
import RootPageViewTemplate from './RootPageViewTemplate';
import Index from './00-Index';
import Information from './01-Information';
import Operator from './02-Operator';
import World from './03-World';
import Media from './04-Media';
import More from './05-More';
import {parseRoute} from '../../utils/hash-route';

const mobileQuery = '(max-width: 1024px), (orientation: portrait)';
const routeIndex = () => Math.max(0, config.navbar.items.findIndex(item => parseRoute(location.hash).section === item.href.split('#')[1]));

// Honor every scrollable ancestor, including nested articles and horizontal carousels.
function canScroll(target: EventTarget | null, direction: number) {
    let element = target instanceof HTMLElement ? target : null;
    while (element && element.id !== 'root-page-views') {
        const style = getComputedStyle(element);
        if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2) {
            if (direction > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 3) return true;
            if (direction < 0 && element.scrollTop > 3) return true;
        }
        element = element.parentElement;
    }
    return false;
}

export default function RootPageViews() {
    const [index, setIndex] = useState(routeIndex);
    useLayoutEffect(() => {
        viewIndex.set(index);
        isFooterVisible.set(false);
        document.querySelector(`.mobile-section-nav a[data-index="${index}"]`)?.scrollIntoView({block:'nearest', inline:'nearest'});
    }, [index]);
    useEffect(() => {
        const change = () => setIndex(routeIndex());
        window.addEventListener('hashchange', change);
        return () => window.removeEventListener('hashchange', change);
    }, []);
    useEffect(() => {
        const root = document.getElementById('root-page-views');
        if (!root) return;
        let lastTurn = 0;
        let touch: {x: number; y: number; up: boolean; down: boolean} | null = null;
        const blocked = () => isScrollLocked.get() || identityDialogOpen.get() || isOwnerInfoOpen.get() || isNavMenuOpen.get();
        const turn = (direction: number) => {
            if (blocked() || performance.now() - lastTurn < 850) return;
            const current = viewIndex.get();
            const mobile = matchMedia(mobileQuery).matches;
            if (!mobile && current === config.navbar.items.length - 1) {
                if (direction > 0 && !isFooterVisible.get()) { isFooterVisible.set(true); lastTurn = performance.now(); return; }
                if (direction < 0 && isFooterVisible.get()) { isFooterVisible.set(false); lastTurn = performance.now(); return; }
            }
            const next = current + direction;
            if (next >= 0 && next < config.navbar.items.length) {
                location.hash = config.navbar.items[next].href.split('#')[1];
                lastTurn = performance.now();
            }
        };
        const start = (event: TouchEvent) => {
            touch = null;
            if (blocked() || event.touches.length !== 1 || (event.target as HTMLElement).closest('button, input, iframe, .mobile-section-nav')) return;
            touch = {x: event.touches[0].clientX, y: event.touches[0].clientY, up: canScroll(event.target, -1), down: canScroll(event.target, 1)};
        };
        const end = (event: TouchEvent) => {
            if (!touch || blocked()) return;
            const {x, y, up, down} = touch;
            touch = null;
            const dx = x - event.changedTouches[0].clientX, dy = y - event.changedTouches[0].clientY;
            if (Math.abs(dy) < 85 || Math.abs(dy) < Math.abs(dx) * 1.3) return;
            // Only a new gesture starting at the boundary can turn a section.
            if (dy > 0 ? down : up) return;
            turn(dy > 0 ? 1 : -1);
        };
        const cancel = () => { touch = null; };
        const wheel = (event: WheelEvent) => {
            if (blocked() || Math.abs(event.deltaY) < 25 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
            const direction = event.deltaY > 0 ? 1 : -1;
            if (!canScroll(event.target, direction)) turn(direction);
        };
        root.addEventListener('touchstart', start, {passive: true});
        root.addEventListener('touchend', end, {passive: true});
        root.addEventListener('touchcancel', cancel, {passive: true});
        root.addEventListener('wheel', wheel, {passive: true});
        return () => {
            root.removeEventListener('touchstart', start);
            root.removeEventListener('touchend', end);
            root.removeEventListener('touchcancel', cancel);
            root.removeEventListener('wheel', wheel);
        };
    }, []);
    return <>
        <nav className="mobile-section-nav" aria-label="页面分区">
            <div className="mobile-section-current"><span className="mobile-section-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{config.navbar.items[index].subtitle}</strong><small>{config.navbar.items[index].title}</small></div></div>
            <div className="mobile-section-steps">{config.navbar.items.map((item, i) => <a key={item.href} href={item.href} target="_self" data-index={i} aria-label={`切换到${item.subtitle}`} aria-current={index === i ? 'page' : undefined}><span /></a>)}</div>
        </nav>
        {[Index, Information, Operator, World, Media, More].map((Element, i) => <RootPageViewTemplate key={i} selfIndex={i}><Element /></RootPageViewTemplate>)}
    </>;
}
