import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { CONFIG } from "../lib/products";

export default function Account() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", default_address: "", default_area: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        default_address: profile.default_address || "",
        default_area: profile.default_area || "",
      });
    }
  }, [profile]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase.from("profiles").upsert({ id: user.id, ...form });
    setSaving(false);
    setSaved(true);
    refreshProfile();
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading || !user) {
    return <div className="center-loading">Loading your account…</div>;
  }

  return (
    <main className="page wrap">
      <div className="page-head">
        <h1>Your account</h1>
        <p>Signed in as {user.email}</p>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <h2>Default delivery details</h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: -8, marginBottom: 18 }}>
          We&apos;ll pre-fill these at checkout so you don&apos;t have to type them every time.
        </p>
        <form onSubmit={handleSave} noValidate>
          <div className="field">
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="default_address">Delivery address</label>
            <textarea id="default_address" value={form.default_address} onChange={(e) => setForm({ ...form, default_address: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="default_area">Area (Hyderabad only, for now)</label>
            <select id="default_area" value={form.default_area} onChange={(e) => setForm({ ...form, default_area: e.target.value })}>
              <option value="">Select your area</option>
              {CONFIG.deliveryAreas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span style={{ marginLeft: 12, color: "var(--green-mid)", fontSize: 13.5 }}>Saved ✓</span>}
        </form>
      </div>
    </main>
  );
}
