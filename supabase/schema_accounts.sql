-- =========================================================
-- Migración: agrega "Cuentas" (accounts) al esquema existente
-- Ejecuta esto DESPUÉS del schema.sql original — no lo reemplaza.
-- =========================================================

-- -----------------------------
-- Tabla: accounts
-- -----------------------------
create table public.accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('cash', 'bank', 'credit_card', 'savings')),
  balance     numeric(12, 2) not null default 0,
  created_at  timestamptz not null default now()
);

create index accounts_user_id_idx on public.accounts(user_id);

alter table public.accounts enable row level security;

create policy "accounts_select_own"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "accounts_insert_own"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "accounts_update_own"
  on public.accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "accounts_delete_own"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- -----------------------------
-- transactions gana account_id
-- -----------------------------
alter table public.transactions
  add column account_id uuid references public.accounts(id) on delete set null;

create index transactions_account_id_idx on public.transactions(account_id);

-- =========================================================
-- El balance de cada cuenta se mantiene solo: un trigger lo
-- ajusta cada vez que se inserta/edita/borra una transacción.
-- income y saving suman al balance de la cuenta; expense resta.
-- =========================================================
create or replace function public.adjust_account_balance()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  delta numeric(12,2);
begin
  if tg_op = 'INSERT' then
    if new.account_id is not null then
      delta := case new.type when 'expense' then -new.amount else new.amount end;
      update public.accounts set balance = balance + delta where id = new.account_id;
    end if;
    return new;

  elsif tg_op = 'UPDATE' then
    if old.account_id is not null then
      delta := case old.type when 'expense' then old.amount else -old.amount end;
      update public.accounts set balance = balance + delta where id = old.account_id;
    end if;
    if new.account_id is not null then
      delta := case new.type when 'expense' then -new.amount else new.amount end;
      update public.accounts set balance = balance + delta where id = new.account_id;
    end if;
    return new;

  elsif tg_op = 'DELETE' then
    if old.account_id is not null then
      delta := case old.type when 'expense' then old.amount else -old.amount end;
      update public.accounts set balance = balance + delta where id = old.account_id;
    end if;
    return old;
  end if;

  return null;
end;
$$;

create trigger trg_adjust_account_balance
  after insert or update or delete on public.transactions
  for each row execute function public.adjust_account_balance();

-- =========================================================
-- 4 cuentas por defecto para usuarios NUEVOS (mismo patrón
-- que las categorías por defecto)
-- =========================================================
create or replace function public.handle_new_user_accounts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.accounts (user_id, name, type, balance) values
    (new.id, 'Efectivo', 'cash', 0),
    (new.id, 'Banco', 'bank', 0),
    (new.id, 'Tarjeta de crédito', 'credit_card', 0),
    (new.id, 'Ahorro', 'savings', 0);
  return new;
end;
$$;

create trigger on_auth_user_created_accounts
  after insert on auth.users
  for each row execute function public.handle_new_user_accounts();