import { navigateRoute } from "../../../components/useHashRoute";

const links = [
  ["LICENSE", "https://github.com/Yue-plus/astro-arknights/blob/main/LICENSE"],
  ["GITHUB REPOSITORY", "https://github.com/schrolemons/arknights.github.io/"],
  ["LIVE DEMO", "https://arknights.astro.yue.zone/"],
  ["ASTRO FRAMEWORK", "https://docs.astro.build/zh-cn/getting-started/"],
];

export default function Footer() {
  return <footer className="relative flex h-[400px] w-full flex-col justify-center overflow-hidden border-t border-white/15 bg-[#151515] px-[8vw] text-white portrait:h-[400px] portrait:px-6">
    <div className="pointer-events-none absolute right-[7vw] top-1/2 -translate-y-1/2 text-[10rem] font-black leading-none text-white/[.035] portrait:text-[5rem]">END</div>
    <div className="relative z-10 flex items-start justify-between gap-12 portrait:flex-col portrait:gap-8">
      <div>
        <div className="flex items-center gap-3 text-xs tracking-[.4em] text-ark-gold font-benderBold"><span className="h-px w-10 bg-ark-gold" />END OF ARCHIVE</div>
        <h2 className="mt-5 text-4xl font-black tracking-tight portrait:text-3xl">SCHNIE：ARK</h2>
        <p className="mt-2 text-sm text-white/45">the ARK from the Ninth Edge</p>
      </div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs tracking-[.16em] text-white/55 font-benderBold portrait:gap-x-8">
        {links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="transition-colors hover:text-ark-gold">{label}</a>)}
        <button type="button" onClick={() => navigateRoute("more", ["repository"])} className="text-left transition-colors hover:text-ark-gold"> </button>
        <span className="text-white/25">ASTRO / REACT / TAILWIND</span>
      </div>
    </div>
    <div className="relative z-10 mt-10 flex items-end justify-between border-t border-white/10 pt-5 text-[.65rem] tracking-[.12em] text-white/35 font-benderRegular portrait:mt-7 portrait:flex-col portrait:items-start portrait:gap-2">
      <span> </span>
      <span>© 2026 SCHRO LEMONS</span>
    </div>
  </footer>;
}
