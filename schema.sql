-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: clients
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  vat_number text,
  channel text, -- GDO, Grossista, Horeca, Food Service, Laboratorio
  province text,
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: companies
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: import_batches
create table import_batches (
  id uuid primary key default uuid_generate_v4(),
  filename text,
  imported_at timestamp with time zone default now(),
  total_rows int default 0,
  success_rows int default 0,
  error_rows int default 0,
  error_report jsonb
);

-- Table: revenues
create table revenues (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id),
  company_id uuid not null references companies(id),
  period date not null, -- Stored as YYYY-MM-01
  amount numeric not null check (amount >= 0),
  source text not null default 'manual', -- 'manual', 'import'
  import_batch_id uuid references import_batches(id),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (client_id, company_id, period)
);

-- Indexes
create index idx_revenues_period on revenues(period);
create index idx_revenues_client on revenues(client_id);
create index idx_revenues_company on revenues(company_id);

-- RLS (Row Level Security)
-- For MVP single-tenant (admin only), we assume the user is authenticated via Supabase Auth
-- and we allow full access to authenticated users.

alter table clients enable row level security;
alter table companies enable row level security;
alter table revenues enable row level security;
alter table import_batches enable row level security;

-- Policy: Allow everything for authenticated users
create policy "Enable all for authenticated users" on clients
  for all using (auth.role() = 'authenticated');

create policy "Enable all for authenticated users" on companies
  for all using (auth.role() = 'authenticated');

create policy "Enable all for authenticated users" on revenues
  for all using (auth.role() = 'authenticated');

create policy "Enable all for authenticated users" on import_batches
  for all using (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_clients_updated_at before update on clients
for each row execute procedure update_updated_at_column();

create trigger update_companies_updated_at before update on companies
for each row execute procedure update_updated_at_column();

create trigger update_revenues_updated_at before update on revenues
for each row execute procedure update_updated_at_column();
