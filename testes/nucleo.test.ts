import { describe, expect, it } from 'vitest';
import { recomendar } from '../src/nucleo/diagnostico';
import { idsDaRota, nosDaRota, andamento } from '../src/nucleo/rota';
import { agendarNovas, pendentes, responderCartao } from '../src/nucleo/revisao';
import { diasNaSemana, semanasNoRitmo } from '../src/nucleo/ritmo';
import { inicioDaSemana, reais, somarDias } from '../src/nucleo/formato';
import type { CartaoRevisao, Perfil, Trecho } from '../src/nucleo/tipos';

const base: Perfil = { nome: 'Teste', idade: '25-39', situacao: 'desempregado', urgencia: 'meses', tempo: '1h', recursos: ['celular', 'internet'], gostos: [], local: 'media', meta: 2000, sonho: '' };

describe('diagnóstico', () => {
  it('quem gosta de cozinhar e tem cozinha vai para comida', () => {
    const r = recomendar({ ...base, gostos: ['cozinhar'], recursos: ['celular', 'internet', 'cozinha'], urgencia: 'ja' });
    expect(r[0].caminho).toBe('comida');
    expect(r[0].motivos.length).toBeGreaterThan(0);
  });
  it('tecnologia cai para o fim sem computador e com pressa', () => {
    const r = recomendar({ ...base, gostos: ['computador'], urgencia: 'ja' });
    const tec = r.find((x) => x.caminho === 'tecnologia')!;
    expect(r.indexOf(tec)).toBeGreaterThan(1);
    expect(tec.avisos.length).toBeGreaterThan(0);
  });
  it('quem tem computador, tempo e pode esperar recebe tecnologia no topo', () => {
    const r = recomendar({ ...base, gostos: ['computador', 'numeros'], recursos: ['celular', 'internet', 'computador'], urgencia: 'longo', tempo: '4h' });
    expect(r[0].caminho).toBe('tecnologia');
  });
  it('sempre devolve os sete caminhos com afinidade entre 0 e 100', () => {
    const r = recomendar(base);
    expect(r).toHaveLength(7);
    r.forEach((x) => { expect(x.afinidade).toBeGreaterThanOrEqual(0); expect(x.afinidade).toBeLessThanOrEqual(100); });
  });
});

describe('rota', () => {
  it('quem tem pressa passa pelo caminho e pelos clientes antes das contas', () => {
    const ids = idsDaRota({ urgencia: 'ja' }, 'servicos');
    expect(ids.indexOf('clientes')).toBeLessThan(ids.indexOf('dinheiro'));
  });
  it('emprego não passa pelos trechos de clientes', () => {
    expect(idsDaRota({ urgencia: 'meses' }, 'emprego')).not.toContain('clientes');
  });
  it('marca a primeira parada não feita como atual e libera a missão no fim do trecho', () => {
    const p = (id: string) => ({ id, titulo: '', resumo: '', minutos: 5, peca: '', batidas: [], hoje: '', revisao: [] });
    const t: Trecho = { id: 't', titulo: '', subtitulo: '', icone: 'mapa', paradas: [p('t.a'), p('t.b')], missao: { id: 't.missao', titulo: '', porque: '', tempo: '', passos: [], registro: { pergunta: '', exemplo: '' } } };
    let nos = nosDaRota([t], { concluidas: { 't.a': { em: '', acertos: 1, total: 1 } }, missoes: {} });
    expect(nos.map((n) => n.estado)).toEqual(['feita', 'atual', 'travada']);
    nos = nosDaRota([t], { concluidas: { 't.a': { em: '', acertos: 1, total: 1 }, 't.b': { em: '', acertos: 1, total: 1 } }, missoes: {} });
    expect(nos.map((n) => n.estado)).toEqual(['feita', 'feita', 'livre']);
    expect(andamento(nos, 3).chegou).toBe(true);
  });
});

describe('revisão espaçada', () => {
  it('agenda para o dia seguinte, afasta nos acertos e volta no erro', () => {
    const c: Record<string, CartaoRevisao> = {};
    agendarNovas(c, 'x', 2, '2026-01-01');
    expect(pendentes(c, '2026-01-01')).toEqual([]);
    expect(pendentes(c, '2026-01-02')).toEqual(['x#0', 'x#1']);
    responderCartao(c, 'x#0', true, '2026-01-02');
    expect(c['x#0'].proxima).toBe('2026-01-05');
    responderCartao(c, 'x#0', false, '2026-01-05');
    expect(c['x#0']).toEqual({ caixa: 0, proxima: '2026-01-06' });
  });
});

describe('ritmo e datas', () => {
  it('a semana começa na segunda', () => {
    expect(inicioDaSemana('2026-11-11')).toBe('2026-11-09');
    expect(inicioDaSemana('2026-11-15')).toBe('2026-11-09');
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('conta semanas no ritmo sem punir a semana que ainda não fechou', () => {
    const dias = ['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-09'];
    expect(diasNaSemana(dias, '2026-11-11')).toEqual(['2026-11-09']);
    expect(semanasNoRitmo(dias, 3, '2026-11-11')).toBe(1);
    expect(semanasNoRitmo([...dias, '2026-11-10', '2026-11-11'], 3, '2026-11-11')).toBe(2);
  });
  it('formata reais', () => {
    expect(reais(4320)).toBe('R$ 4.320');
    expect(reais(7.5)).toBe('R$ 7,50');
  });
});
