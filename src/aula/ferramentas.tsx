import { useState } from 'react';
import type { Contato, IdFerramenta, IdIcone, Maleta } from '@/nucleo/tipos';
import { acoes, CUSTOS_PADRAO, useEstado } from '@/nucleo/estado';
import { clientesNecessarios, custoTotal, fraseDaOferta, horaParaPreco, horasVendidas, precoMinimo, valorHora } from '@/nucleo/contas';
import { reais } from '@/nucleo/formato';
import { Icone } from '@/ui/Icone';

/* As ferramentas usam os números e as palavras da própria pessoa.
   O que ela preenche na aula fica guardado na maleta e pode ser ajustado depois. */

export const FERRAMENTAS: { id: IdFerramenta; nome: string; para: string; icone: IdIcone }[] = [
  { id: 'custo-do-mes', nome: 'Custo do mês', para: 'Quanto a sua vida custa por mês', icone: 'casa' },
  { id: 'valor-da-hora', nome: 'Valor da hora', para: 'Quanto cada hora de trabalho precisa render', icone: 'relogio' },
  { id: 'preco-minimo', nome: 'Preço mínimo', para: 'Abaixo deste valor, você paga para trabalhar', icone: 'moeda' },
  { id: 'meta-de-clientes', nome: 'Meta de clientes', para: 'De quantos clientes a sua meta precisa', icone: 'alvo' },
  { id: 'oferta', nome: 'Oferta em uma frase', para: 'Para quem, qual resultado, como e por quanto', icone: 'megafone' },
  { id: 'lista-quente', nome: 'Lista quente', para: 'Os primeiros 20 nomes para oferecer', icone: 'pessoa' },
  { id: 'plano-da-semana', nome: 'Plano da semana', para: 'Uma ação pequena por dia', icone: 'calendario' },
];

export function ferramentaPronta(id: IdFerramenta, m: Maleta): boolean {
  switch (id) {
    case 'custo-do-mes':
      return custoTotal(m) > 0;
    case 'valor-da-hora':
      return valorHora(m) > 0;
    case 'preco-minimo':
      return precoMinimo(m) > 0;
    case 'meta-de-clientes':
      return m.clientes.ticket > 0;
    case 'lista-quente':
      return m.contatos.length >= 5;
    case 'oferta':
      return Boolean(m.oferta.quem.trim() && m.oferta.resultado.trim() && m.oferta.como.trim());
    case 'plano-da-semana':
      return Object.values(m.plano).filter((x) => x.trim()).length >= 3;
  }
}

/* ---------- campos ---------- */
function CampoReais({ valor, aoMudar, rotulo, dica }: { valor: number; aoMudar: (v: number) => void; rotulo: string; dica?: string }) {
  return (
    <label className="campo-reais">
      <span className="cr-rotulo">
        <b>{rotulo}</b>
        {dica && <small>{dica}</small>}
      </span>
      <span className="cr-caixa">
        <i>R$</i>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={valor ? String(valor) : ''}
          placeholder="0"
          onChange={(e) => aoMudar(Number(e.target.value.replace(/\D/g, '').slice(0, 7)) || 0)}
          aria-label={rotulo}
        />
      </span>
    </label>
  );
}

function Passos({ valor, aoMudar, rotulo, dica, min, max, passo = 1, sufixo }: { valor: number; aoMudar: (v: number) => void; rotulo: string; dica?: string; min: number; max: number; passo?: number; sufixo?: string }) {
  const limitar = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="campo-passos">
      <span className="cr-rotulo">
        <b>{rotulo}</b>
        {dica && <small>{dica}</small>}
      </span>
      <span className="cp-controle">
        <button onClick={() => aoMudar(limitar(valor - passo))} aria-label={`Diminuir ${rotulo}`}>
          −
        </button>
        <output className="numero">
          {valor}
          {sufixo ? ` ${sufixo}` : ''}
        </output>
        <button onClick={() => aoMudar(limitar(valor + passo))} aria-label={`Aumentar ${rotulo}`}>
          +
        </button>
      </span>
    </div>
  );
}

function Resultado({ rotulo, valor, nota, vazio }: { rotulo: string; valor: string; nota?: string; vazio?: boolean }) {
  return (
    <div className={`ferr-resultado${vazio ? ' vazio' : ''}`}>
      <span>{rotulo}</span>
      <strong className="numero">{valor}</strong>
      {nota && <small>{nota}</small>}
    </div>
  );
}

/* ---------- as ferramentas ---------- */
function CustoDoMes() {
  const m = useEstado().maleta;
  const total = custoTotal(m);
  return (
    <div className="ferr">
      {CUSTOS_PADRAO.map((c) => (
        <CampoReais key={c.id} rotulo={c.rotulo} dica={c.dica} valor={m.custos[c.id] ?? 0} aoMudar={(v) => acoes.maleta((x) => { x.custos[c.id] = v; })} />
      ))}
      <Resultado rotulo="O seu mês custa" valor={reais(total)} vazio={total === 0} nota={total > 0 ? `São ${reais(Math.round(total / 30))} por dia, trabalhando ou não.` : 'Preencha o que souber. Pode ser um valor aproximado.'} />
    </div>
  );
}

function ValorDaHora() {
  const m = useEstado().maleta;
  const custo = custoTotal(m);
  const hora = valorHora(m);
  return (
    <div className="ferr">
      {custo === 0 ? (
        <CampoReais rotulo="Custo do seu mês" dica="some tudo, mesmo que aproximado" valor={m.custos.outros ?? 0} aoMudar={(v) => acoes.maleta((x) => { x.custos.outros = v; })} />
      ) : (
        <div className="ferr-fixo">
          <span>Custo do seu mês</span>
          <b className="numero">{reais(custo)}</b>
        </div>
      )}
      <CampoReais rotulo="Quanto você quer que sobre" dica="para guardar, investir no trabalho, viver melhor" valor={m.hora.sobra} aoMudar={(v) => acoes.maleta((x) => { x.hora.sobra = v; })} />
      <Passos rotulo="Dias de trabalho no mês" min={1} max={31} valor={m.hora.dias} aoMudar={(v) => acoes.maleta((x) => { x.hora.dias = v; })} />
      <Passos rotulo="Horas vendidas por dia" dica="só as horas com cliente ou produzindo" min={1} max={14} valor={m.hora.horas} sufixo="h" aoMudar={(v) => acoes.maleta((x) => { x.hora.horas = v; })} />
      <Resultado rotulo="A sua hora precisa valer" valor={reais(Math.ceil(hora))} vazio={hora === 0} nota={hora > 0 ? `${reais(custo + m.hora.sobra)} ÷ ${horasVendidas(m)} horas no mês` : 'Informe o custo do mês para fazer a conta.'} />
    </div>
  );
}

function PrecoMinimo() {
  const m = useEstado().maleta;
  const hora = horaParaPreco(m);
  const minimo = precoMinimo(m);
  const servico = m.preco.modo === 'servico';
  return (
    <div className="ferr">
      <div className="ferr-abas" role="tablist">
        <button role="tab" aria-selected={servico} className={servico ? 'ativa' : ''} onClick={() => acoes.maleta((x) => { x.preco.modo = 'servico'; })}>
          Serviço
        </button>
        <button role="tab" aria-selected={!servico} className={!servico ? 'ativa' : ''} onClick={() => acoes.maleta((x) => { x.preco.modo = 'produto'; })}>
          Produto
        </button>
      </div>
      {servico ? (
        <>
          <CampoReais rotulo="Valor da sua hora" dica={valorHora(m) > 0 ? 'veio da conta da hora; pode ajustar' : 'quanto cada hora precisa render'} valor={Math.ceil(hora)} aoMudar={(v) => acoes.maleta((x) => { x.preco.hora = v; })} />
          <Passos rotulo="Tempo do serviço" dica="do começo ao fim, com preparo e limpeza" min={15} max={600} passo={15} valor={m.preco.minutos} sufixo="min" aoMudar={(v) => acoes.maleta((x) => { x.preco.minutos = v; })} />
          <CampoReais rotulo="Material e deslocamento" dica="o que você gasta para fazer este serviço" valor={m.preco.material} aoMudar={(v) => acoes.maleta((x) => { x.preco.material = v; })} />
          <Resultado rotulo="Preço mínimo deste serviço" valor={reais(Math.ceil(minimo))} vazio={minimo === 0} nota={minimo > 0 ? 'Cobrando menos que isso, o dinheiro para fechar o mês sai do seu bolso.' : 'Informe o valor da hora para fazer a conta.'} />
        </>
      ) : (
        <>
          <CampoReais rotulo="Custo de uma unidade" dica="ingredientes ou compra, embalagem, frete, taxas" valor={m.preco.material} aoMudar={(v) => acoes.maleta((x) => { x.preco.material = v; })} />
          <Passos rotulo="Quanto você soma em cima" dica="a parte que paga o seu trabalho e a sobra" min={10} max={300} passo={10} valor={m.preco.margem} sufixo="%" aoMudar={(v) => acoes.maleta((x) => { x.preco.margem = v; })} />
          <Resultado rotulo="Preço mínimo de uma unidade" valor={reais(Math.ceil(minimo * 100) / 100)} vazio={minimo === 0} nota={minimo > 0 ? `Em cada unidade ficam ${reais(Math.round((minimo - m.preco.material) * 100) / 100)} para o seu trabalho e a sobra.` : 'Informe o custo de uma unidade.'} />
        </>
      )}
    </div>
  );
}

function MetaDeClientes() {
  const e = useEstado();
  const m = e.maleta;
  const r = clientesNecessarios(m, e.perfil?.meta ?? 0);
  return (
    <div className="ferr">
      <CampoReais rotulo="Quanto quer ganhar por mês" valor={r.meta} aoMudar={(v) => acoes.maleta((x) => { x.clientes.meta = v; })} />
      <CampoReais rotulo="Valor médio de uma venda" dica="quanto um cliente paga cada vez" valor={m.clientes.ticket} aoMudar={(v) => acoes.maleta((x) => { x.clientes.ticket = v; })} />
      <Passos rotulo="Vezes que o cliente compra no mês" min={1} max={30} valor={m.clientes.vezes} sufixo="x" aoMudar={(v) => acoes.maleta((x) => { x.clientes.vezes = v; })} />
      <Resultado rotulo="Você precisa de" valor={r.vendas ? `${r.vendas} vendas no mês` : '—'} vazio={!r.vendas} nota={r.vendas ? `Cerca de ${r.porSemana} por semana. Com clientes que voltam ${m.clientes.vezes}x no mês, bastam ${r.clientes} clientes fixos.` : 'Informe o valor médio de uma venda.'} />
    </div>
  );
}

const ESTADOS_CONTATO: { id: Contato['estado']; rotulo: string }[] = [
  { id: 'a-falar', rotulo: 'A falar' },
  { id: 'falei', rotulo: 'Falei' },
  { id: 'interessou', rotulo: 'Interessou' },
  { id: 'comprou', rotulo: 'Comprou' },
  { id: 'nao', rotulo: 'Agora não' },
];

function ListaQuente() {
  const contatos = useEstado().maleta.contatos;
  const [nome, setNome] = useState('');
  const adicionar = () => {
    const limpo = nome.trim();
    if (!limpo || contatos.length >= 20) return;
    acoes.maleta((x) => { x.contatos.push({ nome: limpo, estado: 'a-falar' }); });
    setNome('');
  };
  const avancar = (i: number) =>
    acoes.maleta((x) => {
      const atual = ESTADOS_CONTATO.findIndex((s) => s.id === x.contatos[i].estado);
      x.contatos[i].estado = ESTADOS_CONTATO[(atual + 1) % ESTADOS_CONTATO.length].id;
    });
  const compraram = contatos.filter((c) => c.estado === 'comprou').length;
  return (
    <div className="ferr">
      <form className="ferr-adicionar" onSubmit={(ev) => { ev.preventDefault(); adicionar(); }}>
        <input className="campo" value={nome} onChange={(ev) => setNome(ev.target.value)} placeholder="Nome de alguém que você conhece" maxLength={40} aria-label="Nome do contato" />
        <button className="botao fino" type="submit" disabled={!nome.trim() || contatos.length >= 20} aria-label="Adicionar">
          <Icone nome="mais" tamanho={20} />
        </button>
      </form>
      {contatos.length === 0 && <p className="ferr-vazio">Comece por quem torce por você: família, amigos, vizinhos, colegas. Só o primeiro nome basta.</p>}
      <ul className="ferr-contatos">
        {contatos.map((c, i) => (
          <li key={`${c.nome}-${i}`}>
            <span>{c.nome}</span>
            <button className={`estado-contato e-${c.estado}`} onClick={() => avancar(i)} aria-label={`Estado de ${c.nome}: ${ESTADOS_CONTATO.find((s) => s.id === c.estado)?.rotulo}. Toque para mudar.`}>
              {ESTADOS_CONTATO.find((s) => s.id === c.estado)?.rotulo}
            </button>
            <button className="remover" onClick={() => acoes.maleta((x) => { x.contatos.splice(i, 1); })} aria-label={`Tirar ${c.nome}`}>
              <Icone nome="fechar" tamanho={16} />
            </button>
          </li>
        ))}
      </ul>
      <Resultado rotulo="Na sua lista" valor={`${contatos.length} de 20`} vazio={contatos.length === 0} nota={contatos.length < 5 ? 'Coloque pelo menos 5 nomes para seguir.' : compraram ? `${compraram} já ${compraram === 1 ? 'comprou' : 'compraram'}. Toque no estado para atualizar.` : 'Toque no estado de cada nome para atualizar depois de falar.'} />
    </div>
  );
}

function Oferta() {
  const m = useEstado().maleta;
  const campos: { chave: keyof Maleta['oferta']; rotulo: string; exemplo: string }[] = [
    { chave: 'quem', rotulo: 'Para quem', exemplo: 'quem trabalha o dia todo no centro' },
    { chave: 'resultado', rotulo: 'Qual resultado a pessoa leva', exemplo: 'almoçar comida caseira sem sair do trabalho' },
    { chave: 'como', rotulo: 'Como você entrega', exemplo: 'marmitas entregues ao meio-dia' },
    { chave: 'preco', rotulo: 'Por quanto', exemplo: 'R$ 20 cada' },
  ];
  const frase = fraseDaOferta(m);
  return (
    <div className="ferr">
      {campos.map((c) => (
        <label key={c.chave} className="campo-texto">
          <b>{c.rotulo}</b>
          <input className="campo" value={m.oferta[c.chave]} placeholder={c.exemplo} maxLength={90} onChange={(ev) => acoes.maleta((x) => { x.oferta[c.chave] = ev.target.value; })} />
        </label>
      ))}
      <div className={`ferr-resultado frase${frase ? '' : ' vazio'}`}>
        <span>A sua oferta</span>
        <strong>{frase || 'Ajudo … a … com …, por …'}</strong>
      </div>
    </div>
  );
}

const DIAS = [
  { id: 'seg', nome: 'Segunda', ex: 'Mandar a oferta para 5 pessoas' },
  { id: 'ter', nome: 'Terça', ex: 'Postar uma foto do trabalho' },
  { id: 'qua', nome: 'Quarta', ex: 'Fazer uma parada aqui na rota' },
  { id: 'qui', nome: 'Quinta', ex: 'Falar com 2 clientes que já compraram' },
  { id: 'sex', nome: 'Sexta', ex: 'Anotar o que entrou e o que saiu' },
  { id: 'sab', nome: 'Sábado', ex: 'Atender, entregar, produzir' },
  { id: 'dom', nome: 'Domingo', ex: 'Descansar e olhar a semana que vem' },
];

function PlanoDaSemana() {
  const plano = useEstado().maleta.plano;
  const cheios = Object.values(plano).filter((x) => x.trim()).length;
  return (
    <div className="ferr">
      {DIAS.map((d) => (
        <label key={d.id} className="campo-texto dia">
          <b>{d.nome}</b>
          <input className="campo" value={plano[d.id] ?? ''} placeholder={d.ex} maxLength={80} onChange={(ev) => acoes.maleta((x) => { x.plano[d.id] = ev.target.value; })} />
        </label>
      ))}
      <Resultado rotulo="Dias com uma ação" valor={`${cheios} de 7`} vazio={cheios === 0} nota={cheios < 3 ? 'Escolha pelo menos 3 dias. Uma ação pequena em cada um.' : 'Pequeno e todo dia vence grande e de vez em quando.'} />
    </div>
  );
}

export function Ferramenta({ id }: { id: IdFerramenta }) {
  switch (id) {
    case 'custo-do-mes':
      return <CustoDoMes />;
    case 'valor-da-hora':
      return <ValorDaHora />;
    case 'preco-minimo':
      return <PrecoMinimo />;
    case 'meta-de-clientes':
      return <MetaDeClientes />;
    case 'lista-quente':
      return <ListaQuente />;
    case 'oferta':
      return <Oferta />;
    case 'plano-da-semana':
      return <PlanoDaSemana />;
  }
}
