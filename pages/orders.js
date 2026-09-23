import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Orders() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState(null);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFetchError(error.message);
        else setOrders(data || []);
      });
  }, [user]);

  if (loading || !user) {
    return <div className="center-loading">Loading…</div>;
  }

  return (
    <main className="page wrap">
      <div className="page-head">
        <h1>My orders</h1>
        <p>Everything you&apos;ve ordered from Field to Family.</p>
      </div>

      {fetchError && <div className="auth-alert error" style={{ marginTop: 20 }}>{fetchError}</div>}

      {orders === null && !fetchError && <div className="center-loading">Fetching your orders…</div>}

      {orders && orders.length === 0 && (
        <div className="empty-state">
          <div className="ic">🧺</div>
          No orders yet — head to the shop and fill your first basket.
        </div>
      )}

      {orders && orders.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {orders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="order-top">
                <span className="order-code">{o.order_code}</span>
                <span className="status-pill">{o.status}</span>
              </div>
              <div className="order-date">
                {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                {" · "}{o.area}, Hyderabad · {o.slot}
              </div>
              <div className="order-items" style={{ marginTop: 10 }}>
                {o.items.map((it) => `${it.name} x ${it.qty} ${it.unit}`).join(", ")}
              </div>
              <div className="order-foot">
                <span>{o.payment}</span>
                <span>₹{o.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
