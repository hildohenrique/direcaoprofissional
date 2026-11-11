import type { CartaoRevisao } from './tipos';
import { somarDias } from './formato';

/* Revisão espaçada no modelo de caixas: cada acerto empurra a pergunta para mais longe,
   cada erro traz ela de volta para amanhã. Lembrar na hora em que se está quase esquecendo
   é o que fixa o aprendizado. */
export const INTERVALOS = [1, 3, 7, 16, 35];

export const idCartao = (idParada: string, i: number) => `${idParada}#${i}`;

export function agendarNovas(cartoes: Record<string, CartaoRevisao>, idParada: string, quantas: number, hoje: string) {
  for (let i = 0; i < quantas; i++) {
    const id = idCartao(idParada, i);
    if (!cartoes[id]) cartoes[id] = { caixa: 0, proxima: somarDias(hoje, INTERVALOS[0]) };
  }
}

export function responderCartao(cartoes: Record<string, CartaoRevisao>, id: string, acertou: boolean, hoje: string) {
  const atual = cartoes[id] ?? { caixa: 0, proxima: hoje };
  const caixa = acertou ? Math.min(atual.caixa + 1, INTERVALOS.length) : 0;
  /* passou da última caixa: a pergunta sai da fila por um bom tempo */
  const dias = caixa >= INTERVALOS.length ? 90 : INTERVALOS[caixa];
  cartoes[id] = { caixa, proxima: somarDias(hoje, dias) };
}

export function pendentes(cartoes: Record<string, CartaoRevisao>, hoje: string, limite = 5): string[] {
  return Object.entries(cartoes)
    .filter(([, c]) => c.proxima <= hoje)
    .sort((a, b) => a[1].proxima.localeCompare(b[1].proxima) || a[0].localeCompare(b[0]))
    .slice(0, limite)
    .map(([id]) => id);
}
