// ============================================================
// BUSINESS CONFIG - edit these for your own operation.
// Note: minOrder / freeDeliveryAbove / deliveryFee are mirrored inside the
// place_order() Postgres function (supabase/migration_admin_inventory.sql)
// for security - update both places if you change them.
// ============================================================
export const CONFIG = {
  businessName: "Field to Family",
  city: "Hyderabad",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91 9014346193", // country code + number, no + or spaces
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "fieldtofamily2026@gmail.com",
  deliveryAreas: [
    "Hitech City",
    "Gachibowli",
    "Madhapur",
    "Kondapur",
    "Jubilee Hills",
    "Banjara Hills",
    "Kukatpally",
    "Miyapur",
    "Ameerpet",
    "Secunderabad",
    "LB Nagar",
    "Kompally",
  ],
  deliverySlots: ["6:00 – 9:00 AM", "5:00 – 8:00 PM"],
  minOrder: 150,
  freeDeliveryAbove: 500,
  deliveryFee: 30,
};

export function formatPhoneDisplay(num) {
  if (!num) return "";
  if (num.length === 12) return "+" + num.slice(0, 2) + " " + num.slice(2, 7) + " " + num.slice(7);
  return "+" + num;
}

export function joinAddress({ flatNo, building, street }) {
  return [flatNo, building, street].map((s) => (s || "").trim()).filter(Boolean).join(", ");
}

// ============================================================
// PHONE NUMBER HELPERS (India, +91)
// ============================================================
export function toE164Indian(input) {
  const digits = (input || "").replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return "+91" + last10;
}

export function isValidIndianMobile(input) {
  const digits = (input || "").replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return /^[6-9]\d{9}$/.test(last10);
}

export function formatE164ForDisplay(e164) {
  if (!e164) return "";
  const digits = e164.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return "+91 " + last10.slice(0, 5) + " " + last10.slice(5);
}

// Uses the browser's geolocation, then OpenStreetMap's free reverse-geocoding
// service to guess a street name. The person still confirms/edits it - this
// only saves typing, it never submits anything on its own.
export function locateAndReverseGeocode() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Your browser doesn't support location detection."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { Accept: "application/json" } }
          );
          const data = await res.json();
          const a = data.address || {};
          const street = [a.road, a.suburb || a.neighbourhood].filter(Boolean).join(", ");
          resolve({ latitude, longitude, street, raw: data.display_name || "" });
        } catch (e) {
          // Reverse geocoding failed, but we still have coordinates.
          resolve({ latitude, longitude, street: "", raw: "" });
        }
      },
      (err) => reject(new Error(err.message || "Couldn't get your location.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
