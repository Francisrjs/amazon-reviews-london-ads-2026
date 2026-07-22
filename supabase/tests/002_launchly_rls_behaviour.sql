begin;

create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated',
   'owner-one@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated',
   'owner-two@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","aud":"authenticated"}';

insert into public.stores (owner_id, brand, description)
values ('11111111-1111-4111-8111-111111111111', 'Owner One Store', 'RLS test');

select is((select count(*)::integer from public.stores), 1, 'owner can read own store');
select lives_ok(
  $$update public.stores set brand = 'Updated Store' where owner_id = '11111111-1111-4111-8111-111111111111'$$,
  'owner can update own store'
);

set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","aud":"authenticated"}';

select is((select count(*)::integer from public.stores), 0, 'second user cannot read first user store');
select throws_ok(
  $$insert into public.stores (owner_id, brand) values ('11111111-1111-4111-8111-111111111111', 'Impersonated Store')$$,
  '42501',
  'new row violates row-level security policy for table "stores"',
  'second user cannot insert for first user'
);
select is(
  (select count(*)::integer from public.stores where owner_id = '11111111-1111-4111-8111-111111111111'),
  0,
  'explicit owner filter does not bypass RLS'
);

set local role anon;
set local request.jwt.claims = '{"role":"anon","aud":"anon"}';
select throws_ok(
  $$select * from public.stores$$,
  '42501',
  'permission denied for table stores',
  'anonymous role has no table access'
);

reset role;
select * from finish();
rollback;
