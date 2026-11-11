import type { Estado, IdCaminho, Parada, PerguntaRevisao, Perfil, Trecho } from '@/nucleo/tipos';
import { idsDaRota } from '@/nucleo/rota';

/* Cada arquivo em ./trechos exporta um Trecho. Basta criar o arquivo: ele entra na biblioteca sozinho. */
const modulos = import.meta.glob<Record<string, unknown>>('./trechos/*.ts', { eager: true });

function ehTrecho(x: unknown): x is Trecho {
  return typeof x === 'object' && x !== null && Array.isArray((x as Trecho).paradas) && typeof (x as Trecho).id === 'string';
}

export const TRECHOS: Record<string, Trecho> = {};
for (const modulo of Object.values(modulos)) {
  for (const valor of Object.values(modulo)) {
    if (ehTrecho(valor)) TRECHOS[valor.id] = valor;
  }
}

const PARADAS: Record<string, { parada: Parada; trecho: Trecho }> = {};
for (const trecho of Object.values(TRECHOS)) {
  for (const parada of trecho.paradas) PARADAS[parada.id] = { parada, trecho };
}

export function acharParada(id: string) {
  return PARADAS[id] ?? null;
}

export function acharMissao(id: string) {
  const trecho = Object.values(TRECHOS).find((t) => t.missao.id === id);
  return trecho ? { missao: trecho.missao, trecho } : null;
}

/** A rota da pessoa: os trechos que existem na biblioteca, na ordem certa para o perfil dela. */
export function montarRota(perfil: Perfil | null, caminho: IdCaminho | null): Trecho[] {
  return idsDaRota(perfil, caminho)
    .map((id) => TRECHOS[id])
    .filter((t): t is Trecho => Boolean(t));
}

export function rotaDoEstado(e: Pick<Estado, 'perfil' | 'caminho'>): Trecho[] {
  return montarRota(e.perfil, e.caminho);
}

export function acharPergunta(idCartao: string): { pergunta: PerguntaRevisao; parada: Parada } | null {
  const [idParada, indice] = idCartao.split('#');
  const achado = PARADAS[idParada];
  const pergunta = achado?.parada.revisao[Number(indice)];
  return achado && pergunta ? { pergunta, parada: achado.parada } : null;
}

/** O nome amigável de cada texto que a pessoa escreveu nas paradas (chave -> rótulo). */
export const ROTULOS_DOS_TEXTOS: Record<string, string> = {};
for (const { parada } of Object.values(PARADAS)) {
  for (const b of parada.batidas) if (b.tipo === 'escrever') ROTULOS_DOS_TEXTOS[b.chave] = b.rotulo;
}
