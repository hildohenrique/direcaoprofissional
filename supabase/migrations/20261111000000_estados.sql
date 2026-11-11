-- Cópia do progresso de cada pessoa, para ela não perder nada ao trocar de aparelho.
-- O app guarda o estado inteiro em um JSON; aqui fica uma linha por pessoa.
create table if not exists public.estados (
  user_id uuid primary key references auth.users (id) on delete cascade,
  estado jsonb not null,
  atualizado_em timestamptz not null default now(),
  constraint estado_de_tamanho_razoavel check (octet_length(estado::text) < 2000000)
);

alter table public.estados enable row level security;

-- Cada pessoa só enxerga e altera a própria linha.
create policy "le o proprio estado" on public.estados
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "cria o proprio estado" on public.estados
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "atualiza o proprio estado" on public.estados
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
