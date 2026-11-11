import { describe, expect, it } from 'vitest';
import { TRECHOS } from '../src/conteudo/index';
import { CAMINHOS, ORDEM_CAMINHOS } from '../src/conteudo/caminhos';
import { PERSONAGENS } from '../src/conteudo/personagens';
import { idsDaRota } from '../src/nucleo/rota';
import type { Batida, Cena, Parada, Trecho } from '../src/nucleo/tipos';

/* Este teste é o revisor automático do conteúdo. Ele garante o formato e as regras de ensino
   que estão no guia (docs/guia-de-conteudo.md). Se ele reclamar, conserte o conteúdo, não o teste. */

const INTERATIVAS = new Set(['escolha', 'estimativa', 'ordenar', 'separar', 'conversa', 'ferramenta', 'escrever']);
const PROIBIDAS = [/—/, /\bfique rico\b/i, /\bdinheiro fácil\b/i, /\brenda garantida\b/i, /\bganhe dinheiro dormindo\b/i];

function textosDaBatida(b: Batida): string[] {
  const t: (string | undefined)[] = [b.k];
  switch (b.tipo) {
    case 'fala': t.push(b.t, b.texto, ...(b.pontos ?? [])); break;
    case 'historia': t.push(b.t, b.texto); break;
    case 'escolha': t.push(b.pergunta, ...b.opcoes.flatMap((o) => [o.texto, o.retorno])); break;
    case 'estimativa': t.push(b.pergunta, b.retorno); break;
    case 'ordenar': t.push(b.pergunta, b.retorno, ...b.itens); break;
    case 'separar': t.push(b.pergunta, b.retorno, ...b.grupos, ...b.itens.map((i) => i.texto)); break;
    case 'conversa': t.push(b.contexto, b.contato, ...b.trocas.flatMap((x) => (x.de === 'outro' ? [x.texto] : x.opcoes.flatMap((o) => [o.texto, o.retorno, o.resposta])))); break;
    case 'ferramenta': t.push(b.t, b.texto); break;
    case 'escrever': t.push(b.pergunta, b.ajuda, b.exemplo, b.rotulo); break;
    case 'resumo': t.push(...b.pontos); break;
  }
  return t.filter((x): x is string => typeof x === 'string');
}

function conferirCena(cena: Cena, onde: string) {
  switch (cena.tipo) {
    case 'pessoa': expect(PERSONAGENS[cena.quem], `${onde}: personagem da cena`).toBeTruthy(); if (cena.fala) expect(cena.fala.length, `${onde}: fala do balão curta`).toBeLessThanOrEqual(60); break;
    case 'barras': expect(cena.itens.length, `${onde}: barras`).toBeGreaterThanOrEqual(2); expect(cena.itens.length).toBeLessThanOrEqual(5); break;
    case 'fatias': expect(cena.itens.length, `${onde}: fatias`).toBeGreaterThanOrEqual(2); expect(cena.itens.length).toBeLessThanOrEqual(5); break;
    case 'escada': expect(cena.degraus.length, `${onde}: escada`).toBeGreaterThanOrEqual(3); expect(cena.degraus.length).toBeLessThanOrEqual(5); break;
    case 'comparar': expect(cena.a.linhas.length + cena.b.linhas.length, `${onde}: comparar`).toBeLessThanOrEqual(8); break;
    case 'celular': expect(cena.linhas.length, `${onde}: celular`).toBeLessThanOrEqual(4); break;
    case 'lista': expect(cena.itens.length, `${onde}: lista`).toBeLessThanOrEqual(5); break;
    case 'trilha': expect(cena.pontos.length, `${onde}: trilha`).toBeGreaterThanOrEqual(3); expect(cena.pontos.length).toBeLessThanOrEqual(5); break;
    default: break;
  }
}

function conferirParada(p: Parada, trecho: Trecho) {
  const onde = p.id;
  expect(p.id.startsWith(`${trecho.id}.`), `${onde}: id começa com o id do trecho`).toBe(true);
  expect(p.titulo.length, `${onde}: título curto`).toBeLessThanOrEqual(42);
  expect(p.resumo.length, `${onde}: resumo curto`).toBeLessThanOrEqual(52);
  expect(p.minutos).toBeGreaterThanOrEqual(4);
  expect(p.minutos).toBeLessThanOrEqual(9);
  expect(p.batidas.length, `${onde}: entre 9 e 14 batidas`).toBeGreaterThanOrEqual(9);
  expect(p.batidas.length, `${onde}: entre 9 e 14 batidas`).toBeLessThanOrEqual(14);
  expect(p.hoje.length, `${onde}: tem ação de hoje`).toBeGreaterThan(20);
  expect(p.revisao.length, `${onde}: 2 ou 3 perguntas de revisão`).toBeGreaterThanOrEqual(2);
  expect(p.revisao.length).toBeLessThanOrEqual(3);

  const tipos = p.batidas.map((b) => b.tipo);
  expect(tipos[tipos.length - 1], `${onde}: termina com resumo`).toBe('resumo');
  expect(tipos.filter((t) => t === 'resumo').length, `${onde}: um resumo só`).toBe(1);
  expect(['historia', 'estimativa', 'escolha'], `${onde}: abre com história ou pergunta, nunca com definição`).toContain(tipos[0]);
  expect(tipos.filter((t) => INTERATIVAS.has(t)).length, `${onde}: pelo menos 4 interações`).toBeGreaterThanOrEqual(4);
  expect(new Set(tipos.filter((t) => INTERATIVAS.has(t))).size, `${onde}: pelo menos 3 tipos de interação diferentes`).toBeGreaterThanOrEqual(3);

  let seguidas = 0;
  p.batidas.forEach((b, i) => {
    const aqui = `${onde} batida ${i + 1} (${b.tipo})`;
    seguidas = INTERATIVAS.has(b.tipo) ? 0 : seguidas + 1;
    expect(seguidas, `${aqui}: no máximo 2 batidas de leitura seguidas`).toBeLessThanOrEqual(2);
    if (b.cena) conferirCena(b.cena, aqui);
    for (const texto of textosDaBatida(b)) {
      for (const proibida of PROIBIDAS) expect(proibida.test(texto), `${aqui}: texto proibido ${proibida} em "${texto}"`).toBe(false);
    }
    switch (b.tipo) {
      case 'fala':
        expect(b.t.length, `${aqui}: título`).toBeLessThanOrEqual(60);
        expect((b.texto ?? '').length, `${aqui}: texto de até 260 caracteres`).toBeLessThanOrEqual(260);
        expect((b.pontos ?? []).length, `${aqui}: até 4 pontos`).toBeLessThanOrEqual(4);
        expect(Boolean(b.texto) || Boolean(b.pontos?.length), `${aqui}: precisa de texto ou pontos`).toBe(true);
        break;
      case 'historia':
        expect(PERSONAGENS[b.quem], `${aqui}: personagem`).toBeTruthy();
        expect(b.texto.length, `${aqui}: história de até 300 caracteres`).toBeLessThanOrEqual(300);
        break;
      case 'escolha':
        expect(b.opcoes.length, `${aqui}: 2 a 4 opções`).toBeGreaterThanOrEqual(2);
        expect(b.opcoes.length).toBeLessThanOrEqual(4);
        if (b.semCerta) expect(b.opcoes.some((o) => o.certa), `${aqui}: pergunta de opinião não tem certa`).toBe(false);
        else expect(b.opcoes.filter((o) => o.certa).length, `${aqui}: exatamente uma opção certa`).toBe(1);
        b.opcoes.forEach((o) => {
          expect(o.texto.length, `${aqui}: opção curta`).toBeLessThanOrEqual(120);
          expect(o.retorno.length, `${aqui}: todo retorno explica o porquê`).toBeGreaterThan(25);
          expect(o.retorno.length, `${aqui}: retorno de até 240 caracteres`).toBeLessThanOrEqual(240);
        });
        break;
      case 'estimativa':
        expect(b.resposta, `${aqui}: resposta dentro da régua`).toBeGreaterThanOrEqual(b.min);
        expect(b.resposta).toBeLessThanOrEqual(b.max);
        expect(Math.abs((b.resposta - b.min) / b.passo - Math.round((b.resposta - b.min) / b.passo)), `${aqui}: resposta alcançável com o passo`).toBeLessThan(1e-9);
        expect((b.max - b.min) / b.passo, `${aqui}: régua com 8 a 80 posições`).toBeGreaterThanOrEqual(8);
        expect((b.max - b.min) / b.passo).toBeLessThanOrEqual(80);
        expect(b.retorno.length).toBeGreaterThan(30);
        break;
      case 'ordenar':
        expect(b.itens.length, `${aqui}: 3 a 5 itens`).toBeGreaterThanOrEqual(3);
        expect(b.itens.length).toBeLessThanOrEqual(5);
        b.itens.forEach((t) => expect(t.length, `${aqui}: item curto`).toBeLessThanOrEqual(60));
        break;
      case 'separar':
        expect(b.itens.length, `${aqui}: 4 a 6 itens`).toBeGreaterThanOrEqual(4);
        expect(b.itens.length).toBeLessThanOrEqual(6);
        expect(new Set(b.itens.map((i) => i.grupo)).size, `${aqui}: os dois grupos são usados`).toBe(2);
        b.grupos.forEach((g) => expect(g.length, `${aqui}: nome de grupo curto`).toBeLessThanOrEqual(22));
        b.itens.forEach((t) => expect(t.texto.length, `${aqui}: item curto`).toBeLessThanOrEqual(60));
        break;
      case 'conversa': {
        expect(b.trocas[0].de, `${aqui}: a outra pessoa começa`).toBe('outro');
        const vezes = b.trocas.filter((t) => t.de === 'voce');
        expect(vezes.length, `${aqui}: 1 a 3 decisões`).toBeGreaterThanOrEqual(1);
        expect(vezes.length).toBeLessThanOrEqual(3);
        for (const t of vezes) {
          if (t.de !== 'voce') continue;
          expect(t.opcoes.length, `${aqui}: 2 ou 3 respostas possíveis`).toBeGreaterThanOrEqual(2);
          expect(t.opcoes.length).toBeLessThanOrEqual(3);
          expect(t.opcoes.filter((o) => o.nota === 'boa').length, `${aqui}: uma resposta boa por decisão`).toBe(1);
          t.opcoes.forEach((o) => expect(o.texto.length, `${aqui}: mensagem de até 190 caracteres`).toBeLessThanOrEqual(190));
        }
        break;
      }
      case 'escrever':
        expect(/^[a-z0-9-]+$/.test(b.chave), `${aqui}: chave em minúsculas com hífen`).toBe(true);
        expect(b.rotulo.length).toBeLessThanOrEqual(40);
        break;
      case 'resumo':
        expect(b.pontos.length, `${aqui}: 3 pontos`).toBe(3);
        b.pontos.forEach((t) => expect(t.length, `${aqui}: ponto curto`).toBeLessThanOrEqual(110));
        break;
      default:
        break;
    }
  });

  p.revisao.forEach((r, i) => {
    expect(r.opcoes.length, `${onde} revisão ${i + 1}: 3 opções`).toBe(3);
    expect(r.certa).toBeGreaterThanOrEqual(0);
    expect(r.certa).toBeLessThan(3);
    expect(r.porque.length).toBeGreaterThan(20);
  });
}

describe('conteúdo', () => {
  const trechos = Object.values(TRECHOS);

  it('tem trechos', () => {
    expect(trechos.length).toBeGreaterThan(0);
  });

  it('não repete ids', () => {
    const ids = trechos.flatMap((t) => [t.missao.id, ...t.paradas.map((p) => p.id)]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const trecho of trechos) {
    describe(`trecho ${trecho.id}`, () => {
      it('tem estrutura completa', () => {
        expect(trecho.paradas.length, 'de 3 a 6 paradas').toBeGreaterThanOrEqual(3);
        expect(trecho.paradas.length).toBeLessThanOrEqual(6);
        expect(trecho.missao.id).toBe(`${trecho.id}.missao`);
        expect(trecho.missao.passos.length).toBeGreaterThanOrEqual(3);
        expect(trecho.missao.passos.length).toBeLessThanOrEqual(6);
        if (trecho.caminho) expect(CAMINHOS[trecho.caminho]).toBeTruthy();
      });
      for (const parada of trecho.paradas) {
        it(`parada ${parada.id} segue o guia`, () => conferirParada(parada, trecho));
      }
    });
  }

  it('toda rota possível só usa trechos que existem', () => {
    const faltando = new Set<string>();
    for (const caminho of ORDEM_CAMINHOS) {
      for (const urgencia of ['ja', 'meses', 'longo'] as const) {
        for (const id of idsDaRota({ urgencia }, caminho)) if (!TRECHOS[id]) faltando.add(id);
      }
    }
    expect([...faltando], 'trechos que a rota pede e ainda não existem').toEqual([]);
  });
});
