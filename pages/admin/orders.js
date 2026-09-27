import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";

const STATUSES = ["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"];
const STATUS_LABEL = {
  placed: "Placed", confirmed: "Confirmed", packed: "Packed",
  out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data: orderRows, error: oErr } = await supabase
      .from("orders").select("*").order("created_at", { ascending: false });
    if (oErr) { setError(oErr.message); setLoading(false); return; }

    const userIds = Array.from(new Set((orderRows || []).map((o) => o.user_id)));
    if (userIds.length) {
      const { data: profileRows } = await supabase.from("profiles").select("id, full_name, phone").in("id", userIds);
      const map = {};
      (profileRows || []).forEach((p) => { map[p.id] = p; });
      setCustomers(map);
    }
    setOrders(orderRows || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(order, status) {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) setError(error.message);
  }

  if (loading) return <AdminLayout><div className="center-loading">Loading orders…</div></AdminLayout>;

  return (
    <AdminLayout>
      {error && <div className="auth-alert error">{error}</div>}
      {orders.length === 0 && <div className="empty-state"><div className="ic">🧺</div>No orders yet.</div>}
      {orders.map((o) => {
        const customer = customers[o.user_id];
        return (
          <div className="order-card" key={o.id}>
            <div className="order-top">
              <span className="order-code">{o.order_code}</span>
              <select
                value={o.status}
                onChange={(e) => updateStatus(o, e.target.value)}
                style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "5px 8px", fontSize: 12.5, background: "var(--card)", color: "var(--ink)" }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className="order-date">
              {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              {" · "}{customer?.full_name || "Customer"} {customer?.phone ? `· ${customer.phone}` : ""}
            </div>
            <div className="order-items">{(o.items || []).map((it) => `${it.name} x ${it.qty} ${it.unit}`).join(", ")}</div>
            <div className="order-date" style={{ marginTop: 4 }}>
              {[o.flat_no, o.building, o.street].filter(Boolean).join(", ")}, {o.area} · {o.slot} · {o.payment}
            </div>
            <div className="order-foot"><span>{o.payment}</span><span>₹{o.total}</span></div>
          </div>
        );
      })}
    </AdminLayout>
  );
}
