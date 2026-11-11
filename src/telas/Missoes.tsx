import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { acoes, useEstado } from '@/nucleo/estado';
import { nosDaRota, type No } from '@/nucleo/rota';
import { acharMissao, rotaDoEstado } from '@/conteudo';
import { dataCurta } from '@/nucleo/formato';
import { tocar, vibrar } from '@/nucleo/som';
import { Icone } from '@/ui/Icone';

type NoMissao = Extract<No, { tipo: 'missao' }>;

export function Missoes() {
  const e = useEstado();
  const missoes = nosDaRota(rotaDoEstado(e), e).filter((n): n is NoMissao => n.tipo === 'missao');
  const abertas = missoes.filter((m) => m.estado === 'livre');
  const feitas = missoes.filter((m) => m.estado === 'feita');
  const proximas = missoes.filter((m) => m.estado === 'travada');

  const cartao = (m: NoMissao) => (
    <Link key={m.id} to={m.estado === 'travada' ? '#' : `/missao/${m.id}`} className={`cartao missao-cartao ${m.estado}`} aria-disabled={m.estado === 'travada'} onClick={(ev) => m.estado === 'travada' && ev.preventDefault()}>
      <span className="missao-icone">
        <Icone nome={m.estado === 'feita' ? 'estrela' : m.estado === 'travada' ? 'cadeado' : 'bandeira'} />
      </span>
      <span className="missao-texto">
        <small>{m.trecho.titulo}</small>
        <b>{m.missao.titulo}</b>
        <span>{m.estado === 'feita' ? `Cumprida em ${dataCurta(e.missoes[m.id].em)}` : m.estado === 'travada' ? 'Abre no fim do trecho' : m.missao.tempo}</span>
      </span>
      {m.estado !== 'travada' && <Icone nome="seta" tamanho={18} />}
    </Link>
  );

  return (
    <div className="tela">
      <div className="coluna pilha-g">
        <header className="pilha surge">
          <p className="rotulo">Fora da tela</p>
          <h1 className="titulo">Missões</h1>
          <p className="suave">A aula ensina. A missão é onde o dinheiro aparece: uma ação pequena, com gente de verdade, no fim de cada trecho.</p>
        </header>

        {abertas.length > 0 && (
          <section className="pilha surge-2">
            <h2 className="titulo-2">Para fazer agora</h2>
            {abertas.map(cartao)}
          </section>
        )}
        {abertas.length === 0 && feitas.length === 0 && (
          <div className="cartao plano vazio surge-2">
            <Icone nome="bandeira" tamanho={30} />
            <p>
              A sua primeira missão abre quando você terminar as paradas do primeiro trecho. <Link to="/rota">Voltar para a rota</Link>
            </p>
          </div>
        )}
        {proximas.length > 0 && (
          <section className="pilha surge-3">
            <h2 className="titulo-2">Mais adiante</h2>
            {proximas.map(cartao)}
          </section>
        )}
        {feitas.length > 0 && (
          <section className="pilha surge-3">
            <h2 className="titulo-2">Cumpridas</h2>
            {feitas.map(cartao)}
          </section>
        )}
      </div>
    </div>
  );
}

export function TelaMissao() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const e = useEstado();
  const achado = acharMissao(id);
  const feita = e.missoes[id];
  const [marcados, setMarcados] = useState<number[]>([]);
  const [registro, setRegistro] = useState(feita?.registro ?? '');
  const [comemorar, setComemorar] = useState(false);

  if (!achado) {
    return (
      <div className="tela sem-barra">
        <div className="coluna pilha">
          <h1 className="titulo">Missão não encontrada</h1>
          <Link className="botao" to="/missoes">
            Ver as missões
          </Link>
        </div>
      </div>
    );
  }
  const { missao, trecho } = achado;
  const alternar = (i: number) => {
    tocar('toque');
    setMarcados(marcados.includes(i) ? marcados.filter((x) => x !== i) : [...marcados, i]);
  };
  const concluir = () => {
    acoes.concluirMissao(missao.id, registro.trim());
    tocar('chegada');
    vibrar([20, 60, 20, 60, 40]);
    setComemorar(true);
  };

  if (comemorar) {
    return (
      <div className="palco chegada">
        <div className="chegada-dentro">
          <div className="peca-nova">
            <div className="peca-brilho" />
            <Icone nome="estrela" tamanho={64} traco={1.4} />
          </div>
          <p className="k">Missão cumprida</p>
          <h1 className="t">{missao.titulo}</h1>
          <p className="chegada-placar">Isto você fez no mundo real, com gente de verdade. É o que mais conta na rota inteira.</p>
          <div className="chegada-hoje">
            <p className="k">Entrou dinheiro?</p>
            <p>Registre na maleta cada valor que entrar, mesmo pequeno. Ver a soma crescer é a prova de que a rota está funcionando.</p>
          </div>
        </div>
        <div className="aula-pe chegada-pe">
          <div className="aula-pe-principal" style={{ gap: 10 }}>
            <Link className="botao ouro" to="/maleta">
              Registrar um ganho
            </Link>
            <Link className="botao claro" to="/rota">
              Voltar ao mapa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tela sem-barra">
      <div className="coluna pilha-g">
        <header className="pilha surge">
          <button className="botao-icone" onClick={() => navegar(-1)} aria-label="Voltar">
            <Icone nome="voltar" />
          </button>
          <p className="rotulo">Missão · {trecho.titulo}</p>
          <h1 className="titulo">{missao.titulo}</h1>
          <p className="suave">{missao.porque}</p>
          <span className="chip ouro">
            <Icone nome="relogio" tamanho={15} /> {missao.tempo}
          </span>
        </header>

        <section className="pilha surge-2">
          <h2 className="titulo-2">Passo a passo</h2>
          <ul className="passos">
            {missao.passos.map((p, i) => {
              const ok = Boolean(feita) || marcados.includes(i);
              return (
                <li key={p}>
                  <button className={`passo${ok ? ' feito' : ''}`} onClick={() => alternar(i)} role="checkbox" aria-checked={ok} disabled={Boolean(feita)}>
                    <i>{ok && <Icone nome="check" tamanho={15} traco={3} />}</i>
                    <span>{p}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="pilha surge-3">
          <h2 className="titulo-2">{missao.registro.pergunta}</h2>
          <textarea className="campo" rows={5} value={registro} onChange={(ev) => setRegistro(ev.target.value)} placeholder={`Ex.: ${missao.registro.exemplo}`} aria-label={missao.registro.pergunta} />
          <p className="pequeno suave">Escrever o que aconteceu ajuda a enxergar o que você aprendeu. Fica guardado só para você.</p>
        </section>

        <div className="pilha">
          {feita ? (
            <>
              <button className="botao" onClick={() => { acoes.concluirMissao(missao.id, registro.trim()); navegar('/missoes'); }}>
                Salvar a anotação
              </button>
              <p className="pequeno suave centro">Cumprida em {dataCurta(feita.em)}.</p>
            </>
          ) : (
            <>
              <button className="botao ouro" onClick={concluir} disabled={registro.trim().length < 10}>
                Cumpri a missão
              </button>
              <p className="pequeno suave centro">{registro.trim().length < 10 ? 'Conte em poucas palavras o que aconteceu para concluir.' : 'Só marque quando tiver feito de verdade. A rota é sua.'}</p>
              <Link className="botao-texto centro" to="/norte" state={{ pedido: `Preciso de ajuda com a missão "${missao.titulo}". Por onde eu começo?` }}>
                Pedir ajuda ao Norte
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
