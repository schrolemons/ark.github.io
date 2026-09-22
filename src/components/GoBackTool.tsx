import {useEffect, useState} from 'react';
import {IconArrow} from './SvgIcons';
import {previousPage} from '../utils/navigation';

export default function GoBackTool({goBackHref}: {goBackHref?: string}) {
    const [fallback, setFallback] = useState(goBackHref ?? `${import.meta.env.BASE_URL}#information`);
    const [href, setHref] = useState(fallback);
    useEffect(() => {
        const base = import.meta.env.BASE_URL;
        const path = location.pathname.replace(/\/$/, '');
        const parent = goBackHref ?? (path.startsWith(base + 'docs/') ? base + 'docs/' : path === base + 'operator' ? base + '#operator' : path === base + 'docs' ? base + '#more' : base + '#information');
        setFallback(parent); setHref(previousPage(parent));
    }, [goBackHref]);
    // Explicit parent navigation also works after following several article headings.
    return <a href={href} target="_self" className="go-back-tool"><IconArrow className="w-2 rotate-180 pointer-events-none"/><span>返回上一级<small>GO BACK</small></span></a>;
}
