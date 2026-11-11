import { useSyncExternalStore } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Estado } from './tipos';
import { aoMudar, lerEstado, substituirEstado, estadoInicial } from './estado';
import { mesclar } from './mesclar';

/* Conta e cópia na nuvem (Supabase). É opcional: sem as variáveis VITE_SUPABASE_URL e
   VITE_SUPABASE_ANON_KEY o app funciona só no aparelho e nada deste arquivo é carregado. */

const URL_NUVEM = import.meta.env.VITE_SUPABASE_URL;
const CHAVE_NUVEM = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const nuvemLigada = Boolean(URL_NUVEM && CHAVE_NUVEM) && import.meta.env.MODE !== 'unico';

/* de quem é o progresso guardado neste aparelho: evita misturar duas contas no mesmo celular */
const CHAVE_DONO = 'direcao-profissional:dono';

export interface Conta {
  situacao: 'desligada' | 'carregando' | 'fora' | 'dentro';
  email?: string;
  copia: 'parada' | 'enviando' | 'em-dia' | 'erro';
  /** o projeto aceita contas novas? null enquanto não se sabe */
  cadastroAberto: boolean | null;
}

let conta: Conta = { situacao: nuvemLigada ? 'carregando' : 'desligada', copia: 'parada', cadastroAberto: null };
let token: string | null = null;
let idUsuario: string | null = null;
const ouvintes = new Set<() => void>();
function definir(parte: Partial<Conta>) {
  conta = { ...conta, ...parte };
  ouvintes.forEach((f) => f());
}
export function useConta(): Conta {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => conta,
    () => conta,
  );
}
export function tokenDaConta(): string | null {
  return token;
}

let promessa: Promise<SupabaseClient> | null = null;
function cliente(): Promise<SupabaseClient> {
  /* no arquivo único não existe nuvem: este desvio deixa a biblioteca fora do pacote */
  if (import.meta.env.MODE === 'unico') return Promise.reject(new Error('sem nuvem'));
  promessa ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(URL_NUVEM!, CHAVE_NUVEM!));
  return promessa;
}

async function enviar() {
  if (!idUsuario) return;
  definir({ copia: 'enviando' });
  try {
    const c = await cliente();
    const estado = lerEstado();
    const { error } = await c.from('estados').upsert({ user_id: idUsuario, estado, atualizado_em: estado.atualizadoEm });
    definir({ copia: error ? 'erro' : 'em-dia' });
  } catch {
    definir({ copia: 'erro' });
  }
}

let espera: ReturnType<typeof setTimeout> | null = null;
function agendarEnvio() {
  if (!idUsuario) return;
  if (espera) clearTimeout(espera);
  espera = setTimeout(() => void enviar(), 2500);
}

/** Ao entrar: busca a cópia da conta, junta com o que há no aparelho e devolve o resultado para a nuvem. */
async function sincronizar() {
  if (!idUsuario) return;
  try {
    const c = await cliente();
    const { data, error } = await c.from('estados').select('estado').eq('user_id', idUsuario).maybeSingle();
    if (error) return definir({ copia: 'erro' });
    const remoto = (data?.estado as Estado | undefined) ?? null;
    const dono = localStorage.getItem(CHAVE_DONO);
    let local = lerEstado();
    /* o aparelho guardava o progresso de outra conta: não mistura, começa do que esta conta tem */
    if (dono && dono !== idUsuario) local = estadoInicial();
    const base = estadoInicial();
    const junto = remoto ? mesclar(local, { ...base, ...remoto, maleta: { ...base.maleta, ...remoto.maleta }, ajustes: { ...base.ajustes, ...remoto.ajustes } }) : local;
    localStorage.setItem(CHAVE_DONO, idUsuario);
    substituirEstado(junto);
    await enviar();
  } catch {
    definir({ copia: 'erro' });
  }
}

/** Chamado uma vez na abertura do app. */
export async function iniciarNuvem() {
  if (!nuvemLigada) return;
  try {
    const c = await cliente();
    c.auth.onAuthStateChange((evento, sessao) => {
      token = sessao?.access_token ?? null;
      const antes = idUsuario;
      idUsuario = sessao?.user.id ?? null;
      definir({ situacao: sessao ? 'dentro' : 'fora', email: sessao?.user.email ?? undefined, copia: sessao ? conta.copia : 'parada' });
      /* o Supabase pede para não chamar o próprio cliente de dentro deste aviso: adia para depois */
      if (sessao && antes !== idUsuario && (evento === 'SIGNED_IN' || evento === 'INITIAL_SESSION')) setTimeout(() => void sincronizar(), 0);
    });
    aoMudar(agendarEnvio);
    /* as configurações públicas do projeto dizem se ele aceita contas novas */
    fetch(`${URL_NUVEM}/auth/v1/settings`, { headers: { apikey: CHAVE_NUVEM! } })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg: { disable_signup?: boolean } | null) => definir({ cadastroAberto: cfg ? !cfg.disable_signup : null }))
      .catch(() => undefined);
    /* ao fechar ou trocar de aba, tenta mandar o que ficou pendente */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && espera) {
        clearTimeout(espera);
        espera = null;
        void enviar();
      }
    });
  } catch {
    definir({ situacao: 'fora', copia: 'erro' });
  }
}

/** Manda para o e-mail um código de 6 números (e um link). */
export async function pedirCodigo(email: string): Promise<string | null> {
  try {
    const c = await cliente();
    const { error } = await c.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: conta.cadastroAberto !== false, emailRedirectTo: window.location.origin } });
    if (!error) return null;
    if (error.status === 429) return 'Muitas tentativas. Espere um minuto e peça de novo.';
    if (conta.cadastroAberto === false) return 'Não achei uma conta com esse e-mail, e o cadastro de contas novas ainda não está aberto.';
    return 'Não consegui enviar o código. Confira o e-mail e tente de novo.';
  } catch {
    return 'Sem conexão. Confira a internet e tente de novo.';
  }
}

export async function confirmarCodigo(email: string, codigo: string): Promise<string | null> {
  try {
    const c = await cliente();
    const { error } = await c.auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo.trim(), type: 'email' });
    return error ? 'Código errado ou vencido. Confira os números ou peça um código novo.' : null;
  } catch {
    return 'Sem conexão. Confira a internet e tente de novo.';
  }
}

export async function entrarComSenha(email: string, senha: string): Promise<string | null> {
  try {
    const c = await cliente();
    const { error } = await c.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
    if (!error) return null;
    return error.status === 429 ? 'Muitas tentativas. Espere um minuto e tente de novo.' : 'E-mail ou senha não conferem.';
  } catch {
    return 'Sem conexão. Confira a internet e tente de novo.';
  }
}

export async function sair() {
  try {
    if (espera) clearTimeout(espera);
    await enviar();
    const c = await cliente();
    await c.auth.signOut();
  } catch {
    /* mesmo sem conexão, a sessão local é encerrada pelo aviso de mudança de estado */
  }
}
