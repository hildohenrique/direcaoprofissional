import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { acoes, lerEstado } from '@/nucleo/estado';
import { pendentes } from '@/nucleo/revisao';
import { acharPergunta } from '@/conteudo';
import { diaLocal } from '@/nucleo/formato';
import { tocar, vibrar } from '@/nucleo/som';
import { Icone } from '@/ui/Icone';

/* A revisão de hoje: poucas perguntas de paradas antigas, na hora em que a memória começa a falhar. */
export function Revisao() {
  /* a fila é fotografada na entrada: responder não pode mudar a ordem no meio da sessão */
  const fila = useMemo(
    () =>
      pendentes(lerEstado().revisao, diaLocal(), 6)
        .map((id) => ({ id, achado: acharPergunta(id) }))
        .filter((x): x is { id: string; achado: NonNullable<ReturnType<typeof acharPergunta>> } => Boolean(x.achado)),
    [],
  );
  const [indice, setIndice] = useState(0);
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [acertos, setAcertos] = useState(0);
  const item = fila[indice];

  if (fila.length === 0 || !item) {
    const terminou = fila.length > 0;
    return (
      <div className="palco chegada">
        <div className="chegada-dentro">
          <div className="peca-nova">
            <div className="peca-brilho" />
            <Icone nome="lampada" tamanho={60} traco={1.4} />
          </div>
          <p className="k">{terminou ? 'Revisão feita' : 'Nada para revisar hoje'}</p>
          <h1 className="t">{terminou ? `${acertos} de ${fila.length} na memória` : 'A memória está em dia'}</h1>
          <p className="chegada-placar">
            {terminou ? 'O que você acertou volta daqui a mais tempo. O que escapou volta amanhã. É assim que fica para sempre.' : 'As perguntas voltam nos dias certos, um pouco antes de você esquecer.'}
          </p>
        </div>
        <div className="aula-pe chegada-pe">
          <Link className="botao" to="/rota">
            Voltar ao mapa
          </Link>
        </div>
      </div>
    );
  }

  const { pergunta, parada } = item.achado;
  const responder = (i: number) => {
    if (escolhida !== null) return;
    const ok = i === pergunta.certa;
    setEscolhida(i);
    if (ok) setAcertos((x) => x + 1);
    tocar(ok ? 'certo' : 'errado');
    vibrar(ok ? 14 : [10, 60, 10]);
    acoes.responderRevisao(item.id, ok);
  };
  const seguir = () => {
    setEscolhida(null);
    setIndice(indice + 1);
  };

  return (
    <div className="palco aula">
      <header className="aula-topo">
        <Link className="botao-icone" to="/rota" aria-label="Sair da revisão">
          <Icone nome="fechar" />
        </Link>
        <div className="segmentos">
          {fila.map((_, i) => (
            <i key={i} className={i < indice ? 'cheio' : i === indice ? 'atual' : ''} />
          ))}
        </div>
        <span className="botao-icone" />
      </header>
      <main className="aula-corpo">
        <div className="aula-batida" key={indice}>
          <div className="interacao">
            <p className="k">Revisão · {parada.titulo}</p>
            <h2 className="pergunta">{pergunta.pergunta}</h2>
            <div className="opcoes">
              {pergunta.opcoes.map((o, i) => {
                const estado = escolhida === null ? '' : i === pergunta.certa ? ' certa' : i === escolhida ? ' errada' : ' apagada';
                return (
                  <button key={o} className={`opcao${estado}`} onClick={() => responder(i)} disabled={escolhida !== null}>
                    <b>{String.fromCharCode(65 + i)}</b>
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
            {escolhida !== null && (
              <div className={`retorno ${escolhida === pergunta.certa ? 'certo' : 'errado'}`} role="status">
                <p className="retorno-titulo">{escolhida === pergunta.certa ? 'Lembrou' : 'Volta amanhã'}</p>
                <p>{pergunta.porque}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="aula-pe">
        <div className="aula-pe-principal">
          <button className="botao" onClick={seguir} disabled={escolhida === null}>
            {indice === fila.length - 1 ? 'Terminar a revisão' : 'Próxima'}
            <Icone nome="seta" tamanho={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
