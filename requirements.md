# Product Success Predictor Requirements

## Product Summary

Product Success Predictor is a web application that helps a small business or solo entrepreneur decide whether launching a product is a good business decision before investing in inventory, ads, or production.

The application uses public marketplace data from Amazon Beauty & Personal Care products to estimate product viability based on category, price, and product description.

## Goal

The product must provide a fast and understandable decision workflow that answers:

- Is this product worth launching?
- What is the expected success probability?
- What are the main factors increasing or reducing the chance of success?
- What changes could improve the launch decision?

## Target User

- Small business owners
- Solo founders
- Early-stage e-commerce sellers
- Users without access to formal market research

## Core User Flow

1. The user enters product inputs.
2. The system analyzes the input against comparable marketplace data.
3. The system returns a decision dashboard.
4. The user reviews metrics, trends, risks, and recommendations.
5. The user decides to launch, adjust, or reject the product idea.

## Input Requirements

The application must accept:

- Product category
- Product price
- Short product description

The application should also support:

- Expected gross margin
- Monthly ad budget
- Scenario selection such as balanced, conservative, or aggressive

## Output Requirements

The application must display the following decision outputs:

- Decision success percentage
- Decision risk percentage
- Market saturation percentage
- Product age indicator
- Number of published products
- Price fit or suggested price guidance
- Confidence level of the prediction

## Dashboard Requirements

The dashboard must include:

### 1. KPI Cards

- Market saturation
- Product age
- Number of published products
- Price fit score

### 2. Charts

- Product Price History
  - X-axis: date
  - Y-axis: price
- Rating History
  - X-axis: date
  - Y-axis: rating
- Purchase History by Age
  - X-axis: age group
  - Y-axis: quantity purchased

### 3. AI Decision Summary

The summary must include:

- Decision success percentage
- Decision risk percentage
- One recommendation to reduce risk
- Market saturation percentage
- Target audience count
- Search interest data
- Best store selling this product
- Best-rated published product
- Additional selling tips

### 4. Decision-Support Sections

The application should include:

- Weighted decision drivers
- Launch verdict states
  - Launch now
  - Reposition first
  - Avoid for now
- Comparable product snapshot
- Scenario switching for fast comparison

## Functional Requirements

- The app must render as a single-page web experience.
- The app must update the dashboard after the user changes inputs.
- The app must explain the prediction using visible business factors, not only a score.
- The app must help the user compare price and market position quickly.
- The app must surface at least one recommended next action.
- The app must remain understandable for non-technical users.

## Data Requirements

- The main dataset source is `meta_Beauty_and_Personal_Care.json`.
- The first version uses Beauty & Personal Care subcategories only.
- The product must use comparable product data rather than direct sales data.
- The system must acknowledge that success is a proxy based on rating and review signals.

## Non-Functional Requirements

- The interface must look professional, modern, clean, and simple.
- The design must fit on one page.
- The page must work well on desktop and mobile widths.
- The application must be fast to load and easy to scan.
- The output must be understandable in presentation and demo contexts.

## Assumptions and Limitations

- No real sales data is available in the current dataset.
- Price data is incomplete for many products.
- The current solution is strongest for categories with enough comparable history.
- The first public demo may use fake or mocked values before the full model is connected.

## Success Criteria

The product is successful when:

- A user can enter a product idea in less than one minute.
- The application returns a clear launch recommendation.
- The user can understand why the recommendation was made.
- The user can identify at least one improvement action.
- The dashboard can be used as both a product demo and a future real application shell.
