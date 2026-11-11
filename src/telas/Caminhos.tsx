import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { IdCaminho } from '@/nucleo/tipos';
import { acoes, useEstado } from '@/nucleo/estado';
import { avisoDeIdade, recomendar, type Recomendacao } from '@/nucleo/diagnostico';
import { CAMINHOS } from '@/conteudo/caminhos';
import { montarRota } from '@/conteudo';
import { primeiroNome } from '@/nucleo/formato';
import { tocar } from '@/nucleo/som';
import { Icone } from '@/ui/Icone';

function CartaoCaminho({ rec, posicao, aberto, aoAbrir, aoEscolher, atual }: { rec: Recomendacao; posicao: number; aberto: boolean; aoAbrir: () => void; aoEscolher: () => void; atual: boolean }) {
  const c = CAMINHOS[rec.caminho];
  return (
    <article className={`cartao caminho${aberto ? ' aberto' : ''}${posicao === 0 ? ' primeiro' : ''}`}>
      <button className="caminho-topo" onClick={aoAbrir} aria-expanded={aberto}>
        <span className="caminho-icone">
          <Icone nome={c.icone} tamanho={26} />
        </span>
        <span className="caminho-nome">
          {posicao === 0 && <small className="rotulo">Mais combina com você</small>}
          {atual && posicao !== 0 && <small className="rotulo">Seu caminho atual</small>}
          <b>{c.nome}</b>
          <span className="afinidade" aria-label={`Afinidade ${rec.afinidade} de 100`}>
            <i style={{ width: `${Math.max(6, rec.afinidade)}%` }} />
          </span>
        </span>
        <Icone nome="seta" tamanho={18} className="caminho-seta" />
      </button>
      {aberto && (
        <div className="caminho-corpo">
          <p>{c.frase}</p>
          {rec.motivos.length > 0 && (
            <ul className="motivos">
              {rec.motivos.map((m) => (
                <li key={m}>
                  <Icone nome="check" tamanho={16} traco={2.6} />
                  {m}
                </li>
              ))}
            </ul>
          )}
          {rec.avisos.length > 0 && (
            <ul className="motivos avisos">
              {rec.avisos.map((m) => (
                <li key={m}>
                  <Icone nome="relogio" tamanho={16} />
                  {m}
                </li>
              ))}
            </ul>
          )}
          <dl className="ficha-caminho">
            <div>
              <dt>Primeiro dinheiro</dt>
              <dd>{c.primeiroReal}</dd>
            </div>
            <div>
              <dt>Para começar</dt>
              <dd>{c.investimento}</dd>
            </div>
            <div>
              <dt>Até onde vai</dt>
              <dd>{c.teto}</dd>
            </div>
          </dl>
          <p className="honesto">
            <b>O lado difícil:</b> {c.honesto}
          </p>
          <div className="exemplos">
            {c.exemplos.map((x) => (
              <span key={x} className="chip">
                {x}
              </span>
            ))}
          </div>
          <button className="botao" onClick={aoEscolher}>
            {atual ? 'Continuar neste caminho' : 'Seguir por este caminho'}
            <Icone nome="seta" tamanho={20} />
          </button>
        </div>
      )}
    </article>
  );
}

export function Caminhos() {
  const e = useEstado();
  const navegar = useNavigate();
  const perfil = e.perfil!;
  const recs = useMemo(() => recomendar(perfil), [perfil]);
  const [aberto, setAberto] = useState<IdCaminho | null>(recs[0].caminho);
  const [todos, setTodos] = useState(false);
  const aviso = avisoDeIdade(perfil);
  const visiveis = todos ? recs : recs.slice(0, 3);

  const escolher = (c: IdCaminho) => {
    tocar('certo');
    acoes.escolherCaminho(c);
    navegar('/rota', { replace: true });
  };
  const paradas = (c: IdCaminho) => montarRota(perfil, c).reduce((s, t) => s + t.paradas.length, 0);

  return (
    <div className="tela sem-barra">
      <div className="coluna pilha-g">
        <header className="pilha surge">
          {e.caminho && (
            <Link to="/rota" className="botao-icone" aria-label="Voltar para a rota">
              <Icone nome="voltar" />
            </Link>
          )}
          <p className="rotulo">Rota calculada</p>
          <h1 className="titulo">{primeiroNome(perfil.nome)}, estes caminhos combinam com o seu ponto de partida</h1>
          <p className="suave">Comparei o que você gosta, o que você tem e a sua pressa com sete jeitos de ganhar dinheiro. A escolha é sua, e dá para trocar depois sem perder o que já fez.</p>
        </header>

        {aviso && (
          <div className="aviso surge-2">
            <Icone nome="escudo" />
            <p>{aviso}</p>
          </div>
        )}

        <div className="pilha surge-2">
          {visiveis.map((rec, i) => (
            <CartaoCaminho key={rec.caminho} rec={rec} posicao={i} atual={e.caminho === rec.caminho} aberto={aberto === rec.caminho} aoAbrir={() => setAberto(aberto === rec.caminho ? null : rec.caminho)} aoEscolher={() => escolher(rec.caminho)} />
          ))}
          {!todos && (
            <button className="botao claro" onClick={() => setTodos(true)}>
              Ver os outros {recs.length - 3} caminhos
            </button>
          )}
        </div>

        {aberto && (
          <p className="pequeno suave centro">
            A rota de {CAMINHOS[aberto].nome.toLowerCase()} tem {paradas(aberto)} paradas. No ritmo de {e.ajustes.metaSemanal} por semana, são cerca de {Math.ceil(paradas(aberto) / e.ajustes.metaSemanal)} semanas.
          </p>
        )}
        <Link className="botao-texto centro" to="/partida">
          Refazer o ponto de partida
        </Link>
      </div>
    </div>
  );
}
