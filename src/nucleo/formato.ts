import type { Formato } from './tipos';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brlCentavos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** R$ 1.250 — sem centavos quando o valor é redondo, com centavos quando não é */
export function reais(v: number): string {
  if (!Number.isFinite(v)) return 'R$ 0';
  return (Number.isInteger(v) ? brl : brlCentavos).format(v).replace(/ /g, ' ');
}

export function formatar(v: number, formato: Formato = 'numero'): string {
  switch (formato) {
    case 'reais':
      return reais(v);
    case 'porcento':
      return `${decimal.format(v)}%`;
    case 'horas':
      return `${decimal.format(v)} h`;
    case 'dias':
      return `${inteiro.format(v)} ${v === 1 ? 'dia' : 'dias'}`;
    case 'pessoas':
      return `${inteiro.format(v)} ${v === 1 ? 'pessoa' : 'pessoas'}`;
    default:
      return decimal.format(v);
  }
}

/** "2026-11-11" no fuso do aparelho */
export function diaLocal(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function somarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split('-').map(Number);
  return diaLocal(new Date(a, m - 1, d + n));
}

/** segunda-feira da semana de um dia */
export function inicioDaSemana(dia: string): string {
  const [a, m, d] = dia.split('-').map(Number);
  const data = new Date(a, m - 1, d);
  const desloc = (data.getDay() + 6) % 7;
  return diaLocal(new Date(a, m - 1, d - desloc));
}

export function dataCurta(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? '';
}
