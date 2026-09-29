import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";
import { toE164Indian, isValidIndianMobile, formatE164ForDisplay } from "../../lib/products";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");
  const [promotePhone, setPromotePhone] = useState("");
  const [promoteRole, setPromoteRole] = useState("supervisor");
  const [promoteMsg, setPromoteMsg] = useState("");
  const [promoting, setPromoting] = useState(false);

  async function loadStaff() {
    const { data } = await supabase.from("profiles").select("*").neq("role", "customer").order("full_name");
    setStaff(data || []);
  }

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

      loadStaff();
    }
    load();
  }, []);

  async function handlePromote(e) {
    e.preventDefault();
    setPromoteMsg("");
    if (!isValidIndianMobile(promotePhone)) {
      setPromoteMsg("Enter a valid 10-digit mobile number.");
      return;
    }
    setPromoting(true);
    const target = toE164Indian(promotePhone);
    const last10 = target.slice(-10);
    // Match loosely since Supabase may store the phone with or without "+".
    const { data: matches, error: findErr } = await supabase
      .from("profiles").select("id, full_name, phone").ilike("phone", `%${last10}`);
    if (findErr || !matches || matches.length === 0) {
      setPromoting(false);
      setPromoteMsg("No account found with that number. They need to sign up on the site first.");
      return;
    }
    const { error: updateErr } = await supabase.from("profiles").update({ role: promoteRole }).eq("id", matches[0].id);
    setPromoting(false);
    if (updateErr) { setPromoteMsg(updateErr.message); return; }
    setPromoteMsg(`${matches[0].full_name || "That account"} is now a ${promoteRole}.`);
    setPromotePhone("");
    loadStaff();
  }

  async function handleDemote(person) {
    await supabase.from("profiles").update({ role: "customer" }).eq("id", person.id);
    loadStaff();
  }

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

      <div className="card">
        <h2>Staff access</h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: -8, marginBottom: 18 }}>
          Admin and Supervisor accounts have identical access. The person must have already
          signed up on the site with their mobile number before you can add them here.
        </p>

        {staff.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            {staff.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <span>{s.full_name || "Unnamed"} <span style={{ color: "var(--ink-soft)" }}>· {formatE164ForDisplay(s.phone)} · {s.role}</span></span>
                <button type="button" className="btn-outline" style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => handleDemote(s)}>Remove staff access</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handlePromote} className="field-row" style={{ alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Mobile number</label>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", padding: "0 10px", border: "1px solid var(--line)", borderRadius: 10, color: "var(--ink-soft)", fontSize: 14 }}>+91</span>
              <input type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210" value={promotePhone}
                onChange={(e) => setPromotePhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 160 }}>
            <label>Role</label>
            <select value={promoteRole} onChange={(e) => setPromoteRole(e.target.value)}>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="field" style={{ flex: "0 0 auto" }}>
            <button type="submit" className="btn-primary" disabled={promoting}>{promoting ? "Adding…" : "Add staff"}</button>
          </div>
        </form>
        {promoteMsg && <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{promoteMsg}</p>}
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
