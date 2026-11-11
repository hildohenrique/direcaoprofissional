import { useEffect, useMemo, useRef, useState } from 'react';
import type { Batida, OpcaoConversa } from '@/nucleo/tipos';
import { formatar } from '@/nucleo/formato';
import { acoes, useEstado } from '@/nucleo/estado';
import { tocar, vibrar } from '@/nucleo/som';
import { Icone } from '@/ui/Icone';
import { useContagem } from './Cena';
import { Ferramenta, ferramentaPronta } from './ferramentas';

/** acertou: true ou false nas batidas com resposta certa; null nas que não contam ponto. */
export interface Resultado {
  acertou: boolean | null;
}

interface Props<T extends Batida['tipo']> {
  batida: Extract<Batida, { tipo: T }>;
  aoResolver: (r: Resultado) => void;
}

function embaralhar<T>(lista: T[], semente: number): T[] {
  const copia = [...lista];
  let s = semente || 1;
  for (let i = copia.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  /* nunca entrega já na ordem certa */
  if (copia.length > 1 && copia.every((x, i) => x === lista[i])) copia.push(copia.shift() as T);
  return copia;
}

function retorno(acertou: boolean | null, texto: string, titulo?: string) {
  const classe = acertou === null ? 'neutro' : acertou ? 'certo' : 'errado';
  return (
    <div className={`retorno ${classe}`} role="status">
      <p className="retorno-titulo">{titulo ?? (acertou === null ? 'Anotado' : acertou ? 'Isso mesmo' : 'Quase')}</p>
      <p>{texto}</p>
    </div>
  );
}

function sinal(acertou: boolean) {
  tocar(acertou ? 'certo' : 'errado');
  vibrar(acertou ? 14 : [10, 60, 10]);
}

/* ---------- escolha ---------- */
export function Escolha({ batida, aoResolver }: Props<'escolha'>) {
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const opcao = escolhida === null ? null : batida.opcoes[escolhida];
  const escolher = (i: number) => {
    if (escolhida !== null) return;
    setEscolhida(i);
    if (batida.semCerta) {
      tocar('toque');
      aoResolver({ acertou: null });
    } else {
      const ok = Boolean(batida.opcoes[i].certa);
      sinal(ok);
      aoResolver({ acertou: ok });
    }
  };
  return (
    <div className="interacao">
      <h2 className="pergunta">{batida.pergunta}</h2>
      <div className="opcoes">
        {batida.opcoes.map((o, i) => {
          const estado = escolhida === null ? '' : batida.semCerta ? (i === escolhida ? ' marcada' : ' apagada') : o.certa ? ' certa' : i === escolhida ? ' errada' : ' apagada';
          return (
            <button key={o.texto} className={`opcao${estado}`} onClick={() => escolher(i)} disabled={escolhida !== null}>
              <b>{String.fromCharCode(65 + i)}</b>
              <span>{o.texto}</span>
            </button>
          );
        })}
      </div>
      {opcao && retorno(batida.semCerta ? null : Boolean(opcao.certa), opcao.retorno, batida.semCerta ? 'Entendi' : undefined)}
    </div>
  );
}

/* ---------- estimativa ---------- */
export function Estimativa({ batida, aoResolver }: Props<'estimativa'>) {
  const meio = batida.min + Math.round((batida.max - batida.min) / 2 / batida.passo) * batida.passo;
  const [palpite, setPalpite] = useState(meio);
  const [mexeu, setMexeu] = useState(false);
  const [revelado, setRevelado] = useState(false);
  const margem = Math.max(batida.passo, Math.abs(batida.resposta) * 0.15);
  const acertou = Math.abs(palpite - batida.resposta) <= margem;
  const pos = (v: number) => ((v - batida.min) / (batida.max - batida.min)) * 100;
  const conferir = () => {
    setRevelado(true);
    sinal(acertou);
    aoResolver({ acertou });
  };
  return (
    <div className="interacao">
      <h2 className="pergunta">{batida.pergunta}</h2>
      <div className={`regua${revelado ? ' revelada' : ''}`}>
        <output className="regua-valor numero">{formatar(palpite, batida.formato)}</output>
        <div className="regua-trilho">
          <input
            type="range"
            min={batida.min}
            max={batida.max}
            step={batida.passo}
            value={palpite}
            disabled={revelado}
            aria-label="Seu palpite"
            onChange={(e) => {
              setPalpite(Number(e.target.value));
              setMexeu(true);
            }}
            style={{ ['--pos' as string]: `${pos(palpite)}%` }}
          />
          {revelado && (
            <div className="regua-resposta" style={{ left: `${pos(batida.resposta)}%` }}>
              <i />
            </div>
          )}
        </div>
        <div className="regua-pontas numero">
          <span>{formatar(batida.min, batida.formato)}</span>
          <span>{formatar(batida.max, batida.formato)}</span>
        </div>
      </div>
      {!revelado ? (
        <button className="botao ouro" onClick={conferir} disabled={!mexeu}>
          {mexeu ? 'Este é o meu palpite' : 'Arraste para dar o seu palpite'}
        </button>
      ) : (
        <>
          <Revelacao valor={batida.resposta} formato={batida.formato} palpite={palpite} />
          {retorno(acertou, batida.retorno, acertou ? 'Bom palpite' : 'A conta')}
        </>
      )}
    </div>
  );
}

function Revelacao({ valor, formato, palpite }: { valor: number; formato: Extract<Batida, { tipo: 'estimativa' }>['formato']; palpite: number }) {
  const v = useContagem(valor, 1000);
  return (
    <div className="revelacao">
      <div>
        <span>Seu palpite</span>
        <strong className="numero">{formatar(palpite, formato)}</strong>
      </div>
      <div className="certa">
        <span>Resposta</span>
        <strong className="numero">{formatar(Number.isInteger(valor) ? Math.round(v) : Math.round(v * 10) / 10, formato)}</strong>
      </div>
    </div>
  );
}

/* ---------- ordenar ---------- */
export function Ordenar({ batida, aoResolver }: Props<'ordenar'>) {
  const mistura = useMemo(() => embaralhar(batida.itens, batida.itens.join('').length), [batida]);
  const [ordem, setOrdem] = useState<string[]>([]);
  const [conferido, setConferido] = useState(false);
  const restantes = mistura.filter((x) => !ordem.includes(x));
  const acertou = ordem.every((x, i) => x === batida.itens[i]);
  const conferir = () => {
    setConferido(true);
    sinal(acertou);
    aoResolver({ acertou });
  };
  return (
    <div className="interacao">
      <h2 className="pergunta">{batida.pergunta}</h2>
      <p className="dica-toque">Toque nos itens na ordem certa. Toque de novo para tirar.</p>
      <ol className="ordem">
        {(conferido ? batida.itens : ordem).map((item, i) => (
          <li key={item} className={conferido ? (ordem[i] === item ? 'certa' : 'corrigida') : ''}>
            <button onClick={() => !conferido && setOrdem(ordem.filter((x) => x !== item))} disabled={conferido}>
              <b>{i + 1}</b>
              <span>{item}</span>
            </button>
          </li>
        ))}
        {!conferido && restantes.length > 0 && <li className="vaga" aria-hidden="true"><b>{ordem.length + 1}</b></li>}
      </ol>
      {!conferido && restantes.length > 0 && (
        <div className="fichas">
          {restantes.map((item) => (
            <button key={item} className="ficha" onClick={() => { tocar('toque'); setOrdem([...ordem, item]); }}>
              {item}
            </button>
          ))}
        </div>
      )}
      {!conferido && restantes.length === 0 && (
        <button className="botao ouro" onClick={conferir}>
          Conferir a ordem
        </button>
      )}
      {conferido && retorno(acertou, batida.retorno, acertou ? 'Ordem certa' : 'A ordem que funciona')}
    </div>
  );
}

/* ---------- separar ---------- */
export function Separar({ batida, aoResolver }: Props<'separar'>) {
  const itens = useMemo(() => embaralhar(batida.itens, batida.itens.length * 7 + batida.pergunta.length), [batida]);
  const [respostas, setRespostas] = useState<(0 | 1)[]>([]);
  const [ultimo, setUltimo] = useState<boolean | null>(null);
  const atual = itens[respostas.length];
  const fim = respostas.length === itens.length;
  const erros = respostas.filter((r, i) => r !== itens[i].grupo).length;
  const responder = (g: 0 | 1) => {
    if (!atual) return;
    const ok = g === atual.grupo;
    sinal(ok);
    setUltimo(ok);
    const novas = [...respostas, g];
    setRespostas(novas);
    if (novas.length === itens.length) aoResolver({ acertou: novas.filter((r, i) => r !== itens[i].grupo).length <= 1 });
  };
  return (
    <div className="interacao">
      <h2 className="pergunta">{batida.pergunta}</h2>
      {!fim && atual && (
        <>
          <div className="separar-contagem numero">
            {respostas.length + 1} de {itens.length}
          </div>
          <div key={atual.texto} className={`separar-carta${ultimo === false ? ' veio-de-erro' : ''}`}>
            {atual.texto}
          </div>
          <div className="separar-botoes">
            <button className="grupo g0" onClick={() => responder(0)}>
              {batida.grupos[0]}
            </button>
            <button className="grupo g1" onClick={() => responder(1)}>
              {batida.grupos[1]}
            </button>
          </div>
        </>
      )}
      {fim && (
        <>
          <div className="separar-fim">
            {[0, 1].map((g) => (
              <div key={g} className={`coluna-grupo g${g}`}>
                <p>{batida.grupos[g]}</p>
                {itens.map((item, i) => (item.grupo === g ? <span key={item.texto} className={respostas[i] === item.grupo ? '' : 'errou'}>{item.texto}</span> : null))}
              </div>
            ))}
          </div>
          {erros > 0 && <p className="dica-toque">Em destaque, o que você tinha colocado no outro grupo.</p>}
          {retorno(erros <= 1, batida.retorno, erros === 0 ? 'Tudo no lugar' : `${itens.length - erros} de ${itens.length} no lugar certo`)}
        </>
      )}
    </div>
  );
}

/* ---------- conversa ---------- */
type Linha = { de: 'outro' | 'voce'; texto: string } | { de: 'nota'; nota: OpcaoConversa['nota']; texto: string };

export function Conversa({ batida, aoResolver }: Props<'conversa'>) {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [passo, setPasso] = useState(0);
  const [notas, setNotas] = useState<OpcaoConversa['nota'][]>([]);
  const fimRef = useRef<HTMLDivElement>(null);
  const troca = batida.trocas[passo];

  /* as mensagens da outra pessoa entram sozinhas, uma a uma */
  useEffect(() => {
    if (!troca || troca.de !== 'outro') return;
    const t = setTimeout(() => {
      setLinhas((l) => [...l, { de: 'outro', texto: troca.texto }]);
      setPasso((p) => p + 1);
    }, linhas.length === 0 ? 350 : 900);
    return () => clearTimeout(t);
  }, [troca, linhas.length]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [linhas.length, passo]);

  const acabou = passo >= batida.trocas.length;
  const avisado = useRef(false);
  useEffect(() => {
    if (acabou && !avisado.current) {
      avisado.current = true;
      aoResolver({ acertou: !notas.includes('ruim') });
    }
  }, [acabou, notas, aoResolver]);

  const responder = (o: OpcaoConversa) => {
    sinal(o.nota !== 'ruim');
    setNotas((n) => [...n, o.nota]);
    setLinhas((l) => [
      ...l,
      { de: 'voce', texto: o.texto },
      { de: 'nota', nota: o.nota, texto: o.retorno },
      ...(o.resposta ? [{ de: 'outro' as const, texto: o.resposta }] : []),
    ]);
    setPasso((p) => p + 1);
  };

  return (
    <div className="interacao conversa">
      <p className="conversa-contexto">{batida.contexto}</p>
      <div className="zap">
        <div className="zap-topo">
          <i>{batida.contato.charAt(0)}</i>
          <div>
            <b>{batida.contato}</b>
            <span>{acabou ? 'visto por último agora' : 'online'}</span>
          </div>
        </div>
        <div className="zap-corpo" aria-live="polite">
          {linhas.map((l, i) =>
            l.de === 'nota' ? (
              <p key={i} className={`zap-nota ${l.nota}`}>
                <b>{l.nota === 'boa' ? 'Boa resposta.' : l.nota === 'ok' ? 'Dá para melhorar.' : 'Cuidado.'}</b> {l.texto}
              </p>
            ) : (
              <p key={i} className={`bolha ${l.de === 'voce' ? 'eu' : 'outro'}`}>
                {l.texto}
              </p>
            ),
          )}
          {troca?.de === 'outro' && (
            <p className="bolha outro digitando" aria-label="digitando">
              <i />
              <i />
              <i />
            </p>
          )}
          <div ref={fimRef} />
        </div>
      </div>
      {troca?.de === 'voce' && (
        <div className="opcoes respostas">
          <p className="dica-toque">O que você responde?</p>
          {troca.opcoes.map((o) => (
            <button key={o.texto} className="opcao" onClick={() => responder(o)}>
              <span>{o.texto}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- escrever ---------- */
export function Escrever({ batida, aoResolver }: Props<'escrever'>) {
  const salvo = useEstado().maleta.textos[batida.chave] ?? '';
  const [texto, setTexto] = useState(salvo);
  const [exemplo, setExemplo] = useState(false);
  const pronto = texto.trim().length >= 3;
  const avisou = useRef(false);
  useEffect(() => {
    if (pronto) {
      acoes.salvarTexto(batida.chave, texto.trim());
      if (!avisou.current) {
        avisou.current = true;
        aoResolver({ acertou: null });
      }
    }
  }, [pronto, texto, batida.chave, aoResolver]);
  return (
    <div className="interacao">
      <h2 className="pergunta">{batida.pergunta}</h2>
      {batida.ajuda && <p className="ajuda">{batida.ajuda}</p>}
      <textarea className="campo" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva aqui, do seu jeito" rows={4} aria-label={batida.pergunta} />
      <div className="escrever-pe">
        <span className="guardado">
          <Icone nome="maleta" tamanho={16} /> {pronto ? `Guardado na maleta: ${batida.rotulo}` : 'Vai para a sua maleta'}
        </span>
        {batida.exemplo && (
          <button className="link" onClick={() => setExemplo(!exemplo)}>
            {exemplo ? 'Esconder exemplo' : 'Ver um exemplo'}
          </button>
        )}
      </div>
      {exemplo && batida.exemplo && <p className="exemplo">{batida.exemplo}</p>}
    </div>
  );
}

/* ---------- ferramenta ---------- */
export function BatidaFerramenta({ batida, aoResolver }: Props<'ferramenta'>) {
  const maleta = useEstado().maleta;
  const pronta = ferramentaPronta(batida.ferramenta, maleta);
  const avisou = useRef(false);
  useEffect(() => {
    if (pronta && !avisou.current) {
      avisou.current = true;
      aoResolver({ acertou: null });
    }
  }, [pronta, aoResolver]);
  return (
    <div className="interacao">
      <h2 className="pergunta">{batida.t}</h2>
      {batida.texto && <p className="ajuda">{batida.texto}</p>}
      <div className="ferramenta-na-aula">
        <Ferramenta id={batida.ferramenta} />
      </div>
    </div>
  );
}

/** O que a voz lê em cada batida. */
export function textoParaVoz(b: Batida): string {
  switch (b.tipo) {
    case 'fala':
      return [b.t, b.texto, ...(b.pontos ?? [])].filter(Boolean).join('. ');
    case 'historia':
      return [b.t, b.texto].filter(Boolean).join('. ');
    case 'escolha':
      return [b.pergunta, ...b.opcoes.map((o, i) => `${String.fromCharCode(65 + i)}: ${o.texto}`)].join('. ');
    case 'estimativa':
    case 'ordenar':
    case 'separar':
    case 'escrever':
      return b.pergunta;
    case 'conversa':
      return b.contexto;
    case 'ferramenta':
      return [b.t, b.texto].filter(Boolean).join('. ');
    case 'resumo':
      return `Para levar: ${b.pontos.join('. ')}`;
  }
}
