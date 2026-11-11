/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço do projeto Supabase. Sem ele, o app funciona só no aparelho. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
