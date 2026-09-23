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
    const [{index, direction}, setRoute] = useState(() => ({index: routeIndex(), direction: 1}));
    useLayoutEffect(() => {
        viewIndex.set(index);
        isFooterVisible.set(false);
    }, [index]);
    useEffect(() => {
        const change = () => {
            const next = routeIndex();
            setRoute(previous => next === previous.index ? previous : {index: next, direction: next > previous.index ? 1 : -1});
        };
        window.addEventListener('hashchange', change);
        return () => window.removeEventListener('hashchange', change);
    }, []);
    useEffect(() => {
        const root = document.getElementById('root-page-views');
        if (!root) return;
        let lastTurn = 0;
        let touch: {x: number; y: number; up: boolean; down: boolean; view: HTMLElement | null} | null = null;
        const clearDrag = () => {
            root.querySelectorAll<HTMLElement>('[data-dragging]').forEach(element => {
                delete element.dataset.dragging;
                element.style.removeProperty('--swipe-y');
            });
        };
        const blocked = () => isScrollLocked.get() || identityDialogOpen.get() || isOwnerInfoOpen.get() || isNavMenuOpen.get();
        const turn = (direction: number) => {
            const mobile = matchMedia(mobileQuery).matches;
            if (blocked() || performance.now() - lastTurn < (mobile ? 560 : 850)) return;
            const current = viewIndex.get();
            if (current === config.navbar.items.length - 1) {
                if (direction > 0 && !isFooterVisible.get()) {
                    isFooterVisible.set(true);
                    // Footer is deliberately separated from the regular page rhythm.
                    // The extra lock is paired with the visual hold in mobile CSS.
                    lastTurn = performance.now() + (mobile ? 400 : 0);
                    return;
                }
                if (direction < 0 && isFooterVisible.get()) {
                    isFooterVisible.set(false);
                    lastTurn = performance.now() + (mobile ? 80 : 0);
                    return;
                }
            }
            const next = current + direction;
            if (next >= 0 && next < config.navbar.items.length) {
                location.hash = config.navbar.items[next].href.split('#')[1];
                lastTurn = performance.now();
            }
        };
        const start = (event: TouchEvent) => {
            clearDrag();
            touch = null;
            if (blocked() || event.touches.length !== 1 || (event.target as HTMLElement).closest('button, input, iframe, .mobile-section-nav')) return;
            touch = {x: event.touches[0].clientX, y: event.touches[0].clientY, up: canScroll(event.target, -1), down: canScroll(event.target, 1), view: (event.target as HTMLElement).closest('.root-view')};
        };
        const move = (event: TouchEvent) => {
            if (!touch || blocked() || !matchMedia(mobileQuery).matches) return;
            if (event.touches.length !== 1) { cancel(); return; }
            const dx = touch.x - event.touches[0].clientX;
            const dy = touch.y - event.touches[0].clientY;
            if (Math.abs(dy) < 10 || Math.abs(dx) > Math.abs(dy) || (dy > 0 ? touch.down : touch.up)) return;
            const next = viewIndex.get() + (dy > 0 ? 1 : -1);
            if (next < 0 || next >= config.navbar.items.length || !touch.view) return;
            touch.view.dataset.dragging = 'true';
            touch.view.style.setProperty('--swipe-y', `${Math.max(-56, Math.min(56, -dy * .2))}px`);
        };
        const end = (event: TouchEvent) => {
            clearDrag();
            if (!touch || blocked()) { touch = null; return; }
            const {x, y, up, down} = touch;
            touch = null;
            const dx = x - event.changedTouches[0].clientX, dy = y - event.changedTouches[0].clientY;
            if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.3) return;
            // Only a new gesture starting at the boundary can turn a section.
            if (dy > 0 ? down : up) return;
            turn(dy > 0 ? 1 : -1);
        };
        const cancel = () => { clearDrag(); touch = null; };
        const wheel = (event: WheelEvent) => {
            if (blocked() || Math.abs(event.deltaY) < 25 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
            const direction = event.deltaY > 0 ? 1 : -1;
            if (!canScroll(event.target, direction)) turn(direction);
        };
        root.addEventListener('touchstart', start, {passive: true});
        root.addEventListener('touchmove', move, {passive: true});
        root.addEventListener('touchend', end, {passive: true});
        root.addEventListener('touchcancel', cancel, {passive: true});
        root.addEventListener('wheel', wheel, {passive: true});
        return () => {
            root.removeEventListener('touchstart', start);
            root.removeEventListener('touchmove', move);
            root.removeEventListener('touchend', end);
            root.removeEventListener('touchcancel', cancel);
            root.removeEventListener('wheel', wheel);
            clearDrag();
        };
    }, []);
    return <>
        <nav className="mobile-section-nav" aria-label="当前页面分区">
            <div key={index} className="mobile-section-current" data-direction={direction}>
                <div className="mobile-section-counter" aria-hidden="true">
                    <span className="mobile-section-number">{String(index).padStart(2, '0')}</span>
                    <span className="mobile-section-total">/ {String(config.navbar.items.length - 1).padStart(2, '0')}</span>
                </div>
                <span className="mobile-section-label">{config.pageTracker.labels[index] ?? config.navbar.items[index].title}</span>
            </div>
        </nav>
        {[Index, Information, Operator, World, Media, More].map((Element, i) => <RootPageViewTemplate key={i} selfIndex={i} direction={direction}><Element /></RootPageViewTemplate>)}
    </>;
}
