import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { CONFIG, makeOrderCode, joinAddress, locateAndReverseGeocode } from "../lib/products";

function buildOrderText(order) {
  const lines = order.lines
    .map((l) => "• " + l.name + " (" + l.hi + " / " + l.te + ") x " + l.qty + " " + l.unit + " — ₹" + l.lineTotal)
    .join("\n");
  return (
    "Field to Family order " + order.order_code + "\n\n" +
    lines + "\n\n" +
    "Subtotal: ₹" + order.subtotal + "\n" +
    "Delivery: " + (order.delivery_fee === 0 ? "Free" : "₹" + order.delivery_fee) + "\n" +
    "Total: ₹" + order.total + "\n\n" +
    "Name: " + order.customerName + "\n" +
    "Phone: " + order.customerPhone + "\n" +
    "Address: " + order.address + ", " + order.area + ", Hyderabad\n" +
    (order.latitude ? "Location pin: https://maps.google.com/?q=" + order.latitude + "," + order.longitude + "\n" : "") +
    "Slot: " + order.slot + "\n" +
    "Payment: " + order.payment +
    (order.notes ? "\nNotes: " + order.notes : "")
  );
}

export default function CartDrawer() {
  const {
    drawerOpen, drawerStep, setDrawerStep, closeDrawer,
    lines, subtotal, lastOrder, setLastOrder, setQty, clearCart,
  } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();

  const deliveryFee = subtotal >= CONFIG.freeDeliveryAbove || subtotal === 0 ? 0 : CONFIG.deliveryFee;
  const total = subtotal + deliveryFee;
  const meetsMin = subtotal >= CONFIG.minOrder;

  const [form, setForm] = useState({
    name: "", phone: "", flatNo: "", building: "", street: "", area: "",
    latitude: null, longitude: null,
    slot: CONFIG.deliverySlots[0], payment: "Cash on delivery", notes: "",
  });
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: profile.full_name || f.name,
        phone: profile.phone || f.phone,
        flatNo: profile.flat_no || f.flatNo,
        building: profile.building || f.building,
        street: profile.street || f.street,
        area: profile.default_area || f.area,
        latitude: profile.latitude ?? f.latitude,
        longitude: profile.longitude ?? f.longitude,
      }));
    } else if (user) {
      setForm((f) => ({ ...f, name: f.name || user.email }));
    }
  }, [profile, user]);

  async function handleUseLocation() {
    setLocateError("");
    setLocating(true);
    try {
      const loc = await locateAndReverseGeocode();
      setForm((f) => ({
        ...f,
        latitude: loc.latitude,
        longitude: loc.longitude,
        street: loc.street || f.street,
      }));
    } catch (e) {
      setLocateError(e.message || "Couldn't get your location. You can still type your address in below.");
    }
    setLocating(false);
  }

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") closeDrawer(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  async function handlePlaceOrder() {
    if (!form.name.trim() || !form.phone.trim() || !form.flatNo.trim() || !form.street.trim() || !form.area) {
      setFormError("Please fill in your name, phone, flat/house no., street and area before placing the order.");
      return;
    }
    setFormError("");
    setPlacing(true);

    const orderCode = makeOrderCode();
    const itemsPayload = lines.map((l) => ({
      id: l.item.id, name: l.item.name, hi: l.item.hi, te: l.item.te,
      qty: l.qty, unit: l.item.unit, price: l.item.price, lineTotal: l.lineTotal,
    }));
    const combinedAddress = joinAddress(form);

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      order_code: orderCode,
      items: itemsPayload,
      subtotal, delivery_fee: deliveryFee, total,
      area: form.area, address: combinedAddress,
      flat_no: form.flatNo.trim(), building: form.building.trim(), street: form.street.trim(),
      latitude: form.latitude, longitude: form.longitude,
      slot: form.slot, payment: form.payment, notes: form.notes.trim(),
    });

    setPlacing(false);

    if (error) {
      setFormError("Something went wrong saving your order (" + error.message + "). Please try again.");
      return;
    }

    // Save/update the delivery details on the profile for next time.
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.name.trim(),
      phone: form.phone.trim(),
      default_address: combinedAddress,
      default_area: form.area,
      flat_no: form.flatNo.trim(), building: form.building.trim(), street: form.street.trim(),
      latitude: form.latitude, longitude: form.longitude,
    });

    setLastOrder({
      order_code: orderCode,
      lines: itemsPayload,
      subtotal, delivery_fee: deliveryFee, total,
      customerName: form.name.trim(), customerPhone: form.phone.trim(),
      address: combinedAddress, area: form.area,
      latitude: form.latitude, longitude: form.longitude,
      slot: form.slot, payment: form.payment, notes: form.notes.trim(),
    });
    clearCart();
    setDrawerStep("confirm");
  }

  function goToCheckout() {
    if (!user) {
      closeDrawer();
      router.push("/login?next=checkout");
      return;
    }
    setDrawerStep("checkout");
  }

  if (!drawerOpen) {
    return null;
  }

  return (
    <>
      <div className={"scrim" + (drawerOpen ? " open" : "")} onClick={closeDrawer} />
      <aside className={"drawer" + (drawerOpen ? " open" : "")} role="dialog" aria-modal="true" aria-label="Your basket">
        <div className="drawer-head">
          <h2>
            {drawerStep === "cart" && "Your basket"}
            {drawerStep === "checkout" && "Delivery details"}
            {drawerStep === "confirm" && "Order ready to send"}
          </h2>
          <button className="drawer-close" aria-label="Close basket" onClick={closeDrawer}>&times;</button>
        </div>

        <div className="drawer-body">
          {drawerStep === "cart" && (
            lines.length === 0 ? (
              <div className="empty-basket">
                <div className="ic">🧺</div>
                Your basket is empty.<br />Add some vegetables to get started.
              </div>
            ) : (
              <>
                {lines.map((l) => (
                  <div className="basket-row" key={l.item.id}>
                    <div className="ic">{l.item.ic}</div>
                    <div className="info">
                      <div className="name">{l.item.name}</div>
                      <div className="unit-price">₹{l.item.price} / {l.item.unit}</div>
                    </div>
                    <div className="qty-stepper">
                      <button type="button" aria-label="Decrease" onClick={() => setQty(l.item.id, l.qty - 1)}>−</button>
                      <input
                        type="text" inputMode="numeric" aria-label="Quantity" value={l.qty}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setQty(l.item.id, !v || v < 0 ? 0 : v);
                        }}
                      />
                      <button type="button" aria-label="Increase" onClick={() => setQty(l.item.id, l.qty + 1)}>+</button>
                    </div>
                    <div className="line-total">₹{l.lineTotal}</div>
                  </div>
                ))}
                <button type="button" className="remove-btn" style={{ marginTop: 6 }} onClick={clearCart}>
                  Clear basket
                </button>
              </>
            )
          )}

          {drawerStep === "checkout" && (
            <>
              <button type="button" className="back-link" onClick={() => setDrawerStep("cart")}>‹ Back to basket</button>
              <div className="field">
                <label htmlFor="f-name">Full name</label>
                <input id="f-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="f-phone">Phone number <span className="hint">(for delivery updates)</span></label>
                <input id="f-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="f-address">Delivery address</label>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ width: "100%", marginBottom: 10, fontSize: 13.5 }}
                  onClick={handleUseLocation}
                  disabled={locating}
                >
                  {locating ? "Finding your location…" : "📍 Use my current location"}
                </button>
                {locateError && <div className="form-error" style={{ marginTop: -4 }}>{locateError}</div>}
                {form.latitude && (
                  <div className="form-note" style={{ marginTop: -4 }}>
                    Location pinned ✓ — street below was filled in automatically, please check it.
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="f-flat">Flat / House no.</label>
                <input id="f-flat" placeholder="e.g. 302" value={form.flatNo} onChange={(e) => setForm({ ...form, flatNo: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="f-building">Apartment / building name <span className="hint">(optional)</span></label>
                <input id="f-building" placeholder="e.g. Green Meadows" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="f-street">Street / road name</label>
                <input id="f-street" placeholder="e.g. Road No. 12, near HDFC Bank" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="f-area">Area (Hyderabad only, for now)</label>
                <select id="f-area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                  <option value="">Select your area</option>
                  {CONFIG.deliveryAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Delivery slot</label>
                <div className="radio-group">
                  {CONFIG.deliverySlots.map((s) => (
                    <label key={s} className={"radio-opt" + (form.slot === s ? " checked" : "")}>
                      <input type="radio" name="slot" checked={form.slot === s} onChange={() => setForm({ ...form, slot: s })} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Payment</label>
                <div className="radio-group">
                  {["Cash on delivery", "UPI on delivery"].map((p) => (
                    <label key={p} className={"radio-opt" + (form.payment === p ? " checked" : "")}>
                      <input type="radio" name="payment" checked={form.payment === p} onChange={() => setForm({ ...form, payment: p })} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="f-notes">Notes <span className="hint">(optional)</span></label>
                <textarea id="f-notes" placeholder="Gate code, preferred ripeness, substitutions, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              {formError && <div className="form-error">{formError}</div>}
            </>
          )}

          {drawerStep === "confirm" && lastOrder && (
            <>
              <div className="confirm-wrap">
                <div className="ic">🧺</div>
                <h3>Order saved to your account</h3>
                <div className="oid">Order {lastOrder.order_code} · ₹{lastOrder.total}</div>
              </div>
              <div className="order-summary-box">{buildOrderText(lastOrder)}</div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 0 }}>
                Your order is saved under <b>My orders</b>. To make sure we see it right away, send this summary to us too — pick whichever is easiest.
              </p>
            </>
          )}
        </div>

        <div className="drawer-foot">
          {drawerStep === "cart" && lines.length > 0 && (
            <>
              <div className="summary-line"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="summary-line"><span>Delivery</span><span>{deliveryFee === 0 ? "Free" : "₹" + deliveryFee}</span></div>
              <div className="summary-line total"><span>Total</span><span>₹{total}</span></div>
              {!meetsMin && (
                <div className="min-order-note">Add ₹{CONFIG.minOrder - subtotal} more to reach the ₹{CONFIG.minOrder} minimum order.</div>
              )}
              <button type="button" className="btn-block" disabled={!meetsMin} onClick={goToCheckout}>
                {user ? "Proceed to checkout" : "Sign in to checkout"}
              </button>
            </>
          )}

          {drawerStep === "checkout" && (
            <>
              <div className="summary-line total"><span>Total to pay</span><span>₹{total}</span></div>
              <button type="button" className="btn-block" onClick={handlePlaceOrder} disabled={placing}>
                {placing ? "Placing order…" : "Place order"}
              </button>
            </>
          )}

          {drawerStep === "confirm" && lastOrder && (
            <>
              <a
                href={"https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(buildOrderText(lastOrder))}
                target="_blank" rel="noopener noreferrer" className="btn-block" style={{ textDecoration: "none", marginBottom: 10 }}
              >
                Send via WhatsApp
              </a>
              <a
                href={"mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("F2F order " + lastOrder.order_code) + "&body=" + encodeURIComponent(buildOrderText(lastOrder))}
                className="btn-outline" style={{ textDecoration: "none", display: "block", textAlign: "center", marginBottom: 10 }}
              >
                Send via email instead
              </a>
              <button type="button" className="btn-outline" style={{ width: "100%" }} onClick={() => { setDrawerStep("cart"); closeDrawer(); }}>
                Done
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
