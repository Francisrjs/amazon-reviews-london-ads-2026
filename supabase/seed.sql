-- Application seed data is deliberately small. Raw datasets, reviews, model
-- artifacts, and embeddings do not belong in PostgreSQL.
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
on conflict (version) do update
set algorithm = excluded.algorithm,
    is_current = excluded.is_current,
    validation_metrics = excluded.validation_metrics,
    published_at = excluded.published_at;

insert into public.dataset_versions (
  version, snapshot_date, source_manifest, is_current
)
values (
  'beauty-master-2026-07',
  '2026-07-01',
  '{"storage": "external", "contains_raw_reviews": false}'::jsonb,
  true
)
on conflict (version) do update
set snapshot_date = excluded.snapshot_date,
    source_manifest = excluded.source_manifest,
    is_current = excluded.is_current;
