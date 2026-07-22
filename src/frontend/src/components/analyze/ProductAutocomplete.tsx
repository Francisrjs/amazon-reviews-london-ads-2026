import { useState, useRef, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";

export function ProductAutocomplete({ value, onChange }: { value: string; onChange: (name: string) => void }) {
    const [query, setQuery] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { products } = useProducts(50);

    const filteredProducts = query.trim() === "" 
        ? [] 
        : (products || [])
            .filter((p) => {
                const productName = String(p.name || p.title || "");
                return productName.toLowerCase().includes(query.toLowerCase());
            })
            .slice(0, 3);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
            
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Hydrating Vitamin C Serum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            {isOpen && filteredProducts.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProducts.map((product, index) => {
                        const displayName = String(product.name || product.title || "Sin nombre");
                        return (
                            <li
                                key={product.id ?? index}
                                onClick={() => {
                                    const trimmedName = displayName.length > 120 
                                        ? displayName.substring(0, 117) + "..." 
                                        : displayName;
                                    
                                    setQuery(trimmedName);
                                    onChange(trimmedName);
                                    setIsOpen(false);
                                }}
                                title={displayName}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900 cursor-pointer transition-colors truncate whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                                {displayName}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}