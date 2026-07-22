# Random Forest — Historial, documentación y estado del proyecto

> Nota de nomenclatura: el archivo conserva el nombre solicitado `ramdomForest.md`. El nombre técnico correcto del algoritmo es **Random Forest**.

## 1. Alcance del documento

Este documento resume todos los commits disponibles en el historial actual del repositorio y explica cómo evolucionó Launchly desde un análisis exploratorio inicial hasta un MVP con modelo calibrado, validación estadística y una API FastAPI local.

La revisión se relaciona con:

- [Master PRD](01_PRD_MASTER.md)
- [Requirements](02_REQUIREMENTS.md)
- [Documentation Index](00_INDEX.md)
- [Data Pipeline](05_DATA_PIPELINE.md)
- [ML Models](06_ML_MODELS.md)
- [API and Database](09_API_DATABASE.md)
- [Definition of Done](14_DEFINITION_OF_DONE.md)
- [Backend Runbook](18_BACKEND_RUNBOOK.md)

## 2. Estado ejecutivo

El proyecto se encuentra en un estado de **MVP técnico parcial**:

- La exploración inicial y la estructura documental están consolidadas.
- El pipeline de Machine Learning está implementado.
- El modelo principal es un Random Forest con calibración isotónica.
- Existe una batería de validación, auditoría de leakage y pruebas unitarias.
- Existe una API FastAPI local para inferencia.
- El HTML puede consumir el modelo real cuando la API está disponible.
- El MVP de producto todavía no está cerrado porque faltan profit real, persistencia, Power BI, despliegue, seguridad y artefactos reproducibles versionados o almacenados.

El último commit de `main` es `48550aa`, un merge de `feat/person2-model-and-api`.

## 3. Línea temporal completa de commits

### `cbc4d5b` — `first commit`

**Fecha:** 14/07/2026.

**Archivos:**

- `README.md`

**Aporte:**

- Crea la primera descripción del proyecto.
- No existe todavía una estructura formal de ML, API o documentación de producto.

**Relación con el PRD:**

- Es la base inicial del repositorio.
- Todavía no define de forma verificable el alcance P0/P1/P2.

### `f59d257` — `first commit`

**Fecha:** 14/07/2026.

**Archivos principales:**

- `.gitignore`
- `requirements.txt`
- `data/category_statistics.csv`
- `notebooks/01_amazon_reviews_eda.ipynb`
- `outputs/.gitkeep`

**Aporte:**

- Agrega dependencias iniciales.
- Incorpora estadísticas de categorías.
- Agrega el primer notebook de análisis exploratorio.
- Define carpetas de salida sin comprometer resultados grandes.

**Importancia:**

Este commit inicia la base de datos y análisis. Todavía no existe un target de éxito formal ni una separación entre dataset general, subconjunto con precio y subconjunto NLP.

### `0300bad` — `Se creó con Colab`

**Archivos:**

- `notebooks/01_amazon_reviews_eda.ipynb`

**Aporte:**

- Reemplaza gran parte del notebook por una versión exportada desde Google Colab.
- Reduce y reorganiza el contenido del análisis.

**Riesgo documental:**

- El notebook se convierte en una fuente de trabajo, pero la reproducibilidad todavía depende del entorno interactivo y no de scripts ejecutables.

### `7a13b62` — `Modify Sections`

**Archivos:**

- `notebooks/01_amazon_reviews_eda.ipynb`

**Aporte:**

- Modifica secciones y estructura del EDA.
- Continúa el trabajo de exploración y preparación del dataset.

**Estado:**

- Es un avance exploratorio, no una implementación del modelo de producción.

### `5d0a3b9` — `Real file`

**Archivos:**

- `01_amazon_reviews_eda.ipynb`

**Aporte:**

- Agrega otro notebook de análisis en la raíz.
- Representa una etapa de intercambio de archivos y consolidación manual.

**Riesgo:**

- Duplica la posible fuente de verdad del análisis.
- La posterior organización en `notebooks/` y `docs/` resulta necesaria para evitar ambigüedad.

### `5c54b98` — `Add files via upload`

**Archivos:**

- `PROJECT_CONTEXT.md`

**Aporte:**

- Documenta el contexto del proyecto.
- Aporta una descripción funcional previa a la formalización del PRD.

### `8230f72` — `defining template, structure project and documentations for the mvp`

**Fecha:** 17/07/2026.

**Aporte general:**

Este es el commit estructural más importante antes del modelo. Define la organización del proyecto y crea la documentación formal del MVP.

**Archivos de producto y prototipo:**

- `AmazonProject.html`
- `prototype/launchly-mvp.html`
- `outputs/product-success-mockup.html`

**Archivos de datos y pipeline:**

- `data/amazon_beauty_analysis.py`
- `data/README.md`
- `notebooks/01_data_cleaning_current.ipynb`
- `data/raw/`, `data/processed/`, `data/external/`, `data/fake/`

**Documentación creada:**

- `docs/00_INDEX.md`
- `docs/01_PRD_MASTER.md`
- `docs/02_REQUIREMENTS.md`
- `docs/03_FUNCTIONALITIES.md`
- `docs/04_HTML_MVP_MAPPING.md`
- `docs/05_DATA_PIPELINE.md`
- `docs/06_ML_MODELS.md`
- `docs/07_AUDIENCE_NAMEAGE.md`
- `docs/08_ARCHITECTURE_HOSTING.md`
- `docs/09_API_DATABASE.md`
- `docs/10_POWERBI_VALIDATION.md`
- `docs/11_VALIDATION_QA.md`
- `docs/12_ROADMAP_PRIORITIES.md`
- `docs/13_RISKS_ETHICS.md`
- `docs/14_DEFINITION_OF_DONE.md`
- `docs/15_REFERENCES.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/manifest.json`

**Decisiones de producto introducidas:**

- Success Score de 0 a 100.
- Decision Risk como índice, no como probabilidad.
- Profit per Sale con costes explícitos.
- Comparables y saturación.
- Curvas de precio.
- Persistencia en Supabase.
- Exportación para Power BI.
- División P0, P1 y P2.

**Estado real:**

La mayor parte de estas capacidades se define como objetivo o prototipo. El HTML contiene simulaciones y la API todavía no está implementada.

### `cc8c55f` — `add .md formulas`

**Archivos:**

- `docs/FORMULAS_AND_METRICS.md`

**Aporte:**

- Documenta fórmulas y métricas del proyecto.
- Prepara la separación conceptual entre estadística descriptiva, target, score, calibración, comparables, riesgo y profit.

**Importancia para Random Forest:**

El modelo no debe interpretarse aislado. Sus métricas dependen de cómo se define el target, cómo se construyen las features, cómo se calibra la probabilidad y cómo se transforma la salida en un score de negocio.

### `d77b9a3` — `first steps for the mvp`

**Archivos:**

- `docs/16_FIRST_STEPS_GUIDE.md`
- `docs/17_FASTAPI_EXPLAINER.md`

**Aporte:**

- Crea una guía de primeros pasos.
- Explica por qué FastAPI es la frontera entre frontend, modelo y persistencia.
- Define una arquitectura conceptual `Frontend -> FastAPI -> Model/Rules -> Supabase`.

**Estado:**

En este momento FastAPI está documentado como decisión técnica, pero la implementación todavía se incorpora en el commit de la Persona 2.

### `8d5feb6` — `Update data pipeline documentation and first steps guide; clarify dataset outputs and structure, remove obsolete notebooks.`

**Fecha:** 17/07/2026.

**Archivos:**

- `docs/05_DATA_PIPELINE.md`
- `docs/16_FIRST_STEPS_GUIDE.md`
- Eliminación de `notebooks/01_amazon_reviews_eda.ipynb`
- Renombrado de `notebooks/01_data_cleaning_current.ipynb` a `notebooks/ADSB_Project.ipynb`

**Aporte:**

- Corrige el flujo documental del pipeline.
- Elimina notebooks obsoletos.
- Diferencia el dataset general, el subconjunto con precio y el subconjunto NLP.
- Señala el riesgo de survivorship bias.
- Recomienda conservar `price_is_missing`.
- Reconoce `categories` como taxonomía confiable frente a `main_category`.

**Relación con los requisitos:**

Este commit alinea la documentación con DR-001 a DR-008, especialmente con la necesidad de evitar leakage y separar datasets por uso.

### `d8e6157` — `Person 2 (data scientist): full analysis pipeline, model, testing and API`

**Fecha:** 20/07/2026.

Este es el commit que implementa el Random Forest y convierte la especificación documental en código ejecutable de ML e inferencia.

#### Código de ML

- `src/ml/run_pipeline.py`
  - Ejecuta el análisis de principio a fin.
  - Construye features numéricas, one-hot y TF-IDF.
  - Calcula `price_fit`.
  - Define la etiqueta de éxito.
  - Entrena el Random Forest.
  - Genera artefactos, métricas y figuras.

- `src/ml/metrics.py`
  - Estadística descriptiva.
  - Transformaciones y outliers.
  - Correlaciones y tamaño de efecto.
  - Balance de clases.
  - `price_fit`.
  - Métricas de clasificación.
  - ECE.
  - Calibración.
  - Importancia por permutación.
  - SHAP.
  - Score 0–100.
  - Wilson interval.
  - Risk index.
  - Comparables y saturación.

- `src/ml/fix_calibration_shap.py`
  - Corrige la calibración para usar predicciones out-of-fold.
  - Evita calibrar con predicciones de entrenamiento demasiado optimistas.
  - Produce la curva de calibración honesta.

- `src/ml/leakage_audit.py`
  - Ajusta TF-IDF y estadísticas de precio dentro de cada fold.
  - Compara resultados globales y leak-free.
  - Audita que el resultado no esté artificialmente inflado.

- `src/ml/model_validation.py`
  - Holdout 80/20.
  - Comparación con dummy y regresiones logísticas.
  - Label permutation.
  - Estabilidad entre diferentes particiones.
  - Rendimiento por subcategoría.

#### API

- `src/api/main.py`
  - Implementa `/health`.
  - Implementa `/v1/models/current`.
  - Implementa `/v1/predict/success`.
  - Implementa `/v1/comparables`.
  - Implementa `/v1/price-scenarios`.
  - Implementa `/v1/analyses`.

- `src/api/inference.py`
  - Reconstruye el vector de 316 features.
  - Carga el modelo y los artefactos.
  - Produce score calibrado, incertidumbre, comparables, saturación y curva de precio.

- `src/api/requirements.txt`
  - Declara FastAPI, Uvicorn, scikit-learn, pandas, NumPy y joblib.

#### Tests y evidencias

- `tests/test_metrics.py`
  - Incluye 19 pruebas unitarias para las fórmulas.

- `MODEL_TESTING_REPORT.md`
  - Documenta 19/19 pruebas.
  - Documenta auditoría de leakage.
  - Documenta holdout, baselines, permutation, estabilidad y subcategorías.

- `ANALYSIS_RESULTS.md`
  - Documenta las partes I–VIII del análisis.

- `output/metrics/analysis_results.json`
- `output/metrics/leakage_audit.json`
- `output/metrics/model_validation.json`
- `output/figures/*.png`

#### Frontend

- `AmazonProject.html`
- `prototype/launchly-mvp.html`

Ambos intentan consumir el análisis real y conservan un fallback de datos demo. El badge `Live model` indica respuesta de la API; `Demo data` no representa una predicción real.

#### Limitaciones introducidas por este commit

- No implementa profit real.
- No persiste análisis en Supabase.
- No exporta resultados a Power BI.
- No incluye artefactos binarios del modelo en Git.
- No implementa autenticación, RLS, HTTPS ni observabilidad de producción.
- No entrega request ID ni historial de análisis.

### `48550aa` — `Merge branch 'feat/person2-model-and-api': Person 2 data science + API`

**Fecha:** 20/07/2026.

**Padres:**

- `8d5feb6` como rama principal.
- `d8e6157` como rama de la Persona 2.

**Resultado:**

- Integra en `main` todo el pipeline de Data Science y la API.
- `main` queda alineada con `origin/main` en el momento de la revisión.
- El merge agrega 23 archivos y aproximadamente 3.304 líneas nuevas desde la rama de la Persona 2.

**Interpretación correcta:**

Este merge cierra una entrega importante de modelado e inferencia, pero no cierra el MVP completo del PRD.

## 4. Arquitectura actual del Random Forest

### Flujo de entrenamiento

```text
Dataset de productos
        |
        v
Validación de taxonomía y preparación
        |
        v
Features numéricas + flags + subcategoría + TF-IDF
        |
        v
Random Forest
        |
        v
Probabilidad raw
        |
        v
Calibración isotónica OOF
        |
        v
Success Score 0-100 + incertidumbre
```

### Features principales

- `price_fit` por subcategoría.
- `price_is_missing` según la especificación del pipeline.
- Flags estructurales del producto.
- One-hot de las 8 subcategorías reales.
- Hasta 300 dimensiones TF-IDF del título y descripción.
- Vector total documentado en la inferencia: 316 dimensiones.

### Salidas del sistema

| Salida | Significado |
|---|---|
| Success Score | Proxy calibrado de patrones históricos similares. No es garantía de ventas. |
| Probability | Probabilidad calibrada usada internamente para el score. |
| Uncertainty | Dispersión de las predicciones de los árboles. |
| Confidence | Banda cualitativa derivada de la incertidumbre. |
| Decision Risk | Índice compuesto de downside, saturación e incertidumbre. No es probabilidad de fracaso. |
| Comparables | Productos cercanos según el índice k-NN. |
| Saturation | Percentil de densidad local. No es market share. |
| Price curve | Escenarios de precio frente al score. No demuestra causalidad. |

## 5. Resultados documentados del modelo

Según `MODEL_TESTING_REPORT.md`:

- ROC-AUC OOF: aproximadamente `0.715`.
- ROC-AUC en holdout: aproximadamente `0.707`.
- PR-AUC en holdout: `0.462`.
- ECE calibrado: aproximadamente `0.007`.
- La calibración mejora el Brier de `0.188` a `0.172`.
- Las etiquetas permutadas producen aproximadamente `0.496`, cercano al azar.
- La estabilidad entre particiones es aproximadamente `0.714 ± 0.007`.
- Las ocho subcategorías superan el azar, aunque `Personal Care` y `Fragrance` son más débiles.

### Interpretación

La evidencia respalda una señal predictiva real y modesta. El modelo es útil como apoyo para comparar ideas y reducir incertidumbre, pero no debe presentarse como predictor causal de ventas, rentabilidad o demanda futura.

## 6. Comparación con el PRD y los requirements

### Avances alineados

- FR-001: validación de subcategorías.
- FR-004: Success Score calibrado.
- FR-007: comparables.
- FR-008: saturación.
- FR-009: escenarios de precio parcialmente implementados.
- FR-013: limitaciones visibles en la respuesta del modelo.
- DR-005: uso de subcategorías reales.
- DR-006: auditoría de leakage.
- NFR-006: pipeline ejecutable mediante scripts.
- NFR-009: tests y documentación técnica parcial.

### Brechas pendientes

- FR-003: faltan costes, moneda y mercado en la entrada real.
- FR-006: profit per sale no está implementado en la API real.
- FR-009: los escenarios devuelven score, pero no riesgo y profit por precio.
- FR-010: faltan explicaciones positivas y negativas específicas por producto.
- FR-011: no hay persistencia ni history en Supabase.
- FR-012: no existe exportación Power BI versionada.
- NFR-003: CORS está abierto y faltan controles de producción.
- NFR-005: faltan request IDs completos.
- NFR-007: faltan logs, latencia, errores y drift operativo.
- NFR-008: falta validación formal de accesibilidad.

## 7. Documentos relacionados y función de cada uno

| Documento | Función |
|---|---|
| `docs/01_PRD_MASTER.md` | Objetivo, alcance, usuarios, flujo y definición del MVP. |
| `docs/02_REQUIREMENTS.md` | Requisitos funcionales, datos, no funcionales y reglas de negocio. |
| `docs/05_DATA_PIPELINE.md` | Datasets, taxonomía, leakage, particiones y artefactos. |
| `docs/06_ML_MODELS.md` | Decisiones de modelos, calibración y limitaciones. |
| `docs/09_API_DATABASE.md` | Contrato propuesto de API y modelo de persistencia. |
| `docs/11_VALIDATION_QA.md` | Estrategia de validación y pruebas. |
| `docs/14_DEFINITION_OF_DONE.md` | Checklist de cierre del MVP. |
| `docs/16_FIRST_STEPS_GUIDE.md` | Secuencia de trabajo para el equipo. |
| `docs/17_FASTAPI_EXPLAINER.md` | Explicación conceptual de FastAPI. |
| `docs/18_BACKEND_RUNBOOK.md` | Instalación, artefactos, ejecución y troubleshooting local. |
| `ANALYSIS_RESULTS.md` | Resultados del análisis ejecutado. |
| `MODEL_TESTING_REPORT.md` | Evidencia de veracidad y estabilidad del modelo. |

## 8. Artefactos necesarios para ejecutar la API

La API requiere archivos generados que no están incluidos en Git:

```text
output/models/model.pkl
output/models/calibrator_1d.pkl
output/models/knn_index.pkl
output/models/tfidf_vectorizer.pkl
output/models/feature_names.json
output/models/subcategory_stats.json
output/models/density_reference.npy
output/predictions/scored_catalog.csv
```

El pipeline también espera `Master_Beauty_Dataset.csv` en una ubicación específica del proyecto. Esta diferencia entre el dataset local y el path esperado debe resolverse para que exista una ejecución reproducible desde un checkout limpio.

## 9. Comandos documentados

```bash
python -m pip install -r src/api/requirements.txt
python src/ml/run_pipeline.py
python src/ml/fix_calibration_shap.py
python tests/test_metrics.py
```

Para iniciar la API:

```bash
cd src/api
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Para servir el frontend:

```bash
python -m http.server 8080
```

## 10. Conclusión técnica

El historial muestra una evolución coherente en cuatro fases:

1. Exploración y notebooks.
2. Formalización del producto y documentación.
3. Corrección del pipeline y separación de datasets.
4. Implementación del modelo calibrado, validación y API.

El Random Forest está suficientemente documentado como experimento validado y como servicio local de inferencia. Todavía no es un sistema de producción ni el MVP completo de negocio definido por el PRD.

---

# Random Forest — Histórico, documentação e estado do projeto

> Nota de nomenclatura: o arquivo mantém o nome solicitado `ramdomForest.md`. O nome técnico correto do algoritmo é **Random Forest**.

## 1. Escopo do documento

Este documento resume todos os commits disponíveis no histórico atual do repositório e explica como o Launchly evoluiu de uma análise exploratória inicial para um MVP com modelo calibrado, validação estatística e uma API FastAPI local.

A revisão está relacionada com:

- [Master PRD](01_PRD_MASTER.md)
- [Requirements](02_REQUIREMENTS.md)
- [Documentation Index](00_INDEX.md)
- [Data Pipeline](05_DATA_PIPELINE.md)
- [ML Models](06_ML_MODELS.md)
- [API and Database](09_API_DATABASE.md)
- [Definition of Done](14_DEFINITION_OF_DONE.md)
- [Backend Runbook](18_BACKEND_RUNBOOK.md)

## 2. Status executivo

O projeto está em um estado de **MVP técnico parcial**:

- A exploração inicial e a estrutura documental estão consolidadas.
- O pipeline de Machine Learning está implementado.
- O modelo principal é um Random Forest com calibração isotônica.
- Existe uma bateria de validação, auditoria de leakage e testes unitários.
- Existe uma API FastAPI local para inferência.
- O HTML pode consumir o modelo real quando a API está disponível.
- O MVP de produto ainda não foi concluído porque faltam lucro real, persistência, Power BI, deploy, segurança e artefatos reproduzíveis versionados ou armazenados.

O último commit de `main` é `48550aa`, um merge de `feat/person2-model-and-api`.

## 3. Linha do tempo completa dos commits

### `cbc4d5b` — `first commit`

Cria o primeiro `README.md`. É a base inicial do projeto, sem estrutura formal de ML, API ou documentação de produto.

### `f59d257` — `first commit`

Adiciona `.gitignore`, `requirements.txt`, estatísticas de categorias, o primeiro notebook EDA e a pasta de outputs. Começa a base de dados e análise, mas ainda não existe um target de sucesso formal nem a separação de datasets por uso.

### `0300bad` — `Se creó con Colab`

Substitui grande parte do notebook EDA por uma versão exportada do Google Colab. Organiza o trabalho exploratório, mas a reprodutibilidade ainda depende do notebook.

### `7a13b62` — `Modify Sections`

Modifica seções do notebook de análise exploratória. É uma etapa de exploração, não uma implementação do modelo de produção.

### `5d0a3b9` — `Real file`

Adiciona outro notebook EDA na raiz. Representa uma etapa de intercâmbio de arquivos e cria duplicidade de fontes de análise, posteriormente corrigida pela organização do projeto.

### `5c54b98` — `Add files via upload`

Adiciona `PROJECT_CONTEXT.md`, documentando o contexto do projeto antes da formalização do PRD.

### `8230f72` — `defining template, structure project and documentations for the mvp`

Cria a estrutura principal do Launchly: protótipos HTML, pipeline de dados, pastas de output, áreas de API/ML/testes/Supabase e quase toda a documentação em `docs/`.

Define o PRD, requisitos, funcionalidades, arquitetura, API, Power BI, QA, roadmap, riscos e Definition of Done. Também formaliza Success Score, Decision Risk, Profit per Sale, comparáveis, saturação, cenários de preço, persistência em Supabase e exportação para Power BI.

Neste momento, muitas capacidades ainda eram protótipos ou simulações; a API real ainda não existia.

### `cc8c55f` — `add .md formulas`

Cria `docs/FORMULAS_AND_METRICS.md` com fórmulas e métricas. Estabelece a separação entre estatística, target, score, calibração, comparáveis, risco e profit.

### `d77b9a3` — `first steps for the mvp`

Cria a guia de primeiros passos e a explicação de FastAPI. Define conceitualmente a fronteira `Frontend -> FastAPI -> Model/Rules -> Supabase`.

### `8d5feb6` — atualização do pipeline e remoção de notebooks obsoletos

Atualiza `docs/05_DATA_PIPELINE.md` e `docs/16_FIRST_STEPS_GUIDE.md`, remove notebooks obsoletos e renomeia o notebook atual para `notebooks/ADSB_Project.ipynb`.

A documentação passa a diferenciar dataset geral, subconjunto com preço e subconjunto NLP, explicita o risco de survivorship bias, preserva `price_is_missing`, recomenda a taxonomia `categories` e reforça o controle de leakage.

### `d8e6157` — `Person 2 (data scientist): full analysis pipeline, model, testing and API`

Implementa o núcleo do Random Forest e da inferência.

**ML:**

- `src/ml/run_pipeline.py` executa o fluxo I–VIII.
- `src/ml/metrics.py` implementa métricas, `price_fit`, score, risco, comparáveis, saturação, Wilson e calibração.
- `src/ml/fix_calibration_shap.py` corrige a calibração com predições out-of-fold.
- `src/ml/leakage_audit.py` audita TF-IDF e estatísticas de preço dentro de cada fold.
- `src/ml/model_validation.py` executa holdout, baselines, permutation, estabilidade e resultados por subcategoria.

**API:**

- `src/api/main.py` cria `/health`, `/v1/models/current`, `/v1/predict/success`, `/v1/comparables`, `/v1/price-scenarios` e `/v1/analyses`.
- `src/api/inference.py` reconstrói o vetor de 316 features, carrega os artefatos e calcula as saídas do dashboard.
- `src/api/requirements.txt` declara as dependências do serviço.

**Testes e evidências:**

- `tests/test_metrics.py` contém 19 testes unitários.
- `MODEL_TESTING_REPORT.md` documenta 19/19 testes, leakage, holdout, baselines, permutation, estabilidade e subcategorias.
- `ANALYSIS_RESULTS.md` documenta o resultado do pipeline.
- `output/metrics/*.json` e `output/figures/*.png` armazenam evidências geradas.

**Frontend:**

`AmazonProject.html` e `prototype/launchly-mvp.html` tentam usar o modelo real e mantêm fallback de dados demo. `Live model` significa resposta da API; `Demo data` não é uma predição real.

**Limitações:**

- Não há lucro real.
- Não há persistência em Supabase.
- Não há exportação Power BI.
- Os artefatos binários do modelo não estão no Git.
- Não há autenticação, RLS, HTTPS ou observabilidade de produção.

### `48550aa` — merge de `feat/person2-model-and-api`

Integra `d8e6157` sobre `8d5feb6` em `main`. O merge agrega 23 arquivos e aproximadamente 3.304 linhas novas relacionadas ao pipeline, modelo, validação, API, relatórios e frontend.

O merge representa a conclusão da entrega de Data Science e inferência local, mas não a conclusão do MVP de negócio definido no PRD.

## 4. Arquitetura atual do Random Forest

```text
Dataset de produtos
        |
        v
Validação da taxonomia e preparação
        |
        v
Features numéricas + flags + subcategoria + TF-IDF
        |
        v
Random Forest
        |
        v
Probabilidade raw
        |
        v
Calibração isotônica OOF
        |
        v
Success Score 0-100 + incerteza
```

### Principais features

- `price_fit` por subcategoria.
- `price_is_missing` conforme a especificação do pipeline.
- Flags estruturais do produto.
- One-hot das 8 subcategorias reais.
- Até 300 dimensões TF-IDF do título e descrição.
- Vetor total documentado na inferência: 316 dimensões.

### Saídas

| Saída | Significado |
|---|---|
| Success Score | Proxy calibrado de padrões históricos semelhantes; não é garantia de vendas. |
| Probability | Probabilidade calibrada usada internamente no score. |
| Uncertainty | Dispersão das previsões das árvores. |
| Confidence | Faixa qualitativa derivada da incerteza. |
| Decision Risk | Índice de downside, saturação e incerteza; não é probabilidade de fracasso. |
| Comparables | Produtos próximos pelo índice k-NN. |
| Saturation | Percentil de densidade local; não é participação de mercado. |
| Price curve | Cenários de preço contra score; não prova causalidade. |

## 5. Resultados documentados

Segundo `MODEL_TESTING_REPORT.md`:

- ROC-AUC OOF: aproximadamente `0.715`.
- ROC-AUC no holdout: aproximadamente `0.707`.
- PR-AUC no holdout: `0.462`.
- ECE calibrado: aproximadamente `0.007`.
- O Brier melhora de `0.188` para `0.172` após calibração.
- Labels permutados produzem aproximadamente `0.496`, próximo do acaso.
- Estabilidade entre partições: aproximadamente `0.714 ± 0.007`.
- As oito subcategorias ficam acima do acaso, embora `Personal Care` e `Fragrance` sejam mais fracas.

### Interpretação

Existe um sinal preditivo real, porém moderado. O modelo serve para comparar ideias e reduzir incerteza, não para prometer vendas, rentabilidade ou demanda futura.

## 6. Comparação com o PRD e os requirements

### Avanços alinhados

- FR-001: validação de subcategorias.
- FR-004: Success Score calibrado.
- FR-007: comparáveis.
- FR-008: saturação.
- FR-009: cenários de preço parcialmente implementados.
- FR-013: limitações na resposta.
- DR-005: subcategorias reais.
- DR-006: auditoria de leakage.
- NFR-006: pipeline por scripts.
- NFR-009: testes e documentação técnica parcial.

### Lacunas

- FR-003: faltam custos, moeda e mercado na entrada real.
- FR-006: profit per sale não está implementado na API real.
- FR-009: os cenários não retornam risco e lucro por preço.
- FR-010: faltam explicações positivas e negativas específicas.
- FR-011: não existe persistência nem histórico no Supabase.
- FR-012: não existe exportação Power BI versionada.
- NFR-003: CORS aberto e controles de produção ausentes.
- NFR-005: faltam request IDs completos.
- NFR-007: faltam logs, latência, erros e drift operacional.
- NFR-008: falta validação formal de acessibilidade.

## 7. Documentos relacionados

| Documento | Função |
|---|---|
| `docs/01_PRD_MASTER.md` | Objetivo, alcance, usuários, fluxo e MVP. |
| `docs/02_REQUIREMENTS.md` | Requisitos funcionais, de dados, não funcionais e regras de negócio. |
| `docs/05_DATA_PIPELINE.md` | Datasets, taxonomia, leakage, partições e artefatos. |
| `docs/06_ML_MODELS.md` | Decisões de modelos, calibração e limitações. |
| `docs/09_API_DATABASE.md` | Contrato proposto da API e persistência. |
| `docs/11_VALIDATION_QA.md` | Estratégia de validação e testes. |
| `docs/14_DEFINITION_OF_DONE.md` | Checklist de fechamento do MVP. |
| `docs/16_FIRST_STEPS_GUIDE.md` | Sequência de trabalho. |
| `docs/17_FASTAPI_EXPLAINER.md` | Explicação conceitual de FastAPI. |
| `docs/18_BACKEND_RUNBOOK.md` | Instalação, artefatos, execução e troubleshooting. |
| `ANALYSIS_RESULTS.md` | Resultados da análise. |
| `MODEL_TESTING_REPORT.md` | Evidências de veracidade e estabilidade. |

## 8. Artefatos necessários para executar a API

A API requer arquivos que não estão incluídos no Git:

```text
output/models/model.pkl
output/models/calibrator_1d.pkl
output/models/knn_index.pkl
output/models/tfidf_vectorizer.pkl
output/models/feature_names.json
output/models/subcategory_stats.json
output/models/density_reference.npy
output/predictions/scored_catalog.csv
```

O pipeline também espera `Master_Beauty_Dataset.csv` em um caminho específico. A diferença entre o dataset local e o caminho esperado precisa ser resolvida para permitir uma execução reproduzível a partir de um checkout limpo.

## 9. Comandos documentados

```bash
python -m pip install -r src/api/requirements.txt
python src/ml/run_pipeline.py
python src/ml/fix_calibration_shap.py
python tests/test_metrics.py
```

Para iniciar a API:

```bash
cd src/api
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Para servir o frontend:

```bash
python -m http.server 8080
```

## 10. Conclusão técnica

O histórico apresenta quatro fases: exploração e notebooks; formalização do produto; correção do pipeline e separação dos datasets; implementação do modelo calibrado, validação e API.

O Random Forest está documentado como experimento validado e como serviço local de inferência. Ainda não é um sistema de produção nem o MVP completo de negócio definido pelo PRD.
