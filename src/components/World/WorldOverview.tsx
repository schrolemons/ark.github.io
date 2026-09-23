import React, { useState } from 'react';
import { motion } from 'framer-motion';
import config from '../../../arknights.config';

const items = config.rootPage.WORLD.items;
export const WORLD_PAGE_SIZE = 6;

type OverviewProps = {
  onItemSelect: (index: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  previewIndex?: number;
  onPreviewItem?: (index: number) => void;
};

function Item({ title, subTitle, imageUrl, index, previewed, onClick, onPreview }: {
  title: string;
  subTitle: string;
  imageUrl: string;
  index: number;
  previewed: boolean;
  onClick: () => void;
  onPreview?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return <a href="#world" aria-label={`${title} - ${subTitle}`}
    className={`world-overview-item h-24 pb-3 leading-none flex items-end relative border-b border-white cursor-pointer ${previewed ? "is-previewed" : ""}`}
    onMouseEnter={() => { setHovered(true); onPreview?.(); }} onMouseLeave={() => setHovered(false)}
    onFocus={() => { setHovered(true); onPreview?.(); }} onBlur={() => setHovered(false)}
    onClick={e => { e.preventDefault(); onClick(); }}>
    <span className="world-overview-item-index">{String(index + 1).padStart(2, '0')}</span>
    <div className="world-overview-item-watermark text-[4.5rem] text-[rgba(255,215,0,.25)] font-n15eBold absolute right-[.75rem] bottom-[.75rem] transition-opacity duration-200"
      style={{ opacity: hovered ? 1 : 0 }}>{subTitle}</div>
    <div className="world-overview-item-title text-[2.5rem] font-bold relative transition-[color,transform] duration-200"
      style={{ textShadow: '0 0 1em #000', transform: hovered ? 'translateX(2rem)' : undefined, color: hovered ? '#fff' : '#ababab' }}>{title}</div>
    <div className="world-overview-item-subtitle text-[1.25rem] font-n15eBold ml-[1.5rem] relative transition-[color,transform] duration-200"
      style={{ textShadow: '0 0 1em #000', transform: hovered ? 'translateX(2rem)' : undefined, color: hovered ? '#fff' : '#ababab' }}>{subTitle}</div>
  </a>;
}

export default function WorldOverview({ onItemSelect, currentPage, onPageChange, previewIndex, onPreviewItem }: OverviewProps) {
  const totalPages = Math.ceil(items.length / WORLD_PAGE_SIZE);
  const start = (currentPage - 1) * WORLD_PAGE_SIZE;
  return <div className="w-[39.875rem] absolute top-[20.3703703704%] left-[9rem] z-10" data-world-overview>
    {/*<div className="world-overview-intro">*/}
    {/*  <span>WORLD / SCHNIE</span>*/}
    {/*  <h1>世界设定</h1>*/}
    {/*  <p>记录文明的结构、技术与仍在延续的历史。</p>*/}
    {/*  <div className="world-mobile-index"><span>CONTENTS</span><span>{String(items.length).padStart(2, '0')} ENTRIES</span></div>*/}
    {/*</div>*/}
    {/* All six rows enter together, including rows remounted after the short last page. */}
    <motion.div className="world-overview-list" key={currentPage} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}>
      {items.slice(start, start + WORLD_PAGE_SIZE).map((item, index) =>
        <Item key={item.subTitle} title={item.title} subTitle={item.subTitle} imageUrl={item.imageUrl} index={start + index}
          previewed={previewIndex === start + index} onPreview={() => onPreviewItem?.(start + index)} onClick={() => onItemSelect(start + index)} />)}
    </motion.div>
    {totalPages > 1 && <div className="world-overview-pagination mt-8 flex justify-between items-center">
      <button className="world-overview-page-button px-4 py-2 bg-[#333] text-white hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>上一页</button>
      <div className="world-overview-page-count text-white" aria-live="polite">{currentPage} / {totalPages}</div>
      <button className="world-overview-page-button px-4 py-2 bg-[#333] text-white hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>下一页</button>
    </div>}
  </div>;
}
