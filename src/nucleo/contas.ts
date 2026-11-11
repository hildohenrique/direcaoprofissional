import type { Maleta } from './tipos';

/* As contas da maleta ficam aqui, em um lugar só, para a aula, a maleta e o mentor mostrarem os mesmos números. */

export function custoTotal(m: Maleta): number {
  return Object.values(m.custos).reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
}

export function horasVendidas(m: Maleta): number {
  return Math.max(0, m.hora.dias) * Math.max(0, m.hora.horas);
}

/** (custo do mês + o que quer que sobre) ÷ horas realmente vendidas */
export function valorHora(m: Maleta): number {
  const horas = horasVendidas(m);
  const precisa = custoTotal(m) + Math.max(0, m.hora.sobra);
  return horas > 0 && precisa > 0 ? precisa / horas : 0;
}

export function horaParaPreco(m: Maleta): number {
  return m.preco.hora && m.preco.hora > 0 ? m.preco.hora : valorHora(m);
}

export function precoMinimo(m: Maleta): number {
  if (m.preco.modo === 'produto') return m.preco.material * (1 + m.preco.margem / 100);
  return (horaParaPreco(m) * m.preco.minutos) / 60 + m.preco.material;
}

export function clientesNecessarios(m: Maleta, metaDoPerfil: number): { meta: number; vendas: number; clientes: number; porSemana: number } {
  const meta = m.clientes.meta && m.clientes.meta > 0 ? m.clientes.meta : metaDoPerfil;
  const vendas = m.clientes.ticket > 0 ? Math.ceil(meta / m.clientes.ticket) : 0;
  const clientes = vendas > 0 ? Math.ceil(vendas / Math.max(1, m.clientes.vezes)) : 0;
  return { meta, vendas, clientes, porSemana: Math.ceil(vendas / 4) };
}

export function fraseDaOferta(m: Maleta): string {
  const { quem, resultado, como, preco } = m.oferta;
  if (!quem.trim() && !resultado.trim() && !como.trim()) return '';
  const partes = [`Ajudo ${quem.trim() || '…'} a ${resultado.trim() || '…'}`];
  if (como.trim()) partes.push(`com ${como.trim()}`);
  let frase = partes.join(' ');
  if (preco.trim()) frase += `, por ${preco.trim()}`;
  return `${frase}.`;
}

export function totalGanhos(ganhos: { valor: number }[]): number {
  return ganhos.reduce((s, g) => s + g.valor, 0);
}
