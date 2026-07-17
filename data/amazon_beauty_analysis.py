"""
Análisis de Amazon Reviews 2023
Categoría: Beauty_and_Personal_Care

Archivos esperados:
    Beauty_and_Personal_Care.jsonl.gz
    meta_Beauty_and_Personal_Care.jsonl.gz

Uso recomendado en Google Colab:
    1. Sube este archivo .py a Colab.
    2. Guarda los archivos del dataset en Google Drive.
    3. Cambia DATA_DIR por la ruta correcta.
    4. Ejecuta:
           %run amazon_beauty_analysis.py

El programa:
    - Monta Google Drive si se ejecuta en Colab.
    - Verifica que existan los archivos.
    - Lee una muestra por bloques para no llenar la memoria.
    - Muestra columnas y tipos de datos.
    - Crea tablas descriptivas.
    - Genera gráficos.
    - Une reviews y metadatos mediante parent_asin.
    - Exporta resultados a CSV y PNG.
"""

from pathlib import Path
from typing import Optional

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

# Cambia esta ruta por la carpeta de Google Drive donde guardaste
# los archivos .jsonl.gz.
DATA_DIR = Path(
    "/content/drive/MyDrive/amazon-reviews-2023-analysis/data"
)

REVIEWS_FILE = DATA_DIR / "Beauty_and_Personal_Care.jsonl.gz"
METADATA_FILE = DATA_DIR / "meta_Beauty_and_Personal_Care.jsonl.gz"

# Cantidad de registros que se cargarán en memoria.
# Puedes aumentar estos valores gradualmente.
REVIEWS_SAMPLE_SIZE = 10_000
METADATA_SAMPLE_SIZE = 10_000

# Carpeta donde se guardarán los CSV y gráficos.
OUTPUT_DIR = Path("/content/amazon_beauty_outputs")

pd.set_option("display.max_columns", None)
pd.set_option("display.max_colwidth", 120)


# ============================================================
# 2. FUNCIONES GENERALES
# ============================================================

def mount_google_drive() -> None:
    """
    Monta Google Drive solamente cuando el programa se ejecuta en Colab.
    En una computadora local, continúa sin montar Drive.
    """
    try:
        from google.colab import drive  # type: ignore

        print("Entorno Google Colab detectado.")
        drive.mount("/content/drive")
    except ImportError:
        print("No se detectó Google Colab.")
        print("Se utilizarán las rutas locales configuradas en DATA_DIR.")


def verify_files() -> None:
    """
    Verifica que los dos archivos necesarios existan.
    Detiene el programa con un mensaje claro si falta alguno.
    """
    print("\n=== VERIFICACIÓN DE ARCHIVOS ===")
    print(f"Archivo de reviews: {REVIEWS_FILE}")
    print(f"Existe: {REVIEWS_FILE.exists()}")

    print(f"\nArchivo de metadatos: {METADATA_FILE}")
    print(f"Existe: {METADATA_FILE.exists()}")

    missing_files = [
        path for path in [REVIEWS_FILE, METADATA_FILE]
        if not path.exists()
    ]

    if missing_files:
        missing_text = "\n".join(f"- {path}" for path in missing_files)

        raise FileNotFoundError(
            "\nNo se encontraron los siguientes archivos:\n"
            f"{missing_text}\n\n"
            "Revisa la variable DATA_DIR al principio del archivo."
        )


def load_jsonl_gz_sample(
    file_path: Path,
    sample_size: int,
) -> pd.DataFrame:
    """
    Lee solamente un bloque del archivo JSON Lines comprimido con GZIP.

    Parameters
    ----------
    file_path:
        Ruta del archivo .jsonl.gz.
    sample_size:
        Cantidad máxima de registros que se cargarán.

    Returns
    -------
    pandas.DataFrame
        Tabla con la muestra cargada.
    """
    print(f"\nCargando muestra desde: {file_path.name}")
    print(f"Cantidad solicitada: {sample_size:,} registros")

    reader = pd.read_json(
        file_path,
        lines=True,
        compression="gzip",
        chunksize=sample_size,
    )

    try:
        dataframe = next(reader)
    except StopIteration as error:
        raise ValueError(
            f"El archivo está vacío: {file_path}"
        ) from error

    print(
        f"Muestra cargada: "
        f"{dataframe.shape[0]:,} filas y "
        f"{dataframe.shape[1]:,} columnas"
    )

    return dataframe


def show_dataframe(dataframe: pd.DataFrame, rows: int = 10) -> None:
    """
    Muestra una tabla dentro de Colab/Jupyter.
    Si no está disponible display(), utiliza print().
    """
    try:
        from IPython.display import display

        display(dataframe.head(rows))
    except ImportError:
        print(dataframe.head(rows))


def show_columns(
    dataframe: pd.DataFrame,
    table_name: str,
) -> None:
    """
    Imprime el nombre de todas las columnas de una tabla.
    """
    print(f"\n=== COLUMNAS DE {table_name.upper()} ===")

    for position, column in enumerate(dataframe.columns, start=1):
        print(f"{position:02d}. {column}")


def column_summary(dataframe: pd.DataFrame) -> pd.DataFrame:
    """
    Crea una tabla con:
        - nombre de la columna;
        - tipo de dato;
        - cantidad de nulos;
        - porcentaje de nulos;
        - cantidad de valores únicos.

    Para columnas que contienen listas o diccionarios,
    los valores únicos se calculan convirtiéndolos a texto.
    """
    unique_values = []

    for column in dataframe.columns:
        try:
            unique_count = dataframe[column].nunique(dropna=True)
        except TypeError:
            unique_count = (
                dataframe[column]
                .astype(str)
                .nunique(dropna=True)
            )

        unique_values.append(unique_count)

    summary = pd.DataFrame({
        "columna": dataframe.columns,
        "tipo": dataframe.dtypes.astype(str).values,
        "cantidad_nulos": dataframe.isna().sum().values,
        "porcentaje_nulos": (
            dataframe.isna().mean().values * 100
        ).round(2),
        "valores_unicos": unique_values,
    })

    return summary.sort_values(
        by="porcentaje_nulos",
        ascending=False,
    ).reset_index(drop=True)


def save_current_figure(file_name: str) -> None:
    """
    Guarda el gráfico actual dentro de OUTPUT_DIR.
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    output_file = OUTPUT_DIR / file_name

    plt.tight_layout()
    plt.savefig(
        output_file,
        dpi=150,
        bbox_inches="tight",
    )
    plt.show()
    plt.close()

    print(f"Gráfico guardado: {output_file}")


# ============================================================
# 3. LIMPIEZA DE REVIEWS
# ============================================================

def prepare_reviews(reviews_df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpia y transforma las columnas principales de reviews.
    """
    reviews_df = reviews_df.copy()

    if "rating" in reviews_df.columns:
        reviews_df["rating"] = pd.to_numeric(
            reviews_df["rating"],
            errors="coerce",
        )

    if "helpful_vote" in reviews_df.columns:
        reviews_df["helpful_vote"] = pd.to_numeric(
            reviews_df["helpful_vote"],
            errors="coerce",
        ).fillna(0)

    if "timestamp" in reviews_df.columns:
        # El timestamp de Amazon está expresado en milisegundos Unix.
        reviews_df["review_date"] = pd.to_datetime(
            reviews_df["timestamp"],
            unit="ms",
            errors="coerce",
        )

        reviews_df["review_year"] = (
            reviews_df["review_date"].dt.year
        )

    if "verified_purchase" in reviews_df.columns:
        reviews_df["verified_purchase"] = (
            reviews_df["verified_purchase"]
            .fillna(False)
            .astype(bool)
        )

    return reviews_df


# ============================================================
# 4. LIMPIEZA DE METADATOS
# ============================================================

def clean_price(value: object) -> Optional[float]:
    """
    Convierte precios como '$19.99', '19.99' o None en float.

    Devuelve None cuando el precio no puede convertirse.
    """
    if value is None:
        return None

    text = str(value).strip()

    if text.lower() in {"none", "nan", "", "null"}:
        return None

    # Conservamos solamente números y puntos decimales.
    cleaned = "".join(
        character
        for character in text
        if character.isdigit() or character == "."
    )

    if not cleaned:
        return None

    try:
        return float(cleaned)
    except ValueError:
        return None


def prepare_metadata(metadata_df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpia y transforma las columnas principales de metadatos.
    """
    metadata_df = metadata_df.copy()

    numeric_columns = [
        "average_rating",
        "rating_number",
    ]

    for column in numeric_columns:
        if column in metadata_df.columns:
            metadata_df[column] = pd.to_numeric(
                metadata_df[column],
                errors="coerce",
            )

    if "price" in metadata_df.columns:
        metadata_df["price_numeric"] = (
            metadata_df["price"].apply(clean_price)
        )

    return metadata_df


# ============================================================
# 5. GRÁFICOS DE REVIEWS
# ============================================================

def plot_rating_distribution(
    reviews_df: pd.DataFrame,
) -> None:
    """
    Muestra la cantidad de reviews para cada puntuación.
    """
    if "rating" not in reviews_df.columns:
        print("No existe la columna rating.")
        return

    rating_counts = (
        reviews_df["rating"]
        .dropna()
        .value_counts()
        .sort_index()
    )

    plt.figure(figsize=(8, 5))
    plt.bar(
        rating_counts.index.astype(str),
        rating_counts.values,
    )
    plt.title(
        "Distribución de ratings - Beauty and Personal Care"
    )
    plt.xlabel("Cantidad de estrellas")
    plt.ylabel("Cantidad de reviews")

    save_current_figure("01_rating_distribution.png")


def plot_verified_purchases(
    reviews_df: pd.DataFrame,
) -> None:
    """
    Compara compras verificadas y no verificadas.
    """
    if "verified_purchase" not in reviews_df.columns:
        print("No existe la columna verified_purchase.")
        return

    verified_counts = (
        reviews_df["verified_purchase"]
        .fillna(False)
        .value_counts()
        .rename(index={
            True: "Compra verificada",
            False: "Compra no verificada",
        })
    )

    plt.figure(figsize=(7, 5))
    plt.bar(
        verified_counts.index.astype(str),
        verified_counts.values,
    )
    plt.title(
        "Compras verificadas - Beauty and Personal Care"
    )
    plt.xlabel("Tipo de compra")
    plt.ylabel("Cantidad de reviews")

    save_current_figure("02_verified_purchases.png")


def create_reviews_summary(
    reviews_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Resume las reviews agrupándolas por parent_asin.
    """
    required_columns = {
        "parent_asin",
        "rating",
        "helpful_vote",
    }

    missing_columns = (
        required_columns - set(reviews_df.columns)
    )

    if missing_columns:
        raise KeyError(
            "Faltan columnas necesarias en reviews: "
            f"{sorted(missing_columns)}"
        )

    summary = (
        reviews_df
        .dropna(subset=["parent_asin"])
        .groupby("parent_asin")
        .agg(
            cantidad_reviews=("rating", "count"),
            rating_promedio_reviews=("rating", "mean"),
            votos_utiles=("helpful_vote", "sum"),
            compras_verificadas=(
                "verified_purchase",
                "sum",
            ),
        )
        .reset_index()
    )

    summary["rating_promedio_reviews"] = (
        summary["rating_promedio_reviews"].round(2)
    )

    return summary.sort_values(
        by="cantidad_reviews",
        ascending=False,
    )


def plot_top_reviewed_products(
    reviews_summary: pd.DataFrame,
) -> None:
    """
    Muestra los 15 parent_asin con más reviews dentro de la muestra.
    """
    top_products = (
        reviews_summary
        .head(15)
        .sort_values("cantidad_reviews")
    )

    plt.figure(figsize=(10, 7))
    plt.barh(
        top_products["parent_asin"],
        top_products["cantidad_reviews"],
    )
    plt.title(
        "Productos con más reviews dentro de la muestra"
    )
    plt.xlabel("Cantidad de reviews")
    plt.ylabel("Parent ASIN")

    save_current_figure("03_top_reviewed_products.png")


def plot_reviews_by_year(
    reviews_df: pd.DataFrame,
) -> None:
    """
    Muestra la cantidad de reviews agrupadas por año.
    """
    if "review_year" not in reviews_df.columns:
        print("No existe la columna review_year.")
        return

    reviews_by_year = (
        reviews_df["review_year"]
        .dropna()
        .astype(int)
        .value_counts()
        .sort_index()
    )

    plt.figure(figsize=(11, 5))
    plt.plot(
        reviews_by_year.index,
        reviews_by_year.values,
        marker="o",
    )
    plt.title(
        "Cantidad de reviews por año"
    )
    plt.xlabel("Año")
    plt.ylabel("Cantidad de reviews")
    plt.grid(alpha=0.3)

    save_current_figure("04_reviews_by_year.png")


# ============================================================
# 6. GRÁFICOS DE METADATOS
# ============================================================

def plot_top_stores(
    metadata_df: pd.DataFrame,
) -> None:
    """
    Muestra las tiendas con más productos en la muestra.
    """
    if "store" not in metadata_df.columns:
        print("No existe la columna store.")
        return

    top_stores = (
        metadata_df["store"]
        .dropna()
        .astype(str)
        .replace("", np.nan)
        .dropna()
        .value_counts()
        .head(15)
        .sort_values()
    )

    if top_stores.empty:
        print("No hay tiendas válidas para graficar.")
        return

    plt.figure(figsize=(10, 7))
    plt.barh(
        top_stores.index,
        top_stores.values,
    )
    plt.title(
        "Tiendas con más productos en la muestra"
    )
    plt.xlabel("Cantidad de productos")
    plt.ylabel("Tienda")

    save_current_figure("05_top_stores.png")


def plot_price_vs_rating(
    metadata_df: pd.DataFrame,
) -> None:
    """
    Relaciona precio y calificación promedio del producto.
    """
    required_columns = {
        "price_numeric",
        "average_rating",
    }

    missing_columns = (
        required_columns - set(metadata_df.columns)
    )

    if missing_columns:
        print(
            "No se puede crear el gráfico precio-rating. "
            f"Faltan columnas: {sorted(missing_columns)}"
        )
        return

    plot_df = metadata_df.dropna(
        subset=["price_numeric", "average_rating"]
    ).copy()

    if plot_df.empty:
        print("No hay precios válidos para graficar.")
        return

    # Se elimina el 1% superior para evitar que precios extremos
    # vuelvan ilegible el gráfico.
    upper_price = plot_df["price_numeric"].quantile(0.99)

    plot_df = plot_df[
        plot_df["price_numeric"].between(
            0,
            upper_price,
        )
    ]

    plt.figure(figsize=(9, 6))
    plt.scatter(
        plot_df["price_numeric"],
        plot_df["average_rating"],
        alpha=0.35,
    )
    plt.title(
        "Precio frente a calificación promedio"
    )
    plt.xlabel("Precio en USD")
    plt.ylabel("Calificación promedio")

    save_current_figure("06_price_vs_rating.png")


# ============================================================
# 7. UNIÓN DE REVIEWS Y PRODUCTOS
# ============================================================

def merge_reviews_and_metadata(
    reviews_summary: pd.DataFrame,
    metadata_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Une el resumen de reviews con los metadatos.

    Clave utilizada:
        reviews.parent_asin = metadata.parent_asin
    """
    metadata_columns = [
        "parent_asin",
        "title",
        "store",
        "average_rating",
        "rating_number",
        "price",
        "price_numeric",
        "main_category",
    ]

    available_columns = [
        column
        for column in metadata_columns
        if column in metadata_df.columns
    ]

    if "parent_asin" not in available_columns:
        raise KeyError(
            "La tabla de metadatos no contiene parent_asin."
        )

    products_df = (
        metadata_df[available_columns]
        .drop_duplicates(subset=["parent_asin"])
    )

    merged_df = reviews_summary.merge(
        products_df,
        on="parent_asin",
        how="left",
    )

    metadata_matches = (
        merged_df["title"].notna().sum()
        if "title" in merged_df.columns
        else 0
    )

    print("\n=== RESULTADO DE LA UNIÓN ===")
    print(
        f"Productos resumidos desde reviews: "
        f"{len(reviews_summary):,}"
    )
    print(
        f"Productos que encontraron metadata: "
        f"{metadata_matches:,}"
    )

    print(
        "\nNota: las dos muestras fueron cargadas de forma "
        "independiente. Por eso algunos parent_asin pueden no "
        "tener título, precio o tienda dentro de esta muestra."
    )

    return merged_df.sort_values(
        by="cantidad_reviews",
        ascending=False,
    )


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def export_results(
    reviews_df: pd.DataFrame,
    metadata_df: pd.DataFrame,
    reviews_columns_summary: pd.DataFrame,
    metadata_columns_summary: pd.DataFrame,
    reviews_summary: pd.DataFrame,
    merged_df: pd.DataFrame,
) -> None:
    """
    Guarda tablas procesadas en formato CSV.
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    exports = {
        "reviews_sample.csv": reviews_df,
        "metadata_sample.csv": metadata_df,
        "reviews_columns_summary.csv": reviews_columns_summary,
        "metadata_columns_summary.csv": metadata_columns_summary,
        "reviews_by_product.csv": reviews_summary,
        "beauty_products_analysis.csv": merged_df,
    }

    print("\n=== EXPORTANDO RESULTADOS ===")

    for file_name, dataframe in exports.items():
        output_file = OUTPUT_DIR / file_name

        dataframe.to_csv(
            output_file,
            index=False,
        )

        print(f"Archivo guardado: {output_file}")


# ============================================================
# 9. PROGRAMA PRINCIPAL
# ============================================================

def main() -> None:
    """
    Ejecuta todo el análisis en orden.
    """
    print("=" * 70)
    print("AMAZON REVIEWS 2023")
    print("CATEGORÍA: BEAUTY AND PERSONAL CARE")
    print("=" * 70)

    # 1. Conectar Google Drive.
    mount_google_drive()

    # 2. Crear carpeta de resultados.
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # 3. Verificar los archivos.
    verify_files()

    # 4. Cargar muestras.
    reviews_df = load_jsonl_gz_sample(
        REVIEWS_FILE,
        REVIEWS_SAMPLE_SIZE,
    )

    metadata_df = load_jsonl_gz_sample(
        METADATA_FILE,
        METADATA_SAMPLE_SIZE,
    )

    # 5. Limpiar los datos.
    reviews_df = prepare_reviews(reviews_df)
    metadata_df = prepare_metadata(metadata_df)

    # 6. Mostrar columnas.
    show_columns(
        reviews_df,
        "reviews",
    )

    show_columns(
        metadata_df,
        "metadatos",
    )

    # 7. Mostrar primeras filas.
    print("\n=== PRIMERAS REVIEWS ===")

    review_columns = [
        "parent_asin",
        "rating",
        "title",
        "text",
        "helpful_vote",
        "verified_purchase",
        "review_date",
    ]

    available_review_columns = [
        column
        for column in review_columns
        if column in reviews_df.columns
    ]

    show_dataframe(
        reviews_df[available_review_columns],
        rows=10,
    )

    print("\n=== PRIMEROS PRODUCTOS ===")

    metadata_columns = [
        "parent_asin",
        "title",
        "store",
        "average_rating",
        "rating_number",
        "price",
        "price_numeric",
        "main_category",
    ]

    available_metadata_columns = [
        column
        for column in metadata_columns
        if column in metadata_df.columns
    ]

    show_dataframe(
        metadata_df[available_metadata_columns],
        rows=10,
    )

    # 8. Resumen de columnas.
    reviews_columns_summary = column_summary(
        reviews_df
    )

    metadata_columns_summary = column_summary(
        metadata_df
    )

    print("\n=== RESUMEN DE COLUMNAS DE REVIEWS ===")
    show_dataframe(
        reviews_columns_summary,
        rows=len(reviews_columns_summary),
    )

    print("\n=== RESUMEN DE COLUMNAS DE METADATOS ===")
    show_dataframe(
        metadata_columns_summary,
        rows=len(metadata_columns_summary),
    )

    # 9. Resumen de reviews por producto.
    reviews_summary = create_reviews_summary(
        reviews_df
    )

    print("\n=== PRODUCTOS CON MÁS REVIEWS ===")
    show_dataframe(
        reviews_summary,
        rows=20,
    )

    # 10. Crear gráficos.
    plot_rating_distribution(reviews_df)
    plot_verified_purchases(reviews_df)
    plot_top_reviewed_products(reviews_summary)
    plot_reviews_by_year(reviews_df)
    plot_top_stores(metadata_df)
    plot_price_vs_rating(metadata_df)

    # 11. Unir reviews y metadatos.
    merged_df = merge_reviews_and_metadata(
        reviews_summary,
        metadata_df,
    )

    print("\n=== TABLA FINAL COMBINADA ===")
    show_dataframe(
        merged_df,
        rows=20,
    )

    # 12. Exportar resultados.
    export_results(
        reviews_df=reviews_df,
        metadata_df=metadata_df,
        reviews_columns_summary=reviews_columns_summary,
        metadata_columns_summary=metadata_columns_summary,
        reviews_summary=reviews_summary,
        merged_df=merged_df,
    )

    print("\n" + "=" * 70)
    print("ANÁLISIS FINALIZADO CORRECTAMENTE")
    print(f"Resultados guardados en: {OUTPUT_DIR}")
    print("=" * 70)


if __name__ == "__main__":
    main()
