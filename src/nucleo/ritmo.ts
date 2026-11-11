import { inicioDaSemana, somarDias } from './formato';

/* Ritmo semanal em vez de sequência diária: a meta é aparecer alguns dias por semana.
   Quem falha um dia não perde nada; o que conta é fechar a semana. */

export function diasNaSemana(dias: string[], hoje: string): string[] {
  const inicio = inicioDaSemana(hoje);
  const fim = somarDias(inicio, 6);
  return dias.filter((d) => d >= inicio && d <= fim);
}

/** Semanas seguidas em que a meta foi batida. A semana atual conta se já fechou a meta e não quebra a contagem se ainda não fechou. */
export function semanasNoRitmo(dias: string[], meta: number, hoje: string): number {
  let semana = inicioDaSemana(hoje);
  let total = 0;
  if (diasNaSemana(dias, semana).length >= meta) total += 1;
  for (;;) {
    semana = somarDias(semana, -7);
    if (diasNaSemana(dias, semana).length >= meta) total += 1;
    else break;
    if (total > 520) break;
  }
  return total;
}

/** Sete posições, de segunda a domingo: a pessoa apareceu nesse dia? */
export function semanaMarcada(dias: string[], hoje: string): { dia: string; feito: boolean; hoje: boolean; futuro: boolean }[] {
  const inicio = inicioDaSemana(hoje);
  return Array.from({ length: 7 }, (_, i) => {
    const dia = somarDias(inicio, i);
    return { dia, feito: dias.includes(dia), hoje: dia === hoje, futuro: dia > hoje };
  });
}
