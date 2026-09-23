import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import ParticleFactory from "../ParticleFactory";

type WorldParticleItem = {
  title: string;
  subTitle: string;
  imageUrl: string;
};

interface WorldParticleStageProps {
  item: WorldParticleItem;
  itemIndex: number;
  total: number;
  width: number;
  height: number;
  detail: boolean;
  active: boolean;
}

export default function WorldParticleStage({
  item,
  itemIndex,
  total,
  width,
  height,
  detail,
  active,
}: WorldParticleStageProps) {
  const reducedMotion = useReducedMotion();
  if (!active || width <= 0 || height <= 0) return null;

  const portrait = height > width;
  const scale = portrait ? (detail ? 0.78 : 0.66) : (detail ? 1.38 : 1.16);
  const mobileRailWidth = width <= 390 ? 44 : 48;
  const displayWidth = portrait ? Math.max(0, width - mobileRailWidth) : width;
  const centerX = portrait ? displayWidth / 2 : width * (detail ? 0.30 : 0.68);
  const particleCenterX = portrait ? width / 2 : centerX;
  const centerY = portrait
    ? Math.max(205, Math.min(height * (detail ? 0.305 : 0.285), detail ? 330 : 300))
    : height * 0.48;
  const visualSize = Math.round(400 * scale);

  return <div
    className={`world-particle-stage ${detail ? "is-detail" : "is-overview"}`}
    data-world-particle-stage
    style={{
      "--world-particle-x": `${centerX}px`,
      "--world-particle-y": `${centerY}px`,
      "--world-particle-size": `${visualSize}px`,
      "--world-particle-half-size": `${Math.round(visualSize / 2)}px`,
    } as CSSProperties}
  >
    <div className="world-particle-ghost-frame">
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={item.imageUrl}
          className="world-particle-ghost"
          src={item.imageUrl}
          alt=""
          initial={reducedMotion ? false : { opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: detail ? 0.13 : 0.09, scale: 1, rotate: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, scale: 1.06, rotate: 2 }}
          transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.22, 0.82, 0.24, 1] }}
        />
      </AnimatePresence>
    </div>
    <div className="world-particle-canvas">
      <ParticleFactory
        imageUrl={item.imageUrl}
        width={width}
        height={height}
        isGrayscale={false}
        scale={scale}
        brightnessThreshold={55}
        alphaThreshold={8}
        entryDuration={reducedMotion ? 0 : 1450}
        exitDuration={reducedMotion ? 0 : 520}
        imageDelay={reducedMotion ? 0 : 40}
        particleAreaX={particleCenterX - 200}
        particleAreaY={centerY - 200}
      />
    </div>
    <div className="world-particle-reticle" aria-hidden="true"><span /><span /><span /><span /></div>
    <div className="world-particle-caption" aria-hidden="true">
      <span>{detail ? "WORLD ARCHIVE / ENTITY" : "WORLD ARCHIVE / PREVIEW"}</span>
      <strong>{item.subTitle}</strong>
      <small>{String(itemIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</small>
    </div>
  </div>;
}
