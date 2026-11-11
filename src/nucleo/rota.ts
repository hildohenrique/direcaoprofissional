import type { Estado, IdCaminho, Missao, Parada, Perfil, Trecho } from './tipos';

/* A rota é a mesma biblioteca de trechos em ordens diferentes.
   Quem precisa de dinheiro para já vai primeiro ao que gera o primeiro real;
   quem pode esperar arruma as contas antes. Quem escolhe emprego não passa pelos trechos de clientes. */
export function idsDaRota(perfil: Pick<Perfil, 'urgencia'> | null, caminho: IdCaminho | null): string[] {
  if (!caminho) return ['partida'];
  if (caminho === 'emprego') return ['partida', 'c-emprego-vaga', 'c-emprego-crescer', 'dinheiro', 'constancia'];
  const doCaminho = `c-${caminho}`;
  if (perfil?.urgencia === 'ja') return ['partida', doCaminho, 'clientes', 'dinheiro', 'crescer', 'constancia'];
  return ['partida', 'dinheiro', doCaminho, 'clientes', 'crescer', 'constancia'];
}

export type EstadoNo = 'feita' | 'atual' | 'livre' | 'travada';

export type No =
  | { tipo: 'parada'; id: string; trecho: Trecho; parada: Parada; estado: EstadoNo; numero: number }
  | { tipo: 'missao'; id: string; trecho: Trecho; missao: Missao; estado: EstadoNo };

/** A rota achatada em nós, na ordem do mapa, com o estado de cada um. */
export function nosDaRota(rota: Trecho[], estado: Pick<Estado, 'concluidas' | 'missoes'>): No[] {
  const nos: No[] = [];
  let achouAtual = false;
  let numero = 0;
  for (const trecho of rota) {
    for (const parada of trecho.paradas) {
      numero += 1;
      let situacao: EstadoNo;
      if (estado.concluidas[parada.id]) situacao = 'feita';
      else if (!achouAtual) {
        situacao = 'atual';
        achouAtual = true;
      } else situacao = 'travada';
      nos.push({ tipo: 'parada', id: parada.id, trecho, parada, estado: situacao, numero });
    }
    const todasFeitas = trecho.paradas.every((p) => estado.concluidas[p.id]);
    /* a missão abre quando as paradas do trecho terminam, e não trava o trecho seguinte:
       missão acontece no mundo real e leva o tempo que precisar */
    nos.push({
      tipo: 'missao',
      id: trecho.missao.id,
      trecho,
      missao: trecho.missao,
      estado: estado.missoes[trecho.missao.id] ? 'feita' : todasFeitas ? 'livre' : 'travada',
    });
  }
  return nos;
}

export interface Andamento {
  feitas: number;
  total: number;
  missoesFeitas: number;
  missoesTotal: number;
  proxima: Extract<No, { tipo: 'parada' }> | null;
  missoesAbertas: Extract<No, { tipo: 'missao' }>[];
  /** semanas até o fim, no ritmo de dias por semana que a pessoa escolheu */
  semanasRestantes: number;
  chegou: boolean;
}

export function andamento(nos: No[], diasPorSemana: number): Andamento {
  const paradas = nos.filter((n): n is Extract<No, { tipo: 'parada' }> => n.tipo === 'parada');
  const missoes = nos.filter((n): n is Extract<No, { tipo: 'missao' }> => n.tipo === 'missao');
  const feitas = paradas.filter((n) => n.estado === 'feita').length;
  const restam = paradas.length - feitas;
  return {
    feitas,
    total: paradas.length,
    missoesFeitas: missoes.filter((m) => m.estado === 'feita').length,
    missoesTotal: missoes.length,
    proxima: paradas.find((n) => n.estado === 'atual') ?? null,
    missoesAbertas: missoes.filter((m) => m.estado === 'livre'),
    semanasRestantes: Math.ceil(restam / Math.max(1, diasPorSemana)),
    chegou: paradas.length > 0 && restam === 0,
  };
}
