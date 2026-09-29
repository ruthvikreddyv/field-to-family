import Catalog from "../components/Catalog";
import { CONFIG } from "../lib/products";

export default function Home() {
  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <h1>From the field to your family&apos;s table, by seven in the morning.</h1>
          <p className="lede">
            We buy directly from farms outside {CONFIG.city} each night and deliver whatever&apos;s
            freshest to your door the next morning — no middlemen, no cold storage, no five-day-old
            vegetables dressed up as new.
          </p>
          <div className="hero-cta">
            <a href="#catalog" className="btn-primary">Start your order</a>
            <span className="hero-note">Minimum order ₹{CONFIG.minOrder} · Free delivery above ₹{CONFIG.freeDeliveryAbove}</span>
          </div>
          <div className="harvest-strip">
            <span className="item">Everything below was harvested today — there's no "fresher" tier, this is all of it.</span>
          </div>
        </div>
      </div>

      <div className="info-strip">
        <div className="wrap">
          <span><b>Delivering only in</b> Hyderabad, for now</span>
          <span><b>Delivery window</b> — 6:00–9:00 AM or 5:00–8:00 PM, you choose at checkout</span>
          <span><b>Order by</b> 9:00 PM the night before</span>
          <span><b>Pay</b> cash or UPI on delivery</span>
        </div>
      </div>

      <Catalog />
    </>
  );
}
