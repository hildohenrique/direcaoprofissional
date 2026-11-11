import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEstado } from '@/nucleo/estado';
import { andamento, nosDaRota, type No } from '@/nucleo/rota';
import { rotaDoEstado } from '@/conteudo';
import { CAMINHOS } from '@/conteudo/caminhos';
import { diaLocal, primeiroNome, reais } from '@/nucleo/formato';
import { pendentes } from '@/nucleo/revisao';
import { semanaMarcada, semanasNoRitmo } from '@/nucleo/ritmo';
import { totalGanhos } from '@/nucleo/contas';
import { Icone } from '@/ui/Icone';
import { Simbolo } from '@/ui/Marca';

const LARGURA = 360;
const PASSO = 112;
const TOPO = 178;
const FAIXA = 136;

interface Ponto {
  no: No;
  x: number;
  y: number;
  /** primeiro nó de um trecho: o mapa mostra a faixa com o nome do trecho acima dele */
  abre?: { numero: number; titulo: string; subtitulo: string; feitas: number; total: number };
}

function posicionar(nos: No[], concluidas: Record<string, unknown>): { pontos: Ponto[]; altura: number } {
  const pontos: Ponto[] = [];
  let y = TOPO;
  let trechoAtual = '';
  let numeroTrecho = 0;
  nos.forEach((no, i) => {
    let abre: Ponto['abre'];
    if (no.trecho.id !== trechoAtual) {
      trechoAtual = no.trecho.id;
      numeroTrecho += 1;
      if (i > 0) y += FAIXA;
      abre = {
        numero: numeroTrecho,
        titulo: no.trecho.titulo,
        subtitulo: no.trecho.subtitulo,
        feitas: no.trecho.paradas.filter((p) => concluidas[p.id]).length,
        total: no.trecho.paradas.length,
      };
    }
    /* a estrada serpenteia: o seno espalha as paradas de um lado ao outro do mapa */
    const x = LARGURA / 2 + Math.sin(i * 1.05 + 0.4) * 92;
    pontos.push({ no, x, y, abre });
    y += PASSO;
  });
  return { pontos, altura: y + 210 };
}

/** Curva suave que passa por todos os pontos (Catmull-Rom convertida em Bézier).
 *  `ate` limita o desenho aos primeiros trechos da mesma curva: a parte já percorrida fica exatamente sobre a estrada. */
function curva(pts: { x: number; y: number }[], ate = pts.length - 1): string {
  if (pts.length < 2 || ate < 1) return '';
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < Math.min(ate, pts.length - 1); i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const t = 0.22;
    d += ` C${p1.x + (p2.x - p0.x) * t} ${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t} ${p2.y - (p3.y - p1.y) * t} ${p2.x} ${p2.y}`;
  }
  return d;
}

/* lembra, enquanto o app está aberto, onde a pessoa estava: ao voltar de uma parada o marcador anda até a próxima */
let ultimoAtual: string | null = null;

export function Rota() {
  const e = useEstado();
  const navegar = useNavigate();
  const hoje = diaLocal();
  const nos = useMemo(() => nosDaRota(rotaDoEstado(e), e), [e]);
  const { pontos, altura } = useMemo(() => posicionar(nos, e.concluidas), [nos, e.concluidas]);
  const a = andamento(nos, e.ajustes.metaSemanal);
  const revisar = pendentes(e.revisao, hoje).length;
  const semana = semanaMarcada(e.dias, hoje);
  const ritmo = semanasNoRitmo(e.dias, e.ajustes.metaSemanal, hoje);
  const ganhos = totalGanhos(e.ganhos);
  const [aviso, setAviso] = useState<string | null>(null);

  const atual = pontos.find((p) => p.no.estado === 'atual') ?? pontos[pontos.length - 1];
  const fim = pontos[pontos.length - 1];
  const destino = { x: LARGURA / 2, y: altura - 168 };
  const alvo = a.chegou ? destino : atual;

  /* o marcador começa onde a pessoa estava e anda até a parada atual */
  const anterior = ultimoAtual && ultimoAtual !== atual?.no.id ? pontos.find((p) => p.no.id === ultimoAtual) : null;
  const [marcador, setMarcador] = useState(anterior ?? alvo);
  const refAtual = useRef<HTMLDivElement>(null);

  /* abre o mapa já na parada atual (depois que a troca de tela leva a rolagem ao topo) */
  useEffect(() => {
    const t = setTimeout(() => refAtual.current?.scrollIntoView({ block: 'center' }), 60);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setMarcador(alvo), 350);
    ultimoAtual = atual?.no.id ?? null;
    return () => clearTimeout(t);
  }, [alvo, atual]);
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  const estrada = [...pontos.map(({ x, y }) => ({ x, y })), destino];
  const caminhoTodo = curva(estrada);
  const ultimoFeito = pontos.reduce((m, p, i) => (p.no.tipo === 'parada' && p.no.estado === 'feita' ? i : m), -1);
  /* o ouro vai até a parada atual; no fim da rota, até o destino */
  const trilhaFeita = curva(estrada, a.chegou ? estrada.length - 1 : Math.max(0, pontos.indexOf(atual)));

  const abrir = (p: Ponto) => {
    if (p.no.estado === 'travada') {
      setAviso(p.no.tipo === 'missao' ? 'A missão abre quando você terminar as paradas deste trecho.' : 'Conclua a parada anterior para liberar esta.');
      return;
    }
    navegar(p.no.tipo === 'parada' ? `/parada/${p.no.id}` : `/missao/${p.no.id}`);
  };

  return (
    <div className="tela rota">
      <header className="rota-topo">
        <div className="coluna linha-h">
          <Simbolo tamanho={30} />
          <div className="rota-saudacao">
            <b>{primeiroNome(e.perfil?.nome ?? '') || 'Sua rota'}</b>
            <span>{e.caminho ? CAMINHOS[e.caminho].nome : ''}</span>
          </div>
          <span className="espaco" />
          <Link to="/perfil" className="ritmo-botao" aria-label={`Ritmo da semana: ${semana.filter((d) => d.feito).length} de ${e.ajustes.metaSemanal} dias. Abrir perfil.`}>
            <span className="ritmo-dias" aria-hidden="true">
              {semana.map((d) => (
                <i key={d.dia} className={`${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}`} />
              ))}
            </span>
            <Icone nome="pessoa" tamanho={20} />
          </Link>
        </div>
      </header>

      <div className="coluna pilha rota-painel">
        {a.chegou ? (
          <div className="gps chegou">
            <span className="gps-seta"><Icone nome="bandeira" tamanho={26} /></span>
            <span className="gps-texto">
              <small>Você chegou ao fim desta rota</small>
              <b>Hora de recalcular: um novo destino ou outro caminho</b>
            </span>
          </div>
        ) : (
          a.proxima && (
            <Link className="gps" to={`/parada/${a.proxima.id}`}>
              <span className="gps-seta"><Icone nome="seta" tamanho={26} traco={2.4} /></span>
              <span className="gps-texto">
                <small>{e.posicao[a.proxima.id] ? 'Continue de onde parou' : a.feitas === 0 ? 'Sua primeira parada' : 'Próxima parada'} · {a.proxima.parada.minutos} min</small>
                <b>{a.proxima.parada.titulo}</b>
              </span>
              <span className="gps-ir">Ir</span>
            </Link>
          )
        )}

        {revisar > 0 && (
          <Link className="faixa-revisao" to="/revisao">
            <Icone nome="lampada" tamanho={20} />
            <span>
              <b>Revisão de hoje</b>: {revisar} {revisar === 1 ? 'pergunta' : 'perguntas'} para não esquecer
            </span>
            <Icone nome="seta" tamanho={16} />
          </Link>
        )}

        <div className="rota-numeros">
          <div>
            <strong className="numero">
              {a.feitas}
              <small>/{a.total}</small>
            </strong>
            <span>paradas</span>
          </div>
          <div>
            <strong className="numero">{a.chegou ? '0' : a.semanasRestantes}</strong>
            <span>{a.semanasRestantes === 1 ? 'semana até o fim' : 'semanas até o fim'}</span>
          </div>
          <Link to="/maleta">
            <strong className="numero ouro">{reais(ganhos)}</strong>
            <span>{ganhos > 0 ? 'ganhos na rota' : 'registrar ganho'}</span>
          </Link>
        </div>
        {ritmo > 1 && (
          <p className="pequeno suave centro">
            {ritmo} semanas seguidas no seu ritmo de {e.ajustes.metaSemanal} dias.
          </p>
        )}
      </div>

      <div className="mapa-moldura">
        <div className="mapa" style={{ height: altura }}>
          <svg className="mapa-fundo" viewBox={`0 0 ${LARGURA} ${altura}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="grade" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeOpacity=".06" />
              </pattern>
              <pattern id="relevo" width="360" height="420" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="currentColor" strokeOpacity=".075" strokeWidth="1.1">
                  <path d="M-20 60c70-40 130 30 200 0s110-50 200-10" />
                  <path d="M-20 96c80-36 130 34 210 4s100-44 190-14" />
                  <path d="M-20 250c60-30 150 40 220 6s90-50 180-16" />
                  <path d="M-20 290c70-26 150 44 230 10s90-44 170-10" />
                  <ellipse cx="282" cy="176" rx="46" ry="26" />
                  <ellipse cx="282" cy="176" rx="26" ry="13" />
                  <ellipse cx="70" cy="372" rx="40" ry="22" />
                </g>
              </pattern>
            </defs>
            <rect width={LARGURA} height={altura} fill="url(#grade)" />
            <rect width={LARGURA} height={altura} fill="url(#relevo)" />
            <path d={caminhoTodo} className="estrada-base" />
            <path d={caminhoTodo} className="estrada-tracejada" />
            {ultimoFeito >= 0 && <path d={trilhaFeita} className="estrada-feita" />}
          </svg>

          <div className="rosa-dos-ventos" aria-hidden="true">
            <Icone nome="bussola" tamanho={54} traco={1} />
            <span>N</span>
          </div>

          {pontos.map((p) => {
            const ladoDireito = p.x < LARGURA / 2;
            const esq = `${(p.x / LARGURA) * 100}%`;
            const titulo = p.no.tipo === 'parada' ? p.no.parada.titulo : `Missão: ${p.no.missao.titulo}`;
            return (
              <div key={p.no.id}>
                {p.abre && (
                  <div className="faixa-trecho" style={{ top: p.y - 160 }}>
                    <span className="faixa-numero">Trecho {p.abre.numero}</span>
                    <b>{p.abre.titulo}</b>
                    <small>
                      {p.abre.subtitulo} · {p.abre.feitas}/{p.abre.total}
                    </small>
                  </div>
                )}
                <div ref={p === atual ? refAtual : undefined} className={`no ${p.no.tipo} ${p.no.estado}${ladoDireito ? ' rotulo-direita' : ' rotulo-esquerda'}`} style={{ left: esq, top: p.y }}>
                  <button className="no-botao" onClick={() => abrir(p)} aria-label={`${titulo}. ${p.no.estado === 'feita' ? 'Concluída' : p.no.estado === 'travada' ? 'Bloqueada' : 'Disponível'}.`}>
                    {p.no.estado === 'atual' && <i className="pulso" />}
                    {p.no.tipo === 'missao' ? (
                      <Icone nome={p.no.estado === 'feita' ? 'estrela' : 'bandeira'} tamanho={22} />
                    ) : p.no.estado === 'feita' ? (
                      <Icone nome="check" tamanho={22} traco={3} />
                    ) : p.no.estado === 'travada' ? (
                      <Icone nome="cadeado" tamanho={17} />
                    ) : (
                      <span className="numero">{p.no.numero}</span>
                    )}
                  </button>
                  <button className="no-rotulo" onClick={() => abrir(p)} tabIndex={-1} aria-hidden="true">
                    {p.no.tipo === 'missao' && <small>Missão</small>}
                    <b>{p.no.tipo === 'parada' ? p.no.parada.titulo : p.no.missao.titulo}</b>
                    {p.no.tipo === 'parada' && p.no.estado !== 'travada' && <span>{p.no.parada.resumo}</span>}
                  </button>
                </div>
              </div>
            );
          })}

          <div className={`destino${a.chegou ? ' chegou' : ''}`} style={{ top: destino.y }}>
            <div className="destino-bandeira">
              <Icone nome="bandeira" tamanho={30} />
            </div>
            <small>Destino</small>
            <b>{reais(e.perfil?.meta ?? 0)} por mês</b>
            {e.perfil?.sonho && <p>“{e.perfil.sonho}”</p>}
          </div>

          {marcador && fim && (
            <div className="marcador" style={{ left: `${(marcador.x / LARGURA) * 100}%`, top: marcador.y }} aria-hidden="true">
              <span>
                <b>{(primeiroNome(e.perfil?.nome ?? '') || 'V').charAt(0).toUpperCase()}</b>
              </span>
            </div>
          )}
        </div>
      </div>

      {aviso && (
        <div className="aviso-flutuante" role="status">
          <Icone nome="cadeado" tamanho={18} />
          {aviso}
        </div>
      )}
    </div>
  );
}
