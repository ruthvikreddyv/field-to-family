import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { CONFIG, locateAndReverseGeocode } from "../lib/products";

export default function Account() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", flat_no: "", building: "", street: "", default_area: "", latitude: null, longitude: null });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        flat_no: profile.flat_no || "",
        building: profile.building || "",
        street: profile.street || "",
        default_area: profile.default_area || "",
        latitude: profile.latitude ?? null,
        longitude: profile.longitude ?? null,
      });
    }
  }, [profile]);

  async function handleUseLocation() {
    setLocateError("");
    setLocating(true);
    try {
      const loc = await locateAndReverseGeocode();
      setForm((f) => ({ ...f, latitude: loc.latitude, longitude: loc.longitude, street: loc.street || f.street }));
    } catch (e) {
      setLocateError(e.message || "Couldn't get your location.");
    }
    setLocating(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const default_address = [form.flat_no, form.building, form.street].map((s) => (s || "").trim()).filter(Boolean).join(", ");
    await supabase.from("profiles").upsert({ id: user.id, ...form, default_address });
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

          <button
            type="button"
            className="btn-outline"
            style={{ width: "100%", marginBottom: 16, fontSize: 13.5 }}
            onClick={handleUseLocation}
            disabled={locating}
          >
            {locating ? "Finding your location…" : "📍 Use my current location"}
          </button>
          {locateError && <div className="form-error" style={{ marginTop: -10 }}>{locateError}</div>}
          {form.latitude && (
            <div className="form-note" style={{ marginTop: -10 }}>Location pinned ✓ — street below was filled in automatically, please check it.</div>
          )}

          <div className="field">
            <label htmlFor="flat_no">Flat / house no.</label>
            <input id="flat_no" placeholder="e.g. 302" value={form.flat_no} onChange={(e) => setForm({ ...form, flat_no: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="building">Apartment / building name <span className="hint">(optional)</span></label>
            <input id="building" placeholder="e.g. Green Meadows" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="street">Street / road name</label>
            <input id="street" placeholder="e.g. Road No. 12, near HDFC Bank" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
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
