import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").eq("active", true).order("category").order("sort_order");
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function adjust(product, delta) {
    setBusyId(product.id);
    setError("");
    const { data, error } = await supabase.rpc("adjust_stock", { p_product_id: product.id, p_delta: delta });
    setBusyId(null);
    if (error) { setError(error.message); return; }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...data } : p)));
  }

  if (loading) return <AdminLayout><div className="center-loading">Loading inventory…</div></AdminLayout>;

  return (
    <AdminLayout>
      {error && <div className="auth-alert error">{error}</div>}
      <div className="card">
        <h2>Quick stock adjust</h2>
        {products.map((p) => {
          const status = p.stock <= 0 ? "Out of stock" : p.stock <= p.low_stock_threshold ? "Low stock" : "In stock";
          const statusColor = p.stock <= 0 ? "var(--tomato)" : p.stock <= p.low_stock_threshold ? "var(--turmeric-d)" : "var(--green-mid)";
          return (
            <div key={p.id} style={{ borderBottom: "1px solid var(--line)", padding: "16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.icon} {p.name} <span style={{ fontWeight: 400, color: "var(--ink-soft)", fontSize: 13 }}>₹{p.price}/{p.unit}</span></div>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: statusColor }}>{status}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {[-10, -5, -1].map((d) => (
                  <button key={d} type="button" className="btn-outline" disabled={busyId === p.id}
                    style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => adjust(p, d)}>
                    {d}
                  </button>
                ))}
                <span style={{ minWidth: 56, textAlign: "center", fontWeight: 700, fontSize: 16 }}>{p.stock}</span>
                {[1, 5, 10].map((d) => (
                  <button key={d} type="button" className="btn-outline" disabled={busyId === p.id}
                    style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => adjust(p, d)}>
                    +{d}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
