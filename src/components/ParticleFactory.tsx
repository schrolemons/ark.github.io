// TODO : 在粒子生成动画中应用鼠标影响（已完成）
// TODO : caven尺寸改变时只需要让粒子改变

import React, { useRef, useState, useEffect } from "react";

// 全局常量
const width = 400;
const height = 400;
const animateTime = 40;
const opacityStep = 1 / animateTime;
const Radius = 30;
const Inten = 0.25;
const LargeRadius = 400;
const LargeInten = 0.00005;
const BaseParticleRadius = 0.6;
const ParticleDensity = 6;

// 全局变量
/** 粒子对鼠标的敏感度 */
let mouseSensitivity = 5;
/** 明度阈值 (0-255) */
let brightnessThreshold = 100;
/** 透明度阈值 (0-255) */
let alphaThreshold = 6;
/** 整体缩放因子 */
let scale = 6;

// Logo 数据
const logos = [
  { label: "island", url: "/images/logo.png" },
];

// 辅助函数
function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

function easeOutLog(t: number): number {
  // TODO: We need a better function
  return 1 - Math.pow(1.8, -12 * t);
}

/** 粒子类 */
class Particle {
  x: number;
  y: number;
  totalX: number;
  totalY: number;
  mx?: number;
  my?: number;
  vx?: number;
  vy?: number;
  time: number;
  r: number;
  color: number[];
  opacity: number;
  initialX: number;
  initialY: number;
  progress: number;
  animationProgress: number;
  animationDuration: number;
  initialOpacity: number;
  offsetX: number;
  offsetY: number;
  grayColor: number;
  exitVx?: number;
  exitVy?: number;

  constructor(totalX: number, totalY: number, time: number, color: number[], animationDuration = 3000) {
    this.x = totalX;
    this.y = totalY;
    this.totalX = totalX;
    this.totalY = totalY;
    this.time = time;
    this.r = BaseParticleRadius * scale;
    this.color = [...color];
    this.opacity = 0;
    const angle = Math.random() * Math.PI * 2;
    const radius = (Math.random() * Math.min(width, height)) / 1.2; // 粒子初始位置范围
    this.initialX = width / 2 + Math.cos(angle) * radius;
    this.initialY = height / 2 + Math.sin(angle) * radius;
    this.x = this.initialX;
    this.y = this.initialY;
    this.initialOpacity = 0;
    this.opacity = this.initialOpacity;
    this.progress = 0;
    this.animationProgress = 0;
    this.animationDuration = animationDuration;
    this.offsetX = (Math.random() - 0.5) * 1;
    this.offsetY = (Math.random() - 0.5) * 1;
    this.grayColor = Math.round(
      0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]
    );
  }

  draw(ctx: CanvasRenderingContext2D, isGrayscale: boolean) {
    const centerX = width / 2;
    const centerY = height / 2;
    const scaledX = centerX + (this.x - centerX) * scale;
    const scaledY = centerY + (this.y - centerY) * scale;

    if (isGrayscale) {
      ctx.fillStyle = `rgba(${this.grayColor}, ${this.grayColor}, ${this.grayColor}, ${this.opacity})`;
    } else {
      ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
    }
    ctx.beginPath();
    ctx.arc(scaledX, scaledY, this.r, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime: number, mouseX?: number, mouseY?: number) {
    // 1. 计算鼠标影响产生的力 (无论是否在动画中)
    let repX = 0;
    let repY = 0;

    if (mouseX !== undefined && mouseY !== undefined) {
      const centerX = width / 2;
      const centerY = height / 2;
      const scaledMouseX = centerX + (mouseX - centerX) / scale;
      const scaledMouseY = centerY + (mouseY - centerY) / scale;
      let dx = scaledMouseX - this.x;
      let dy = scaledMouseY - this.y;
      let distance = Math.sqrt(dx ** 2 + dy ** 2);

      // 大范围排斥
      if (distance < LargeRadius) {
        let largeDisPercent = LargeRadius / distance;
        largeDisPercent = largeDisPercent > 7 ? 7 : largeDisPercent;
        let largeAngle = Math.atan2(dy, dx);
        repX +=
          Math.cos(largeAngle) *
          largeDisPercent *
          -LargeInten *
          mouseSensitivity;
        repY +=
          Math.sin(largeAngle) *
          largeDisPercent *
          -LargeInten *
          mouseSensitivity;
      }

      // 小范围强排斥
      if (distance < Radius * 2) {
        // 稍微扩大判定范围增加灵敏度
        let disPercent = Radius / distance;
        disPercent = disPercent > 7 ? 7 : disPercent;
        let angle = Math.atan2(dy, dx);
        repX += Math.cos(angle) * disPercent * -Inten * mouseSensitivity;
        repY += Math.sin(angle) * disPercent * -Inten * mouseSensitivity;
      }
    }

    // 2. 更新位置
    if (this.animationProgress < this.animationDuration) {
      // --- 入场动画阶段 ---
      this.animationProgress += deltaTime;
      const progress = Math.min(
        this.animationProgress / this.animationDuration,
        1
      );
      const easeProgress = easeOutLog(progress);

      // 计算动画应该到达的基础位置
      const baseX = lerp(this.initialX, this.totalX, easeProgress);
      const baseY = lerp(this.initialY, this.totalY, easeProgress);

      // 在动画过程中，累加鼠标产生的速度偏移
      this.vx = (this.vx || 0) * 0.95 + repX; // 加上摩擦系数防止无限加速
      this.vy = (this.vy || 0) * 0.95 + repY;

      // 最终位置 = 动画路径位置 + 鼠标偏移
      this.x = baseX + this.vx;
      this.y = baseY + this.vy;

      this.opacity = lerp(this.initialOpacity, 1, easeProgress);
    } else {
      // --- 常态维持阶段 ---
      // 计算回到目标点的力 (恢复力)
      this.mx = this.totalX - this.x;
      this.my = this.totalY - this.y;
      this.vx = this.mx / this.time + repX;
      this.vy = this.my / this.time + repY;

      this.x += this.vx;
      this.y += this.vy;
    }

    if (this.opacity < 1) this.opacity += opacityStep;
  }

  change(x: number, y: number, color: number[]) {
    this.totalX = x;
    this.totalY = y;
    this.color = [...color];
    this.time = animateTime;
  }

  updateTransition(targetParticle: Particle | undefined, progress: number) {
    if (!targetParticle) return;

    this.totalX = lerp(this.totalX, targetParticle.totalX, progress);
    this.totalY = lerp(this.totalY, targetParticle.totalY, progress);
    this.color = this.color.map((c, i) =>
      lerp(c, targetParticle.color[i], progress)
    );
  }
}

/** Logo图片类 */
class LogoImg {
  particleData: Particle[] = [];
  isLoaded = false;
  ready: Promise<void>;
  constructor(public src: string, public name: string) {
    this.ready = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          // Sample at display resolution; cap the number of particles per shape.
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = Math.min(600, Math.round(width * img.height / img.width));
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const points: Particle[] = [];
          for (let y = 0; y < canvas.height; y += 3) {
            for (let x = 0; x < canvas.width; x += 3) {
              const i = (x + y * canvas.width) * 4;
              const color = Array.from(data.slice(i, i + 4));
              if (Math.max(...color.slice(0, 3)) >= brightnessThreshold && color[3] >= alphaThreshold) {
                points.push(new Particle(x, y, animateTime, color));
              }
            }
          }
          const step = Math.max(1, Math.ceil(points.length / 4000));
          this.particleData = points.filter((_, index) => index % step === 0);
          this.isLoaded = true;
          resolve();
        } catch (error) { reject(error); }
      };
      img.onerror = () => reject(new Error('Unable to load particle image: ' + src));
      img.src = src;
    });
  }
}

const logoCache = new Map<string, LogoImg>();
function getLogo(src: string) {
  const key = src + ':' + brightnessThreshold + ':' + alphaThreshold;
  let logo = logoCache.get(key);
  if (!logo) {
    logo = new LogoImg(src, src);
    logoCache.set(key, logo);
    logo.ready.catch(() => logoCache.delete(key));
  }
  return logo;
}

// 画布类
class ParticleCanvas {
  canvasEle: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  ParticleArr: Particle[];
  mouseX?: number;
  mouseY?: number;
  currentLogo: LogoImg | null;
  particleAreaWidth: number;
  particleAreaHeight: number;
  lastUpdateTime: number;
  debug: boolean;
  isGrayscale: boolean;
  particleAreaX: number;
  particleAreaY: number;
  transitionProgress: number;
  isTransitioning: boolean;
  targetParticles: Particle[];
  private animationFrameId: number | null = null;
  private scale: number;
  private exitAnimationDuration: number;
  private exitTimer?: ReturnType<typeof setTimeout>;
  private newImageDelay: number;
  private entryAnimationDuration: number;
  private isExiting: boolean = false;
  private nextLogo: LogoImg | null = null;

  constructor(
    target: HTMLCanvasElement,
    particleAreaWidth: number,
    particleAreaHeight: number,
    isGrayscale: boolean,
    particleAreaX?: number,
    particleAreaY?: number,
    initialScale: number = 4,
    entryAnimationDuration: number = 3000,
    exitAnimationDuration: number = 1000,
    newImageDelay: number = 100
  ) {
    this.canvasEle = target;
    this.ctx = target.getContext("2d") as CanvasRenderingContext2D;
    this.width = target.width;
    this.height = target.height;
    this.ParticleArr = [];
    this.currentLogo = null;
    this.particleAreaWidth = particleAreaWidth;
    this.particleAreaHeight = particleAreaHeight;
    this.lastUpdateTime = performance.now();
    this.debug = false;
    this.isGrayscale = isGrayscale;
    this.particleAreaX =
      particleAreaX ?? this.width - this.particleAreaWidth - 50;
    this.particleAreaY =
      particleAreaY ?? (this.height - this.particleAreaHeight) / 2;
    this.transitionProgress = 0;
    this.isTransitioning = false;
    this.targetParticles = [];
    this.scale = initialScale;
    this.entryAnimationDuration = entryAnimationDuration;
    this.exitAnimationDuration = exitAnimationDuration;
    this.newImageDelay = newImageDelay;
    scale = initialScale;

    this.canvasEle.addEventListener("mousemove", this.handleMouseMove);
    this.canvasEle.addEventListener("mouseleave", this.handleMouseLeave);
  }

  handleMouseMove = (e: MouseEvent) => {
    const { left, top } = this.canvasEle.getBoundingClientRect();
    this.mouseX = e.clientX - left;
    this.mouseY = e.clientY - top;
  };

  handleMouseLeave = () => {
    this.mouseX = undefined;
    this.mouseY = undefined;
  };

  changeImg(img: LogoImg) {
    if (this.currentLogo && this.currentLogo !== img) {
      this.nextLogo = img;
      this.triggerExitAnimation();
    } else {
      this.loadNewImage(img);
    }
  }

  triggerExitAnimation() {
    this.isExiting = true;
    this.transitionProgress = 0;

    this.ParticleArr.forEach((particle) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 2;
      particle.exitVx = Math.cos(angle) * speed;
      particle.exitVy = Math.sin(angle) * speed;
    });

    clearTimeout(this.exitTimer);
    this.exitTimer = setTimeout(() => {
      if (this.nextLogo) {
        this.loadNewImage(this.nextLogo);
        this.nextLogo = null;
      }
    }, this.exitAnimationDuration + this.newImageDelay);
  }

  loadNewImage(img: LogoImg) {
    this.currentLogo = img;
    this.ParticleArr = img.particleData.map(
      (item) => new Particle(item.totalX, item.totalY, animateTime, item.color, this.entryAnimationDuration)
    );
    this.isExiting = false;
  }

  drawCanvas() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.ParticleArr.length > 0) {
      const particleAreaX = this.particleAreaX;
      const particleAreaY = this.particleAreaY;

      let relativeMouseX =
        this.mouseX !== undefined ? this.mouseX - particleAreaX : undefined;
      let relativeMouseY =
        this.mouseY !== undefined ? this.mouseY - particleAreaY : undefined;

      if (this.isTransitioning) {
        this.transitionProgress += deltaTime / 1000;
        if (this.transitionProgress >= 1) {
          this.isTransitioning = false;
          this.ParticleArr = this.targetParticles;
          this.targetParticles = [];
        } else {
          this.ParticleArr.forEach((particle, index) => {
            particle.updateTransition(
              this.targetParticles[index],
              this.transitionProgress
            );
          });
        }
      }

      if (this.isExiting) {
        this.transitionProgress += deltaTime / this.exitAnimationDuration;
        if (this.transitionProgress >= 1) {
          this.ParticleArr = [];
        } else {
          this.ParticleArr.forEach((particle) => {
            particle.x += particle.exitVx!;
            particle.y += particle.exitVy!;
            particle.opacity = Math.max(0, 1 - this.transitionProgress);
          });
        }
      } else {
        // 正常更新粒子
        this.ParticleArr.forEach((particle) => {
          particle.update(deltaTime, relativeMouseX, relativeMouseY);
        });
      }

      this.ctx.save();
      this.ctx.translate(particleAreaX, particleAreaY);

      this.ParticleArr.forEach((particle) => {
        particle.draw(this.ctx, this.isGrayscale);
      });

      if (
        this.debug &&
        this.mouseX !== undefined &&
        this.mouseY !== undefined
      ) {
        this.ctx.beginPath();
        this.ctx.arc(
          relativeMouseX!,
          relativeMouseY!,
          LargeRadius,
          0,
          Math.PI * 2
        );
        this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(relativeMouseX!, relativeMouseY!, Radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
        this.ctx.stroke();
      }

      this.ctx.restore();
    } else if (this.currentLogo && this.currentLogo.particleData.length > 0) {
      // 如果当前没有粒子但有新的 logo 数据，则创建新的粒子
      this.ParticleArr = this.currentLogo.particleData.map(
        (item) =>
          new Particle(item.totalX, item.totalY, animateTime, item.color, this.entryAnimationDuration)
      );
    }

    this.animationFrameId = window.requestAnimationFrame(() =>
      this.drawCanvas()
    );
  }

  toggleDebug() {
    this.debug = !this.debug;
  }

  setGrayscale(isGrayscale: boolean) {
    this.isGrayscale = isGrayscale;
  }

  stop() {
    clearTimeout(this.exitTimer);
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.canvasEle.removeEventListener("mousemove", this.handleMouseMove);
    this.canvasEle.removeEventListener("mouseleave", this.handleMouseLeave);
  }

  changeScale(newScale: number) {
    scale = newScale;
    this.ParticleArr.forEach((particle) => {
      particle.r = BaseParticleRadius * scale;
    });
  }

  setBrightnessThreshold(threshold: number) {
    brightnessThreshold = Math.max(0, Math.min(255, threshold));
  }

  setAlphaThreshold(threshold: number) {
    alphaThreshold = Math.max(0, Math.min(255, threshold));
  }
}

interface ParticleSystemProps {
  activeLabel?: string;
  imageUrl?: string; // 新增 imageUrl 参数
  width: number;
  height: number;
  isGrayscale: boolean;
  particleAreaX?: number;
  particleAreaY?: number;
  scale?: number;
  brightnessThreshold?: number;
  alphaThreshold?: number;
  entryDuration?: number;
  exitDuration?: number;
  imageDelay?: number;
  debug?: boolean;
}

const ParticleFactory: React.FC<ParticleSystemProps> = ({
  activeLabel,
  imageUrl, // 解构新参数
  width,
  height,
  isGrayscale,
  particleAreaX,
  particleAreaY,
  scale: initialScale,
  brightnessThreshold: initialBrightnessThreshold,
  alphaThreshold: initialAlphaThreshold,
  entryDuration = 3000,
  exitDuration = 1000,
  imageDelay = 100,
  debug = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleCanvas, setParticleCanvas] = useState<ParticleCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const instance = new ParticleCanvas(canvasRef.current, width / 3, height / 2,
      isGrayscale, particleAreaX, particleAreaY, initialScale, entryDuration, exitDuration, imageDelay);
    instance.debug = debug;
    if (initialBrightnessThreshold !== undefined) instance.setBrightnessThreshold(initialBrightnessThreshold);
    if (initialAlphaThreshold !== undefined) instance.setAlphaThreshold(initialAlphaThreshold);
    setParticleCanvas(instance);
    instance.drawCanvas();
    (window as any).particleCanvas = instance;
    return () => {
      // Dispose the instance created by THIS effect, never a stale state closure.
      instance.stop();
      if ((window as any).particleCanvas === instance) delete (window as any).particleCanvas;
    };
  }, [width, height, particleAreaX, particleAreaY, initialScale, entryDuration, exitDuration, imageDelay, debug, initialBrightnessThreshold, initialAlphaThreshold]);

  useEffect(() => {
    if (!particleCanvas) return;
    let cancelled = false;
    const src = imageUrl ?? logos.find(logo => logo.label === activeLabel)?.url ?? logos[0].url;
    const logo = getLogo(src);
    logo.ready.then(() => {
      if (!cancelled) particleCanvas.changeImg(logo);
    }).catch(error => { if (!cancelled) console.error(error); });
    return () => { cancelled = true; };
  }, [imageUrl, activeLabel, particleCanvas]);

  useEffect(() => { particleCanvas?.setGrayscale(isGrayscale); }, [isGrayscale, particleCanvas]);

  return <div className="particle-system" style={{ width, height }} aria-hidden="true">
    <canvas ref={canvasRef} width={width} height={height} />
  </div>;
};

export default ParticleFactory;
