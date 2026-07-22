import { useState, useEffect } from "react";

export function useProducts(limit = 10) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch(`/api/datasets/products?skip=0&limit=${limit}`);
                const data = await response.json();
                
                setProducts(data.items ?? []);
            } catch (error) {
                console.error("Failed to load products from the database:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [limit]);

    return { products, loading };
}