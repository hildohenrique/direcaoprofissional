import { useSyncExternalStore } from 'react';
import type { Estado, IdCaminho, Maleta, Perfil } from './tipos';
import { diaLocal } from './formato';
import { agendarNovas, responderCartao } from './revisao';

const CHAVE = 'direcao-profissional:v1';

export const CUSTOS_PADRAO: { id: string; rotulo: string; dica: string }[] = [
  { id: 'moradia', rotulo: 'Moradia', dica: 'aluguel, prestação, condomínio' },
  { id: 'comida', rotulo: 'Comida', dica: 'mercado, feira, padaria, gás' },
  { id: 'contas', rotulo: 'Contas da casa', dica: 'água, luz, internet, celular' },
  { id: 'transporte', rotulo: 'Transporte', dica: 'ônibus, combustível, aplicativo' },
  { id: 'saude', rotulo: 'Saúde', dica: 'remédio, plano, consulta' },
  { id: 'familia', rotulo: 'Família', dica: 'escola, fralda, ajuda a parentes' },
  { id: 'dividas', rotulo: 'Dívidas e parcelas', dica: 'cartão, empréstimo, crediário' },
  { id: 'outros', rotulo: 'O resto', dica: 'roupa, lazer, imprevistos' },
];

function maletaVazia(): Maleta {
  return {
    custos: {},
    hora: { sobra: 0, dias: 22, horas: 6 },
    preco: { modo: 'servico', minutos: 60, material: 0, margem: 20 },
    clientes: { ticket: 0, vezes: 1 },
    contatos: [],
    oferta: { quem: '', resultado: '', como: '', preco: '' },
    plano: {},
    textos: {},
  };
}

export function estadoInicial(): Estado {
  return {
    v: 1,
    criadoEm: new Date().toISOString(),
    perfil: null,
    caminho: null,
    concluidas: {},
    missoes: {},
    revisao: {},
    dias: [],
    ganhos: [],
    maleta: maletaVazia(),
    norte: [],
    ajustes: { som: true, voz: false, tema: 'auto', metaSemanal: 3 },
    posicao: {},
    vistos: [],
  };
}

function carregar(): Estado {
  try {
    const bruto = globalThis.localStorage?.getItem(CHAVE);
    if (!bruto) return estadoInicial();
    const salvo = JSON.parse(bruto) as Partial<Estado>;
    const base = estadoInicial();
    /* mescla campo a campo: versões novas do app ganham campos sem perder o que a pessoa já fez */
    return {
      ...base,
      ...salvo,
      v: 1,
      maleta: { ...base.maleta, ...salvo.maleta },
      ajustes: { ...base.ajustes, ...salvo.ajustes },
    };
  } catch {
    return estadoInicial();
  }
}

let estado: Estado = carregar();
const ouvintes = new Set<() => void>();

function salvar() {
  try {
    globalThis.localStorage?.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* armazenamento cheio ou bloqueado: o app segue funcionando na memória */
  }
}

export function lerEstado(): Estado {
  return estado;
}

/** Altera o estado: a receita recebe uma cópia e mexe nela à vontade. */
export function mudar(receita: (rascunho: Estado) => void) {
  const rascunho = structuredClone(estado);
  receita(rascunho);
  estado = rascunho;
  salvar();
  ouvintes.forEach((f) => f());
}

export function substituirEstado(novo: Estado) {
  estado = novo;
  salvar();
  ouvintes.forEach((f) => f());
}

function assinar(f: () => void) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

export function useEstado(): Estado {
  return useSyncExternalStore(assinar, lerEstado, lerEstado);
}

/* ---------- Ações ---------- */

function marcarDia(e: Estado, hoje = diaLocal()) {
  if (!e.dias.includes(hoje)) e.dias = [...e.dias, hoje].slice(-400);
}

export const acoes = {
  definirPerfil(perfil: Perfil) {
    mudar((e) => {
      e.perfil = perfil;
    });
  },
  escolherCaminho(caminho: IdCaminho) {
    mudar((e) => {
      e.caminho = caminho;
    });
  },
  concluirParada(id: string, acertos: number, total: number, perguntas: number) {
    mudar((e) => {
      const primeira = !e.concluidas[id];
      e.concluidas[id] = { em: new Date().toISOString(), acertos, total };
      delete e.posicao[id];
      marcarDia(e);
      if (primeira) agendarNovas(e.revisao, id, perguntas, diaLocal());
    });
  },
  guardarPosicao(id: string, batida: number) {
    mudar((e) => {
      e.posicao[id] = batida;
    });
  },
  concluirMissao(id: string, registro: string) {
    mudar((e) => {
      e.missoes[id] = { em: new Date().toISOString(), registro };
      marcarDia(e);
    });
  },
  responderRevisao(idCartao: string, acertou: boolean) {
    mudar((e) => {
      responderCartao(e.revisao, idCartao, acertou, diaLocal());
      marcarDia(e);
    });
  },
  adicionarGanho(valor: number, de: string, em: string = diaLocal()) {
    mudar((e) => {
      e.ganhos.push({ id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, em, valor, de });
      marcarDia(e);
    });
  },
  removerGanho(id: string) {
    mudar((e) => {
      e.ganhos = e.ganhos.filter((g) => g.id !== id);
    });
  },
  maleta(receita: (m: Maleta) => void) {
    mudar((e) => receita(e.maleta));
  },
  salvarTexto(chave: string, texto: string) {
    mudar((e) => {
      e.maleta.textos[chave] = texto;
    });
  },
  falaNorte(de: 'voce' | 'norte', texto: string) {
    mudar((e) => {
      e.norte = [...e.norte, { de, texto, em: new Date().toISOString() }].slice(-60);
    });
  },
  limparNorte() {
    mudar((e) => {
      e.norte = [];
    });
  },
  ajustar(receita: (a: Estado['ajustes']) => void) {
    mudar((e) => receita(e.ajustes));
  },
  marcarVisto(chave: string) {
    mudar((e) => {
      if (!e.vistos.includes(chave)) e.vistos.push(chave);
    });
  },
  recomecar() {
    substituirEstado(estadoInicial());
  },
};
