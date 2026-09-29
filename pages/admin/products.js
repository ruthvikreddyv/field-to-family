import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";

const EMPTY_FORM = {
  id: null,
  name: "", name_hi: "", name_te: "",
  category: "", category_label: "",
  image_url: "", price: "", unit: "kg",
  stock: "", low_stock_threshold: "5",
  active: true, manually_unavailable: false,
  featured: false,
  organic: false, season: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("category").order("sort_order");
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.category, p.category_label));
    return Array.from(map.entries());
  }, [products]);

  function startEdit(p) {
    setForm({
      id: p.id,
      name: p.name, name_hi: p.name_hi || "", name_te: p.name_te || "",
      category: p.category, category_label: p.category_label,
      image_url: p.image_url || "", price: String(p.price), unit: p.unit,
      stock: String(p.stock), low_stock_threshold: String(p.low_stock_threshold),
      active: p.active, manually_unavailable: p.manually_unavailable,
      featured: p.featured,
      organic: (p.tags || []).includes("organic"), season: (p.tags || []).includes("season"),
    });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      setError("Photo upload failed: " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const tags = [form.organic && "organic", form.season && "season"].filter(Boolean);
    const payload = {
      name: form.name.trim(),
      name_hi: form.name_hi.trim(),
      name_te: form.name_te.trim(),
      category: form.category.trim().toLowerCase().replace(/\s+/g, "-"),
      category_label: form.category_label.trim() || form.category.trim(),
      image_url: form.image_url.trim() || null,
      price: parseFloat(form.price) || 0,
      unit: form.unit.trim(),
      stock: parseInt(form.stock, 10) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold, 10) || 5,
      active: form.active,
      manually_unavailable: form.manually_unavailable,
      available: !form.manually_unavailable && (parseInt(form.stock, 10) || 0) > 0,
      featured: form.featured,
      tags,
    };

    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (error) { setError(error.message); return; }
    setFormOpen(false);
    setForm(EMPTY_FORM);
    load();
  }

  async function toggleActive(p) {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    load();
  }

  if (loading) return <AdminLayout><div className="center-loading">Loading products…</div></AdminLayout>;

  return (
    <AdminLayout>
      {error && <div className="auth-alert error">{error}</div>}

      {!formOpen && (
        <button type="button" className="btn-primary" onClick={startNew} style={{ marginBottom: 20 }}>
          + Add product
        </button>
      )}

      {formOpen && (
        <div className="card">
          <h2>{form.id ? "Edit product" : "Add product"}</h2>
          <form onSubmit={handleSave} noValidate>
            <div className="field">
              <label>Photo</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="thumb" style={{ width: 64, height: 64, fontSize: 24 }}>
                  {form.image_url ? <img src={form.image_url} alt="" /> : <span>{(form.name || "?").charAt(0)}</span>}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} style={{ fontSize: 13 }} />
                  <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "4px 0 0" }}>
                    {uploading ? "Uploading…" : "Upload a real photo of this vegetable — a phone photo is fine."}
                  </p>
                </div>
              </div>
            </div>

            <div className="field-row">
              <div className="field"><label>Name (English)</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Hindi name</label><input value={form.name_hi} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} /></div>
              <div className="field"><label>Telugu name</label><input value={form.name_te} onChange={(e) => setForm({ ...form, name_te: e.target.value })} /></div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Category</label>
                <input
                  list="category-list"
                  value={form.category_label}
                  onChange={(e) => setForm({ ...form, category_label: e.target.value, category: e.target.value })}
                  placeholder="e.g. Leafy greens"
                  required
                />
                <datalist id="category-list">
                  {categories.map(([id, label]) => <option key={id} value={label} />)}
                </datalist>
              </div>
              <div className="field"><label>Unit</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg / bunch / piece / 250g" required /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Price (₹)</label><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="field"><label>Stock</label><input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></div>
              <div className="field"><label>Low-stock threshold</label><input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} /></div>
            </div>

            <div className="field">
              <label>Flags</label>
              <div className="radio-group" style={{ flexWrap: "wrap" }}>
                <Checkbox label="Active (visible in catalog)" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
                <Checkbox label="Manually mark unavailable" checked={form.manually_unavailable} onChange={(v) => setForm({ ...form, manually_unavailable: v })} />
                <Checkbox label="Featured" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
                <Checkbox label="Organic" checked={form.organic} onChange={(v) => setForm({ ...form, organic: v })} />
                <Checkbox label="In season" checked={form.season} onChange={(v) => setForm({ ...form, season: v })} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={saving || uploading}>{saving ? "Saving…" : "Save product"}</button>
              <button type="button" className="btn-outline" onClick={() => { setFormOpen(false); setForm(EMPTY_FORM); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>All products ({products.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                <th style={{ padding: "8px 6px" }}>Product</th>
                <th style={{ padding: "8px 6px" }}>Category</th>
                <th style={{ padding: "8px 6px" }}>Price</th>
                <th style={{ padding: "8px 6px" }}>Stock</th>
                <th style={{ padding: "8px 6px" }}>Status</th>
                <th style={{ padding: "8px 6px" }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)", opacity: p.active ? 1 : 0.5 }}>
                  <td style={{ padding: "8px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="thumb-sm">
                        {p.image_url ? <img src={p.image_url} alt="" /> : <span>{p.name.charAt(0)}</span>}
                      </div>
                      <span>{p.name} <span style={{ color: "var(--ink-soft)" }}>({p.name_hi} · {p.name_te})</span></span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 6px" }}>{p.category_label}</td>
                  <td style={{ padding: "8px 6px" }}>₹{p.price}/{p.unit}</td>
                  <td style={{ padding: "8px 6px" }}>{p.stock}</td>
                  <td style={{ padding: "8px 6px" }}>
                    {!p.active ? "Disabled" : p.stock <= 0 ? "Out of stock" : p.manually_unavailable ? "Unavailable" : "Available"}
                  </td>
                  <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
                    <button type="button" className="btn-outline" style={{ padding: "5px 10px", fontSize: 12.5, marginRight: 6 }} onClick={() => startEdit(p)}>Edit</button>
                    <button type="button" className="btn-outline" style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => toggleActive(p)}>
                      {p.active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className={"radio-opt" + (checked ? " checked" : "")} style={{ flex: "0 0 auto", minWidth: "auto", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
