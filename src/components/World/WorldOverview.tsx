import React, { useState } from 'react';
import { motion } from 'framer-motion';
import config from '../../../arknights.config';

const items = config.rootPage.WORLD.items;
export const WORLD_PAGE_SIZE = 6;

type OverviewProps = {
  onItemSelect: (index: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
};

function Item({ title, subTitle, onClick }: { title: string; subTitle: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return <a href="#world" aria-label={`${title} - ${subTitle}`}
    className="h-24 pb-3 leading-none flex items-end relative border-b border-white cursor-pointer"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}
    onClick={e => { e.preventDefault(); onClick(); }}>
    <div className="text-[4.5rem] text-[rgba(255,215,0,.25)] font-n15eBold absolute right-[.75rem] bottom-[.75rem] transition-opacity duration-200"
      style={{ opacity: hovered ? 1 : 0 }}>{subTitle}</div>
    <div className="text-[2.5rem] font-bold relative transition-[color,transform] duration-200"
      style={{ textShadow: '0 0 1em #000', transform: hovered ? 'translateX(2rem)' : undefined, color: hovered ? '#fff' : '#ababab' }}>{title}</div>
    <div className="text-[1.25rem] font-n15eBold ml-[1.5rem] relative transition-[color,transform] duration-200"
      style={{ textShadow: '0 0 1em #000', transform: hovered ? 'translateX(2rem)' : undefined, color: hovered ? '#fff' : '#ababab' }}>{subTitle}</div>
  </a>;
}

export default function WorldOverview({ onItemSelect, currentPage, onPageChange }: OverviewProps) {
  const totalPages = Math.ceil(items.length / WORLD_PAGE_SIZE);
  const start = (currentPage - 1) * WORLD_PAGE_SIZE;
  return <div className="w-[39.875rem] absolute top-[20.3703703704%] left-[9rem] z-10" data-world-overview>
    {/* All six rows enter together, including rows remounted after the short last page. */}
    <motion.div key={currentPage} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}>
      {items.slice(start, start + WORLD_PAGE_SIZE).map((item, index) =>
        <Item key={item.subTitle} title={item.title} subTitle={item.subTitle} onClick={() => onItemSelect(start + index)} />)}
    </motion.div>
    {totalPages > 1 && <div className="mt-8 flex justify-between items-center">
      <button className="px-4 py-2 bg-[#333] text-white hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>上一页</button>
      <div className="text-white" aria-live="polite">{currentPage} / {totalPages}</div>
      <button className="px-4 py-2 bg-[#333] text-white hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>下一页</button>
    </div>}
  </div>;
}
