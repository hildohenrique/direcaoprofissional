import type { Estado } from '@/nucleo/tipos';
import { andamento, nosDaRota } from '@/nucleo/rota';
import { acharMissao, acharParada, rotaDoEstado, ROTULOS_DOS_TEXTOS } from '@/conteudo';
import { CAMINHOS } from '@/conteudo/caminhos';
import { clientesNecessarios, custoTotal, fraseDaOferta, precoMinimo, totalGanhos, valorHora } from '@/nucleo/contas';
import { reais } from '@/nucleo/formato';
import { tokenDaConta } from '@/nucleo/nuvem';

const IDADE = { m16: 'menos de 16 anos', '16-17': '16 ou 17 anos', '18-24': '18 a 24 anos', '25-39': '25 a 39 anos', '40-59': '40 a 59 anos', '60+': '60 anos ou mais' };
const SITUACAO = { estudando: 'estudando', desempregado: 'sem trabalho no momento', clt: 'empregado com carteira', autonomo: 'trabalha por conta', casa: 'cuida da casa e da família', aposentado: 'aposentado' };
const URGENCIA = { ja: 'precisa do dinheiro para agora', meses: 'precisa nos próximos meses', longo: 'pode construir com calma' };
const TEMPO = { '30min': 'uns 30 minutos', '1h': 'cerca de 1 hora', '2h': 'umas 2 horas', '4h': '4 horas ou mais' };
const LOCAL = { capital: 'capital ou cidade grande', media: 'cidade média', pequena: 'cidade pequena', rural: 'zona rural' };

/** O retrato da pessoa que acompanha cada pergunta ao Norte. Só o necessário, nada de dados sensíveis. */
export function contextoParaNorte(e: Estado) {
  const p = e.perfil;
  const nos = nosDaRota(rotaDoEstado(e), e);
  const a = andamento(nos, e.ajustes.metaSemanal);
  const ultima = Object.entries(e.concluidas).sort((x, y) => y[1].em.localeCompare(x[1].em))[0]?.[0];
  const m = e.maleta;
  const numeros: Record<string, string> = {};
  if (custoTotal(m) > 0) numeros['Custo do mês'] = reais(custoTotal(m));
  if (valorHora(m) > 0) numeros['Valor da hora calculado'] = reais(Math.ceil(valorHora(m)));
  if (precoMinimo(m) > 0) numeros['Preço mínimo calculado'] = reais(Math.ceil(precoMinimo(m)));
  if (m.clientes.ticket > 0) numeros['Vendas necessárias por mês'] = String(clientesNecessarios(m, p?.meta ?? 0).vendas);
  if (fraseDaOferta(m)) numeros['Oferta em uma frase'] = fraseDaOferta(m);
  if (m.contatos.length) numeros['Lista quente'] = `${m.contatos.length} nomes, ${m.contatos.filter((c) => c.estado === 'comprou').length} compraram`;
  const textos: Record<string, string> = {};
  for (const [chave, texto] of Object.entries(m.textos)) if (texto.trim()) textos[ROTULOS_DOS_TEXTOS[chave] ?? chave] = texto;
  for (const [id, missao] of Object.entries(e.missoes)) {
    const achada = acharMissao(id);
    if (achada && missao.registro.trim()) textos[`Relato da missão "${achada.missao.titulo}"`] = missao.registro;
  }
  return {
    nome: p?.nome,
    idade: p ? IDADE[p.idade] : undefined,
    situacao: p ? SITUACAO[p.situacao] : undefined,
    urgencia: p ? URGENCIA[p.urgencia] : undefined,
    tempo: p ? TEMPO[p.tempo] : undefined,
    local: p ? LOCAL[p.local] : undefined,
    meta: p?.meta,
    sonho: p?.sonho,
    caminho: e.caminho ? CAMINHOS[e.caminho].nome : undefined,
    paradasFeitas: a.feitas,
    paradasTotal: a.total,
    proximaParada: a.proxima?.parada.titulo,
    ultimaParada: ultima ? acharParada(ultima)?.parada.titulo : undefined,
    missoesAbertas: a.missoesAbertas.map((x) => x.missao.titulo),
    missoesFeitas: Object.keys(e.missoes).map((id) => acharMissao(id)?.missao.titulo).filter((x): x is string => Boolean(x)),
    ganhos: totalGanhos(e.ganhos),
    numeros,
    textos,
  };
}

export type FalhaNorte = 'sem-ia' | 'rede' | 'limite' | 'login' | 'falha' | 'recusa';

/** Conversa com o Norte. O texto chega em pedaços por `aoTexto`. Devolve null se deu certo, ou o motivo da falha. */
export async function perguntarAoNorte(mensagens: { de: 'voce' | 'norte'; texto: string }[], e: Estado, aoTexto: (pedaco: string) => void, sinal?: AbortSignal): Promise<FalhaNorte | null> {
  /* no arquivo único (prévia sem servidor) não existe a função do mentor */
  if (import.meta.env.MODE === 'unico') return 'sem-ia';
  let resposta: Response;
  try {
    resposta = await fetch('/api/norte', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(tokenDaConta() ? { authorization: `Bearer ${tokenDaConta()}` } : {}) },
      body: JSON.stringify({ mensagens: mensagens.slice(-24), contexto: contextoParaNorte(e) }),
      signal: sinal,
    });
  } catch {
    return 'rede';
  }
  if (resposta.status === 503 || resposta.status === 404) return 'sem-ia';
  if (resposta.status === 429) return 'limite';
  if (resposta.status === 401) return 'login';
  if (!resposta.ok || !resposta.body || !resposta.headers.get('content-type')?.includes('ndjson')) return resposta.ok ? 'sem-ia' : 'falha';

  const leitor = resposta.body.getReader();
  const decodificador = new TextDecoder();
  let resto = '';
  let falha: FalhaNorte | null = null;
  try {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      resto += decodificador.decode(value, { stream: true });
      const linhas = resto.split('\n');
      resto = linhas.pop() ?? '';
      for (const l of linhas) {
        if (!l.trim()) continue;
        const evento = JSON.parse(l) as { t: string; v?: string };
        if (evento.t === 'texto' && evento.v) aoTexto(evento.v);
        if (evento.t === 'erro') falha = (evento.v as FalhaNorte) ?? 'falha';
      }
    }
  } catch {
    return 'rede';
  }
  return falha;
}
