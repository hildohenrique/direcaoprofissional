import type { Estado } from './tipos';

/* Junta o progresso de dois aparelhos sem perder nada.
   O que é conquista (paradas, missões, ganhos, dias) se soma.
   O que é escolha ou rascunho (perfil, caminho, maleta, ajustes, conversa) vem da cópia mexida por último. */
export function mesclar(a: Estado, b: Estado): Estado {
  const [novo, velho] = a.atualizadoEm >= b.atualizadoEm ? [a, b] : [b, a];

  const concluidas = { ...velho.concluidas };
  for (const [id, c] of Object.entries(novo.concluidas)) {
    const outra = concluidas[id];
    /* fica a primeira vez que a parada foi concluída */
    concluidas[id] = outra && outra.em <= c.em ? outra : c;
  }

  const missoes = { ...velho.missoes };
  for (const [id, m] of Object.entries(novo.missoes)) {
    const outra = missoes[id];
    /* fica o relato mais recente */
    missoes[id] = outra && outra.em > m.em ? outra : m;
  }

  const revisao = { ...velho.revisao };
  for (const [id, c] of Object.entries(novo.revisao)) {
    const outra = revisao[id];
    /* fica o cartão que foi respondido mais vezes (a próxima data mais distante) */
    revisao[id] = outra && outra.proxima > c.proxima ? outra : c;
  }

  const ganhos = [...velho.ganhos];
  for (const g of novo.ganhos) if (!ganhos.some((x) => x.id === g.id)) ganhos.push(g);
  ganhos.sort((x, y) => x.em.localeCompare(y.em));

  const temPerfil = novo.perfil ? novo : velho;
  return {
    ...novo,
    criadoEm: a.criadoEm <= b.criadoEm ? a.criadoEm : b.criadoEm,
    perfil: temPerfil.perfil,
    caminho: novo.perfil ? novo.caminho ?? velho.caminho : velho.caminho,
    concluidas,
    missoes,
    revisao,
    ganhos,
    dias: [...new Set([...velho.dias, ...novo.dias])].sort().slice(-400),
    maleta: novo.perfil ? novo.maleta : velho.maleta,
    norte: novo.norte.length ? novo.norte : velho.norte,
    vistos: [...new Set([...velho.vistos, ...novo.vistos])],
  };
}
