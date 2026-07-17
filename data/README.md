# Data directory

- `fake/`: small synthetic data that is allowed in Git.
- `raw/`: external files, unchanged, ignored by Git.
- `processed/`: local derived datasets, ignored by Git.
- `external/`: manifests and source documentation.

Real files live in object storage. Each dataset must have a manifest with version, checksum, schema, and date.
