create table waitlist_leads (
  id           uuid        primary key default gen_random_uuid(),
  nombre       text        not null,
  email        text        not null,
  rubro        text,
  num_sucursales text,
  created_at   timestamptz default now()
);

alter table waitlist_leads enable row level security;

-- Cualquier visitante puede registrarse, nadie puede leer ni modificar
create policy "waitlist_insert_public"
  on waitlist_leads
  for insert
  to anon
  with check (true);
