import React, {useEffect, useRef, useState} from "react";
import {IconSocial, IconSound, IconUser} from "../SvgIcons";
import {useStore} from "@nanostores/react";
import {isOwnerInfoOpen} from "../store/rootLayoutStore.ts";
import arknightsConfig from "../../../arknights.config";
import {copyCurrentLink} from "../../utils/clipboard";

const ActiveColor = "#ffd700"
const InactiveColor = "#c4c2c2"
const BoxClassName: React.ComponentProps<"div">["className"] =
    "h-4/5 m-auto relative flex flex-auto items-center justify-center cursor-pointer transition duration-300"
const SvgClassName: React.ComponentProps<"svg">["className"] = "w-auto h-[2.25rem] pointer-events-none"

// Sharing is an independent header action, separate from the removed Toolbox.
export function Share() {
    const [message, setMessage] = useState('');
    const timer = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => () => clearTimeout(timer.current), []);
    const handleCopy = async () => {
        const copied = await copyCurrentLink();
        setMessage(copied ? '链接复制成功' : '复制失败，请复制地址栏链接');
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setMessage(''), 2400);
    };
    return <div className={BoxClassName}>
        <button type="button" aria-label="复制当前网页链接"
                className="w-full h-full flex items-center justify-center" onClick={handleCopy}>
            <IconSocial className={SvgClassName} style={{color: message ? ActiveColor : InactiveColor}}/>
        </button>
        {message && <div role="status" aria-live="polite"
            className="absolute top-[calc(100%+1rem)] right-0 z-[60] flex items-center gap-3 px-5 py-3 border-l-2 border-ark-gold bg-[#171717]/95 text-[#dedede] font-benderRegular text-[clamp(12px,1rem,16px)] tracking-wider whitespace-nowrap pointer-events-none shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)' }}>
            <svg className="w-[1.1em] h-[1.1em] text-ark-gold" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d={message === '链接复制成功' ? 'M4 10l4 4 8-8' : 'M10 4v7m0 3v2'} stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            {message}
        </div>}
    </div>;
}

export function Sound() {
    const [active, setActive] = useState(arknightsConfig?.bgm?.autoplay ?? false)
    const [volume, setVolume] = useState(active ? 1 : 0)
    const audioRef = useRef<HTMLAudioElement>(null)
    const lastTapRef = useRef<number>(0)
    const [isFading, setIsFading] = useState(false);
    const fadeIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;
            active ? audioRef.current.play().catch(console.error) : audioRef.current.pause()

            const handleFade = (targetVolume: number) => {
                setIsFading(true);
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

                fadeIntervalRef.current = setInterval(() => {
                    if ((targetVolume === 1 && audio.volume < 1) || (targetVolume === 0 && audio.volume > 0)) {
                        audio.volume = Math.max(0, Math.min(1, audio.volume + (targetVolume === 1 ? 0.25 : -0.25)));
                        setVolume(audio.volume);
                    } else {
                        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                        setIsFading(false);
                        if (targetVolume === 0) audio.pause();
                    }
                }, 100) as unknown as number;
            };

            if (active) {
                audio.play().catch(e => console.error(e));
                handleFade(1);
            } else {
                handleFade(0);
            }
        }
        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [active]);

    const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isFading) {
            setActive(!active)
        }
        event.preventDefault();
        const now = Date.now();
        if (now - lastTapRef.current > 500) {
            lastTapRef.current = now;
            setActive(!active);
        }
    }

    return <div
        className={BoxClassName}
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
        role="button"
        tabIndex={0}
    >
        <IconSound className={SvgClassName} style={{
            color: active ? ActiveColor : InactiveColor,
            transition: "transform .3s",
            transform: `scaleY(${active ? 1 : .5})`,
        }}/>
        <audio ref={audioRef} src={arknightsConfig?.bgm?.src ?? `${import.meta.env.BASE_URL}audios/bgm.mp3`} loop={arknightsConfig?.bgm?.loop ?? false}/>
    </div>
}

export function OwnerInfo() {
    const $isOwnerInfoOpen = useStore(isOwnerInfoOpen)
    return <button type="button" aria-label="打开个人通行证" aria-expanded={$isOwnerInfoOpen} aria-controls="owner-passport" className={BoxClassName} onClick={() => isOwnerInfoOpen.set(!$isOwnerInfoOpen)}>
        <IconUser className={SvgClassName} style={{color: $isOwnerInfoOpen ? ActiveColor : InactiveColor}}/>
    </button>
}
