import { afterEach, describe, expect, it } from 'vitest';
import { responderNorte } from '../servidor/norte';

const pedir = (corpo: unknown, metodo = 'POST') => responderNorte(new Request('http://local/api/norte', { method: metodo, headers: { 'content-type': 'application/json' }, body: metodo === 'POST' ? JSON.stringify(corpo) : undefined }));

describe('servidor do Norte', () => {
  const chave = process.env.ANTHROPIC_API_KEY;
  const token = process.env.ANTHROPIC_AUTH_TOKEN;
  afterEach(() => {
    if (chave === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = chave;
    if (token === undefined) delete process.env.ANTHROPIC_AUTH_TOKEN; else process.env.ANTHROPIC_AUTH_TOKEN = token;
    delete process.env.NORTE_EXIGE_LOGIN;
  });

  it('só aceita POST', async () => {
    expect((await pedir(null, 'GET')).status).toBe(405);
  });

  it('avisa que está desligado quando não há chave da IA', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_AUTH_TOKEN;
    const r = await pedir({ mensagens: [{ de: 'voce', texto: 'oi' }] });
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ erro: 'sem-ia' });
  });

  it('recusa conversa vazia ou que não termina com a pessoa', async () => {
    process.env.ANTHROPIC_API_KEY = 'chave-de-teste';
    expect((await pedir({ mensagens: [] })).status).toBe(400);
    expect((await pedir({ mensagens: [{ de: 'voce', texto: 'oi' }, { de: 'norte', texto: 'olá' }] })).status).toBe(400);
  });

  it('exige login quando configurado', async () => {
    process.env.ANTHROPIC_API_KEY = 'chave-de-teste';
    process.env.NORTE_EXIGE_LOGIN = '1';
    expect((await pedir({ mensagens: [{ de: 'voce', texto: 'oi' }] })).status).toBe(401);
  });
});
