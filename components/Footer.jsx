import { CONFIG, formatPhoneDisplay } from "../lib/products";

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div>
          <h3>Field to Family</h3>
          <p>A small vegetable-ordering service connecting family farms outside Hyderabad to households across the city. Every crate is picked, sorted and delivered within a day.</p>
        </div>
        <div>
          <h3>Delivering in Hyderabad</h3>
          <ul>
            {CONFIG.deliveryAreas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Get in touch</h3>
          <ul>
            <li>WhatsApp: {formatPhoneDisplay(CONFIG.whatsappNumber)}</li>
            <li>Email: {CONFIG.email}</li>
            <li>Hours: 6 AM – 8 PM, all days</li>
          </ul>
        </div>
      </div>
      <div className="wrap legal">
        Field to Family — vegetable delivery in Hyderabad only, for now. Prices and availability change with the season.
      </div>
    </footer>
  );
}
