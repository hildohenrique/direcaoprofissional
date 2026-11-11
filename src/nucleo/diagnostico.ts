import type { IdCaminho, Perfil } from './tipos';

/* O diagnóstico é uma tabela de regras simples e legível: cada regra olha um traço do perfil
   e soma ou tira pontos de um caminho. Não é um oráculo: serve para ordenar as opções e
   explicar o porquê. A decisão final é sempre da pessoa. */

interface Regra {
  se: (p: Perfil) => boolean;
  para: Partial<Record<IdCaminho, number>>;
  /** frase mostrada quando a regra ajuda um caminho */
  motivo?: string;
  /** frase mostrada quando a regra pesa contra um caminho */
  aviso?: string;
}

const gosta = (g: Perfil['gostos'][number]) => (p: Perfil) => p.gostos.includes(g);
const tem = (r: Perfil['recursos'][number]) => (p: Perfil) => p.recursos.includes(r);
const naoTem = (r: Perfil['recursos'][number]) => (p: Perfil) => !p.recursos.includes(r);

export const REGRAS: Regra[] = [
  /* do que a pessoa gosta */
  { se: gosta('pessoas'), para: { servicos: 2, ensinar: 2, vendas: 2, emprego: 1 }, motivo: 'Você gosta de lidar com gente' },
  { se: gosta('maos'), para: { servicos: 3, comida: 2 }, motivo: 'Você gosta de trabalhar com as mãos' },
  { se: gosta('computador'), para: { digital: 3, tecnologia: 3, emprego: 1 }, motivo: 'Você se dá bem com computador e celular' },
  { se: gosta('cozinhar'), para: { comida: 5 }, motivo: 'Você gosta de cozinhar' },
  { se: gosta('vender'), para: { vendas: 4, servicos: 1, comida: 1 }, motivo: 'Você gosta de vender e negociar' },
  { se: gosta('ensinar'), para: { ensinar: 5 }, motivo: 'Você gosta de explicar e ensinar' },
  { se: gosta('criar'), para: { digital: 3, comida: 1, servicos: 1 }, motivo: 'Você gosta de criar e deixar as coisas bonitas' },
  { se: gosta('numeros'), para: { tecnologia: 2, emprego: 2, vendas: 1 }, motivo: 'Você gosta de números e lógica' },
  { se: gosta('organizar'), para: { emprego: 2, digital: 2, vendas: 1 }, motivo: 'Você é uma pessoa organizada' },

  /* o que a pessoa tem à mão */
  { se: tem('computador'), para: { digital: 2, tecnologia: 4 }, motivo: 'Você já tem computador' },
  { se: naoTem('computador'), para: { tecnologia: -7, digital: -1 }, aviso: 'Sem computador, este caminho fica bem mais difícil' },
  { se: tem('cozinha'), para: { comida: 3 }, motivo: 'Você já tem cozinha para produzir' },
  { se: naoTem('cozinha'), para: { comida: -6 }, aviso: 'Sem uma cozinha disponível, não dá para produzir' },
  { se: tem('ferramentas'), para: { servicos: 3 }, motivo: 'Você já tem ferramentas ou material de trabalho' },
  { se: tem('veiculo'), para: { servicos: 1, comida: 1, vendas: 1 }, motivo: 'Ter como se deslocar ajuda nas entregas e atendimentos' },
  { se: tem('dinheiro'), para: { vendas: 2, comida: 1 }, motivo: 'Você tem um valor para o primeiro estoque ou material' },
  { se: naoTem('internet'), para: { digital: -5, tecnologia: -5, vendas: -1 }, aviso: 'Depende de internet boa todo dia' },

  /* pressa */
  { se: (p) => p.urgencia === 'ja', para: { servicos: 3, comida: 3, vendas: 2, ensinar: 1 }, motivo: 'Dá para receber já nos primeiros dias' },
  { se: (p) => p.urgencia === 'ja', para: { tecnologia: -5, digital: -1 }, aviso: 'Demora para dar o primeiro dinheiro, e você precisa para agora' },
  { se: (p) => p.urgencia === 'longo', para: { tecnologia: 3, emprego: 2, digital: 1 }, motivo: 'Você pode investir tempo antes de colher' },

  /* tempo livre */
  { se: (p) => p.tempo === '30min', para: { tecnologia: -3, comida: -1 }, aviso: 'Pede mais tempo por dia do que você tem hoje' },
  { se: (p) => p.tempo === '4h', para: { tecnologia: 1, emprego: 1 }, motivo: 'Você tem bastante tempo por dia para se dedicar' },

  /* momento de vida */
  { se: (p) => p.situacao === 'clt', para: { emprego: 3 }, motivo: 'Você já está empregado e pode crescer de onde está' },
  { se: (p) => p.situacao === 'desempregado', para: { emprego: 3, servicos: 1 }, motivo: 'Você está livre para começar agora' },
  { se: (p) => p.situacao === 'estudando', para: { emprego: 2, digital: 1, tecnologia: 1, ensinar: 1 }, motivo: 'Combina com a rotina de quem estuda' },
  { se: (p) => p.situacao === 'casa', para: { comida: 1, vendas: 1, digital: 1 }, motivo: 'Dá para fazer de casa' },
  { se: (p) => p.situacao === 'autonomo', para: { servicos: 1, vendas: 1 }, motivo: 'Você já sabe o que é trabalhar por conta' },
  { se: (p) => p.situacao === 'aposentado', para: { ensinar: 2, comida: 1, servicos: 1 }, motivo: 'A sua experiência conta a favor' },
  { se: (p) => p.situacao === 'aposentado', para: { emprego: -3, tecnologia: -2 }, aviso: 'O retorno demora, e o mercado costuma ser duro com quem já se aposentou' },

  /* idade */
  { se: (p) => p.idade === 'm16', para: { emprego: 2, tecnologia: 2, digital: 1, ensinar: 1 }, motivo: 'Começar cedo é a sua maior vantagem' },
  { se: (p) => p.idade === '16-17', para: { emprego: 3, tecnologia: 2, digital: 1 }, motivo: 'Aprendiz e estágio são portas abertas na sua idade' },
  { se: (p) => p.idade === '60+', para: { ensinar: 2 }, motivo: 'Você tem bagagem para passar adiante' },
  { se: (p) => p.idade === '60+', para: { emprego: -3 }, aviso: 'As vagas são mais raras para quem passou dos 60' },

  /* onde mora */
  { se: (p) => p.local === 'pequena' || p.local === 'rural', para: { digital: 1, tecnologia: 1, servicos: 1 }, motivo: 'Funciona bem em cidade pequena' },
];

export interface Recomendacao {
  caminho: IdCaminho;
  /** 0 a 100, relativo ao caminho mais forte */
  afinidade: number;
  motivos: string[];
  avisos: string[];
}

const TODOS: IdCaminho[] = ['servicos', 'comida', 'vendas', 'digital', 'ensinar', 'emprego', 'tecnologia'];

export function recomendar(perfil: Perfil): Recomendacao[] {
  const pontos = Object.fromEntries(TODOS.map((c) => [c, 0])) as Record<IdCaminho, number>;
  const motivos = Object.fromEntries(TODOS.map((c) => [c, [] as { texto: string; peso: number }[]])) as Record<IdCaminho, { texto: string; peso: number }[]>;
  const avisos = Object.fromEntries(TODOS.map((c) => [c, [] as string[]])) as Record<IdCaminho, string[]>;

  for (const regra of REGRAS) {
    if (!regra.se(perfil)) continue;
    for (const [c, valor] of Object.entries(regra.para) as [IdCaminho, number][]) {
      pontos[c] += valor;
      if (valor > 0 && regra.motivo) motivos[c].push({ texto: regra.motivo, peso: valor });
      if (valor < 0 && regra.aviso) avisos[c].push(regra.aviso);
    }
  }

  const maior = Math.max(...Object.values(pontos), 1);
  const menor = Math.min(...Object.values(pontos), 0);
  return TODOS.map((c) => ({
    caminho: c,
    afinidade: Math.round(((pontos[c] - menor) / (maior - menor || 1)) * 100),
    motivos: motivos[c].sort((a, b) => b.peso - a.peso).slice(0, 3).map((m) => m.texto),
    avisos: avisos[c].slice(0, 2),
  })).sort((a, b) => b.afinidade - a.afinidade || TODOS.indexOf(a.caminho) - TODOS.indexOf(b.caminho));
}

/** Avisos que valem para qualquer caminho, por causa da idade. */
export function avisoDeIdade(perfil: Perfil): string | null {
  if (perfil.idade === 'm16') {
    return 'Com menos de 16 anos, a lei brasileira só permite trabalhar como aprendiz, a partir dos 14. Aqui você vai construir habilidades e pode treinar vendendo com um responsável junto. Chame alguém da família para acompanhar a sua rota.';
  }
  if (perfil.idade === '16-17') {
    return 'Com 16 ou 17 anos você já pode trabalhar, com algumas proteções: nada de trabalho noturno, perigoso ou insalubre. Combine os seus planos com um responsável.';
  }
  return null;
}
