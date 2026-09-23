// Only bundle our checked-in SVGs; no user or remote markup is injected.
const symbols = import.meta.glob<string>('/public/images/03-world/*.svg', {
  query: '?raw', import: 'default', eager: true,
});

export default function WorldMobileSymbol({ imageUrl, active }: { imageUrl: string; active: boolean }) {
  const svg = symbols[`/public${imageUrl}`];
  return <div className="world-mobile-detail-art" aria-hidden="true" data-active={active} key={imageUrl}>
    {svg ? <div className="world-mobile-symbol" dangerouslySetInnerHTML={{ __html: svg }} /> : <img src={imageUrl} alt="" />}
  </div>;
}
