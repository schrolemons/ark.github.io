import React, { useEffect, useState, useMemo, useRef } from "react";
import { useStore } from "@nanostores/react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar } from "swiper/modules";
import arknightsConfig from "../../../arknights.config.tsx";
import "swiper/css";
import "swiper/css/scrollbar";

import {
  viewIndex,
  readyToTouch,
} from "../../components/store/rootLayoutStore.ts";
import { directions } from "../../components/store/lineDecoratorStore";
import { navigateRoute, useHashRoute } from "../../components/useHashRoute";

// -scss

import "../../_styles/Operator/base.scss";
import {IconArrow} from "../../components/SvgIcons.tsx";

export default function Operator() {
  const $viewIndex = useStore(viewIndex);
  const $readyToTouch = useStore(readyToTouch);
  const [active, setActive] = useState(false);
  const route = useHashRoute();
  const currentIndex = Math.max(0, arknightsConfig.rootPage.OPERATOR.data.findIndex(op =>
    route.section === 'operator' && (op.id === route.segments[0] || op.cnName === route.segments[0])));
  const setCurrentIndex = (index: number) => navigateRoute('operator', [arknightsConfig.rootPage.OPERATOR.data[index].id]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentOp = useMemo(
    () => arknightsConfig.rootPage.OPERATOR.data[currentIndex],
    [currentIndex]
  );

  const handlePlayVoice = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  };

  // 当切换角色时暂停音频
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentOp]);

  useEffect(() => {
    const isActive = $viewIndex === 2;
    if (isActive) {
      directions.set({ top: true, right: true, bottom: true, left: false });
    }
    setActive(isActive);
  }, [$viewIndex]);

  // 控制logo闪烁效果
  useEffect(() => {
    let timeoutId: number | null = null;

    const toggleVisibility = () => {
      setLogoVisible(true);
      // 显示3秒
      timeoutId = window.setTimeout(() => {
        setLogoVisible(false);
        // 消失1秒
        timeoutId = window.setTimeout(toggleVisibility, 1000);
      }, 3000);
    };

    toggleVisibility();

    return () => {
      // 清理所有的setTimeout
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div
      className={`w-[100vw] max-w-[180rem] h-full absolute top-0 right-0 bottom-0 left-auto transition-all duration-700 ease-in-out bg-layout overflow-hidden ${
        active ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        src={currentOp.voice}
        onEnded={() => setIsPlaying(false)}
      />

      {/* 1. 背景层 (装饰大字 & 网格) */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 mix-blend-overlay" />
        <div className="absolute inset-0 flex items-center z-10 opacity-45">
          <span className="bg-decor-text">{currentOp.name}</span>
        </div>
      </div>

      {/* 2. 主立绘展示层 (含叠影) */}
      <div className="absolute right-0 bottom-0 w-3/4 h-full flex items-end justify-end z-10  pointer-events-none">
        <AnimatePresence mode="wait">
          {/* 背景大叠影：增加缩放视差和混合模式优化 */}
          <motion.img
            key={currentOp.id + "_bg" + active+currentIndex}
            src={currentOp.fullbody}
            alt=""
            style={currentOp.id === 'lifeng' ? { height: '110%', top: '12%', right: '0%' } : undefined}
            initial={{
              opacity: 0,
              x: 400,
              scale: 1.5,
              //filter: "blur(20px) grayscale(1)",
              filter: "grayscale(1)",
            }}
            animate={{
              opacity: 0.25,
              x: 0,
              scale: 1.6,
              //filter: "blur(10px) grayscale(1)",
              filter: "grayscale(1)",
            }}
            exit={{ opacity: 0, x: -30, transition: { duration: 0.4 } }}
            transition={{ 
              type: "spring",
              stiffness: 20,
              damping: 10,
              mass: 1,
              duration: 3, 
              delay: 1 
            }}
            className="absolute right-[-20%] top-[70px] h-[150%] w-auto object-contain mix-blend-color-dodge pointer-events-none select-none"
          />

          {/* 主立绘：增加更细腻的物理弹簧效果和落地点偏移 */}
          <motion.img
            key={currentOp.id + currentIndex}
            src={currentOp.fullbody}
            alt={currentOp.cnName}
            style={currentOp.id === 'lifeng' ? { height: '90%', bottom: '-5rem', right: '20%' } : undefined}
            initial={{ opacity: 0, x: 600, scale: 1 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1, 
            }}
            exit={{
              opacity: 0, 
              x: -40, 
              scale: 1.05, // 消失时轻微放大
              transition: { duration: 0.3 },
            }}
            transition={{
              type: "spring",
              stiffness: 20, // 降低刚度，让动作更优雅沉稳
              damping: 10, // 适中的阻尼防止抖动过大
              mass: 1,
              duration: 3,
              delay: 1
            }}
            className="relative bottom-[-25rem] h-[125%] w-auto object-contain drop-shadow-[-20px_20px_50px_rgba(0,0,0,0.7)] select-none"
          />
        </AnimatePresence>

        <div className="absolute bottom-0 right-[20%] w-[40%] h-[10%] bg-radial-gradient from-black/60 to-transparent blur-2xl -z-10" />
      </div>

      <div className="OPS_info_block mb-0 h-full flex items-center">
        {/* 3. 左侧资料信息区 */}
        <div className="absolute bottom-[-2rem] z-20 h-full flex flex-col justify-center pl-[6rem] portrait:pl-[2rem] w-[45rem] portrait:w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOp.id + currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* 标签 */}
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-white text-black font-black px-2 py-0.5 text-sm tracking-tighter">
                  PROFILE
                </span>
                <span className="text-white/40 font-benderRegular text-xs tracking-[0.2em]">
                  第九边缘：SCHNIE ://
                </span>
              </div>

              {/* 名字区 */}
              <div className="relative mb-8 flex items-end">
                <div className="leading-none mb-1">
                  <div className="name-display">{currentOp.name}</div>
                  <div className="cn-name-display">{currentOp.cnName}</div>
                </div>
                <a href={currentOp.url.replace('{id}', currentOp.id)} target="_blank" className="ml-6 h-20 block no-underline">
                  {logoVisible && (
                    <img
                        src={currentOp.logo}
                        className="block w-auto h-full transition-opacity duration-200"
                        alt="faction"
                    />
                  )}
                </a>
        </div>

        {/*/!* CV 语音展示 *!/*/}
        {/*<div*/}
              {/*  className="voice-section group"*/}
              {/*  onClick={handlePlayVoice}*/}
              {/*  data-playing={isPlaying}*/}
              {/*>*/}
              {/*  <div className="voice-btn-wrapper">*/}
              {/*    <div className={`voice-btn ${isPlaying ? "is-playing" : ""}`}>*/}
              {/*      <svg className="icon" viewBox="0 0 24 24">*/}
              {/*        {isPlaying ? (*/}
              {/*          <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> // 暂停*/}
              {/*        ) : (*/}
              {/*          <path d="M8 5v14l11-7z" /> // 播放*/}
              {/*        )}*/}
              {/*      </svg>*/}
              {/*    </div>*/}
              {/*    /!* 装饰外圈 *!/*/}
              {/*    <div className="btn-echo" />*/}
              {/*  </div>*/}

              {/*  <div className="voice-info">*/}
              {/*    <div className="voice-title">CHARACTER VOICE</div>*/}
              {/*    <div className="voice-name">{currentOp.cv}</div>*/}
              {/*  </div>*/}

              {/*  <div className="voice-wave-container">*/}
              {/*    {[...Array(20)].map((_, i) => (*/}
              {/*      <div key={i} className="wave-bar" />*/}
              {/*    ))}*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/* 描述文本 */}
              <div className="description-section">
                <div className="desc-border" />
                   <div  onClick={() => window.open("https://arknights.astro.yue.zone/docs/", "_blank")}/>
                {currentOp.desc.split('\n').map((sentence, index) => (
                  <p key={index} className="desc-text" style={{ textIndent: '2em', margin: '0 0 0.5em 0' }}>
                    {sentence}
                  </p>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 4. 底部人物选择列表 (Swiper) */}
          <div className="mt-7">
            <div className=" relative overflow-hidden [list-style:none] p-0 block box-border mx-2 my-0 w-[33.625rem] [mask:linear-gradient(-90deg,_rgba(255,_255,_255,_0),_rgb(255,_255,_255)_2rem)] operator-list-container">
              <div className="relative w-full h-full flex [transition-property:transform] box-border [transform:translateZ(0px)]">
                <Swiper
                  modules={[Scrollbar]}
                  spaceBetween={10}
                  slidesPerView={"auto"}
                  scrollbar={{ draggable: true, el: ".op-scrollbar" }}
                >
                  {arknightsConfig.rootPage.OPERATOR.data.map((op, index) => (
                    <SwiperSlide
                      key={op.id}
                      className="flex-shrink-0 w-full h-full [transition-property:transform] block [transform:translateZ(0px)] [backface-visibility:hidden] box-border"
                    >
                      <div
                        onClick={() => setCurrentIndex(index)}
                        className={`thumbnail ${
                          currentIndex === index ? "active" : "inactive"
                        }`}
                      >
                        <div className="image-container absolute top-0 left-0 w-full h-full border-[0.625rem] border-[solid] border-[rgb(255,255,255)]"></div>
                        <div className="[filter:drop-shadow(rgb(0,_0,_0)_-0.5rem_0.5rem_1rem)] overflow-hidden">
                          <img
                            src={op.portrait}
                            className="block w-full h-auto mx-[auto] my-0"
                            alt={op.cnName}
                          />
                        </div>
                        <div className="name-label [filter:drop-shadow(rgb(0,_0,_0)_0px_0px_0.5rem)_drop-shadow(rgb(0,_0,_0)_0px_0px_0.5rem)] [transition:color_0.3s] text-[rgb(255,_255,_255)]">
                          <div className="relative block font-[SourceHanSans-Medium]">
                            {op.cnName}
                          </div>
                        </div>
                        {/* {currentIndex === index && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-ark-blue text-xs selected-indicator">
                            ▼
                          </div>
                        )} */}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
          <div className="op-scrollbar mt-9 relative w-[33.5rem] h-3 before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:h-[0.3px] before:bg-white"></div>
        </div>
      </div>
    </div>
  );
}
