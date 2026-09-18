import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navigateRoute, useHashRoute } from "../../../components/useHashRoute";
import { routeSegment } from "../../../utils/hash-route";

// --- 图标组件 ---
const IconShare = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="opacity-80 hover:opacity-100"
  >
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);
const IconAudio = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="opacity-80 hover:opacity-100"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);
const IconUser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="opacity-80 hover:opacity-100"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const IconArrowLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

// --- 模拟数据 ---
const galleryData = [
  {
    id: "01",
    year: "2026",
    title: "Starry Sky",
    subtitle: "#01#",
    src: "/images/04-media/gallery/2-1.png",
    desc: "The Starry Sky and the Soul",
  },
  {
    id: "02",
    year: "2025",
    title: "meadow",
    subtitle: "#02#",
    src: "/images/04-media/gallery/2-2.png",
    desc: "A View from the Meadow",
  },
  {
    id: "03",
    year: "2026",
    title: "sea",
    subtitle: "#03#",
    src: "/images/04-media/gallery/2-3.png",
    desc: "A View from the Sea",
  },
];

interface GalleryProps {
  onBack?: () => void;
  active?: boolean;
}

export default function ArknightsGallery({ onBack, active = false }: GalleryProps) {
  const route = useHashRoute();
  const currentIndex = Math.max(0, galleryData.findIndex(item => routeSegment(item.title) === route.segments[1]));
  const setCurrentIndex = (index: number) => navigateRoute('media', ['visual_archive', galleryData[index].title]);
  const activeItem = galleryData[currentIndex];

  const nextItem = () => setCurrentIndex((currentIndex + 1) % galleryData.length);
  const prevItem = () => setCurrentIndex((currentIndex - 1 + galleryData.length) % galleryData.length);

  // 触摸/滚轮滑动翻页状态（上下滑动在图片间切换，而不是返回其他页面）
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const lastWheelTime = useRef(0);

  // 键盘左右切换
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevItem();
      else if (e.key === "ArrowRight") nextItem();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!active) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    // 仅当纵向位移明显且大于横向时翻页，避免与缩略图横向滚动冲突
    if (Math.abs(diffY) < 80 || Math.abs(diffY) <= Math.abs(diffX)) return;
    if (diffY > 0) nextItem();
    else prevItem();
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!active) return;
    const now = performance.now();
    if (now - lastWheelTime.current < 500 || Math.abs(e.deltaY) < 15) return;
    lastWheelTime.current = now;
    if (e.deltaY > 0) nextItem();
    else prevItem();
  };

  // 与原有右下角返回按钮保持一致的 UI
  const backButton = (
    <button
      onClick={onBack}
      className="group relative flex items-center justify-between h-14 w-48 bg-[#333] hover:bg-[#444] text-white transition-colors"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffd700] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="pl-4 pr-2">
        <IconArrowLeft />
      </div>
      <div className="flex-1 flex flex-col items-end pr-4 border-l border-white/10 h-3/4 justify-center">
        <span className="text-sm font-bold">返回</span>
        <span className="text-[9px] tracking-[0.1em] opacity-60">GO BACK</span>
      </div>
    </button>
  );

  return (
    <div
      className="relative w-full h-screen bg-[#111] text-white overflow-hidden font-sans select-none touch-pan-x"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* --- 1. 背景层 (带淡入淡出切换) --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* 图片 */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${activeItem.src}')` }}
          />
          {/* 遮罩：保证文字可读性，底部加黑，左侧加黑 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-80" />
        </motion.div>
      </AnimatePresence>

      {/* ---  左侧时间轴 (Timeline) --- */}
      <div className="absolute top-[20%] left-8 md:left-12 z-20 flex flex-col">
        {/* 年份标签 */}
        <div className="mb-8">
          <div className="text-[10px] bg-black/50 px-1 py-0.5 inline-block mb-1 text-[#ffd700] font-bold tracking-widest">
            TIMELINE
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black italic">2026</span>
            <span className="text-xl opacity-50 font-light">‹</span>
            <span className="bg-[#ffd700] text-black text-xs font-bold px-1 py-0.5 transform -skew-x-12">
              2026
            </span>
          </div>
        </div>

        {/* 垂直刻度尺 */}
        <div className="flex flex-col gap-6 relative pl-1">
          {/* 装饰用的长竖线 */}
          <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-white/20"></div>

          {galleryData.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setCurrentIndex(idx)}
              >
                {/* 刻度线 */}
                <div
                  className={`
                            h-[2px] transition-all duration-300 z-10
                            ${isActive ? "w-6 bg-[#ffd700]" : "w-3 bg-white/40 group-hover:bg-white/80 group-hover:w-4"}
                        `}
                ></div>

                {/* 数字 */}
                <span
                  className={`
                            font-mono text-sm transition-all duration-300
                            ${isActive ? "text-[#ffd700] font-bold scale-110" : "text-white/40 group-hover:text-white/80"}
                        `}
                >
                  {item.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 4. 底部主内容区域 --- */}
      <div className="absolute bottom-0 left-0 w-full z-20 pl-8 md:pl-12 pb-8 pr-0 flex flex-col md:flex-row items-end justify-between gap-8">
        {/* 左下：标题与大字 */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <motion.div
            key={activeItem.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-0 ">
              {activeItem.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#ffd700] text-lg font-bold tracking-widest">
                {activeItem.subtitle}
              </span>
            </div>
            {/* 装饰性蓝线 */}
            <div className="w-16 h-1 bg-[#ffd700] mt-4"></div>
          </motion.div>
        </div>

        {/* 中间：缩略图 Swiper 列表（含移动端返回按钮） */}
        <div className="flex-1 w-full flex items-end gap-4">
          {/* 移动端返回按钮：位于缩略图左侧，底部对齐 */}
          <div className="md:hidden flex-shrink-0">
            {backButton}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden relative group/swiper">
            {/* 可滚动列表容器 */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-end relative z-10 pl-4">
            {galleryData.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`
                                relative flex-shrink-0 cursor-pointer 
                                transition-all duration-600 ease-out
                                ${isActive ? "w-48 h-28 opacity-100" : "w-32 h-20  opacity-50 hover:opacity-80"}
                            `}
                >
                  <img
                    src={item.src}
                    alt=""
                    className="w-full h-full object-cover bg-gray-800"
                  />

                  {/* 选中态：青色边框 + 装饰角标 */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBorder"
                      className="absolute inset-0 border-2 border-[#ffd700]"
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute top-0 left-0 w-0 h-0 border-t-[8px] border-l-[8px] border-t-[#ffd700] border-l-transparent"></div>
                    </motion.div>
                  )}

                  {/* 序号覆盖层 */}
                  <div className="absolute top-0 left-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 font-mono">
                    {item.id}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>

        {/* 右下：返回按钮（桌面端） */}
        <div className="hidden md:block flex-shrink-0 mr-0 md:mr-8">
          {backButton}
        </div>
      </div>

      {/* 自定义滚动条样式隐藏 */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
