-- Multi-city expansion: each city WEN serves gets its own delivery hub
-- (for the service-area geofence + distance-based delivery fee) and its
-- own price_multiplier applied on top of the shared product catalog.
-- Admin-editable so pricing/radius/active status don't need code changes.
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  state text not null,
  hq_lat numeric(9,6) not null,
  hq_lng numeric(9,6) not null,
  service_radius_km numeric(6,2) not null,
  price_multiplier numeric(5,3) not null default 1.000,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cities enable row level security;

create policy "Anyone can view active cities" on public.cities
  for select
  using (is_active);

create policy "Admins can manage cities" on public.cities
  for all
  using (is_admin());

insert into public.cities (slug, name, state, hq_lat, hq_lng, service_radius_km, price_multiplier, is_active) values
  ('makurdi', 'Makurdi', 'Benue',  7.729000, 8.524700, 25.00, 1.000, true),
  ('umuahia', 'Umuahia', 'Abia',   5.524910, 7.494610, 20.00, 1.150, true);
