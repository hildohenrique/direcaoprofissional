import type { IdPersonagem } from '@/nucleo/tipos';
import { PERSONAGENS, type Personagem } from '@/conteudo/personagens';

type Humor = 'feliz' | 'pensando' | 'preocupado';

/* O boneco é parente da personagem de peão da palestra de origem:
   corpo em cone, cabeça redonda, e o penteado é o que distingue cada pessoa. */
function Cabelo({ p }: { p: Personagem }) {
  const c = p.cabelo;
  const touca = <path d="M35 49c-1-17 10-27 25-27s26 10 25 27c-5-8-13-12-25-12s-20 4-25 12Z" fill={c} />;
  switch (p.penteado) {
    case 'coque':
      return (
        <>
          <circle cx="60" cy="19" r="10" fill={c} />
          {touca}
        </>
      );
    case 'cacheado':
      return (
        <g fill={c}>
          <circle cx="40" cy="38" r="10" />
          <circle cx="50" cy="27" r="11" />
          <circle cx="64" cy="24" r="11" />
          <circle cx="77" cy="31" r="10" />
          <circle cx="82" cy="43" r="8" />
          <circle cx="36" cy="49" r="7" />
        </g>
      );
    case 'longo':
      return (
        <>
          <path d="M34 50c-3 16-2 30 2 40h9c-4-12-5-24-3-36l-8-4Zm52 0c3 16 2 30-2 40h-9c4-12 5-24 3-36l8-4Z" fill={c} />
          {touca}
        </>
      );
    case 'rabo':
      return (
        <>
          <path d="M82 36c10 2 14 12 11 26-1 5-5 6-7 3 2-9 0-16-6-21l2-8Z" fill={c} />
          {touca}
        </>
      );
    case 'careca':
      return <path d="M35 52c0-5 1-9 3-12 1 4 1 8 0 13l-3-1Zm50 0c0-5-1-9-3-12-1 4-1 8 0 13l3-1Z" fill={c} />;
    case 'grisalho':
      return <path d="M33 52c-3-20 9-32 27-32s30 12 27 32c-4-9-12-14-27-14s-23 5-27 14Z" fill={c} />;
    default:
      return touca;
  }
}

function Rosto({ humor }: { humor: Humor }) {
  const tinta = '#2a1c14';
  return (
    <g stroke={tinta} strokeWidth="2.4" strokeLinecap="round" fill="none">
      {humor === 'preocupado' && <path d="M46 43l8 2m20-2-8 2" strokeWidth="2" />}
      <circle cx="51" cy={humor === 'pensando' ? 50 : 52} r="1.6" fill={tinta} />
      <circle cx="69" cy={humor === 'pensando' ? 50 : 52} r="1.6" fill={tinta} />
      {humor === 'feliz' && <path d="M52 61c4 5 12 5 16 0" />}
      {humor === 'pensando' && <path d="M55 63h9" />}
      {humor === 'preocupado' && <path d="M53 64c4-3 10-3 14 0" />}
    </g>
  );
}

export function Boneco({ quem, humor = 'feliz', tamanho = 150, maleta = false }: { quem: IdPersonagem; humor?: Humor; tamanho?: number; maleta?: boolean }) {
  const p = PERSONAGENS[quem];
  return (
    <svg width={(tamanho * 120) / 160} height={tamanho} viewBox="0 0 120 160" role="img" aria-label={p.nome}>
      <ellipse cx="60" cy="151" rx="34" ry="6" fill="rgba(0,0,0,.28)" />
      <path d="M40 92c-7 6-10 16-9 27" stroke={p.roupa} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M80 92c7 6 10 16 9 27" stroke={p.roupa} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M33 146c8 6 46 6 54 0L74 82c-4-6-24-6-28 0L33 146Z" fill={p.roupa} />
      <path d="M33 146c8 6 46 6 54 0l-2-10c-10 5-40 5-50 0l-2 10Z" fill="rgba(0,0,0,.14)" />
      <circle cx="60" cy="98" r="2" fill="rgba(255,255,255,.55)" />
      <circle cx="60" cy="110" r="2" fill="rgba(255,255,255,.55)" />
      <circle cx="60" cy="122" r="2" fill="rgba(255,255,255,.55)" />
      {maleta && (
        <g>
          <rect x="82" y="118" width="24" height="17" rx="3" fill="#a8734f" />
          <path d="M89 118v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" stroke="#7c5236" strokeWidth="2.4" fill="none" />
          <rect x="92" y="124" width="4" height="4" rx="1" fill="#f0c95a" />
        </g>
      )}
      <circle cx="60" cy="52" r="25" fill={p.pele} />
      <Cabelo p={p} />
      <Rosto humor={humor} />
    </svg>
  );
}
