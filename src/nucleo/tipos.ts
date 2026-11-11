/* Vocabulário da plataforma.
   Rota   = a viagem inteira de uma pessoa, montada a partir do perfil dela.
   Trecho = um pedaço da rota com um tema (ex.: "Seu dinheiro").
   Parada = uma aula curta (5 a 7 minutos), feita de batidas.
   Batida = uma tela da aula: uma ideia, uma história ou uma interação.
   Missão = uma ação no mundo real que fecha o trecho.
   Maleta = o que a pessoa construiu: números, frases, peças e ganhos. */

export type IdCaminho = 'servicos' | 'comida' | 'vendas' | 'digital' | 'ensinar' | 'emprego' | 'tecnologia';

export type IdPersonagem = 'cida' | 'rafa' | 'jessica' | 'antonio' | 'bia' | 'marcos' | 'lu' | 'neuza' | 'davi';

export type IdIcone =
  | 'bussola' | 'mapa' | 'bandeira' | 'maleta' | 'norte' | 'moeda' | 'relogio' | 'coracao' | 'conversa'
  | 'tesoura' | 'panela' | 'sacola' | 'celular' | 'livro' | 'cracha' | 'codigo' | 'lampada' | 'alvo'
  | 'escada' | 'balanca' | 'calendario' | 'estrela' | 'cadeado' | 'check' | 'seta' | 'voltar' | 'fechar'
  | 'som' | 'mudo' | 'pessoa' | 'peca' | 'foguete' | 'semente' | 'grafico' | 'lapis' | 'megafone'
  | 'aperto' | 'casa' | 'ferramenta' | 'mais' | 'lixeira' | 'engrenagem' | 'escudo' | 'pix';

export type Formato = 'reais' | 'numero' | 'porcento' | 'horas' | 'dias' | 'pessoas';

/* ---------- Perfil (ponto de partida) ---------- */

export type FaixaIdade = 'm16' | '16-17' | '18-24' | '25-39' | '40-59' | '60+';
export type Situacao = 'estudando' | 'desempregado' | 'clt' | 'autonomo' | 'casa' | 'aposentado';
export type Urgencia = 'ja' | 'meses' | 'longo';
export type Tempo = '30min' | '1h' | '2h' | '4h';
export type Recurso = 'celular' | 'computador' | 'internet' | 'cozinha' | 'veiculo' | 'ferramentas' | 'dinheiro';
export type Gosto = 'pessoas' | 'maos' | 'computador' | 'cozinhar' | 'vender' | 'ensinar' | 'criar' | 'numeros' | 'organizar';
export type Local = 'capital' | 'media' | 'pequena' | 'rural';

export interface Perfil {
  nome: string;
  idade: FaixaIdade;
  situacao: Situacao;
  urgencia: Urgencia;
  tempo: Tempo;
  recursos: Recurso[];
  gostos: Gosto[];
  local: Local;
  /** quanto quer ganhar por mês com o novo caminho, em reais */
  meta: number;
  /** nas palavras da pessoa: o que ela quer mudar */
  sonho: string;
}

/* ---------- Cenas: o desenho que acompanha uma batida ---------- */

export type Cena =
  | { tipo: 'pessoa'; quem: IdPersonagem; humor?: 'feliz' | 'pensando' | 'preocupado'; fala?: string }
  | { tipo: 'numero'; valor: number; formato?: Formato; legenda?: string }
  | { tipo: 'barras'; formato?: Formato; itens: { rotulo: string; valor: number; destaque?: boolean }[] }
  | { tipo: 'fatias'; formato?: Formato; titulo?: string; itens: { rotulo: string; valor: number; tom?: 'custo' | 'voce' | 'lucro' | 'neutro' }[] }
  | { tipo: 'escada'; degraus: string[]; ativo?: number }
  | { tipo: 'balanca'; esquerda: { rotulo: string; peso: number }; direita: { rotulo: string; peso: number } }
  | { tipo: 'comparar'; a: { titulo: string; linhas: string[]; tom?: 'bom' | 'ruim' | 'neutro' }; b: { titulo: string; linhas: string[]; tom?: 'bom' | 'ruim' | 'neutro' } }
  | { tipo: 'celular'; app: 'zap' | 'insta' | 'nota'; titulo?: string; linhas: { de?: 'eu' | 'outro'; texto: string }[] }
  | { tipo: 'lista'; itens: { texto: string; feito?: boolean }[] }
  | { tipo: 'trilha'; pontos: string[]; ativo?: number }
  | { tipo: 'calendario'; marcados: number[]; legenda?: string }
  | { tipo: 'icone'; icone: IdIcone; legenda?: string };

/* ---------- Batidas ---------- */

interface BaseBatida {
  /** rótulo pequeno acima do título (ex.: "A história da Cida") */
  k?: string;
  cena?: Cena;
}

export interface OpcaoEscolha {
  texto: string;
  /** omitido em perguntas de opinião (semCerta) */
  certa?: boolean;
  /** o que a pessoa lê depois de escolher: explica o porquê, sem bronca */
  retorno: string;
}

export interface OpcaoConversa {
  texto: string;
  nota: 'boa' | 'ok' | 'ruim';
  retorno: string;
  /** o que o cliente responde a esta opção (aparece na conversa) */
  resposta?: string;
}

export type Troca = { de: 'outro'; texto: string } | { de: 'voce'; opcoes: OpcaoConversa[] };

export type IdFerramenta = 'custo-do-mes' | 'valor-da-hora' | 'preco-minimo' | 'meta-de-clientes' | 'lista-quente' | 'oferta' | 'plano-da-semana';

export type Batida = BaseBatida &
  (
    | { tipo: 'fala'; t: string; texto?: string; pontos?: string[] }
    | { tipo: 'historia'; quem: IdPersonagem; t?: string; texto: string }
    | { tipo: 'escolha'; pergunta: string; opcoes: OpcaoEscolha[]; semCerta?: boolean }
    | { tipo: 'estimativa'; pergunta: string; min: number; max: number; passo: number; resposta: number; formato: Formato; retorno: string }
    | { tipo: 'ordenar'; pergunta: string; itens: string[]; retorno: string }
    | { tipo: 'separar'; pergunta: string; grupos: [string, string]; itens: { texto: string; grupo: 0 | 1 }[]; retorno: string }
    | { tipo: 'conversa'; contexto: string; contato: string; trocas: Troca[] }
    | { tipo: 'ferramenta'; ferramenta: IdFerramenta; t: string; texto?: string }
    | { tipo: 'escrever'; pergunta: string; ajuda?: string; exemplo?: string; chave: string; rotulo: string }
    | { tipo: 'resumo'; pontos: string[] }
  );

export type TipoBatida = Batida['tipo'];

export interface PerguntaRevisao {
  pergunta: string;
  opcoes: string[];
  /** índice da opção certa */
  certa: number;
  porque: string;
}

export interface Parada {
  id: string;
  titulo: string;
  /** uma linha que aparece no mapa */
  resumo: string;
  minutos: number;
  /** o nome da peça que vai para a maleta */
  peca: string;
  batidas: Batida[];
  /** uma ação de até 10 minutos para fazer hoje */
  hoje: string;
  revisao: PerguntaRevisao[];
}

export interface Missao {
  id: string;
  titulo: string;
  porque: string;
  tempo: string;
  passos: string[];
  registro: { pergunta: string; exemplo: string };
}

export interface Trecho {
  id: string;
  titulo: string;
  subtitulo: string;
  icone: IdIcone;
  /** trecho que pertence a um caminho de renda (os da base não têm) */
  caminho?: IdCaminho;
  paradas: Parada[];
  missao: Missao;
}

/* ---------- Caminhos de renda ---------- */

export interface Caminho {
  id: IdCaminho;
  nome: string;
  frase: string;
  icone: IdIcone;
  exemplos: string[];
  primeiroReal: string;
  investimento: string;
  teto: string;
  honesto: string;
}

/* ---------- Estado salvo no aparelho ---------- */

export interface Conclusao {
  em: string;
  acertos: number;
  total: number;
}

export interface CartaoRevisao {
  caixa: number;
  proxima: string;
}

export interface Ganho {
  id: string;
  em: string;
  valor: number;
  de: string;
}

export interface Contato {
  nome: string;
  estado: 'a-falar' | 'falei' | 'interessou' | 'comprou' | 'nao';
}

export interface Maleta {
  custos: Record<string, number>;
  hora: { sobra: number; dias: number; horas: number };
  preco: { modo: 'servico' | 'produto'; minutos: number; material: number; margem: number; hora?: number };
  clientes: { ticket: number; vezes: number; meta?: number };
  contatos: Contato[];
  oferta: { quem: string; resultado: string; como: string; preco: string };
  plano: Record<string, string>;
  textos: Record<string, string>;
}

export interface MensagemNorte {
  de: 'voce' | 'norte';
  texto: string;
  em: string;
}

export interface Ajustes {
  som: boolean;
  voz: boolean;
  tema: 'auto' | 'claro' | 'escuro';
  metaSemanal: number;
}

export interface Estado {
  v: 1;
  criadoEm: string;
  perfil: Perfil | null;
  caminho: IdCaminho | null;
  concluidas: Record<string, Conclusao>;
  missoes: Record<string, { em: string; registro: string }>;
  revisao: Record<string, CartaoRevisao>;
  dias: string[];
  ganhos: Ganho[];
  maleta: Maleta;
  norte: MensagemNorte[];
  ajustes: Ajustes;
  /** em que batida a pessoa parou em cada parada, para retomar */
  posicao: Record<string, number>;
  vistos: string[];
}
