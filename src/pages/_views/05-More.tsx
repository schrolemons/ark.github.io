import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { viewIndex, readyToTouch, isFooterVisible } from "../../components/store/rootLayoutStore.ts";
import { directions } from "../../components/store/lineDecoratorStore";
import { navigateRoute, useHashRoute } from "../../components/useHashRoute";
import Footer from "./components/Footer.tsx";
import arknightsConfig from "../../../arknights.config";

interface ArchiveCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  meta: string;
  img: string;
  url: string;
}

const ARCHIVE_CARDS: ArchiveCard[] = [
  {
    id: "01", slug: "repository", title: "模板仓库", subtitle: "REPOSITORY", eyebrow: "TEMPLATE SOURCE",
    description: "站点模板与交互页面的源代码。", meta: "ASTRO / REACT / TAILWIND", img: "/images/05-more/1.png",
    url: "https://github.com/Yue-plus/astro-arknights",
  },
  {
    id: "02", slug: "documentation", title: "相关文档", subtitle: "DOCUMENTATION", eyebrow: "PROJECT DOCUMENTS",
    description: "人物、世界设定与故事的使用资料。", meta: "WORLD / OPERATOR / STORY", img: "/images/05-more/2.png",
    url: "https://world.sch-nie.com/archives/",
  },
  {
    id: "03", slug: "author_profile", title: "作者主页", subtitle: "AUTHOR PROFILE", eyebrow: "CREATOR PROFILE",
    description: "查看作者的其他项目与公开资料。", meta: "SCHRO LEMONS", img: "/images/05-more/3.png",
    url: "https://github.com/schrolemons",
  },
];

// Keep the dashboard counters tied to the same configuration that renders each section.
const SITE_STATS = {
  projectRecords: ARCHIVE_CARDS.length,
  operatorRecords: arknightsConfig.rootPage.OPERATOR.data.length,
  worldEntries: arknightsConfig.rootPage.WORLD?.items.length ?? 0,
  navigationSections: arknightsConfig.navbar.items.length,
};

const formatStat = (value: number | null) => value === null ? "--" : String(value).padStart(2, "0");

function ArchiveCardView({ card, selected, onOpen }: { card: ArchiveCard; selected: boolean; onOpen: () => void }) {
  return <article className={`archive-card group relative min-h-[25rem] overflow-hidden border border-white/15 bg-[#161616] transition-all duration-500 hover:-translate-y-2 hover:border-ark-gold ${selected ? "border-ark-gold shadow-[0_0_2rem_rgba(255,215,0,.12)]" : ""}`}>
    <a href={card.url} target="_blank" rel="noreferrer" aria-label={`${card.title} - ${card.subtitle}`} onClick={onOpen} className="absolute inset-0 z-20 cursor-pointer" />
    <div className="archive-card-media absolute inset-0 flex items-center justify-center bg-black">
      <img src={card.img} alt="" loading="lazy" className="h-3/5 w-3/5 object-contain opacity-45 transition duration-700 group-hover:scale-110 group-hover:opacity-85" />
    </div>
    <div className="archive-card-shade absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
    <div className="archive-card-eyebrow absolute left-6 top-6 z-10 flex items-center gap-3 text-[.65rem] tracking-[.25em] text-white/50 font-benderBold">
      <span className="text-ark-gold">{card.id}</span><span className="h-px w-8 bg-white/30" /><span>{card.eyebrow}</span>
    </div>
    <div className="archive-card-copy absolute inset-x-6 bottom-6 z-10">
      <h2 className="text-3xl font-bold text-white">{card.title}</h2>
      <div className="mt-1 text-xs tracking-[.25em] text-ark-gold font-benderBold">{card.subtitle}</div>
      <p className="mt-4 max-w-[18rem] text-sm leading-relaxed text-white/65">{card.description}</p>
      <div className="mt-5 flex items-center gap-2 text-[.65rem] tracking-[.15em] text-white/45 font-benderBold"><span className="h-px w-8 bg-ark-gold transition-all group-hover:w-12" />{card.meta}</div>
      <div className="mt-4 text-[.65rem] tracking-[.25em] text-white/45 font-benderBold transition-colors group-hover:text-white">VIEW ARCHIVE ↗</div>
    </div>
  </article>;
}

export default function More() {
  const $viewIndex = useStore(viewIndex);
  const $readyToTouch = useStore(readyToTouch);
  const $isFooterVisible = useStore(isFooterVisible);
  const route = useHashRoute();
  const [active, setActive] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [archiveStatus, setArchiveStatus] = useState<"checking" | "active" | "unavailable">("checking");
  const [informationRecords, setInformationRecords] = useState<number | null>(null);
  const selectedSlug = route.section === "more" ? route.segments[0] : undefined;
  const selectedCard = useMemo(() => ARCHIVE_CARDS.find(card => card.slug === selectedSlug), [selectedSlug]);

  useEffect(() => {
    // A deep link should always open at the start of the archive, even if the
    // previous More-page visit had already revealed the footer.
    isFooterVisible.set(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedSlug]);

  useEffect(() => {
    let cancelled = false;
    const readWebsiteStatus = async () => {
      try {
        const response = await fetch(window.location.href, { method: "HEAD", cache: "no-store" });
        if (!cancelled) setArchiveStatus(response.ok ? "active" : "unavailable");
      } catch {
        if (!cancelled) setArchiveStatus("unavailable");
      }
    };
    void readWebsiteStatus();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const readInformationRecords = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}world/breaking-news.json`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Information records request failed: ${response.status}`);
        const categories = await response.json() as Array<{ totalCount?: number }>;
        const total = categories.reduce((sum, category) => sum + (category.totalCount ?? 0), 0);
        if (!cancelled) setInformationRecords(total);
      } catch {
        // Keep the zero state when the archive endpoint is unavailable.
      }
    };
    void readInformationRecords();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const isActive = $viewIndex === 5 && $readyToTouch;
    if (isActive) directions.set({ top: true, right: false, bottom: !$isFooterVisible, left: false });
    setActive(isActive);
  }, [$viewIndex, $readyToTouch, $isFooterVisible]);

  const handleOpen = (card: ArchiveCard) => {
    navigateRoute("more", [card.slug]);
  };

  const archiveStatusLabel = archiveStatus.toUpperCase();
  const connectionLabel = archiveStatus === "unavailable" ? "OFFLINE" : archiveStatus === "checking" ? "CHECKING" : "ONLINE";

  return <div data-more-page data-footer-visible={$isFooterVisible} className={`relative h-full w-full overflow-hidden bg-[#0c0c0c] transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`}>
    <div className="more-page-track h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: $isFooterVisible ? "translateY(-400px)" : "translateY(0)" }}>
      <main ref={mainRef} className="relative h-full w-full overflow-hidden px-[7vw] pb-12 pt-[10rem] portrait:overflow-y-auto portrait:px-6 portrait:pb-16 portrait:pt-[8rem]">
        <div className="pointer-events-none absolute bottom-[-2%] left-[-2%] select-none text-[14vw] font-black leading-none tracking-tighter text-white/[.04]">ARCHIVE</div>
        <div className="relative z-10 flex items-start justify-between gap-12 portrait:flex-col portrait:gap-8">
          <div className="more-mobile-heading" aria-hidden="true">
            <small>SCHNIE ARCHIVE</small>
            <h2>MORE CONTENT</h2>
            <strong>更多内容</strong>
            <p>继续探索项目、文档与创作者档案。</p>
          </div>
          <div className="more-heading-desktop max-w-[45rem]">
            <div className="flex items-center gap-3 text-xs tracking-[.4em] text-ark-gold font-benderBold"><span className="h-px w-10 bg-ark-gold" />PROJECT ARCHIVE</div>
            <h1 className="mt-5 text-6xl font-black leading-none tracking-tight text-white portrait:text-5xl">第九边缘：方舟</h1>
            <p className="mt-5 max-w-[40rem] text-base leading-relaxed text-white/55 portrait:text-sm">SCHNIE:ARK 是第九边缘世界观的快速档案站，记录情报、角色、设定等内容。</p>
          </div>
          <section aria-label="系统状态" className="w-[18rem] shrink-0 border-l border-ark-gold/70 pl-5 portrait:w-full portrait:border-l-0 portrait:border-t portrait:pt-4">
            <div className="text-xs tracking-[.35em] text-white/45 font-benderBold">SYSTEM STATUS</div>
            <div className={`mt-3 flex items-center gap-2 text-sm font-benderBold ${archiveStatus === "unavailable" ? "text-white/50" : "text-ark-gold"}`}><span className={`h-2 w-2 rounded-full ${archiveStatus === "checking" ? "animate-pulse bg-white/50" : archiveStatus === "active" ? "animate-pulse bg-ark-gold" : "bg-white/35"}`} />{connectionLabel} / ARCHIVE {archiveStatusLabel}</div>
            <dl className="mt-5 grid grid-cols-2 gap-y-3 text-xs font-benderRegular">
              <dt className="text-white/40">OPERATOR RECORDS</dt>
              <dd data-stat="operator-records" className="text-right text-white/75">{formatStat(SITE_STATS.operatorRecords)}</dd>
              <dt className="text-white/40">WORLD ENTRIES</dt>
              <dd data-stat="world-entries" className="text-right text-white/75">{formatStat(SITE_STATS.worldEntries)}</dd>
              <dt className="text-white/40">INFORMATION RECORDS</dt>
              <dd data-stat="information-records" className="text-right text-white/75">{formatStat(informationRecords)}</dd>
              <dt className="text-white/40">NAVIGATION SECTIONS</dt>
              <dd data-stat="navigation-sections" className="text-right text-white/75">{formatStat(SITE_STATS.navigationSections)}</dd>
              <dt className="text-white/40">LAST UPDATE</dt>
              <dd className="text-right text-white/75">2026.09</dd>
            </dl>
          </section>
        </div>
        <div className="relative z-10 mt-12 flex items-center gap-4 text-xs tracking-[.35em] text-white/40 font-benderBold"><span className="text-ark-gold">PROJECTS</span><span className="h-px flex-1 bg-white/15" /><span data-stat="project-records">{formatStat(SITE_STATS.projectRecords)} RECORDS</span></div>
        <div className="relative z-10 mt-5 grid grid-cols-3 gap-5 portrait:grid-cols-1">
          {ARCHIVE_CARDS.map(card => <ArchiveCardView key={card.slug} card={card} selected={selectedCard?.slug === card.slug} onOpen={() => handleOpen(card)} />)}
        </div>
        <div className="relative z-10 mt-8 flex items-center justify-between text-[.65rem] tracking-[.25em] text-white/35 font-benderBold"><span>{selectedCard ? `SELECTED // ${selectedCard.subtitle}` : "SELECT A RECORD TO CONTINUE"}</span><span>SCROLL FOR OTHER INFORMATION ↓</span></div>
      </main>
      <div className="more-page-footer h-[400px] w-full"><Footer /></div>
    </div>
  </div>;
}
