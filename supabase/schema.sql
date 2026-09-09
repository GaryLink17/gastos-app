-- =========================================================
-- Esquema MVP: App de gestión de gastos, ingresos y ahorros
-- =========================================================

-- -----------------------------
-- Tabla: categories
-- -----------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('income', 'expense', 'saving')),
  color       text not null default '#0f766e', -- teal por defecto
  created_at  timestamptz not null default now()
);

create index categories_user_id_idx on public.categories(user_id);

-- -----------------------------
-- Tabla: transactions
-- -----------------------------
create table public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_id   uuid not null references public.categories(id) on delete restrict,
  type          text not null check (type in ('income', 'expense', 'saving')),
  amount        numeric(12, 2) not null check (amount > 0),
  description   text,
  date          date not null default current_date,
  created_at    timestamptz not null default now()
);

create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date);
create index transactions_category_id_idx on public.transactions(category_id);
create index transactions_type_idx on public.transactions(type);

-- =========================================================
-- Row Level Security: cada usuario solo ve/edita lo suyo
-- =========================================================
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- =========================================================
-- Categorías por defecto al registrar un usuario nuevo
-- =========================================================
create or replace function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, color) values
    (new.id, 'Salario',           'income',  '#0f766e'),
    (new.id, 'Freelance',         'income',  '#0d9488'),
    (new.id, 'Otros ingresos',    'income',  '#14b8a6'),
    (new.id, 'Comida',            'expense', '#b45309'),
    (new.id, 'Transporte',        'expense', '#c2410c'),
    (new.id, 'Vivienda',          'expense', '#9a3412'),
    (new.id, 'Servicios',         'expense', '#a16207'),
    (new.id, 'Entretenimiento',   'expense', '#b91c1c'),
    (new.id, 'Salud',             'expense', '#be123c'),
    (new.id, 'Otros gastos',      'expense', '#78350f'),
    (new.id, 'Ahorro general',    'saving',  '#4338ca'),
    (new.id, 'Fondo de emergencia','saving', '#3730a3');
  return new;
end;
$$;

-- Se dispara automáticamente cada vez que Supabase Auth crea un usuario nuevo
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute function public.handle_new_user_categories();
