import VegArt from "../components/VegArt";
import Gallery from "../components/Gallery";
import LocationFields from "../components/LocationFields";
import Fx, { burst } from "../components/Fx";
import { HeroScene } from "../components/Scenes";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG } from "../lib/config.mjs";
import { FALLBACK_PRODUCTS } from "../lib/catalog.mjs";
import {
  buildMessage, cartLines, fmtQty, makeOrderId, normalisePhone,
  priceBreakdown, stepFor, validateCheckout, whatsappLink,
} from "../lib/order.mjs";

const CART_KEY = "f2f_cart";
const FORM_KEY = "f2f_form";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

/* ---------- live vegetable list from the Google Sheet ---------- */
function normaliseProduct(p) {
  return {
    id: String(p.id || "").trim(),
    category: String(p.category || "Vegetables").trim(),
    name: String(p.name || "").trim(),
    hi: String(p.hi || "").trim(),
    te: String(p.te || "").trim(),
    price: Number(p.price) || 0,
    unit: String(p.unit || "kg").trim(),
    available: p.available !== false && String(p.available).toLowerCase() !== "no",
    image: String(p.image || "").trim(),
  };
}

export default function Home() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [live, setLive] = useState(false);
  const [cart, setCart] = useState({});
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState("basket"); // basket | details | review | done
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const loggedRef = useRef(false);
  const [last, setLast] = useState(null);
  const [toast, setToast] = useState("");
  const [origin, setOrigin] = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", address: "", pincode: "", area: "", landmark: "", slot: CONFIG.deliverySlots[0],
    payment: CONFIG.paymentOptions[0], notes: "", mapLink: "",
  });

  /* restore saved basket + details */
  useEffect(() => {
    setCart(load(CART_KEY, {}));
    setForm((f) => ({ ...f, ...load(FORM_KEY, {}) }));
    setLast(load("f2f_last", null));
    setOrigin(window.location.origin);
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save(CART_KEY, cart); }, [cart, ready]);
  useEffect(() => { if (ready) save(FORM_KEY, form); }, [form, ready]);

  /* fetch the live list (prices + availability) from the Sheet, if connected */
  useEffect(() => {
    if (!CONFIG.sheetUrl) return;
    let cancelled = false;
    fetch(CONFIG.sheetUrl + (CONFIG.sheetUrl.includes("?") ? "&" : "?") + "t=" + Date.now(), { method: "GET", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.products)) return;
        const list = data.products.map(normaliseProduct).filter((p) => p.id && p.name);
        if (list.length) { setProducts(list); setLive(true); }
      })
      .catch(() => { /* keep built-in list; ordering still works */ });
    return () => { cancelled = true; };
  }, []);

  /* close drawer on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDrawer(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const lines = useMemo(() => cartLines(cart, products), [cart, products]);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totals = priceBreakdown(Math.round(subtotal * 100) / 100, CONFIG);
  const itemCount = lines.length;

  const categories = useMemo(() => {
    const seen = [];
    products.forEach((p) => { if (!seen.includes(p.category)) seen.push(p.category); });
    return seen;
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => activeCat === "All" || c === activeCat)
      .map((c) => ({
        category: c,
        items: products.filter(
          (p) => p.category === c &&
            (!q || p.name.toLowerCase().includes(q) || p.hi.includes(q) || p.te.includes(q))
        ),
      }))
      .filter((g) => g.items.length);
  }, [products, categories, activeCat, query]);

  function setQty(id, qty) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id]; else next[id] = Math.min(99, qty);
      return next;
    });
  }
  function bump(p, dir) {
    const s = stepFor(p.unit);
    const cur = cart[p.id] || 0;
    if (cur === 0 && dir > 0) { setToast(`${p.name} added`); }
    setQty(p.id, Math.round((cur + dir * s) * 10) / 10);
  }

  function openDrawer() { setStep(lines.length ? "basket" : "basket"); setError(""); setDrawer(true); }

  function goDetails() {
    if (totals.subtotal < CONFIG.minOrder) {
      setError(`Minimum order is ₹${CONFIG.minOrder}. Add ₹${Math.ceil(CONFIG.minOrder - totals.subtotal)} more.`);
      return;
    }
    setError(""); setStep("details");
  }

  function goReview() {
    const customer = { ...form };
    const problem = validateCheckout({ lines, totals, customer }, CONFIG);
    if (problem) { setError(problem); return; }
    setError("");
    const orderId = makeOrderId();
    const message = buildMessage({ orderId, lines, totals, customer });
    setOrder({ orderId, message, link: whatsappLink(CONFIG.whatsappNumber, message), lines, totals, customer });
    loggedRef.current = false;
    setStep("review");
  }

  /* Runs when the customer taps the real WhatsApp link. The link itself
     opens WhatsApp (so it can never be blocked as a pop-up); this just
     also logs the order to the Google Sheet in the background. */
  function onSendClick() {
    if (!order || loggedRef.current) return;
    loggedRef.current = true;
    save("f2f_last", Object.fromEntries(order.lines.map((l) => [l.id, l.qty])));
    if (CONFIG.sheetUrl) {
      const payload = {
        orderId: order.orderId,
        name: order.customer.name.trim(),
        phone: normalisePhone(order.customer.phone),
        address: order.customer.address.trim() + (order.customer.landmark ? " (Landmark: " + order.customer.landmark.trim() + ")" : ""),
        area: order.customer.area.trim() + " - " + order.customer.pincode,
        mapLink: order.customer.mapLink || "",
        slot: order.customer.slot,
        payment: order.customer.payment,
        notes: (order.customer.notes || "").trim(),
        items: order.lines.map((l) => ({ id: l.id, qty: l.qty })),
        clientTotal: order.totals.total,
        website: "", // honeypot - must stay empty
      };
      try {
        const body = JSON.stringify(payload);
        // Two independent routes; the Sheet ignores the duplicate by order ID.
        try {
          if (navigator.sendBeacon) navigator.sendBeacon(CONFIG.sheetUrl, new Blob([body], { type: "text/plain;charset=UTF-8" }));
        } catch (e) { /* fall through to fetch */ }
        fetch(CONFIG.sheetUrl, {
          method: "POST",
          mode: "no-cors",
          keepalive: true,
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body,
        }).catch(() => {});
      } catch (e) { /* ordering via WhatsApp still works */ }
    }
    setTimeout(() => { setCart({}); setStep("done"); }, 600);
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1700);
    return () => clearTimeout(t);
  }, [toast]);

  const inCart = (id) => cart[id] || 0;

  const lastCount = last ? cartLines(last, products).length : 0;
  function orderAgain() {
    const ok = {};
    cartLines(last, products).forEach((l) => { ok[l.id] = l.qty; });
    setCart(ok);
    openDrawer();
  }
  const shareText = encodeURIComponent(`Fresh vegetables delivered in ${CONFIG.city} - order in a minute on WhatsApp: ${origin || CONFIG.siteUrl}`);


  return (
    <>
      <Fx />
      <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">{toast}</div>
      <header className="top">
        <div className="top-in">
          <div className="brand">Field to Family <span className="pill">{CONFIG.city}</span></div>
          <button className="basket-btn" onClick={openDrawer} aria-label="Open basket">
            <span>Basket</span>
            <span className="count" key={itemCount}>{itemCount}</span>
            {itemCount > 0 && <span className="amt">₹{totals.subtotal}</span>}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-in">
          <div className="hero-copy">
            <h1>Fresh from the farm to your kitchen.</h1>
            <p>Pick your vegetables, tap send, and your order reaches us on WhatsApp. Everything listed was harvested for today&apos;s delivery.</p>
            <div className="facts">
              <span>Delivering in {CONFIG.city} only</span>
              <span>Min order ₹{CONFIG.minOrder}</span>
              <span>Free delivery above ₹{CONFIG.freeDeliveryAbove}</span>
            </div>
            <div className="hero-btns"><a className="hero-cta" href="#veg">Start your order</a><a className="hero-sec" href="#contact">Bulk orders &amp; queries</a></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            {["tomato", "carrot", "cauliflower", "capsicum", "spinach"].map((id, i) => (
              <span key={id} className={"float-veg v" + i}><VegArt id={id} name={id} size={74} /></span>
            ))}
          </div>
        </div>
        <HeroScene />
      </section>

      <section className="steps" aria-label="How to order">
        {[
          ["1", "Pick", "Choose vegetables and quantity."],
          ["2", "Check", "Your order is typed out for you."],
          ["3", "Send", "Tap send in WhatsApp. We confirm and deliver."],
        ].map(([n, t, d]) => (
          <div className="step" key={n}><span className="n">{n}</span><div><b>{t}</b><span>{d}</span></div></div>
        ))}
      </section>

      <div className="filters">
        <div className="filters-in">
          <input
            className="search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vegetables (English / తెలుగు / हिन्दी)" aria-label="Search vegetables"
          />
          <div className="cats" role="tablist">
            {["All", ...categories].map((c) => (
              <button key={c} className={"cat" + (activeCat === c ? " on" : "")} onClick={() => setActiveCat(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <main className="list" id="veg">
        {lastCount > 0 && itemCount === 0 && (
          <button className="again" onClick={orderAgain}>
            <b>Order again</b><span>Your last order · {lastCount} item{lastCount > 1 ? "s" : ""}</span>
          </button>
        )}
        {visible.length === 0 && <p className="empty">No vegetables match &ldquo;{query}&rdquo;.</p>}
        {visible.map((g) => (
          <section key={g.category}>
            <h2>{g.category}<small>{g.items.length}</small></h2>
            {g.items.map((p) => {
              const q = inCart(p.id);
              return (
                <div className={"row" + (p.available ? "" : " off")} key={p.id}>
                  <div className="thumb">
                    {p.image ? <img src={p.image} alt="" loading="lazy" /> : <VegArt id={p.id} name={p.name} size={60} />}
                  </div>
                  <div className="info">
                    <div className="nm">{p.name}{CONFIG.popular && CONFIG.popular.includes(p.id) && <i className="tag">Popular</i>}</div>
                    <div className="native">{p.te}{p.te && p.hi ? " · " : ""}{p.hi}</div>
                    <div className="pr"><b>₹{p.price}</b> / {p.unit}{!p.available && <em> · Out of stock today</em>}</div>
                  </div>
                  <div className="act">
                    {!p.available ? (
                      <span className="na">Unavailable</span>
                    ) : q > 0 ? (
                      <div className="stepper">
                        <button onClick={() => bump(p, -1)} aria-label={`Less ${p.name}`}>−</button>
                        <span>{fmtQty(q)}</span>
                        <button onClick={() => bump(p, 1)} aria-label={`More ${p.name}`}>+</button>
                      </div>
                    ) : (
                      <button className="add" onClick={(e) => { burst(e.clientX, e.clientY); bump(p, 1); }}>Add</button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        ))}
        <p className="foot-note">
          {live ? "Prices and availability are updated live." : "Prices may change with the market."}{" "}
          Quantity for kg items goes in half-kilos.
        </p>
      </main>

      <section className="promises">
        {CONFIG.promises.map((x) => (<div key={x.title}><b>{x.title}</b><span>{x.text}</span></div>))}
      </section>

      <Gallery items={CONFIG.gallery} />

      <section className="contact" id="contact">
        <h2>Questions &amp; bulk orders</h2>
        <p>Cooking for a function, a restaurant or a big family? Call or WhatsApp us for bulk prices and special requests.</p>
        <div className="c-grid">
          {CONFIG.contact.phones.map((n) => {
            const shown = `+${n.slice(0, 2)} ${n.slice(2, 7)} ${n.slice(7)}`;
            return (
              <div className="contact-card" key={n}>
                <b>{shown}</b>
                <div>
                  <a className="c-btn" href={`tel:+${n}`}>Call</a>
                  <a className="c-btn wa" href={`https://wa.me/${n}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </div>
              </div>
            );
          })}
        </div>
        <a className="c-mail" href={`mailto:${CONFIG.contact.email}?subject=Field%20to%20Family%20enquiry`}>
          <span>Email for customer enquiries</span><b>{CONFIG.contact.email}</b>
        </a>
      </section>

      {itemCount > 0 && !drawer && (
        <button className="float" onClick={openDrawer}>
          View basket · {itemCount} item{itemCount > 1 ? "s" : ""} · ₹{totals.subtotal}
        </button>
      )}

      <footer className="foot">
        <a className="share" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer">Share with friends on WhatsApp</a>
        <div>Field to Family · Hyderabad · Orders on WhatsApp {CONFIG.whatsappNumber.replace(/^91/, "+91 ")}</div>
        <div><a className="foot-link" href={`mailto:${CONFIG.contact.email}`}>{CONFIG.contact.email}</a></div>
      </footer>

      {/* ---------------- basket / checkout drawer ---------------- */}
      <div className={"scrim" + (drawer ? " open" : "")} onClick={() => setDrawer(false)} />
      <aside className={"drawer" + (drawer ? " open" : "")} aria-hidden={!drawer} role="dialog" aria-label="Your order">
        <div className="d-head">
          <h3>
            {step === "basket" && "Your basket"}
            {step === "details" && "Delivery details"}
            {step === "review" && "Review & send"}
            {step === "done" && "Order sent"}
          </h3>
          <button className="x" onClick={() => setDrawer(false)} aria-label="Close">×</button>
        </div>

        <div className="d-body">
          {step === "basket" && (lines.length === 0 ? (
            <p className="empty">Your basket is empty. Add some vegetables to begin.</p>
          ) : (
            <>
              {lines.map((l) => {
                const p = products.find((x) => x.id === l.id);
                return (
                  <div className="b-row" key={l.id}>
                    <div className="b-info">
                      <div className="nm">{l.name}</div>
                      <div className="native">₹{l.price} / {l.unit}</div>
                    </div>
                    <div className="stepper">
                      <button onClick={() => bump(p, -1)} aria-label="Less">−</button>
                      <span>{fmtQty(l.qty)}</span>
                      <button onClick={() => bump(p, 1)} aria-label="More">+</button>
                    </div>
                    <div className="lt">₹{l.lineTotal}</div>
                  </div>
                );
              })}
              <button className="link" onClick={() => setCart({})}>Clear basket</button>
            </>
          ))}

          {step === "details" && (
            <div className="form">
              <label>Your name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </label>
              <label>Mobile number
                <input value={form.phone} inputMode="numeric" autoComplete="tel" maxLength={14}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
              </label>
              <label>Flat / house no., apartment, street
                <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. 302, Green Meadows, Road No. 12" />
              </label>
              <LocationFields form={form} setForm={setForm} />
              <fieldset>
                <legend>Delivery slot</legend>
                {CONFIG.deliverySlots.map((s) => (
                  <label className={"opt" + (form.slot === s ? " on" : "")} key={s}>
                    <input type="radio" name="slot" checked={form.slot === s} onChange={() => setForm({ ...form, slot: s })} />{s}
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Payment</legend>
                {CONFIG.paymentOptions.map((s) => (
                  <label className={"opt" + (form.payment === s ? " on" : "")} key={s}>
                    <input type="radio" name="pay" checked={form.payment === s} onChange={() => setForm({ ...form, payment: s })} />{s}
                  </label>
                ))}
              </fieldset>
              <label>Notes (optional)
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Gate code, ripeness, substitutions…" />
              </label>
            </div>
          )}

          {step === "review" && order && (
            <>
              <p className="hint">This is the message that will be sent to us on WhatsApp. Check it, then tap the green button.</p>
              <pre className="msg">{order.message}</pre>
            </>
          )}

          {step === "done" && order && (
            <div className="done">
              <div className="tick">✓</div>
              <h4>Almost done — {order.orderId}</h4>
              <p>WhatsApp should have opened with your order. <b>Tap Send in WhatsApp</b> to place it. We&apos;ll confirm by WhatsApp shortly.</p>
              <a className="wa" href={order.link} target="_blank" rel="noopener noreferrer">WhatsApp didn&apos;t open? Tap here</a>
              <button className="ghost" onClick={() => { setStep("basket"); setDrawer(false); }}>Start a new order</button>
            </div>
          )}

          {error && <div className="err" role="alert">{error}</div>}
        </div>

        <div className="d-foot">
          {step === "basket" && lines.length > 0 && (
            <>
              <div className="sum"><span>Subtotal</span><span>₹{totals.subtotal}</span></div>
              <div className="sum"><span>Delivery</span><span>{totals.delivery === 0 ? "Free" : "₹" + totals.delivery}</span></div>
              <div className="sum t"><span>Total</span><span>₹{totals.total}</span></div>
              {totals.subtotal < CONFIG.minOrder && <div className="note">Add ₹{Math.ceil(CONFIG.minOrder - totals.subtotal)} more to reach the ₹{CONFIG.minOrder} minimum.</div>}
              <button className="primary" onClick={goDetails} disabled={totals.subtotal < CONFIG.minOrder}>Continue</button>
            </>
          )}
          {step === "details" && (
            <>
              <div className="sum t"><span>Total</span><span>₹{totals.total}</span></div>
              <div className="two">
                <button className="ghost" onClick={() => { setError(""); setStep("basket"); }}>Back</button>
                <button className="primary" onClick={goReview}>Review message</button>
              </div>
            </>
          )}
          {step === "review" && order && (
            <>
              <a className="primary wa-btn" href={order.link} target="_blank" rel="noopener noreferrer" onClick={onSendClick}>
                Send order on WhatsApp
              </a>
              <button className="ghost" onClick={() => setStep("details")}>Edit details</button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
