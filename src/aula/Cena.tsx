import { useEffect, useState } from 'react';
import type { Cena as TipoCena, Formato } from '@/nucleo/tipos';
import { formatar } from '@/nucleo/formato';
import { Boneco } from '@/ui/Boneco';
import { Icone } from '@/ui/Icone';
import { PERSONAGENS } from '@/conteudo/personagens';

/** Conta de zero até o valor: o número "chega", em vez de aparecer pronto. */
export function useContagem(alvo: number, ms = 900): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(alvo);
      return;
    }
    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / ms);
      setV(alvo * (1 - Math.pow(1 - t, 3)));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [alvo, ms]);
  return v;
}

function arredondar(v: number, alvo: number) {
  return Number.isInteger(alvo) ? Math.round(v) : Math.round(v * 10) / 10;
}

function Numero({ valor, formato, legenda }: { valor: number; formato?: Formato; legenda?: string }) {
  const v = useContagem(valor);
  return (
    <div className="cena-numero">
      <strong className="numero">{formatar(arredondar(v, valor), formato)}</strong>
      {legenda && <span>{legenda}</span>}
    </div>
  );
}

function Barras({ itens, formato }: { itens: { rotulo: string; valor: number; destaque?: boolean }[]; formato?: Formato }) {
  const maior = Math.max(...itens.map((i) => i.valor), 1);
  return (
    <div className="cena-barras">
      {itens.map((item, i) => (
        <div key={item.rotulo} className={`barra-linha${item.destaque ? ' destaque' : ''}`}>
          <span className="barra-rotulo">{item.rotulo}</span>
          <div className="barra-trilho">
            <i style={{ width: `${Math.max(4, (item.valor / maior) * 100)}%`, animationDelay: `${i * 0.14}s` }} />
          </div>
          <span className="barra-valor numero">{formatar(item.valor, formato)}</span>
        </div>
      ))}
    </div>
  );
}

function Fatias({ titulo, itens, formato = 'reais' }: Extract<TipoCena, { tipo: 'fatias' }>) {
  const total = itens.reduce((s, i) => s + i.valor, 0) || 1;
  return (
    <div className="cena-fatias">
      {titulo && <p className="fatias-titulo">{titulo}</p>}
      <div className="fatias-barra" role="img" aria-label={itens.map((i) => `${i.rotulo}: ${formatar(i.valor, formato)}`).join(', ')}>
        {itens.map((item, i) => (
          <i key={item.rotulo} className={`tom-${item.tom ?? 'neutro'}`} style={{ flexGrow: item.valor / total, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <ul>
        {itens.map((item) => (
          <li key={item.rotulo}>
            <b className={`tom-${item.tom ?? 'neutro'}`} />
            <span>{item.rotulo}</span>
            <strong className="numero">{formatar(item.valor, formato)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Escada({ degraus, ativo }: { degraus: string[]; ativo?: number }) {
  return (
    <div className="cena-escada">
      {degraus.map((d, i) => (
        <div key={d} className={`degrau${ativo === i ? ' ativo' : ''}${ativo !== undefined && i < ativo ? ' passado' : ''}`} style={{ marginLeft: `${i * (56 / Math.max(1, degraus.length - 1))}%`, animationDelay: `${i * 0.12}s` }}>
          <b>{i + 1}</b>
          <span>{d}</span>
        </div>
      )).reverse()}
    </div>
  );
}

function Balanca({ esquerda, direita }: Extract<TipoCena, { tipo: 'balanca' }>) {
  const inclinacao = Math.max(-12, Math.min(12, (direita.peso - esquerda.peso) * 5));
  return (
    <div className="cena-balanca">
      <div className="balanca-braco" style={{ ['--giro' as string]: `${inclinacao}deg` }}>
        <div className="prato">
          <span>{esquerda.rotulo}</span>
        </div>
        <div className="prato">
          <span>{direita.rotulo}</span>
        </div>
      </div>
      <div className="balanca-pe" />
    </div>
  );
}

function Comparar({ a, b }: Extract<TipoCena, { tipo: 'comparar' }>) {
  return (
    <div className="cena-comparar">
      {[a, b].map((lado, i) => (
        <div key={lado.titulo} className={`lado tom-${lado.tom ?? 'neutro'}`} style={{ animationDelay: `${i * 0.18}s` }}>
          <p className="lado-titulo">{lado.titulo}</p>
          {lado.linhas.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

function Celular({ app, titulo, linhas }: Extract<TipoCena, { tipo: 'celular' }>) {
  return (
    <div className={`cena-celular app-${app}`}>
      <div className="celular-topo">{titulo ?? (app === 'zap' ? 'Conversa' : app === 'insta' ? 'Publicação' : 'Anotações')}</div>
      <div className="celular-tela">
        {linhas.map((l, i) => (
          <p key={i} className={app === 'zap' ? `bolha ${l.de === 'eu' ? 'eu' : 'outro'}` : 'linha'} style={{ animationDelay: `${0.15 + i * 0.3}s` }}>
            {l.texto}
          </p>
        ))}
      </div>
    </div>
  );
}

function Lista({ itens }: { itens: { texto: string; feito?: boolean }[] }) {
  return (
    <ul className="cena-lista">
      {itens.map((item, i) => (
        <li key={item.texto} className={item.feito ? 'feito' : ''} style={{ animationDelay: `${i * 0.16}s` }}>
          <b>{item.feito && <Icone nome="check" tamanho={15} traco={3} />}</b>
          <span>{item.texto}</span>
        </li>
      ))}
    </ul>
  );
}

function Trilha({ pontos, ativo }: { pontos: string[]; ativo?: number }) {
  return (
    <div className="cena-trilha">
      {pontos.map((p, i) => (
        <div key={p} className={`ponto${ativo !== undefined && i <= ativo ? ' aceso' : ''}`} style={{ animationDelay: `${i * 0.22}s` }}>
          <b>{i + 1}</b>
          <span>{p}</span>
        </div>
      ))}
    </div>
  );
}

function Calendario({ marcados, legenda }: { marcados: number[]; legenda?: string }) {
  return (
    <div className="cena-calendario">
      <div className="grade">
        {Array.from({ length: 28 }, (_, i) => (
          <i key={i} className={marcados.includes(i + 1) ? 'marcado' : ''} style={{ animationDelay: `${i * 0.02}s` }} />
        ))}
      </div>
      {legenda && <span>{legenda}</span>}
    </div>
  );
}

export function Cena({ cena }: { cena: TipoCena }) {
  switch (cena.tipo) {
    case 'pessoa':
      return (
        <div className="cena-pessoa">
          <Boneco quem={cena.quem} humor={cena.humor} tamanho={168} />
          {cena.fala && (
            <p className="balao">
              <small>{PERSONAGENS[cena.quem].nome}</small>
              {cena.fala}
            </p>
          )}
        </div>
      );
    case 'numero':
      return <Numero valor={cena.valor} formato={cena.formato} legenda={cena.legenda} />;
    case 'barras':
      return <Barras itens={cena.itens} formato={cena.formato} />;
    case 'fatias':
      return <Fatias {...cena} />;
    case 'escada':
      return <Escada degraus={cena.degraus} ativo={cena.ativo} />;
    case 'balanca':
      return <Balanca {...cena} />;
    case 'comparar':
      return <Comparar {...cena} />;
    case 'celular':
      return <Celular {...cena} />;
    case 'lista':
      return <Lista itens={cena.itens} />;
    case 'trilha':
      return <Trilha pontos={cena.pontos} ativo={cena.ativo} />;
    case 'calendario':
      return <Calendario marcados={cena.marcados} legenda={cena.legenda} />;
    case 'icone':
      return (
        <div className="cena-icone">
          <div className="halo">
            <Icone nome={cena.icone} tamanho={58} traco={1.5} />
          </div>
          {cena.legenda && <span>{cena.legenda}</span>}
        </div>
      );
  }
}
