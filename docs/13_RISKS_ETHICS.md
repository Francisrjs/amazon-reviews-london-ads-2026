# Risks, limitations, and responsible use

## 1. Scientific risks

| Risk | Impact | Mitigation |
|---|---|---|
| No real sales data | Success is a proxy | Clear labeling and sensitivity analysis |
| Survivorship bias | Optimistic score | General dataset without the at-least-50-reviews filter |
| Missing price | Biased price model | Separate subset plus missing flag |
| Noisy taxonomy | Wrong comparisons | `categories[1]` and whitelist |
| Leakage | False metrics | Automatic audit |
| Old dataset | Drift | Versions and monitoring |
| Price association is not causality | Misleading recommendation | Historical scenario language |

## 2. Business risks

- Profit is wrong if fees or costs are missing.
- Monthly units are not observed.
- Market and channel are hardcoded in the prototype.
- Simulated trends may be presented as real.

## 3. Age and name risks

- A name does not identify an individual age.
- Geographic and cultural bias.
- Wide distributions.
- Fake names, aliases, and family accounts.
- Potential unwanted profiling.

### Policy

- Aggregates only.
- Source and country visible.
- Do not persist per person by default.
- Do not use in sensitive decisions.
- Functionality is experimental and opt-in.

## 4. Prohibited claims

- "Guaranteed 79 percent chance of sales."
- "William is 68 years old."
- "Changing price causes success to rise."
- "This market has 68 percent real market share saturation."

## 5. Allowed claims

- "The calibrated model assigned a score of 79 based on historical proxy outcomes."
- "The name's estimated population age distribution has a mean of 68 in the stated source."
- "This price produced the strongest historical model score within the tested range."
- "Local semantic density is in the 68th percentile of the category."
