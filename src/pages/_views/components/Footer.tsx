const links = [
  ["LICENSE", "https://github.com/Yue-plus/astro-arknights/blob/main/LICENSE"],
  ["MONITOR", "https://monitor.sch-nie.com"],
  ["QQ GROUP", "https://qun.qq.com/universal-share/share?ac=1&authKey=bxrQjDCZtHbnA9EW6MpVOuH%2FytkJx6YgPYEsoJUYGr%2F6D7yKVIp8qh9qGFakdYZI&busi_data=eyJncm91cENvZGUiOiI4OTM2MDUzMzciLCJ0b2tlbiI6IkF5VS9odTNsTXVJdnE4RGpwZUk3WGlPQnpDSGUxcVdIVkk5THFxTll3UCtFRlNGRWxHMFhKV3k2RWlZeHdSZXkiLCJ1aW4iOiIyNDMyOTAyNjY1In0%3D&data=bg9ocl3vgexcqjY1z-tNHQG4mymT0Uh6CzFqU7GbfkE6jEetPSlxryKzgqtKid_Z8qaAJ0KeqR0FPBXUu3At-w&svctype=4&tempid=h5_group_info"],
  ["ASTRO FRAMEWORK", "https://docs.astro.build/zh-cn/getting-started/"],
];

export default function Footer() {
  return <footer className="relative flex h-[400px] w-full flex-col justify-center overflow-hidden border-t border-white/15 bg-[#151515] px-[8vw] text-white portrait:h-[400px] portrait:px-6">
    <div className="pointer-events-none absolute right-[7vw] top-1/2 -translate-y-1/2 text-[10rem] font-black leading-none text-white/[.035] portrait:text-[5rem]">END</div>
    <div className="relative z-10 flex items-stretch justify-between gap-16 portrait:flex-col portrait:items-start portrait:gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 text-xs tracking-[.4em] text-ark-gold font-benderBold"><span className="h-px w-10 bg-ark-gold" />END OF ARCHIVE</div>
        <h2 className="mt-5 text-4xl font-black tracking-tight portrait:text-3xl">SCHNIE：ARK</h2>
        <p className="mt-2 text-sm text-white/45">the ARK from the Ninth Edge</p>
      </div>
      <div className="flex w-[26rem] max-w-full flex-col justify-between portrait:h-auto portrait:w-full">
        <nav aria-label="Footer links" className="grid grid-cols-2 gap-x-10 gap-y-4 text-xs tracking-[.16em] text-white/55 font-benderBold portrait:gap-x-8">
          {links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="transition-colors hover:text-ark-gold">{label}</a>)}
        </nav>
        <div className="mt-5 border-t border-white/10 pt-3 text-right text-[.65rem] tracking-[.16em] text-white/25 font-benderRegular portrait:text-left">
          <span className="mr-3 text-white/35 font-benderBold">STACK</span>
          <span>ASTRO / REACT / TAILWIND</span>
        </div>
      </div>
    </div>
    <div className="relative z-10 mt-10 flex items-end justify-between border-t border-white/10 pt-5 text-[.65rem] tracking-[.12em] text-white/35 font-benderRegular portrait:mt-7 portrait:flex-col portrait:items-start portrait:gap-2">
      <span> </span>
      <span>© 2026 SCHRO LEMONS</span>
    </div>
  </footer>;
}
