import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Batida, Parada } from '@/nucleo/tipos';
import { acoes, lerEstado, useEstado } from '@/nucleo/estado';
import { acharParada, rotaDoEstado } from '@/conteudo';
import { nosDaRota } from '@/nucleo/rota';
import { calar, falar, tocar, vibrar, vozDisponivel } from '@/nucleo/som';
import { diaLocal } from '@/nucleo/formato';
import { semanaMarcada } from '@/nucleo/ritmo';
import { PERSONAGENS } from '@/conteudo/personagens';
import { Icone } from '@/ui/Icone';
import { Cena } from '@/aula/Cena';
import { BatidaFerramenta, Conversa, Escolha, Escrever, Estimativa, Ordenar, Separar, textoParaVoz, type Resultado } from '@/aula/batidas';

const SEM_ESPERA = new Set<Batida['tipo']>(['fala', 'historia', 'resumo']);
const PODE_PULAR = new Set<Batida['tipo']>(['ferramenta', 'escrever']);

function Conteudo({ batida, aoResolver }: { batida: Batida; aoResolver: (r: Resultado) => void }) {
  switch (batida.tipo) {
    case 'fala':
      return (
        <div className="leitura">
          {batida.k && <p className="k">{batida.k}</p>}
          <h1 className="t">{batida.t}</h1>
          {batida.texto && <p className="corpo">{batida.texto}</p>}
          {batida.pontos && (
            <ul className="pontos">
              {batida.pontos.map((p, i) => (
                <li key={p} style={{ animationDelay: `${0.25 + i * 0.16}s` }}>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    case 'historia':
      return (
        <div className="leitura">
          <p className="k">{batida.k ?? `A história de ${PERSONAGENS[batida.quem].nome}`}</p>
          {batida.t && <h1 className="t">{batida.t}</h1>}
          <p className="corpo">{batida.texto}</p>
        </div>
      );
    case 'resumo':
      return (
        <div className="leitura">
          <p className="k">Para levar</p>
          <ol className="resumo">
            {batida.pontos.map((p, i) => (
              <li key={p} style={{ animationDelay: `${0.15 + i * 0.22}s` }}>
                <b>{i + 1}</b>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case 'escolha':
      return <Escolha batida={batida} aoResolver={aoResolver} />;
    case 'estimativa':
      return <Estimativa batida={batida} aoResolver={aoResolver} />;
    case 'ordenar':
      return <Ordenar batida={batida} aoResolver={aoResolver} />;
    case 'separar':
      return <Separar batida={batida} aoResolver={aoResolver} />;
    case 'conversa':
      return <Conversa batida={batida} aoResolver={aoResolver} />;
    case 'escrever':
      return <Escrever batida={batida} aoResolver={aoResolver} />;
    case 'ferramenta':
      return <BatidaFerramenta batida={batida} aoResolver={aoResolver} />;
  }
}

function Chegada({ parada, acertos, total }: { parada: Parada; acertos: number; total: number }) {
  const e = useEstado();
  const hoje = diaLocal();
  const semana = semanaMarcada(e.dias, hoje);
  const feitos = semana.filter((d) => d.feito).length;
  const nos = nosDaRota(rotaDoEstado(e), e);
  const proxima = nos.find((n) => n.tipo === 'parada' && n.estado === 'atual');
  const meu = nos.findIndex((n) => n.id === parada.id);
  const missaoAberta = nos.slice(meu + 1).find((n) => n.tipo === 'missao');
  const abriuMissao = missaoAberta && missaoAberta.estado === 'livre' && nos[meu + 1]?.id === missaoAberta.id ? missaoAberta : null;

  return (
    <div className="palco chegada">
      <div className="chegada-dentro">
        <div className="peca-nova">
          <div className="peca-brilho" />
          <Icone nome="peca" tamanho={64} traco={1.4} />
        </div>
        <p className="k">Peça nova na maleta</p>
        <h1 className="t">{parada.peca}</h1>
        {total > 0 && (
          <p className="chegada-placar">
            Você acertou <b>{acertos}</b> de <b>{total}</b> de primeira.{acertos < total ? ' O que escapou volta na revisão dos próximos dias.' : ''}
          </p>
        )}

        <div className="chegada-hoje">
          <p className="k">Para fazer hoje</p>
          <p>{parada.hoje}</p>
        </div>

        <div className="chegada-semana" aria-label={`Você apareceu ${feitos} de ${e.ajustes.metaSemanal} dias nesta semana`}>
          <div className="dias">
            {semana.map((d, i) => (
              <i key={d.dia} className={`${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}`}>
                {'STQQSSD'[i]}
              </i>
            ))}
          </div>
          <span>
            {feitos >= e.ajustes.metaSemanal ? 'Semana no ritmo.' : `${feitos} de ${e.ajustes.metaSemanal} dias da sua semana.`}
          </span>
        </div>
      </div>
      <div className="aula-pe chegada-pe">
        {abriuMissao ? (
          <Link className="botao ouro" to={`/missao/${abriuMissao.id}`}>
            Trecho concluído: ver a missão
          </Link>
        ) : proxima ? (
          <Link className="botao" to="/rota">
            Voltar ao mapa
          </Link>
        ) : (
          <Link className="botao ouro" to="/rota">
            Você chegou ao destino
          </Link>
        )}
      </div>
    </div>
  );
}

export function Aula() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const achado = acharParada(id);
  const ajustes = useEstado().ajustes;
  const inicial = useMemo(() => {
    const salvo = lerEstado().posicao[id] ?? 0;
    return achado && salvo < achado.parada.batidas.length ? salvo : 0;
  }, [id, achado]);
  const [indice, setIndice] = useState(inicial);
  const [resultados, setResultados] = useState<Record<number, Resultado>>({});
  const [fim, setFim] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const parada = achado?.parada;
  const batida = parada?.batidas[indice];
  const total = parada?.batidas.length ?? 0;
  const liberada = batida ? SEM_ESPERA.has(batida.tipo) || Boolean(resultados[indice]) : false;

  const aoResolver = useCallback(
    (r: Resultado) => {
      /* só o primeiro resultado de cada batida conta: voltar e refazer não soma ponto */
      setResultados((atual) => (atual[indice] ? atual : { ...atual, [indice]: r }));
    },
    [indice],
  );

  useEffect(() => {
    corpo.current?.scrollTo({ top: 0 });
    if (batida && ajustes.voz) falar(textoParaVoz(batida));
    return calar;
  }, [indice, batida, ajustes.voz]);

  const avancar = useCallback(() => {
    if (!parada) return;
    if (indice < total - 1) {
      tocar('toque');
      setIndice(indice + 1);
      acoes.guardarPosicao(parada.id, indice + 1);
      return;
    }
    const contam = Object.values(resultados).filter((r) => r.acertou !== null);
    acoes.concluirParada(parada.id, contam.filter((r) => r.acertou).length, contam.length, parada.revisao.length);
    tocar('chegada');
    vibrar([20, 60, 20, 60, 40]);
    setFim(true);
  }, [parada, indice, total, resultados]);

  const voltar = useCallback(() => {
    if (indice > 0) setIndice(indice - 1);
  }, [indice]);

  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      const alvo = ev.target as HTMLElement;
      if (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA') return;
      if ((ev.key === 'ArrowRight' || ev.key === 'Enter') && liberada && !fim) avancar();
      if (ev.key === 'ArrowLeft' && !fim) voltar();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [avancar, voltar, liberada, fim]);

  if (!parada || !batida) {
    return (
      <div className="tela sem-barra">
        <div className="coluna pilha">
          <h1 className="titulo">Parada não encontrada</h1>
          <Link className="botao" to="/rota">
            Voltar ao mapa
          </Link>
        </div>
      </div>
    );
  }

  if (fim) {
    const contam = Object.values(resultados).filter((r) => r.acertou !== null);
    return <Chegada parada={parada} acertos={contam.filter((r) => r.acertou).length} total={contam.length} />;
  }

  const cena = batida.cena ?? (batida.tipo === 'historia' ? ({ tipo: 'pessoa', quem: batida.quem } as const) : null);
  const ultima = indice === total - 1;

  return (
    <div className="palco aula">
      <header className="aula-topo">
        <button className="botao-icone" onClick={() => navegar('/rota')} aria-label="Sair da parada">
          <Icone nome="fechar" />
        </button>
        <div className="segmentos" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={indice + 1} aria-label={`Batida ${indice + 1} de ${total}`}>
          {parada.batidas.map((_, i) => (
            <i key={i} className={i < indice ? 'cheio' : i === indice ? 'atual' : ''} />
          ))}
        </div>
        <button
          className="botao-icone"
          aria-label="Tirar uma dúvida com o Norte sobre esta parte"
          onClick={() => {
            acoes.guardarPosicao(parada.id, indice);
            navegar('/norte', { state: { pedido: `Estou na parada "${parada.titulo}" e não entendi bem esta parte: "${textoParaVoz(batida).slice(0, 220)}". Me explica de outro jeito, com um exemplo do meu caminho?`, voltar: `/parada/${parada.id}` } });
          }}
        >
          <Icone nome="norte" />
        </button>
        {vozDisponivel() ? (
          <button className={`botao-icone${ajustes.voz ? ' ligado' : ''}`} onClick={() => acoes.ajustar((a) => { a.voz = !a.voz; })} aria-label={ajustes.voz ? 'Desligar a leitura em voz alta' : 'Ouvir a aula em voz alta'} aria-pressed={ajustes.voz}>
            <Icone nome={ajustes.voz ? 'som' : 'mudo'} />
          </button>
        ) : null}
      </header>

      <main className="aula-corpo" ref={corpo}>
        <div className="aula-batida" key={indice}>
          {cena && (
            <div className="aula-cena">
              <Cena cena={cena} />
            </div>
          )}
          <Conteudo batida={batida} aoResolver={aoResolver} />
        </div>
      </main>

      <footer className="aula-pe">
        <button className="botao-icone voltar" onClick={voltar} disabled={indice === 0} aria-label="Batida anterior">
          <Icone nome="voltar" />
        </button>
        <div className="aula-pe-principal">
          {!liberada && PODE_PULAR.has(batida.tipo) && (
            <button className="link pular" onClick={() => aoResolver({ acertou: null })}>
              Pular por agora
            </button>
          )}
          <button className={`botao${ultima ? ' ouro' : ''}`} onClick={avancar} disabled={!liberada}>
            {ultima ? 'Concluir parada' : 'Continuar'}
            <Icone nome="seta" tamanho={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
