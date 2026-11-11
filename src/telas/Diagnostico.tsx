import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FaixaIdade, Gosto, IdIcone, Local, Perfil, Recurso, Situacao, Tempo, Urgencia } from '@/nucleo/tipos';
import { acoes, lerEstado } from '@/nucleo/estado';
import { reais } from '@/nucleo/formato';
import { tocar } from '@/nucleo/som';
import { Icone } from '@/ui/Icone';

interface Opcao<T> {
  valor: T;
  rotulo: string;
  detalhe?: string;
  icone?: IdIcone;
}

const IDADES: Opcao<FaixaIdade>[] = [
  { valor: 'm16', rotulo: 'Menos de 16' },
  { valor: '16-17', rotulo: '16 ou 17' },
  { valor: '18-24', rotulo: '18 a 24' },
  { valor: '25-39', rotulo: '25 a 39' },
  { valor: '40-59', rotulo: '40 a 59' },
  { valor: '60+', rotulo: '60 ou mais' },
];
const SITUACOES: Opcao<Situacao>[] = [
  { valor: 'estudando', rotulo: 'Estou estudando', icone: 'livro' },
  { valor: 'desempregado', rotulo: 'Estou sem trabalho', icone: 'relogio' },
  { valor: 'clt', rotulo: 'Tenho emprego com carteira', icone: 'cracha' },
  { valor: 'autonomo', rotulo: 'Trabalho por conta', icone: 'ferramenta' },
  { valor: 'casa', rotulo: 'Cuido da casa e da família', icone: 'casa' },
  { valor: 'aposentado', rotulo: 'Sou aposentado', icone: 'coracao' },
];
const URGENCIAS: Opcao<Urgencia>[] = [
  { valor: 'ja', rotulo: 'Para agora', detalhe: 'As contas estão apertando', icone: 'foguete' },
  { valor: 'meses', rotulo: 'Nos próximos meses', detalhe: 'Tenho um fôlego, mas quero ver resultado', icone: 'calendario' },
  { valor: 'longo', rotulo: 'Posso construir com calma', detalhe: 'Quero algo sólido, mesmo que demore', icone: 'semente' },
];
const TEMPOS: Opcao<Tempo>[] = [
  { valor: '30min', rotulo: 'Uns 30 minutos' },
  { valor: '1h', rotulo: 'Cerca de 1 hora' },
  { valor: '2h', rotulo: 'Umas 2 horas' },
  { valor: '4h', rotulo: '4 horas ou mais' },
];
const RECURSOS: Opcao<Recurso>[] = [
  { valor: 'celular', rotulo: 'Celular', icone: 'celular' },
  { valor: 'internet', rotulo: 'Internet boa', icone: 'conversa' },
  { valor: 'computador', rotulo: 'Computador', icone: 'codigo' },
  { valor: 'cozinha', rotulo: 'Cozinha para usar', icone: 'panela' },
  { valor: 'veiculo', rotulo: 'Moto, carro ou bicicleta', icone: 'seta' },
  { valor: 'ferramentas', rotulo: 'Ferramentas ou material de trabalho', icone: 'ferramenta' },
  { valor: 'dinheiro', rotulo: 'Uns R$ 200 para começar', icone: 'moeda' },
];
const GOSTOS: Opcao<Gosto>[] = [
  { valor: 'pessoas', rotulo: 'Lidar com gente', icone: 'pessoa' },
  { valor: 'maos', rotulo: 'Trabalhar com as mãos', icone: 'tesoura' },
  { valor: 'computador', rotulo: 'Mexer no computador e no celular', icone: 'celular' },
  { valor: 'cozinhar', rotulo: 'Cozinhar', icone: 'panela' },
  { valor: 'vender', rotulo: 'Vender e negociar', icone: 'sacola' },
  { valor: 'ensinar', rotulo: 'Explicar e ensinar', icone: 'livro' },
  { valor: 'criar', rotulo: 'Criar e deixar bonito', icone: 'lapis' },
  { valor: 'numeros', rotulo: 'Números e lógica', icone: 'grafico' },
  { valor: 'organizar', rotulo: 'Organizar', icone: 'calendario' },
];
const LOCAIS: Opcao<Local>[] = [
  { valor: 'capital', rotulo: 'Capital ou cidade grande' },
  { valor: 'media', rotulo: 'Cidade média' },
  { valor: 'pequena', rotulo: 'Cidade pequena' },
  { valor: 'rural', rotulo: 'Zona rural' },
];
const METAS: Opcao<number>[] = [
  { valor: 500, rotulo: reais(500), detalhe: 'Um reforço no mês' },
  { valor: 1000, rotulo: reais(1000), detalhe: 'Uma renda extra de verdade' },
  { valor: 2000, rotulo: reais(2000), detalhe: 'Mais que um salário mínimo' },
  { valor: 4000, rotulo: reais(4000), detalhe: 'Viver disso com folga' },
  { valor: 8000, rotulo: `${reais(8000)} ou mais`, detalhe: 'Um negócio ou uma carreira forte' },
];

function Unica<T extends string | number>({ opcoes, valor, aoEscolher, colunas }: { opcoes: Opcao<T>[]; valor: T | undefined; aoEscolher: (v: T) => void; colunas?: boolean }) {
  return (
    <div className={`diag-opcoes${colunas ? ' duas' : ''}`} role="radiogroup">
      {opcoes.map((o) => (
        <button key={String(o.valor)} role="radio" aria-checked={valor === o.valor} className={`diag-opcao${valor === o.valor ? ' marcada' : ''}`} onClick={() => aoEscolher(o.valor)}>
          {o.icone && <Icone nome={o.icone} />}
          <span>
            <b>{o.rotulo}</b>
            {o.detalhe && <small>{o.detalhe}</small>}
          </span>
        </button>
      ))}
    </div>
  );
}

function Varias<T extends string>({ opcoes, valores, aoMudar, maximo }: { opcoes: Opcao<T>[]; valores: T[]; aoMudar: (v: T[]) => void; maximo?: number }) {
  const alternar = (v: T) => {
    if (valores.includes(v)) aoMudar(valores.filter((x) => x !== v));
    else if (!maximo || valores.length < maximo) aoMudar([...valores, v]);
  };
  return (
    <div className="diag-opcoes">
      {opcoes.map((o) => {
        const marcada = valores.includes(o.valor);
        return (
          <button key={o.valor} role="checkbox" aria-checked={marcada} className={`diag-opcao${marcada ? ' marcada' : ''}`} onClick={() => alternar(o.valor)}>
            {o.icone && <Icone nome={o.icone} />}
            <span>
              <b>{o.rotulo}</b>
            </span>
            <i className="caixinha">{marcada && <Icone nome="check" tamanho={15} traco={3} />}</i>
          </button>
        );
      })}
    </div>
  );
}

function Calculando({ nome }: { nome: string }) {
  const frases = ['Lendo o seu ponto de partida', 'Comparando sete caminhos', 'Traçando a sua rota'];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, frases.length - 1)), 700);
    return () => clearInterval(t);
  }, [frases.length]);
  return (
    <div className="palco calculando" role="status">
      <div className="radar">
        <i />
        <i />
        <i />
        <Icone nome="bussola" tamanho={46} traco={1.5} />
      </div>
      <p className="k">Calculando a rota{nome ? ` de ${nome}` : ''}</p>
      <p className="t" key={i}>
        {frases[i]}
      </p>
    </div>
  );
}

const TOTAL = 10;

export function Diagnostico() {
  const navegar = useNavigate();
  const anterior = lerEstado().perfil;
  const [passo, setPasso] = useState(0);
  const [p, setP] = useState<Partial<Perfil>>(anterior ?? { recursos: ['celular'], gostos: [], sonho: '', nome: '' });
  const [calculando, setCalculando] = useState(false);
  const definir = (parte: Partial<Perfil>) => setP((atual) => ({ ...atual, ...parte }));

  const seguir = () => {
    tocar('toque');
    if (passo < TOTAL - 1) return setPasso(passo + 1);
    acoes.definirPerfil({
      nome: (p.nome ?? '').trim(),
      idade: p.idade ?? '25-39',
      situacao: p.situacao ?? 'desempregado',
      urgencia: p.urgencia ?? 'meses',
      tempo: p.tempo ?? '1h',
      recursos: p.recursos ?? [],
      gostos: p.gostos ?? [],
      local: p.local ?? 'media',
      meta: p.meta ?? 1000,
      sonho: (p.sonho ?? '').trim(),
    });
    setCalculando(true);
    setTimeout(() => navegar('/caminhos', { replace: true }), 2300);
  };
  /* nas perguntas de uma resposta só, tocar já avança: menos toques, mais ritmo */
  const escolherEAvancar = (parte: Partial<Perfil>) => {
    definir(parte);
    setTimeout(() => {
      tocar('toque');
      setPasso((x) => Math.min(x + 1, TOTAL - 1));
    }, 220);
  };

  if (calculando) return <Calculando nome={(p.nome ?? '').trim().split(' ')[0]} />;

  const telas: { k: string; pergunta: string; ajuda?: string; corpo: React.ReactNode; pronto: boolean; botao?: boolean }[] = [
    {
      k: 'Ponto de partida',
      pergunta: 'Como você quer ser chamado?',
      corpo: <input className="campo" autoFocus value={p.nome ?? ''} maxLength={30} placeholder="Seu primeiro nome" onChange={(ev) => definir({ nome: ev.target.value })} onKeyDown={(ev) => ev.key === 'Enter' && (p.nome ?? '').trim() && seguir()} aria-label="Seu nome" />,
      pronto: Boolean((p.nome ?? '').trim()),
      botao: true,
    },
    { k: 'Sobre você', pergunta: 'Qual é a sua idade?', corpo: <Unica colunas opcoes={IDADES} valor={p.idade} aoEscolher={(v) => escolherEAvancar({ idade: v })} />, pronto: Boolean(p.idade) },
    { k: 'Sobre você', pergunta: 'Como está o seu trabalho hoje?', corpo: <Unica opcoes={SITUACOES} valor={p.situacao} aoEscolher={(v) => escolherEAvancar({ situacao: v })} />, pronto: Boolean(p.situacao) },
    { k: 'Seu momento', pergunta: 'Para quando você precisa desse dinheiro?', ajuda: 'A resposta muda a ordem da sua rota.', corpo: <Unica opcoes={URGENCIAS} valor={p.urgencia} aoEscolher={(v) => escolherEAvancar({ urgencia: v })} />, pronto: Boolean(p.urgencia) },
    { k: 'Seu momento', pergunta: 'Quanto tempo por dia você consegue separar?', ajuda: 'Seja realista. Pouco e todo dia funciona melhor que muito de vez em quando.', corpo: <Unica colunas opcoes={TEMPOS} valor={p.tempo} aoEscolher={(v) => escolherEAvancar({ tempo: v })} />, pronto: Boolean(p.tempo) },
    { k: 'O que você tem', pergunta: 'O que você tem à mão?', ajuda: 'Marque tudo o que você pode usar.', corpo: <Varias opcoes={RECURSOS} valores={p.recursos ?? []} aoMudar={(v) => definir({ recursos: v })} />, pronto: true, botao: true },
    { k: 'O seu jeito', pergunta: 'O que mais combina com você?', ajuda: 'Escolha até três.', corpo: <Varias maximo={3} opcoes={GOSTOS} valores={p.gostos ?? []} aoMudar={(v) => definir({ gostos: v })} />, pronto: (p.gostos ?? []).length > 0, botao: true },
    { k: 'Onde você está', pergunta: 'Onde você mora?', corpo: <Unica colunas opcoes={LOCAIS} valor={p.local} aoEscolher={(v) => escolherEAvancar({ local: v })} />, pronto: Boolean(p.local) },
    { k: 'O destino', pergunta: 'Quanto você quer ganhar por mês com esse novo caminho?', ajuda: 'É o seu primeiro destino. Dá para mudar depois.', corpo: <Unica opcoes={METAS} valor={p.meta} aoEscolher={(v) => escolherEAvancar({ meta: v })} />, pronto: Boolean(p.meta) },
    {
      k: 'O destino',
      pergunta: 'O que você quer que mude na sua vida?',
      ajuda: 'Uma frase, do seu jeito. É para você lembrar por que começou. Pode pular.',
      corpo: <textarea className="campo" value={p.sonho ?? ''} maxLength={240} rows={4} placeholder="Ex.: Quero parar de depender dos outros e pagar as minhas contas sem sufoco." onChange={(ev) => definir({ sonho: ev.target.value })} aria-label="O que você quer que mude" />,
      pronto: true,
      botao: true,
    },
  ];
  const tela = telas[passo];
  const ultimo = passo === TOTAL - 1;

  return (
    <div className="tela sem-barra diag">
      <div className="coluna diag-coluna">
        <header className="diag-topo">
          <button className="botao-icone" onClick={() => (passo === 0 ? navegar(-1) : setPasso(passo - 1))} aria-label="Voltar">
            <Icone nome="voltar" />
          </button>
          <div className="barra-progresso" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={passo + 1}>
            <i style={{ width: `${((passo + 1) / TOTAL) * 100}%` }} />
          </div>
          <span className="pequeno suave numero diag-conta">
            {passo + 1}/{TOTAL}
          </span>
        </header>
        <main className="diag-corpo pilha" key={passo}>
          <div className="surge">
            <p className="rotulo">{tela.k}</p>
            <h1 className="titulo">{tela.pergunta}</h1>
            {tela.ajuda && <p className="suave diag-ajuda">{tela.ajuda}</p>}
          </div>
          <div className="surge-2">{tela.corpo}</div>
        </main>
        {(tela.botao || tela.pronto) && (
          <footer className="diag-pe">
            <button className="botao" onClick={seguir} disabled={!tela.pronto}>
              {ultimo ? 'Traçar a minha rota' : 'Continuar'}
              <Icone nome="seta" tamanho={20} />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
