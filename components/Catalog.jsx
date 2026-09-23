import { useState } from "react";
import { CATALOG, ALL_ITEMS } from "../lib/products";
import { useCart } from "../context/CartContext";

function ProduceRow({ item }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(item.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <div className="produce-row">
      <div className="ic">{item.ic}</div>
      <div>
        <div className="produce-name">
          {item.name}{" "}
          <span className="produce-native">
            ({item.hi} · {item.te})
          </span>
          {item.tags.includes("organic") && <span className="badge organic">Organic</span>}
          {item.tags.includes("season") && <span className="badge season">In season</span>}
        </div>
        <div className="produce-meta">
          <span className="price">₹{item.price}</span> / {item.unit}
        </div>
      </div>
      <div className="row-actions">
        <div className="qty-stepper">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Quantity"
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setQty(!v || v < 1 ? 1 : Math.min(99, v));
            }}
          />
          <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
        </div>
        <button type="button" className={"add-btn" + (added ? " added" : "")} onClick={handleAdd}>
          {added ? "Added ✓" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [activeCat, setActiveCat] = useState("all");

  function scrollToCat(catId) {
    setActiveCat(catId);
    const target = catId === "all" ? document.getElementById("catalog") : document.getElementById("cat-" + catId);
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    }
  }

  return (
    <>
      <nav className="cats" aria-label="Vegetable categories">
        <div className="wrap">
          <button className={"cat-pill" + (activeCat === "all" ? " active" : "")} onClick={() => scrollToCat("all")}>
            All vegetables
          </button>
          {CATALOG.map((cat) => (
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
        {CATALOG.map((cat) => (
          <section className="category-block" id={"cat-" + cat.id} key={cat.id}>
            <div className="category-head">
              <h2>{cat.label}</h2>
              <span className="count">{cat.items.length} items</span>
            </div>
            {cat.note && <p className="category-note">{cat.note}</p>}
            <div className="produce-list">
              {cat.items.map((it) => (
                <ProduceRow item={ALL_ITEMS[it.id]} key={it.id} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
