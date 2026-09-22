import {useEffect, useRef, useState} from "react";
import {useStore} from "@nanostores/react";
import arknightsConfig from "../../arknights.config";
import {isOwnerInfoOpen} from "./store/rootLayoutStore";
import "./OwnerInfo.css";
import {identity, identityDialogOpen} from './store/identityStore';
import {specialIdentity} from '../utils/identity';

export default function OwnerInfo() {
    const open = useStore(isOwnerInfoOpen);
    const user = useStore(identity);
    const special = user?.kind === 'member' ? specialIdentity(user.name) : undefined;
    const panel = useRef<HTMLElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const owner = arknightsConfig.navbar.ownerInfo;
    const name = user?.kind === 'member' ? user.name : '游客';
    const [playing, setPlaying] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [switching, setSwitching] = useState(false);
    useEffect(() => { if (!open) { setPlaying(false); setVideoReady(false); setSwitching(false); } }, [open]);
    useEffect(() => {
        if (!switching) return;
        const timer = window.setTimeout(() => { isOwnerInfoOpen.set(false); identityDialogOpen.set(true); }, 360);
        return () => window.clearTimeout(timer);
    }, [switching]);

    useEffect(() => {
        if (!open) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        // Focus after the opening transition, when the previously hidden panel is visible.
        const focusTimer = window.setTimeout(() => closeButton.current?.focus({preventScroll: true}), 300);
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                isOwnerInfoOpen.set(false);
            }
            if (event.key === "Tab") {
                const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button, a[href], iframe') ?? [])
                    .filter(element => element.getClientRects().length > 0);
                const first = controls[0], last = controls[controls.length - 1];
                if (!panel.current?.contains(document.activeElement)) {
                    event.preventDefault(); first?.focus();
                } else if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault(); last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault(); first?.focus();
                }
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener("keydown", handleKey);
            previousFocus?.focus({preventScroll: true});
        };
    }, [open]);

    return <div className="owner-overlay" data-open={open} data-switching={switching} aria-hidden={!open}
                onWheel={event => event.stopPropagation()} onTouchMove={event => event.stopPropagation()}>
        <div className="owner-backdrop" onClick={() => isOwnerInfoOpen.set(false)} />
        <section ref={panel} id="owner-passport" className="owner-scene" role="dialog"
                 aria-modal="true" aria-labelledby="passport-title">
          {owner.video && <div className="passport-video">
            <div className="passport-video-label"><span>ARCHIVE / MOTION</span><span>BILIBILI</span></div>
            <div className="passport-video-stage">
              {open && playing ? <iframe title={owner.video.title} src={`https://player.bilibili.com/player.html?bvid=${encodeURIComponent(owner.video.bvid)}&page=1&autoplay=1&high_quality=1`}
                onLoad={() => setVideoReady(true)} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> :
                <button type="button" aria-label={`播放 ${owner.video.title}`} onClick={() => setPlaying(true)}>
                  <span className="passport-play" aria-hidden="true">▷</span><strong>{owner.video.title}</strong><span>点击播放 · PLAY FILM</span>
                </button>}
              {playing && !videoReady && <div className="passport-video-loading" role="status">正在连接放映源…</div>}
            </div>
            <div className="passport-video-caption"><span>遇见，始于这一刻。</span><a href={`https://www.bilibili.com/video/${owner.video.bvid}`} target="_blank" rel="noreferrer">在 Bilibili 观看 ↗</a></div>
          </div>}
          <div className="owner-passport">
            <div className="passport-stripe" aria-hidden="true" />
            <header className="passport-header">
                <div><span className="passport-label">SCHNIE ARCHIVE</span>
                    <h2 id="passport-title">个人通行证<span>PERSONAL PASS</span></h2>
                </div>
                <button ref={closeButton} type="button" className="passport-close" aria-label="关闭个人通行证"
                        onClick={() => isOwnerInfoOpen.set(false)}>×</button>
            </header>
            <div className="passport-identity-band"><span>IDENTITY / 档案身份</span><span>ARK — 09</span></div>
            <div className="passport-body">
                <div className="passport-emblem">
                    <span className="passport-label">{arknightsConfig.title}</span>
                    <img src={import.meta.env.BASE_URL + "images/logo.png"} alt={name + " 标识"} />
                    <span className="passport-emblem-caption">THE NINTH EDGE</span>
                    <span className="passport-stamp" data-special={Boolean(special?.code)}>{special?.code ?? 'IX'}</span>
                </div>
                <div className="passport-holder">
                    <span className="passport-label">PASS HOLDER / 持有人</span>
                    <h3 className="passport-name" data-special={Boolean(special)}>{!special && user?.kind === 'member' && <span>同行者：</span>}<strong>{special?.name ?? name}</strong>{special && <small>{special.english}</small>}</h3>
                    {(special?.signature ?? owner.slogan) && <p>{special?.signature ?? owner.slogan}</p>}
                    <button type="button" className="identity-switch" disabled={switching} onClick={() => setSwitching(true)}>
                        <span>{switching ? '正在重构身份…' : user?.kind === 'member' ? '切换身份' : '登录'}</span><span className="identity-switch-icon" aria-hidden="true">⟳</span>
                    </button>
                </div>
                <nav className="passport-links" aria-label="个人链接">
                    <div className="passport-external-label">外部信息源 <span>EXTERNAL SOURCES</span></div>
                    {owner.footerLinks?.map(({label, url, portraitHidden}, index) =>
                        <a key={label + url} href={url} target="_blank" rel="noreferrer"
                           className={portraitHidden ? "passport-link portrait-hidden" : "passport-link"}>
                            <span className="passport-link-index">{String(index + 1).padStart(2, "0")}</span>
                            <span>{label}</span><span aria-hidden="true">↗</span>
                        </a>)}
                </nav>
            </div>
            <footer className="passport-footer">
                <div className="passport-barcode" aria-hidden="true" />
                <div className="passport-footer-meta"><span>{arknightsConfig.title}</span><span>PERSONAL ARCHIVE</span></div>
            </footer>
            <div className="passport-stripe passport-stripe-bottom" aria-hidden="true" />
          </div>
        </section>
    </div>;
}
