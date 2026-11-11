import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { IdFerramenta } from '@/nucleo/tipos';
import { acoes, useEstado } from '@/nucleo/estado';
import { clientesNecessarios, custoTotal, fraseDaOferta, precoMinimo, totalGanhos, valorHora } from '@/nucleo/contas';
import { dataCurta, reais } from '@/nucleo/formato';
import { acharParada, ROTULOS_DOS_TEXTOS } from '@/conteudo';
import { tocar, vibrar } from '@/nucleo/som';
import { Icone } from '@/ui/Icone';
import { Ferramenta, FERRAMENTAS, ferramentaPronta } from '@/aula/ferramentas';

function Ganhos() {
  const e = useEstado();
  const [valor, setValor] = useState('');
  const [de, setDe] = useState('');
  const [festa, setFesta] = useState<null | 'primeiro' | 'mais'>(null);
  const total = totalGanhos(e.ganhos);
  const meta = e.perfil?.meta ?? 0;
  const mes = new Date().toISOString().slice(0, 7);
  const noMes = totalGanhos(e.ganhos.filter((g) => g.em.startsWith(mes)));

  const registrar = (ev: React.FormEvent) => {
    ev.preventDefault();
    const v = Number(valor.replace(/\D/g, ''));
    if (!v) return;
    const primeiro = e.ganhos.length === 0;
    acoes.adicionarGanho(v, de.trim() || 'Ganho');
    tocar('chegada');
    vibrar([20, 60, 20, 60, 40]);
    setFesta(primeiro ? 'primeiro' : 'mais');
    setValor('');
    setDe('');
    setTimeout(() => setFesta(null), primeiro ? 6000 : 2200);
  };

  return (
    <section className="cartao ganhos surge-2" id="ganhos">
      <div className="ganhos-topo">
        <div>
          <p className="rotulo">Ganhos na rota</p>
          <strong className="ganhos-total numero">{reais(total)}</strong>
        </div>
        <span className="ganhos-moeda">
          <Icone nome="moeda" tamanho={30} />
        </span>
      </div>
      {meta > 0 && (
        <div className="ganhos-meta">
          <div className="barra-progresso">
            <i style={{ width: `${Math.min(100, (noMes / meta) * 100)}%` }} />
          </div>
          <span className="pequeno suave">
            Neste mês: <b className="numero">{reais(noMes)}</b> de {reais(meta)}
          </span>
        </div>
      )}
      {festa === 'primeiro' && (
        <div className="primeiro-real" role="status">
          <b>O seu primeiro real.</b>
          <span>Alguém pagou pelo que você fez. Daqui para a frente é repetir e melhorar. Guarde este dia.</span>
        </div>
      )}
      {festa === 'mais' && (
        <div className="primeiro-real simples" role="status">
          <b>Registrado.</b>
        </div>
      )}
      {e.ganhos.length === 0 && !festa && <p className="suave pequeno">Quando entrar o primeiro dinheiro do seu novo caminho, registre aqui. Vale R$ 5, vale R$ 500.</p>}
      <form className="ganhos-form" onSubmit={registrar}>
        <label className="cr-caixa">
          <i>R$</i>
          <input inputMode="numeric" pattern="[0-9]*" placeholder="0" value={valor} onChange={(ev) => setValor(ev.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Valor recebido" />
        </label>
        <input className="campo" placeholder="De onde veio? Ex.: 2 marmitas" value={de} maxLength={50} onChange={(ev) => setDe(ev.target.value)} aria-label="De onde veio" />
        <button className="botao ouro" type="submit" disabled={!Number(valor)}>
          Registrar
        </button>
      </form>
      {e.ganhos.length > 0 && (
        <ul className="ganhos-lista">
          {[...e.ganhos].reverse().slice(0, 8).map((g) => (
            <li key={g.id}>
              <span className="suave pequeno">{dataCurta(g.em)}</span>
              <span className="ganho-de">{g.de}</span>
              <b className="numero">{reais(g.valor)}</b>
              <button onClick={() => acoes.removerGanho(g.id)} aria-label={`Apagar ${g.de}`}>
                <Icone nome="fechar" tamanho={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function valorDaFerramenta(id: IdFerramenta, e: ReturnType<typeof useEstado>): string {
  const m = e.maleta;
  switch (id) {
    case 'custo-do-mes':
      return reais(custoTotal(m));
    case 'valor-da-hora':
      return `${reais(Math.ceil(valorHora(m)))} por hora`;
    case 'preco-minimo':
      return reais(Math.ceil(precoMinimo(m)));
    case 'meta-de-clientes': {
      const r = clientesNecessarios(m, e.perfil?.meta ?? 0);
      return `${r.vendas} vendas no mês`;
    }
    case 'lista-quente':
      return `${m.contatos.length} nomes`;
    case 'oferta':
      return fraseDaOferta(m);
    case 'plano-da-semana':
      return `${Object.values(m.plano).filter((x) => x.trim()).length} dias planejados`;
  }
}

export function Maleta() {
  const e = useEstado();
  const pecas = Object.keys(e.concluidas)
    .map((id) => acharParada(id)?.parada)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const textos = Object.entries(e.maleta.textos).filter(([, t]) => t.trim());

  return (
    <div className="tela">
      <div className="coluna pilha-g">
        <header className="pilha surge">
          <p className="rotulo">O que você construiu</p>
          <h1 className="titulo">Maleta</h1>
        </header>

        <Ganhos />

        <section className="pilha surge-3">
          <h2 className="titulo-2">Suas ferramentas</h2>
          <div className="grade-ferramentas">
            {FERRAMENTAS.map((f) => {
              const pronta = ferramentaPronta(f.id, e.maleta);
              return (
                <Link key={f.id} to={`/maleta/${f.id}`} className={`cartao plano ferramenta-cartao${pronta ? ' pronta' : ''}`}>
                  <span className="ferramenta-icone">
                    <Icone nome={f.icone} />
                  </span>
                  <b>{f.nome}</b>
                  <span className={pronta ? 'valor' : 'suave'}>{pronta ? valorDaFerramenta(f.id, e) : f.para}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {textos.length > 0 && (
          <section className="pilha">
            <h2 className="titulo-2">Suas palavras</h2>
            {textos.map(([chave, texto]) => (
              <div key={chave} className="cartao plano texto-guardado">
                <p className="rotulo">{ROTULOS_DOS_TEXTOS[chave] ?? chave}</p>
                <p>{texto}</p>
              </div>
            ))}
          </section>
        )}

        <section className="pilha">
          <h2 className="titulo-2">
            Peças <span className="suave numero">{pecas.length}</span>
          </h2>
          {pecas.length === 0 ? (
            <p className="suave">Cada parada concluída deixa uma peça aqui.</p>
          ) : (
            <ul className="pecas">
              {pecas.map((p) => (
                <li key={p.id}>
                  <Link to={`/parada/${p.id}`}>
                    <Icone nome="peca" tamanho={20} />
                    <span>{p.peca}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export function TelaFerramenta() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const f = FERRAMENTAS.find((x) => x.id === id);
  if (!f) {
    return (
      <div className="tela sem-barra">
        <div className="coluna pilha">
          <h1 className="titulo">Ferramenta não encontrada</h1>
          <Link className="botao" to="/maleta">
            Voltar para a maleta
          </Link>
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
          <p className="rotulo">Ferramenta</p>
          <h1 className="titulo">{f.nome}</h1>
          <p className="suave">{f.para}. O que você preencher fica salvo.</p>
        </header>
        <div className="surge-2">
          <Ferramenta id={f.id} />
        </div>
        <Link className="botao claro" to="/maleta">
          Pronto
        </Link>
      </div>
    </div>
  );
}
