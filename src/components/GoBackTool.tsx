import {useEffect, useState} from 'react';
import {IconArrow} from './SvgIcons';
import {previousPage} from '../utils/navigation';

export default function GoBackTool({goBackHref, overviewHref}: {goBackHref?: string; overviewHref?: string}) {
    const [fallback, setFallback] = useState(goBackHref ?? `${import.meta.env.BASE_URL}#information`);
    const [href, setHref] = useState(fallback);
    useEffect(() => {
        const base = import.meta.env.BASE_URL;
        const path = location.pathname.replace(/\/$/, '');
        const parent = goBackHref ?? (path.startsWith(base + 'docs/') ? base + 'docs/' : path === base + 'operator' ? base + '#operator' : path === base + 'docs' ? base + '#more' : base + '#information');
        setFallback(parent); setHref(previousPage(parent));
    }, [goBackHref]);
    // Explicit parent navigation also works after following several article headings.
    const overview = overviewHref ?? goBackHref;
    return <><a href={href} target="_self" className="go-back-tool"><IconArrow className="reader-tool-arrow rotate-180 pointer-events-none"/><span>返回上一级<small>GO BACK</small></span></a>
      {overview && <a href={overview} target="_self" className="go-back-tool overview-tool"><span>{overview.includes('operator') ? '人物总览' : overview.includes('docs') ? '文档总览' : '分类总览'}<small>ALL RECORDS</small></span><IconArrow className="reader-tool-arrow pointer-events-none"/></a>}</>;
}
