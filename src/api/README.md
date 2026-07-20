# API — Product Success Predictor (FastAPI)

Sirve el modelo calibrado real (Persona 2) al dashboard `AmazonProject.html` (Persona 4).
Carga los artefactos de `REPO/output/models/` y expone los endpoints P0 del contrato
(`docs/09_API_DATABASE.md`).

## Requisitos
```bash
pip install fastapi "uvicorn[standard]" scikit-learn pandas numpy joblib
```
Los artefactos deben existir en `REPO/output/models/` (los genera `src/ml/run_pipeline.py`
+ `fix_calibration_shap.py`): `model.pkl`, `calibrator_1d.pkl`, `knn_index.pkl`,
`tfidf_vectorizer.pkl`, `subcategory_stats.json`, `feature_names.json`, `density_reference.npy`,
y `output/predictions/scored_catalog.csv`.

## Ejecutar
```bash
cd REPO/src/api
uvicorn main:app --reload --port 8000
```
- Docs interactivas (Swagger): http://localhost:8000/docs
- Health: http://localhost:8000/health

## Endpoints

| Método | Ruta | Función |
|---|---|---|
| GET  | `/health` | Liveness |
| GET  | `/v1/models/current` | Versión + métricas CV/validación/calibración |
| POST | `/v1/predict/success` | Score calibrado 0–100 + incertidumbre + confianza |
| POST | `/v1/comparables` | k-NN (5 similares) + saturación + IC Wilson |
| POST | `/v1/price-scenarios` | Curva de precio (barrido) + precio recomendado |
| POST | `/v1/analyses` | Análisis completo (lo que consume la página) |

### Ejemplo
```bash
curl -X POST http://localhost:8000/v1/analyses \
  -H "Content-Type: application/json" \
  -d '{"subcategory":"Skin Care","title":"Hydrating Vitamin C Serum",
       "description":"vegan, lightweight, fast absorbing","price":30,
       "risk_preference":"balanced"}'
```

`subcategory` debe ser una de: Hair Care, Skin Care, Foot, Hand & Nail Care, Makeup,
Tools & Accessories, Fragrance, Shave & Hair Removal, Personal Care (si no → 422).

## Conexión con la página
`AmazonProject.html` llama a `POST /v1/analyses` desde `applyModel()`. Si el backend está
arriba, los números de éxito/riesgo/saturación/comparables/curva/rango pasan a ser del
**modelo real** (badge "● Live model"); si no, cae al cálculo demo (badge "◐ Demo data").

Servir la página (para que el `fetch` tenga origen http y CORS funcione):
```bash
cd REPO   # o la carpeta del PROJECT donde está AmazonProject.html
python -m http.server 8080
# abrir http://localhost:8080/AmazonProject.html
```
Cambiar el backend desde la consola del navegador:
`localStorage.setItem('MODEL_API_BASE','http://localhost:8000')` ·
forzar demo: `localStorage.setItem('MODEL_API_OFF','1')`.

## Notas
- CORS abierto (`*`) para desarrollo; en producción restringir al dominio del front.
- Las flags de `details` (has_brand, has_scent, …) por defecto van en 0 en inferencia
  (un producto nuevo no las trae); se pueden pasar en `detail_flags`.
- Capa de negocio (profit/forecast/demografía) NO sale del modelo: sigue siendo demo/etiquetada
  según `METHODS_TO_MOCKUP.md`.
