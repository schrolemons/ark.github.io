import React from "react";
import { IconArrow } from "../SvgIcons.tsx";
import config from "../../../arknights.config.tsx";
import { motion } from "framer-motion";
// import LogoParticleCanvas from "./DN_logos.tsx";

interface WorldItem {
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string;
}

interface WorldDetailsProps {
  active?: boolean;
  item?: WorldItem;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onGoToItem?: (index: number) => void;
}

const items = config.rootPage.WORLD!.items;

export default function WorldDetails({
  active = true,
  item,
  onBack,
  onPrevious,
  onNext,
  onGoToItem,
}: WorldDetailsProps) {
  if (!item) {
    return null;
  }

  // 动画配置
  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="world-detail absolute inset-0 w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 内容层 */}
      <motion.div className="absolute inset-0 z-[3] pointer-events-none">
        <div className="world-copy absolute top-1/2 -translate-y-1/2 right-[10%] w-[40%] max-w-[600px] flex flex-col pointer-events-auto pl-8 border-l border-white/30 portrait:top-[34%] portrait:bottom-[17%] portrait:translate-y-0 portrait:left-[9%] portrait:right-auto portrait:w-[74%] portrait:overflow-y-auto portrait:pr-4 portrait:bg-[#171717]/80"
          onWheel={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
          <div className="world-copy-kicker">WORLD ARCHIVE <span>{item.subTitle}</span></div>
          {/* 装饰线 */}
          <div className="world-copy-rule absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent" />

          <motion.div
            key={`title-${item.title}`}
            className="world-copy-title text-[4rem] font-bold leading-none text-white drop-shadow-lg w-[60%] portrait:w-full"
            variants={textVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            {item.title}
          </motion.div>

          <motion.div
            key={`subtitle-${item.title}`}
            className="world-copy-subtitle text-[2rem] font-n15eBold text-ark-blue mt-2 mb-6 w-[60%] portrait:w-full"
            variants={textVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            {item.subTitle}
          </motion.div>

          <motion.div
            key={`desc-${item.title}`}
            className="world-copy-description text-[1rem] leading-relaxed text-gray-200 w-[60%] portrait:w-full portrait:text-[1.75rem]"
            variants={textVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            {item.description.split('\n').map((paragraph, index) => (
              <p key={index} style={{ textIndent: '2em', margin: '0 0 1em 0' }}>
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>

        {/* 导航按钮 (左右箭头) */}
        <div className="world-detail-nav pointer-events-auto">
          <motion.a
            role="button" aria-label="上一条设定" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPrevious(); } }}
            className="absolute left-[5%] top-1/2 -translate-y-1/2 p-4 cursor-pointer hover:bg-white/10 rounded-full transition-colors z-[10] origin-center"
            onClick={(e) => {
              e.preventDefault();
              onPrevious();
            }}
          >
            <IconArrow className="w-8 h-8 rotate-180 fill-white opacity-70" />
          </motion.a>

          <motion.a
            role="button" aria-label="下一条设定" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNext(); } }}
            className="absolute right-[15%] top-1/2 -translate-y-1/2 p-4 cursor-pointer hover:bg-white/10 rounded-full transition-colors z-[10] origin-center"
            onClick={(e) => {
              e.preventDefault();
              onNext();
            }}
          >
            <IconArrow className="w-8 h-8 fill-white opacity-70" />
          </motion.a>
        </div>
      </motion.div>

      {/* 底部进度条/指示器 */}
      <motion.div
        className="world-detail-progress absolute bottom-[10%] left-[10%] right-[30%] h-1 flex gap-2 z-[3]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {items.map((_: any, index: number) => (
          <div
            key={index}
            className={`h-full flex-1 transition-colors duration-300 ${
              items[index] === item
                ? "bg-ark-blue"
                : "bg-white/20 hover:bg-white/40"
            } cursor-pointer`}
            onClick={() => (onGoToItem ? onGoToItem(index) : null)}
          />
        ))}
      </motion.div>

      {/* 返回按钮 */}
      <motion.button
        className="world-detail-back absolute bottom-[10%] right-[10%] bg-[#333] hover:bg-[#444] text-white px-8 py-3 flex items-center gap-4 z-[10] transition-colors"
        onClick={onBack}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <IconArrow className="w-4 h-4 rotate-180 fill-current" />
        <div className="text-left">
          <div className="text-sm font-bold">BACK</div>
          <div className="text-xs opacity-60">RETURN TO MAP</div>
        </div>
      </motion.button>
    </motion.div>
  );
}
