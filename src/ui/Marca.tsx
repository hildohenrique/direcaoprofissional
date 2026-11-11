/** O símbolo: um marcador de mapa com a agulha de bússola dentro. Onde você está e para onde vai. */
export function Simbolo({ tamanho = 36 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 45c9-10 15-17 15-25a15 15 0 1 0-30 0c0 8 6 15 15 25Z" fill="var(--rota)" />
      <circle cx="24" cy="20" r="10.5" fill="var(--cartao)" />
      <path d="M24 11.500l3.200 8.500-3.200 8.500-3.200-8.500 3.200-8.500Z" fill="var(--ouro)" />
      <path d="M24 20l3.200 0-3.200 8.500-3.200-8.500Z" fill="var(--tinta)" opacity=".85" />
    </svg>
  );
}

export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className={`marca${compacta ? ' compacta' : ''}`}>
      <Simbolo tamanho={compacta ? 28 : 38} />
      <div>
        <b>Direção</b>
        <span>Profissional</span>
      </div>
    </div>
  );
}
