import React, { useEffect, useRef, useState, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  viewIndex,
  readyToTouch,
} from "../../components/store/rootLayoutStore.ts";
import { directions } from "../../components/store/lineDecoratorStore.ts";
import PortraitBottomGradientMask from "../../components/PortraitBottomGradientMask";
import config from "../../../arknights.config.tsx";
import ParticleFactory from "../../components/ParticleFactory.tsx";
import WorldOverview, { WORLD_PAGE_SIZE } from "../../components/World/WorldOverview";
import { navigateRoute, useHashRoute } from "../../components/useHashRoute";
import { routeSegment } from "../../utils/hash-route";
import WorldDetails from "../../components/World/WorldDetails";
import { motion, AnimatePresence } from "framer-motion";
import AshParticles from "../../components/World/AshParticles.tsx";

const items = config.rootPage.WORLD!.items;

// 使用 useCallback 优化回调函数
export default function World() {
  const $viewIndex = useStore(viewIndex);
  const $readyToTouch = useStore(readyToTouch);
  const world = useRef<HTMLDivElement>(null);
  const route = useHashRoute();
  const itemIndex = route.section === 'world' ? items.findIndex(item => routeSegment(item.subTitle) === route.segments[0]) : -1;
  const selectedItemIndex = itemIndex < 0 ? null : itemIndex;
  const requestedPage = Number(route.params.page);
  const currentPage = route.section === 'world' && Number.isInteger(requestedPage)
    ? Math.max(1, Math.min(Math.ceil(items.length / WORLD_PAGE_SIZE), requestedPage)) : 1;
  const [active, setActive] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isWorldReady, setIsWorldReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // 初始设置
    handleResize();

    // 添加事件监听器
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const wasActive = active;
    const isActive = $viewIndex === 3 && $readyToTouch;

    if (isActive) {
      directions.set({ top: false, right: true, bottom: true, left: false });
    }

    // 检查是否正在离开当前页面
    if (wasActive && !isActive) {
      setIsLeaving(true);
      // 等待过渡动画结束后再真正隐藏页面
      const timer = setTimeout(() => {
        setActive(false);
        setIsLeaving(false);
      }, 300); // 300ms 是过渡动画的持续时间

      return () => clearTimeout(timer);
    } else {
      setIsLeaving(false);
      setActive(isActive);
    }
  }, [$viewIndex, $readyToTouch, active]);

  useEffect(() => {
    if (active && !isLeaving && windowSize.width > 0 && windowSize.height > 0) {
      // 给一个小延迟，确保其他元素都已经渲染完成
      const timer = setTimeout(() => {
        setIsWorldReady(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setIsWorldReady(false); // 确保在非活动状态下停止粒子系统
    }
  }, [active, isLeaving, windowSize]);

  const handleItemSelect = useCallback((index: number) => {
    navigateRoute('world', [items[index].subTitle]);
  }, []);

  const handleBack = useCallback(() => {
    const page = Math.floor((selectedItemIndex ?? 0) / WORLD_PAGE_SIZE) + 1;
    navigateRoute('world', [], page > 1 ? { page: String(page) } : {});
  }, [selectedItemIndex]);

  const handlePrevious = useCallback(() => {
    if (selectedItemIndex !== null) handleItemSelect((selectedItemIndex - 1 + items.length) % items.length);
  }, [selectedItemIndex, handleItemSelect]);

  const handleNext = useCallback(() => {
    if (selectedItemIndex !== null) handleItemSelect((selectedItemIndex + 1) % items.length);
  }, [selectedItemIndex, handleItemSelect]);

  const handleGoToItem = useCallback((index: number) => {
    navigateRoute('world', [items[index].subTitle]);
  }, []);

  return (
    <div
      ref={world}
      className={`w-full h-full absolute top-0 left-0 bg-[#272727] overflow-hidden transition-opacity duration-300 ${
        isLeaving
          ? "opacity-0"
          : active
            ? "opacity-100 visible"
            : "opacity-0 invisible"
      }`}
    >
      {/* 背景层 */}
      <div className="bg-layout absolute inset-0 bg-[#101010] opacity-90 z-[0]" />

      {/* 背景文字 "WORLD" */}
      <h1 className="absolute bottom-[5%] left-[10%] text-gray-800 dark:text-gray-900 font-bold text-9xl opacity-20 select-none z-[1] pointer-events-none">
        WORLD
      </h1>

      {/* 
          Z-Index 结构:
          0: 背景
          1: 粒子
          10: 内容 (Overview / Details)
          20: 遮罩/UI 装饰
      */}

      {/* 内容区域 */}
      <div className="absolute inset-0 ">
        <AnimatePresence mode="wait">
          {selectedItemIndex === null ? (
            <WorldOverview key="overview" onItemSelect={handleItemSelect} currentPage={currentPage}
              onPageChange={page => navigateRoute('world', [], page > 1 ? { page: String(page) } : {})} />
          ) : (
            <WorldDetails
              key="details"
              item={items[selectedItemIndex]}
              active={active && !isLeaving}
              onBack={handleBack}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onGoToItem={handleGoToItem}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 3D 粒子特效 - 允许点击操作 */}
      {isWorldReady && (
        <div
          className={`absolute ${selectedItemIndex !== null ? "left-0" : "right-0"} top-1/2 transform -translate-y-1/2 opacity-70`}
        >
          <ParticleFactory
            activeLabel={selectedItemIndex !== null ? undefined : "island"}
            imageUrl={
              selectedItemIndex !== null
                ? items[selectedItemIndex].imageUrl
                : undefined
            }
            width={windowSize.width}
            height={windowSize.height}
            isGrayscale={false}
            scale={windowSize.height > windowSize.width ? (selectedItemIndex !== null ? 0.45 : 0.6) : 1.7}
            particleAreaX={
              windowSize.height > windowSize.width ? windowSize.width / 2 - 200 : selectedItemIndex !== null
                ? windowSize.width / 5
                : windowSize.width / 2 + 60
            }
            particleAreaY={windowSize.height > windowSize.width ? (selectedItemIndex !== null ? windowSize.height * 0.2 - 200 : windowSize.height * 0.72 - 200) : windowSize.height / 2 - 150}
          />
        </div>
      )}
      {active && !isLeaving && selectedItemIndex === null && <AshParticles count={35} />}
      <PortraitBottomGradientMask />
    </div>
  );
}
