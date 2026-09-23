// ============================================================
// BUSINESS CONFIG - edit these for your own operation.
// ============================================================
export const CONFIG = {
  businessName: "Field to Family",
  city: "Hyderabad",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999", // country code + number, no + or spaces
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "orders@fieldtofamily.example",
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

// ============================================================
// CATALOG - name in English, Hindi (hi) and Telugu (te)
// ============================================================
export const CATALOG = [
  {
    id: "leafy",
    label: "Leafy greens",
    note: "Cut the same morning — best eaten within two days.",
    items: [
      { id: "spinach", name: "Spinach", hi: "पालक", te: "పాలకూర", ic: "🥬", price: 30, unit: "bunch", tags: ["organic"] },
      { id: "fenugreek", name: "Fenugreek leaves", hi: "मेथी", te: "మెంతికూర", ic: "🌿", price: 25, unit: "bunch", tags: [] },
      { id: "amaranth", name: "Amaranth greens", hi: "चौलाई", te: "తోటకూర", ic: "🌿", price: 25, unit: "bunch", tags: [] },
      { id: "coriander", name: "Coriander", hi: "धनिया", te: "కొత్తిమీర", ic: "🌿", price: 15, unit: "bunch", tags: ["season"] },
      { id: "mint", name: "Mint", hi: "पुदीना", te: "పుదీనా", ic: "🌿", price: 15, unit: "bunch", tags: [] },
      { id: "mustard", name: "Mustard greens", hi: "सरसों", te: "ఆవిసె కూర", ic: "🥬", price: 30, unit: "bunch", tags: [] },
    ],
  },
  {
    id: "roots",
    label: "Roots & tubers",
    note: "Stores well — good for stocking up.",
    items: [
      { id: "potato", name: "Potato", hi: "आलू", te: "బంగాళాదుంప", ic: "🥔", price: 35, unit: "kg", tags: [] },
      { id: "onion", name: "Onion", hi: "प्याज़", te: "ఉల్లిపాయ", ic: "🧅", price: 40, unit: "kg", tags: [] },
      { id: "carrot", name: "Carrot", hi: "गाजर", te: "క్యారెట్", ic: "🥕", price: 45, unit: "kg", tags: ["season"] },
      { id: "beetroot", name: "Beetroot", hi: "चुकंदर", te: "బీట్‌రూట్", ic: "🍠", price: 40, unit: "kg", tags: [] },
      { id: "radish", name: "Radish", hi: "मूली", te: "ముల్లంగి", ic: "🥕", price: 30, unit: "kg", tags: [] },
      { id: "sweetpotato", name: "Sweet potato", hi: "शकरकंद", te: "చిలగడదుంప", ic: "🍠", price: 50, unit: "kg", tags: ["season"] },
      { id: "ginger", name: "Ginger", hi: "अदरक", te: "అల్లం", ic: "🫚", price: 90, unit: "250g", tags: [] },
      { id: "garlic", name: "Garlic", hi: "लहसुन", te: "వెల్లుల్లి", ic: "🧄", price: 140, unit: "250g", tags: [] },
    ],
  },
  {
    id: "gourds",
    label: "Gourds & squashes",
    note: "",
    items: [
      { id: "bottlegourd", name: "Bottle gourd", hi: "लौकी", te: "సొరకాయ", ic: "🥒", price: 35, unit: "piece", tags: [] },
      { id: "ridgegourd", name: "Ridge gourd", hi: "तोरई", te: "బీరకాయ", ic: "🥒", price: 40, unit: "kg", tags: [] },
      { id: "bittergourd", name: "Bitter gourd", hi: "करेला", te: "కాకరకాయ", ic: "🥒", price: 45, unit: "kg", tags: [] },
      { id: "pumpkin", name: "Pumpkin", hi: "कद्दू", te: "గుమ్మడికాయ", ic: "🎃", price: 35, unit: "kg", tags: [] },
      { id: "cucumber", name: "Cucumber", hi: "खीरा", te: "దోసకాయ", ic: "🥒", price: 30, unit: "kg", tags: ["organic"] },
      { id: "snakegourd", name: "Snake gourd", hi: "चिचिंडा", te: "పొట్లకాయ", ic: "🥒", price: 40, unit: "kg", tags: [] },
    ],
  },
  {
    id: "everyday",
    label: "Everyday vegetables",
    note: "The weekly basics.",
    items: [
      { id: "tomato", name: "Tomato", hi: "टमाटर", te: "టమాటా", ic: "🍅", price: 40, unit: "kg", tags: ["organic"] },
      { id: "brinjal", name: "Brinjal", hi: "बैंगन", te: "వంకాయ", ic: "🍆", price: 35, unit: "kg", tags: [] },
      { id: "cauliflower", name: "Cauliflower", hi: "फूल गोभी", te: "కాలీఫ్లవర్", ic: "🥦", price: 40, unit: "piece", tags: ["season"] },
      { id: "cabbage", name: "Cabbage", hi: "पत्ता गोभी", te: "క్యాబేజీ", ic: "🥬", price: 30, unit: "piece", tags: [] },
      { id: "beans", name: "Green beans", hi: "फंसी", te: "చిక్కుడుకాయ", ic: "🫛", price: 50, unit: "kg", tags: [] },
      { id: "capsicum", name: "Capsicum", hi: "शिमला मिर्च", te: "క్యాప్సికం", ic: "🫑", price: 60, unit: "kg", tags: [] },
      { id: "peas", name: "Green peas", hi: "मटर", te: "బటానీ", ic: "🫛", price: 70, unit: "kg", tags: ["season"] },
      { id: "okra", name: "Okra", hi: "भिंडी", te: "బెండకాయ", ic: "🌱", price: 45, unit: "kg", tags: [] },
      { id: "chilli", name: "Green chilli", hi: "हरी मिर्च", te: "పచ్చిమిర్చి", ic: "🌶️", price: 40, unit: "250g", tags: [] },
      { id: "drumstick", name: "Drumstick", hi: "सहजन", te: "మునగకాయ", ic: "🌿", price: 50, unit: "bunch", tags: [] },
    ],
  },
];

export const ALL_ITEMS = {};
CATALOG.forEach((cat) =>
  cat.items.forEach((it) => {
    ALL_ITEMS[it.id] = { ...it, categoryId: cat.id };
  })
);

export function formatPhoneDisplay(num) {
  if (!num) return "";
  if (num.length === 12) return "+" + num.slice(0, 2) + " " + num.slice(2, 7) + " " + num.slice(7);
  return "+" + num;
}

export function makeOrderCode() {
  const d = new Date();
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const stamp = d.getFullYear().toString().slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
  const rand = Math.floor(1000 + Math.random() * 9000);
  return "F2F-" + stamp + "-" + rand;
}
