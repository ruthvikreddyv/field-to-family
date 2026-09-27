import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("id, active, available, stock, low_stock_threshold");
      if (pErr) { setError(pErr.message); return; }

      const total = products.length;
      const available = products.filter((p) => p.active && p.available).length;
      const lowStock = products.filter((p) => p.active && p.stock > 0 && p.stock <= p.low_stock_threshold).length;
      const outOfStock = products.filter((p) => p.active && p.stock <= 0).length;
      setStats({ total, available, lowStock, outOfStock });

      const { data: orders, error: oErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (oErr) { setError(oErr.message); return; }
      setRecentOrders(orders || []);
    }
    load();
  }, []);

  return (
    <AdminLayout>
      {error && <div className="auth-alert error">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        <StatCard label="Total products" value={stats?.total} href="/admin/products" />
        <StatCard label="Available now" value={stats?.available} href="/admin/products" />
        <StatCard label="Low stock" value={stats?.lowStock} href="/admin/inventory" warn={stats?.lowStock > 0} />
        <StatCard label="Out of stock" value={stats?.outOfStock} href="/admin/inventory" warn={stats?.outOfStock > 0} />
      </div>

      <div className="card">
        <h2>Recent orders</h2>
        {recentOrders.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>No orders yet.</p>}
        {recentOrders.map((o) => (
          <div className="order-card" key={o.id}>
            <div className="order-top">
              <span className="order-code">{o.order_code}</span>
              <span className="status-pill">{o.status}</span>
            </div>
            <div className="order-date">
              {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {o.area}
            </div>
            <div className="order-items">{(o.items || []).map((it) => `${it.name} x ${it.qty}`).join(", ")}</div>
            <div className="order-foot"><span>{o.payment}</span><span>₹{o.total}</span></div>
          </div>
        ))}
        <Link href="/admin/orders" className="btn-outline" style={{ marginTop: 8, display: "inline-block" }}>View all orders</Link>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, href, warn }) {
  return (
    <Link href={href} className="card" style={{ margin: 0, textDecoration: "none", display: "block" }}>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: warn ? "var(--tomato)" : "var(--ink)" }}>
        {value ?? "—"}
      </div>
    </Link>
  );
}
