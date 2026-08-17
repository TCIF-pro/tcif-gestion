-- ============================================================
-- TCIF CRM — Schéma Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

create extension if not exists pgcrypto;

-- ========== CLIENTS ==========
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text,
  telephone text,
  activite text,
  site_url text,
  statut text not null default 'Prospect'
    check (statut in ('Prospect', 'Actif', 'En pause', 'Terminé')),
  date_signature date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== SUIVI DE PROJET (1 ligne par client) ==========
create table if not exists suivi_projet (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade unique,
  etape text
    check (etape in ('Premier échange', 'Devis envoyé', 'Acompte reçu', 'En création', 'Livré', 'Abonnement actif')),
  date_derniere_action date,
  prochaine_action text,
  notes text,
  updated_at timestamptz not null default now()
);

-- ========== ABONNEMENTS ==========
create table if not exists abonnements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  montant_mensuel numeric(10, 2) not null default 0,
  date_renouvellement_domaine date,
  statut_prelevement text not null default 'À jour'
    check (statut_prelevement in ('À jour', 'En retard', 'Résilié')),
  derniere_facture_envoyee date,
  created_at timestamptz not null default now()
);

-- ========== DEVIS & FACTURES ==========
create table if not exists devis_factures (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('Devis', 'Facture')),
  numero text,
  date date not null default current_date,
  montant numeric(10, 2) not null default 0,
  statut text not null default 'Envoyé'
    check (statut in ('Envoyé', 'Accepté', 'Payé', 'En attente')),
  created_at timestamptz not null default now()
);

-- ========== updated_at automatique ==========
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on clients;
create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

drop trigger if exists suivi_projet_set_updated_at on suivi_projet;
create trigger suivi_projet_set_updated_at
  before update on suivi_projet
  for each row execute function set_updated_at();

-- ========== ROW LEVEL SECURITY ==========
-- Un seul compte utilisateur (le tien) : accès complet réservé aux utilisateurs
-- authentifiés. Ne crée jamais de second compte sur ce projet Supabase.
alter table clients enable row level security;
alter table suivi_projet enable row level security;
alter table abonnements enable row level security;
alter table devis_factures enable row level security;

drop policy if exists "authenticated full access" on clients;
create policy "authenticated full access" on clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on suivi_projet;
create policy "authenticated full access" on suivi_projet
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on abonnements;
create policy "authenticated full access" on abonnements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on devis_factures;
create policy "authenticated full access" on devis_factures
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ========== DONNÉES DE DÉPART ==========
insert into clients (nom, activite, site_url, statut, notes)
values
  ('Jérôme Cotard', 'Magnétisme, massages énergétiques', 'https://jeromecotard.fr', 'Terminé', null),
  ('Françoise', 'Lithothérapie, numérologie', 'https://jais9.fr', 'Terminé', 'Refonte de site existant')
on conflict do nothing;
