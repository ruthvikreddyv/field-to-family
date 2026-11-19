// ============================================================
// THE ONLY FILE YOU EVER NEED TO EDIT IN CODE.
// (Prices and availability are edited in the Google Sheet, not here.)
// ============================================================

export const CONFIG = {
  businessName: "Field to Family",

  // Shown in the "Questions and bulk orders" section. Orders themselves still go to whatsappNumber below.
  contact: {
    email: "fieldtofamily2026@gmail.com",
    phones: ["919014346194", "919347797274", "917995458335"],
  },
  city: "Hyderabad",

  // Orders open WhatsApp chat with this number. Country code + number,
  // no "+", no spaces.
  whatsappNumber: "919014346193",

  // Your website address (used for the preview card when the link is shared on WhatsApp).
  siteUrl: "https://field-to-family.vercel.app",

  // Vegetables that get a "Popular" tag (use the ID column from the Products sheet).
  popular: ["tomato", "onion", "potato", "spinach", "coriander", "carrot"],

  // "Our farm and store" section. To show REAL photos: copy your pictures into the
  // folder public/gallery and put the file name in `photo`. If a file is missing, a
  // drawing is shown instead, so nothing ever looks broken.
  gallery: [
    { scene: "field", photo: "/gallery/farm.jpg", title: "Where it grows", text: "Vegetables grown on our partner farms and picked for your order." },
    { scene: "store", photo: "/gallery/store.jpg", title: "Where we sort", text: "Hand-sorted and weighed fresh, so you only get what looks good." },
    { scene: "delivery", photo: "/gallery/delivery.jpg", title: "How it reaches you", text: "Delivered to your door in Hyderabad in a morning or evening slot." },
  ],

  // Short promises shown under the hero. Edit freely, but only keep ones that are true for you.
  promises: [
    { title: "Farm fresh", text: "Picked for your order, not stored for days." },
    { title: "Fair prices", text: "Market-based prices, updated by us." },
    { title: "Pay on delivery", text: "Cash or UPI when it arrives." },
  ],

  // Paste the Web App URL from Google Apps Script here (see SETUP.md,
  // Step 3). Leave it as "" and the site still works - orders just go to
  // WhatsApp and nothing is logged in the Sheet, and the built-in
  // vegetable list is used.
  sheetUrl: "https://docs.google.com/spreadsheets/d/1vEg0GSPdoPkvd1POJXIO2YYrNO0MhX0G-DSqky7IZuQ/edit?gid=1682368930",

  deliverySlots: ["6:00 – 9:00 AM", "5:00 – 8:00 PM"],
  paymentOptions: ["Cash on delivery", "UPI on delivery"],

  minOrder: 150,
  freeDeliveryAbove: 299,
  deliveryFee: 30,
};
