import {useEffect, useRef} from "react";
import {useStore} from "@nanostores/react";
import arknightsConfig from "../../arknights.config";
import {isOwnerInfoOpen} from "./store/rootLayoutStore";
import "./OwnerInfo.css";

export default function OwnerInfo() {
    const open = useStore(isOwnerInfoOpen);
    const panel = useRef<HTMLElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const owner = arknightsConfig.navbar.ownerInfo;
    const name = owner.name || arknightsConfig.title;

    useEffect(() => {
        if (!open) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        // Wait until the newly visible dialog participates in layout before focusing it.
        const focusFrame = requestAnimationFrame(() => closeButton.current?.focus());
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                isOwnerInfoOpen.set(false);
            }
            if (event.key === "Tab") {
                const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])
                    .filter(element => element.getClientRects().length > 0);
                const first = controls[0], last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault(); last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault(); first?.focus();
                }
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => {
            cancelAnimationFrame(focusFrame);
            document.removeEventListener("keydown", handleKey);
            previousFocus?.focus();
        };
    }, [open]);

    return <div className="owner-overlay" data-open={open} aria-hidden={!open}
                onWheel={event => event.stopPropagation()} onTouchMove={event => event.stopPropagation()}>
        <div className="owner-backdrop" onClick={() => isOwnerInfoOpen.set(false)} />
        <section ref={panel} id="owner-passport" className="owner-passport" role="dialog"
                 aria-modal="true" aria-labelledby="passport-title">
            <div className="passport-stripe" aria-hidden="true" />
            <header className="passport-header">
                <div><span className="passport-label">NINTH EDGE / ARCHIVE</span>
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
                    <span className="passport-stamp" aria-hidden="true">IX</span>
                </div>
                <div className="passport-holder">
                    <span className="passport-label">PASS HOLDER / 持有人</span>
                    <h3>{name}</h3>
                    {owner.slogan && <p>{owner.slogan}</p>}
                </div>
                <nav className="passport-links" aria-label="个人链接">
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
        </section>
    </div>;
}
