import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ALL_ITEMS } from "../lib/products";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState("cart"); // cart | checkout | confirm
  const [lastOrder, setLastOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("f2f_cart");
      if (raw) setCart(JSON.parse(raw) || {});
    } catch (e) {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("f2f_cart", JSON.stringify(cart));
    } catch (e) {
      /* ignore */
    }
  }, [cart, loaded]);

  const addItem = useCallback((itemId, qty) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + qty }));
  }, []);

  const setQty = useCallback((itemId, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = Math.min(99, qty);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const openDrawer = useCallback((step) => {
    setDrawerStep(step || "cart");
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const lines = Object.keys(cart)
    .filter((id) => cart[id] > 0 && ALL_ITEMS[id])
    .map((id) => {
      const item = ALL_ITEMS[id];
      const qty = cart[id];
      return { item, qty, lineTotal: item.price * qty };
    });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        lines,
        subtotal,
        count,
        addItem,
        setQty,
        clearCart,
        drawerOpen,
        drawerStep,
        setDrawerStep,
        openDrawer,
        closeDrawer,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
