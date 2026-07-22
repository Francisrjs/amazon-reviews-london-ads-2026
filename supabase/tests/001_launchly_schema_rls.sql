begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

select has_table('public', 'analyses', 'analyses table exists');
select has_table('public', 'stores', 'stores table exists');
select has_table('public', 'portfolio_products', 'portfolio products table exists');
select has_table('public', 'shortlist_items', 'shortlist table exists');
select has_table('public', 'store_products', 'store products table exists');
select has_function('public', 'persist_analysis', array['uuid', 'jsonb', 'jsonb'], 'analysis RPC exists');
select has_function('public', 'import_store', array['uuid', 'jsonb', 'jsonb'], 'store import RPC exists');
select col_type_is('public', 'portfolio_products', 'selling_price', 'numeric(12,2)', 'money uses numeric');
select col_is_pk('public', 'analyses', 'id', 'analyses has primary key');
select col_is_fk('public', 'analyses', 'owner_id', 'analysis owner has foreign key');
select has_index('public', 'analyses', 'analyses_owner_created_idx', 'history cursor index exists');
select has_index('public', 'portfolio_products', 'portfolio_products_owner_created_idx', 'portfolio owner index exists');
select policies_are('public', 'stores', array[
  'stores_delete_own', 'stores_insert_own', 'stores_select_own', 'stores_update_own'
], 'stores has operation-specific RLS policies');
select policies_are('public', 'analyses', array[
  'analyses_delete_own', 'analyses_insert_own', 'analyses_select_own', 'analyses_update_own'
], 'analyses has operation-specific RLS policies');
select is(
  (select count(*)::integer from information_schema.views where table_schema = 'analytics' and table_name = 'analysis_export_v1'),
  1,
  'Power BI export view exists'
);

select * from finish();
rollback;
