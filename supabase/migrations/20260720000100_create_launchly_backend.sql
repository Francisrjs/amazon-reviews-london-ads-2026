begin;

create schema if not exists private;
create schema if not exists analytics;

revoke all on schema private from public, anon, authenticated;
revoke all on schema analytics from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (display_name is null or char_length(display_name) between 1 and 120)
);

create table public.stores (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  brand text not null,
  description text not null default '',
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_owner_unique unique (owner_id),
  constraint stores_id_owner_unique unique (id, owner_id),
  constraint stores_brand_length check (char_length(btrim(brand)) between 1 and 120),
  constraint stores_description_length check (char_length(description) <= 1000),
  constraint stores_currency_format check (currency ~ '^[A-Z]{3}$')
);

create table public.portfolio_products (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_product_id text not null,
  source_type text not null default 'simulation',
  product_key text not null,
  subcategory text not null,
  name text not null,
  description text not null default '',
  selling_price numeric(12,2) not null,
  success_score numeric(5,2) not null,
  estimated_monthly_profit numeric(14,2) not null,
  startup_cost numeric(14,2) not null,
  image_url text,
  trend_pct numeric(7,2) not null default 0,
  currency text not null default 'USD',
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_products_owner_source_unique unique (owner_id, source_type, source_product_id),
  constraint portfolio_products_id_owner_unique unique (id, owner_id),
  constraint portfolio_products_source_type_check check (source_type in ('model', 'formula', 'external_data', 'simulation')),
  constraint portfolio_products_name_length check (char_length(btrim(name)) between 1 and 200),
  constraint portfolio_products_nonnegative check (
    selling_price >= 0 and success_score between 0 and 100 and startup_cost >= 0
  ),
  constraint portfolio_products_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint portfolio_products_payload_object check (jsonb_typeof(source_payload) = 'object')
);

create table public.shortlist_items (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint shortlist_product_owner_fk foreign key (product_id, owner_id)
    references public.portfolio_products(id, owner_id) on delete cascade,
  constraint shortlist_owner_product_unique unique (owner_id, product_id),
  constraint shortlist_position_check check (position >= 0)
);

create table public.store_products (
  id bigint generated always as identity primary key,
  store_id bigint not null,
  owner_id uuid not null,
  product_id bigint not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint store_products_store_owner_fk foreign key (store_id, owner_id)
    references public.stores(id, owner_id) on delete cascade,
  constraint store_products_product_owner_fk foreign key (product_id, owner_id)
    references public.portfolio_products(id, owner_id) on delete cascade,
  constraint store_products_store_product_unique unique (store_id, product_id),
  constraint store_products_position_check check (position >= 0)
);

create table public.model_versions (
  id bigint generated always as identity primary key,
  version text not null unique,
  algorithm text not null,
  validation_metrics jsonb not null default '{}'::jsonb,
  artifact_manifest jsonb not null default '{}'::jsonb,
  is_current boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  constraint model_versions_metrics_object check (jsonb_typeof(validation_metrics) = 'object'),
  constraint model_versions_manifest_object check (jsonb_typeof(artifact_manifest) = 'object')
);

create unique index model_versions_one_current_idx on public.model_versions (is_current) where is_current;

create table public.dataset_versions (
  id bigint generated always as identity primary key,
  version text not null unique,
  snapshot_date date not null,
  checksum text,
  source_manifest jsonb not null default '{}'::jsonb,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  constraint dataset_versions_manifest_object check (jsonb_typeof(source_manifest) = 'object')
);

create unique index dataset_versions_one_current_idx on public.dataset_versions (is_current) where is_current;

insert into public.model_versions (
  version, algorithm, is_current, validation_metrics, published_at
)
values (
  'success-rf-0.1.0',
  'RandomForest (300) with isotonic calibration',
  true,
  '{"roc_auc": 0.707, "ece": 0.007, "status": "documented"}'::jsonb,
  '2026-07-20T00:00:00Z'
)
on conflict (version) do nothing;

insert into public.dataset_versions (
  version, snapshot_date, source_manifest, is_current
)
values (
  'beauty-master-2026-07',
  '2026-07-01',
  '{"storage": "external", "contains_raw_reviews": false}'::jsonb,
  true
)
on conflict (version) do nothing;

create table public.analyses (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  status text not null default 'completed',
  source_type text not null,
  model_version text not null references public.model_versions(version),
  dataset_version text not null references public.dataset_versions(version),
  raw_result jsonb not null,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analyses_owner_request_unique unique (owner_id, request_id),
  constraint analyses_id_owner_unique unique (id, owner_id),
  constraint analyses_status_check check (status in ('pending', 'completed', 'failed')),
  constraint analyses_source_type_check check (source_type in ('model', 'formula', 'external_data', 'simulation')),
  constraint analyses_result_object check (jsonb_typeof(raw_result) = 'object'),
  constraint analyses_error_consistency check (
    (status = 'failed' and error_code is not null) or
    (status <> 'failed' and error_code is null and error_message is null)
  )
);

create table public.product_inputs (
  analysis_id bigint primary key,
  owner_id uuid not null,
  subcategory text not null,
  title text not null,
  description text not null,
  market text not null,
  currency text not null,
  selling_price numeric(12,2) not null,
  unit_cost numeric(12,2),
  fulfilment_cost numeric(12,2),
  marketplace_fee_pct numeric(6,3),
  advertising_cost_per_unit numeric(12,2),
  return_allowance numeric(12,2),
  expected_units_monthly integer,
  risk_preference text not null,
  detail_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint product_inputs_analysis_owner_fk foreign key (analysis_id, owner_id)
    references public.analyses(id, owner_id) on delete cascade,
  constraint product_inputs_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint product_inputs_market_format check (market ~ '^[A-Z]{2}$'),
  constraint product_inputs_price_positive check (selling_price > 0),
  constraint product_inputs_costs_nonnegative check (
    (unit_cost is null or unit_cost >= 0) and
    (fulfilment_cost is null or fulfilment_cost >= 0) and
    (marketplace_fee_pct is null or marketplace_fee_pct between 0 and 100) and
    (advertising_cost_per_unit is null or advertising_cost_per_unit >= 0) and
    (return_allowance is null or return_allowance >= 0) and
    (expected_units_monthly is null or expected_units_monthly >= 0)
  ),
  constraint product_inputs_risk_preference_check check (risk_preference in ('cautious', 'balanced', 'bold')),
  constraint product_inputs_detail_flags_object check (jsonb_typeof(detail_flags) = 'object')
);

create table public.analysis_metrics (
  analysis_id bigint primary key,
  owner_id uuid not null,
  success_score numeric(5,2) not null,
  probability numeric(8,6),
  uncertainty numeric(8,6) not null,
  confidence text not null,
  risk_index numeric(5,2) not null,
  risk_downside numeric(5,2) not null,
  risk_saturation numeric(5,2) not null,
  risk_uncertainty numeric(5,2) not null,
  saturation numeric(5,2) not null,
  recommended_price numeric(12,2) not null,
  price_range_low numeric(12,2),
  price_range_high numeric(12,2),
  marketplace_fee numeric(12,2),
  profit_per_sale numeric(14,2),
  expected_monthly_profit numeric(14,2),
  profit_is_complete boolean not null default false,
  limitations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint analysis_metrics_analysis_owner_fk foreign key (analysis_id, owner_id)
    references public.analyses(id, owner_id) on delete cascade,
  constraint analysis_metrics_score_ranges check (
    success_score between 0 and 100 and risk_index between 0 and 100 and
    risk_downside between 0 and 100 and risk_saturation between 0 and 100 and
    risk_uncertainty between 0 and 100 and saturation between 0 and 100 and
    uncertainty >= 0
  ),
  constraint analysis_metrics_probability_range check (probability is null or probability between 0 and 1),
  constraint analysis_metrics_limitations_array check (jsonb_typeof(limitations) = 'array')
);

create table public.price_scenarios (
  id bigint generated always as identity primary key,
  analysis_id bigint not null,
  owner_id uuid not null,
  position integer not null,
  price numeric(12,2) not null,
  success_score numeric(5,2) not null,
  risk_index numeric(5,2),
  profit_per_sale numeric(14,2),
  created_at timestamptz not null default now(),
  constraint price_scenarios_analysis_owner_fk foreign key (analysis_id, owner_id)
    references public.analyses(id, owner_id) on delete cascade,
  constraint price_scenarios_analysis_position_unique unique (analysis_id, position),
  constraint price_scenarios_ranges check (
    position >= 0 and price > 0 and success_score between 0 and 100 and
    (risk_index is null or risk_index between 0 and 100)
  )
);

create table public.analysis_comparables (
  id bigint generated always as identity primary key,
  analysis_id bigint not null,
  owner_id uuid not null,
  rank integer not null,
  parent_asin text,
  title text not null,
  subcategory text,
  price numeric(12,2),
  rating numeric(3,2),
  reviews bigint not null default 0,
  success boolean,
  similarity numeric(8,6),
  created_at timestamptz not null default now(),
  constraint analysis_comparables_analysis_owner_fk foreign key (analysis_id, owner_id)
    references public.analyses(id, owner_id) on delete cascade,
  constraint analysis_comparables_analysis_rank_unique unique (analysis_id, rank),
  constraint analysis_comparables_ranges check (
    rank > 0 and (price is null or price >= 0) and
    (rating is null or rating between 0 and 5) and reviews >= 0 and
    (similarity is null or similarity between -1 and 1)
  )
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  owner_id uuid references auth.users(id) on delete set null,
  request_id uuid,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_id_owner_unique unique (id, owner_id),
  constraint audit_events_owner_request_event_unique unique (owner_id, request_id, event_type),
  constraint audit_events_payload_object check (jsonb_typeof(event_payload) = 'object')
);

create index stores_owner_created_idx on public.stores (owner_id, created_at desc, id desc);
create index portfolio_products_owner_created_idx on public.portfolio_products (owner_id, created_at desc, id desc);
create index shortlist_items_owner_position_idx on public.shortlist_items (owner_id, position, id);
create index shortlist_items_product_id_idx on public.shortlist_items (product_id);
create index store_products_store_position_idx on public.store_products (store_id, position, id);
create index store_products_owner_idx on public.store_products (owner_id);
create index store_products_product_id_idx on public.store_products (product_id);
create index analyses_owner_created_idx on public.analyses (owner_id, created_at desc, id desc);
create index analyses_model_version_idx on public.analyses (model_version);
create index analyses_dataset_version_idx on public.analyses (dataset_version);
create index product_inputs_owner_idx on public.product_inputs (owner_id);
create index analysis_metrics_owner_idx on public.analysis_metrics (owner_id);
create index price_scenarios_analysis_id_idx on public.price_scenarios (analysis_id);
create index price_scenarios_owner_idx on public.price_scenarios (owner_id);
create index analysis_comparables_analysis_id_idx on public.analysis_comparables (analysis_id);
create index analysis_comparables_owner_idx on public.analysis_comparables (owner_id);
create index audit_events_owner_created_idx on public.audit_events (owner_id, created_at desc, id desc);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger stores_set_updated_at before update on public.stores
for each row execute function private.set_updated_at();
create trigger portfolio_products_set_updated_at before update on public.portfolio_products
for each row execute function private.set_updated_at();
create trigger analyses_set_updated_at before update on public.analyses
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.portfolio_products enable row level security;
alter table public.shortlist_items enable row level security;
alter table public.store_products enable row level security;
alter table public.model_versions enable row level security;
alter table public.dataset_versions enable row level security;
alter table public.analyses enable row level security;
alter table public.product_inputs enable row level security;
alter table public.analysis_metrics enable row level security;
alter table public.price_scenarios enable row level security;
alter table public.analysis_comparables enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy stores_select_own on public.stores for select to authenticated
using ((select auth.uid()) = owner_id);
create policy stores_insert_own on public.stores for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy stores_update_own on public.stores for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy stores_delete_own on public.stores for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy portfolio_products_select_own on public.portfolio_products for select to authenticated
using ((select auth.uid()) = owner_id);
create policy portfolio_products_insert_own on public.portfolio_products for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy portfolio_products_update_own on public.portfolio_products for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy portfolio_products_delete_own on public.portfolio_products for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy shortlist_items_select_own on public.shortlist_items for select to authenticated
using ((select auth.uid()) = owner_id);
create policy shortlist_items_insert_own on public.shortlist_items for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy shortlist_items_update_own on public.shortlist_items for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy shortlist_items_delete_own on public.shortlist_items for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy store_products_select_own on public.store_products for select to authenticated
using ((select auth.uid()) = owner_id);
create policy store_products_insert_own on public.store_products for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy store_products_update_own on public.store_products for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy store_products_delete_own on public.store_products for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy model_versions_select_authenticated on public.model_versions for select to authenticated
using (true);
create policy dataset_versions_select_authenticated on public.dataset_versions for select to authenticated
using (true);

create policy analyses_select_own on public.analyses for select to authenticated
using ((select auth.uid()) = owner_id);
create policy analyses_insert_own on public.analyses for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy analyses_update_own on public.analyses for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy analyses_delete_own on public.analyses for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy product_inputs_select_own on public.product_inputs for select to authenticated
using ((select auth.uid()) = owner_id);
create policy product_inputs_insert_own on public.product_inputs for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy product_inputs_update_own on public.product_inputs for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy product_inputs_delete_own on public.product_inputs for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy analysis_metrics_select_own on public.analysis_metrics for select to authenticated
using ((select auth.uid()) = owner_id);
create policy analysis_metrics_insert_own on public.analysis_metrics for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy analysis_metrics_update_own on public.analysis_metrics for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy analysis_metrics_delete_own on public.analysis_metrics for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy price_scenarios_select_own on public.price_scenarios for select to authenticated
using ((select auth.uid()) = owner_id);
create policy price_scenarios_insert_own on public.price_scenarios for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy price_scenarios_update_own on public.price_scenarios for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy price_scenarios_delete_own on public.price_scenarios for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy analysis_comparables_select_own on public.analysis_comparables for select to authenticated
using ((select auth.uid()) = owner_id);
create policy analysis_comparables_insert_own on public.analysis_comparables for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy analysis_comparables_update_own on public.analysis_comparables for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy analysis_comparables_delete_own on public.analysis_comparables for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy audit_events_select_own on public.audit_events for select to authenticated
using ((select auth.uid()) = owner_id);
create policy audit_events_insert_own on public.audit_events for insert to authenticated
with check ((select auth.uid()) = owner_id);

grant usage on schema public to authenticated;
revoke all on public.profiles, public.stores, public.portfolio_products,
  public.shortlist_items, public.store_products, public.model_versions,
  public.dataset_versions, public.analyses, public.product_inputs,
  public.analysis_metrics, public.price_scenarios, public.analysis_comparables,
  public.audit_events from anon;
grant select, insert, update, delete on public.profiles, public.stores,
  public.portfolio_products, public.shortlist_items, public.store_products,
  public.analyses, public.product_inputs, public.analysis_metrics,
  public.price_scenarios, public.analysis_comparables to authenticated;
grant select, insert on public.audit_events to authenticated;
grant select on public.model_versions, public.dataset_versions to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create or replace function public.persist_analysis(
  p_request_id uuid,
  p_input jsonb,
  p_result jsonb
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_analysis_id bigint;
  v_item jsonb;
  v_position integer;
begin
  if v_owner is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select id into v_analysis_id
  from public.analyses
  where owner_id = v_owner and request_id = p_request_id;

  if v_analysis_id is not null then
    return v_analysis_id;
  end if;

  insert into public.analyses (
    owner_id, request_id, status, source_type, model_version, dataset_version, raw_result
  ) values (
    v_owner, p_request_id, 'completed', coalesce(p_result ->> 'source', 'model'),
    p_result ->> 'model_version', p_result ->> 'dataset_version', p_result
  ) returning id into v_analysis_id;

  insert into public.product_inputs (
    analysis_id, owner_id, subcategory, title, description, market, currency,
    selling_price, unit_cost, fulfilment_cost, marketplace_fee_pct,
    advertising_cost_per_unit, return_allowance, expected_units_monthly,
    risk_preference, detail_flags
  ) values (
    v_analysis_id, v_owner, p_input ->> 'subcategory', p_input ->> 'title',
    p_input ->> 'description', p_input ->> 'market', p_input ->> 'currency',
    (p_input ->> 'selling_price')::numeric,
    nullif(p_input ->> 'unit_cost', '')::numeric,
    nullif(p_input ->> 'fulfilment_cost', '')::numeric,
    nullif(p_input ->> 'marketplace_fee_pct', '')::numeric,
    nullif(p_input ->> 'advertising_cost_per_unit', '')::numeric,
    nullif(p_input ->> 'return_allowance', '')::numeric,
    nullif(p_input ->> 'expected_units_monthly', '')::integer,
    p_input ->> 'risk_preference', coalesce(p_input -> 'detail_flags', '{}'::jsonb)
  );

  insert into public.analysis_metrics (
    analysis_id, owner_id, success_score, probability, uncertainty, confidence,
    risk_index, risk_downside, risk_saturation, risk_uncertainty, saturation,
    recommended_price, price_range_low, price_range_high, marketplace_fee,
    profit_per_sale, expected_monthly_profit, profit_is_complete, limitations
  ) values (
    v_analysis_id, v_owner,
    (p_result #>> '{success,score}')::numeric,
    nullif(p_result #>> '{success,probability}', '')::numeric,
    (p_result #>> '{success,uncertainty}')::numeric,
    p_result #>> '{success,confidence}',
    (p_result #>> '{risk,index}')::numeric,
    (p_result #>> '{risk,components,downside}')::numeric,
    (p_result #>> '{risk,components,saturation}')::numeric,
    (p_result #>> '{risk,components,uncertainty}')::numeric,
    (p_result #>> '{saturation,value}')::numeric,
    (p_result ->> 'recommended_price')::numeric,
    nullif(p_result #>> '{price_range,0}', '')::numeric,
    nullif(p_result #>> '{price_range,1}', '')::numeric,
    nullif(p_result #>> '{profit,marketplace_fee}', '')::numeric,
    nullif(p_result #>> '{profit,per_sale}', '')::numeric,
    nullif(p_result #>> '{profit,expected_monthly}', '')::numeric,
    coalesce((p_result #>> '{profit,is_complete}')::boolean, false),
    coalesce(p_result -> 'limitations', '[]'::jsonb)
  );

  v_position := 0;
  for v_item in select value from jsonb_array_elements(coalesce(p_result -> 'price_curve', '[]'::jsonb))
  loop
    insert into public.price_scenarios (
      analysis_id, owner_id, position, price, success_score, risk_index, profit_per_sale
    ) values (
      v_analysis_id, v_owner, v_position,
      (v_item ->> 'price')::numeric, (v_item ->> 'score')::numeric,
      nullif(v_item ->> 'risk_index', '')::numeric,
      nullif(v_item ->> 'profit_per_sale', '')::numeric
    );
    v_position := v_position + 1;
  end loop;

  v_position := 1;
  for v_item in select value from jsonb_array_elements(coalesce(p_result -> 'comparables', '[]'::jsonb))
  loop
    insert into public.analysis_comparables (
      analysis_id, owner_id, rank, parent_asin, title, subcategory, price,
      rating, reviews, success, similarity
    ) values (
      v_analysis_id, v_owner, v_position, v_item ->> 'parent_asin',
      v_item ->> 'title', v_item ->> 'subcategory',
      nullif(v_item ->> 'price', '')::numeric,
      nullif(v_item ->> 'rating', '')::numeric,
      coalesce(nullif(v_item ->> 'reviews', '')::bigint, 0),
      case when v_item ? 'success' then (v_item ->> 'success')::boolean else null end,
      nullif(v_item ->> 'similarity', '')::numeric
    );
    v_position := v_position + 1;
  end loop;

  insert into public.audit_events (owner_id, request_id, event_type, entity_type, entity_id)
  values (v_owner, p_request_id, 'analysis.created', 'analysis', v_analysis_id::text);

  return v_analysis_id;
end;
$$;

revoke execute on function public.persist_analysis(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.persist_analysis(uuid, jsonb, jsonb) to authenticated;

create or replace function public.import_store(
  p_request_id uuid,
  p_store jsonb,
  p_shortlist jsonb default '[]'::jsonb
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_store_id bigint;
  v_product_id bigint;
  v_item jsonb;
  v_position integer;
begin
  if v_owner is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  if exists (
    select 1 from public.audit_events
    where owner_id = v_owner and request_id = p_request_id and event_type = 'store.imported'
  ) then
    select id into v_store_id from public.stores where owner_id = v_owner;
    return v_store_id;
  end if;

  if p_store is not null and jsonb_typeof(p_store) = 'object' then
  insert into public.stores (owner_id, brand, description, currency)
  values (
    v_owner, p_store ->> 'brand', coalesce(p_store ->> 'description', ''),
    coalesce(p_store ->> 'currency', 'USD')
  )
  on conflict (owner_id) do update
  set brand = excluded.brand,
      description = excluded.description,
      currency = excluded.currency,
      updated_at = now()
  returning id into v_store_id;

  delete from public.store_products where owner_id = v_owner and store_id = v_store_id;
  v_position := 0;
  for v_item in select value from jsonb_array_elements(coalesce(p_store -> 'products', '[]'::jsonb))
  loop
    insert into public.portfolio_products (
      owner_id, source_product_id, source_type, product_key, subcategory, name,
      description, selling_price, success_score, estimated_monthly_profit,
      startup_cost, image_url, trend_pct, currency, source_payload
    ) values (
      v_owner, v_item ->> 'id', coalesce(v_item ->> 'sourceType', 'simulation'),
      v_item ->> 'key', coalesce(v_item ->> 'category', v_item ->> 'key'),
      v_item ->> 'name', coalesce(v_item ->> 'description', ''),
      (v_item ->> 'price')::numeric, (v_item ->> 'successScore')::numeric,
      (v_item ->> 'monthlyProfit')::numeric, (v_item ->> 'startupCost')::numeric,
      v_item ->> 'image', coalesce((v_item ->> 'trend')::numeric, 0),
      coalesce(v_item ->> 'currency', 'USD'), v_item
    )
    on conflict (owner_id, source_type, source_product_id) do update
    set product_key = excluded.product_key,
        subcategory = excluded.subcategory,
        name = excluded.name,
        description = excluded.description,
        selling_price = excluded.selling_price,
        success_score = excluded.success_score,
        estimated_monthly_profit = excluded.estimated_monthly_profit,
        startup_cost = excluded.startup_cost,
        image_url = excluded.image_url,
        trend_pct = excluded.trend_pct,
        currency = excluded.currency,
        source_payload = excluded.source_payload,
        updated_at = now()
    returning id into v_product_id;

    insert into public.store_products (store_id, owner_id, product_id, position)
    values (v_store_id, v_owner, v_product_id, v_position);
    v_position := v_position + 1;
  end loop;
  else
    delete from public.stores where owner_id = v_owner;
    v_store_id := null;
  end if;

  delete from public.shortlist_items where owner_id = v_owner;

  v_position := 0;
  for v_item in select value from jsonb_array_elements(coalesce(p_shortlist, '[]'::jsonb))
  loop
    insert into public.portfolio_products (
      owner_id, source_product_id, source_type, product_key, subcategory, name,
      description, selling_price, success_score, estimated_monthly_profit,
      startup_cost, image_url, trend_pct, currency, source_payload
    ) values (
      v_owner, v_item ->> 'id', coalesce(v_item ->> 'sourceType', 'simulation'),
      v_item ->> 'key', coalesce(v_item ->> 'category', v_item ->> 'key'),
      v_item ->> 'name', coalesce(v_item ->> 'description', ''),
      (v_item ->> 'price')::numeric, (v_item ->> 'successScore')::numeric,
      (v_item ->> 'monthlyProfit')::numeric, (v_item ->> 'startupCost')::numeric,
      v_item ->> 'image', coalesce((v_item ->> 'trend')::numeric, 0),
      coalesce(v_item ->> 'currency', 'USD'), v_item
    )
    on conflict (owner_id, source_type, source_product_id) do update
    set source_payload = excluded.source_payload, updated_at = now()
    returning id into v_product_id;

    insert into public.shortlist_items (owner_id, product_id, position)
    values (v_owner, v_product_id, v_position)
    on conflict (owner_id, product_id) do update set position = excluded.position;
    v_position := v_position + 1;
  end loop;

  insert into public.audit_events (owner_id, request_id, event_type, entity_type, entity_id)
  values (v_owner, p_request_id, 'store.imported', 'store', v_store_id::text);

  return v_store_id;
end;
$$;

revoke execute on function public.import_store(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.import_store(uuid, jsonb, jsonb) to authenticated;

create view analytics.analysis_export_v1
with (security_invoker = true)
as
select
  a.id as analysis_id,
  a.request_id,
  a.created_at,
  a.status,
  a.source_type,
  a.model_version,
  a.dataset_version,
  i.subcategory,
  i.market,
  i.currency,
  i.selling_price,
  m.success_score,
  m.risk_index,
  m.saturation,
  m.uncertainty,
  m.recommended_price,
  m.profit_per_sale,
  m.expected_monthly_profit,
  m.profit_is_complete
from public.analyses a
join public.product_inputs i on i.analysis_id = a.id and i.owner_id = a.owner_id
join public.analysis_metrics m on m.analysis_id = a.id and m.owner_id = a.owner_id
where a.status = 'completed';

revoke all on analytics.analysis_export_v1 from public, anon, authenticated;
grant usage on schema analytics to service_role;
grant select on analytics.analysis_export_v1 to service_role;

commit;
