# Audience, names, and age estimation

## 1. Two different features

### A. Target Audience Estimator

Estimates the probable product segment using description, metadata, and comparable reviews.

Example:

```text
Likely target segment: Adults 45+
Evidence: "mature skin", "anti-aging", "wrinkles"
Confidence: Medium
```

### B. NameAge Estimator

Estimates the aggregated age distribution associated with a first name in a specific population.

Correct example:

```text
Name: William
Estimated mean age: 68
Median: 66
P25-P75: 51-79
Country/source: United States SSA-derived data
```

This does not mean that a person named William is 68 years old.

## 2. Evaluated repository

`andland/nameage` is an MIT-licensed R package that uses Social Security Administration baby-name data and actuarial tables. Its `nameage()` function returns `n`, `n_alive`, mean, standard deviation, Q1, median, and Q3. The package default reference year is 2015.

## 3. Repository constraints

- R, not Python.
- Version 0.1 and a small repository.
- United States data and population.
- It does not estimate exact age.
- The distribution depends on `base_year`.
- It does not automatically cover the UK, Latin America, or other countries.
- It should not be used as a production dependency without tests and data updates.

## 4. Integration recommendation

Do not execute R on every request. Choose one of these options:

### Recommended option - Port or lookup in Python

1. Download name data allowed by license or source.
2. Reproduce the survival-weight algorithm.
3. Precompute a table:

```text
name, country, base_year, n, n_alive, mean, sd, q1, median, q3
```

4. Store the lookup in compressed form.
5. Serve it from FastAPI.

### Alternative option - R microservice

Keep the original package in a separate service. This is more expensive to operate and is not recommended for the MVP.

## 5. Name availability in the current dataset

The review dataset contains `user_id`, but not a reliable first-name column. Therefore, NameAge cannot be computed from the current data unless:

- The user explicitly enters a name.
- An e-commerce integration provides the first name with consent.
- An external source with valid display names is added.

Do not extract names from free-form review text: the mention may refer to someone else and creates errors.

## 6. Functional requirements

| ID | Requirement | Priority |
|---|---|---:|
| AGE-001 | Receive an explicit name | P2 |
| AGE-002 | Normalize case, spaces, and variants | P2 |
| AGE-003 | Return distribution, not exact age | P2 |
| AGE-004 | Show country, source, and base year | P2 |
| AGE-005 | Show n, sd, and quartiles | P2 |
| AGE-006 | Confidence based on sample size and dispersion | P2 |
| AGE-007 | Do not persist individual inference by default | P0 |
| AGE-008 | Reject missing names without inventing a result | P2 |

## 7. Suggested confidence

Confidence combines sample size and dispersion:

- Low: `n_alive < 100` or `sd > 25`.
- Medium: `n_alive >= 100` and `sd <= 25`.
- High: `n_alive >= 1000` and `sd <= 15`.

These thresholds are starting rules and must be validated.

## 8. Allowed use in Launchly

- Show the aggregated distribution of a potential audience.
- Complement, not replace, product evidence.
- Mark as experimental.
- Do not use it for individual pricing, exclusion, credit, health, or any other sensitive decision.
