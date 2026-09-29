import { useState, useMemo } from "react";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { SearchIcon } from "./Icons";

function ProduceRow({ item }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = item.stock <= 0 || !item.available;
  const lowStock = !outOfStock && item.stock <= item.low_stock_threshold;

  function handleAdd() {
    addItem(item.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <div className="produce-row">
      <div className="thumb">
        {item.image_url ? <img src={item.image_url} alt="" /> : <span>{item.name.charAt(0)}</span>}
      </div>
      <div>
        <div className="produce-name">
          {item.name}{" "}
          <span className="produce-native">
            ({item.name_hi} · {item.name_te})
          </span>
          {item.tags?.includes("organic") && <span className="badge organic">Organic</span>}
          {item.tags?.includes("season") && <span className="badge season">In season</span>}
        </div>
        <div className="produce-meta">
          <span className="price">₹{item.price}</span> / {item.unit}
          {outOfStock && <span className="badge" style={{ color: "var(--tomato)", marginLeft: 8 }}>Out of stock</span>}
          {lowStock && <span className="badge" style={{ color: "var(--tomato)", marginLeft: 8 }}>Only {item.stock} left</span>}
        </div>
      </div>
      <div className="row-actions">
        {!outOfStock && (
          <div className="qty-stepper">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Quantity"
              value={qty}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setQty(!v || v < 1 ? 1 : Math.min(item.stock, v));
              }}
            />
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(item.stock, q + 1))}>+</button>
          </div>
        )}
        <button type="button" className={"add-btn" + (added ? " added" : "")} onClick={handleAdd} disabled={outOfStock}>
          {outOfStock ? "Unavailable" : added ? "Added ✓" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function Catalog() {
  const { byCategory, loading, error } = useProducts();
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");

  function scrollToCat(catId) {
    setActiveCat(catId);
    const target = catId === "all" ? document.getElementById("catalog") : document.getElementById("cat-" + catId);
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            (it.name_hi || "").includes(q) ||
            (it.name_te || "").includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [byCategory, query]);

  return (
    <>
      <nav className="cats" aria-label="Vegetable categories">
        <div className="wrap">
          <button className={"cat-pill" + (activeCat === "all" ? " active" : "")} onClick={() => scrollToCat("all")}>
            All vegetables
          </button>
          {byCategory.map((cat) => (
            <button
              key={cat.id}
              className={"cat-pill" + (activeCat === cat.id ? " active" : "")}
              onClick={() => scrollToCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="page wrap" id="catalog">
        <div className="field" style={{ maxWidth: 360, marginTop: 24, position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: 12, color: "var(--ink-soft)" }}><SearchIcon size={16} /></span>
          <input
            type="search"
            placeholder="Search vegetables… (English, Hindi or Telugu)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search vegetables"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {loading && <div className="center-loading">Loading today's stock…</div>}
        {error && <div className="auth-alert error">{error}</div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            No vegetables match your search right now.
          </div>
        )}

        {filtered.map((cat) => (
          <section className="category-block" id={"cat-" + cat.id} key={cat.id}>
            <div className="category-head">
              <h2>{cat.label}</h2>
              <span className="count">{cat.items.length} items</span>
            </div>
            <div className="produce-list">
              {cat.items.map((it) => (
                <ProduceRow item={it} key={it.id} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
