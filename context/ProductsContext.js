import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("category")
      .order("sort_order");
    if (error) setError(error.message);
    else {
      setError("");
      setProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProduct = useCallback((id) => products.find((p) => p.id === id), [products]);

  const byCategory = useMemo(() => {
    const map = new Map();
    products
      .filter((p) => p.active)
      .forEach((p) => {
        if (!map.has(p.category)) map.set(p.category, { id: p.category, label: p.category_label, items: [] });
        map.get(p.category).items.push(p);
      });
    return Array.from(map.values());
  }, [products]);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refetch: fetchProducts, getProduct, byCategory }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
