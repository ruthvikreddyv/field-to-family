import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { CONFIG } from "../lib/config.mjs";
import { FALLBACK_PRODUCTS } from "../lib/catalog.mjs";
import * as O from "../lib/order.mjs";
import { suggest, lookupPin, cleanPin, PINCODES } from "../lib/pincodes.mjs";

const products = FALLBACK_PRODUCTS.map((p) => ({ ...p, available: true, image: "" }));
const N = products.length;
const veg = (id) => products.find((p) => p.id === id);

// totals
assert.deepEqual(O.priceBreakdown(0, CONFIG), { subtotal: 0, delivery: 0, total: 0 });
assert.equal(O.priceBreakdown(200, CONFIG).total, 230);
assert.equal(O.priceBreakdown(500, CONFIG).delivery, 0);
// steps
assert.equal(O.stepFor("kg"), 0.5); assert.equal(O.stepFor("bunch"), 1);
assert.equal(O.fmtQty(1.5), "1.5"); assert.equal(O.fmtQty(2), "2");
// lines
const lines = O.cartLines({ potato: 1.5, spinach: 2, ghost: 3, onion: -1, mint: 500 }, products);
assert.equal(lines.length, 2);
assert.equal(lines.find((l) => l.id === "potato").lineTotal, veg("potato").price * 1.5);
products.find((p) => p.id === "mint").available = false;
assert.equal(O.cartLines({ mint: 1 }, products).length, 0);
// phone / id
assert.equal(O.normalisePhone("+91 90143 46193"), "9014346193");
assert.ok(O.isValidMobile("9014346193")); assert.ok(!O.isValidMobile("1234567890")); assert.ok(!O.isValidMobile("90143"));
assert.match(O.makeOrderId(new Date(2026, 9, 20), () => 0.5), /^F2F-261020-\d{4}$/);
// message + link
lines.find((l) => l.id === "potato").qty = 5; lines.find((l) => l.id === "potato").lineTotal = veg("potato").price * 5;
const totals = O.priceBreakdown(lines.reduce((s, l) => s + l.lineTotal, 0), CONFIG);
const customer = { name: "Ravi", phone: "9014346193", address: "Flat 4B, Rose Apts, Road 3", pincode: "500081", landmark: "Near Metro", area: "Madhapur", slot: CONFIG.deliverySlots[0], payment: CONFIG.paymentOptions[0], notes: "", mapLink: "" };
const msg = O.buildMessage({ orderId: "F2F-261020-1234", lines, totals, customer });
assert.ok(msg.includes("1. ") && msg.includes("Total: Rs") && msg.includes("Ravi") && msg.includes("Hyderabad"));
const link = O.whatsappLink(CONFIG.whatsappNumber, msg);
assert.ok(link.startsWith("https://wa.me/919014346193?text="));
assert.equal(decodeURIComponent(link.split("text=")[1]), msg);
// validation
const base = { lines, totals, customer };
assert.equal(O.validateCheckout(base, CONFIG), "");
assert.match(O.validateCheckout({ ...base, customer: { ...customer, phone: "123" } }, CONFIG), /mobile/);
assert.match(O.validateCheckout({ ...base, customer: { ...customer, area: "" } }, CONFIG), /area/);
assert.match(O.validateCheckout({ ...base, customer: { ...customer, pincode: "560001" } }, CONFIG), /only in Hyderabad/);
assert.match(O.validateCheckout({ ...base, customer: { ...customer, pincode: "5000" } }, CONFIG), /6-digit/);
assert.ok(msg.includes("Landmark: Near Metro") && msg.includes("Hyderabad - 500081"));
// pincode helpers
assert.equal(suggest("5000")[0].pin.startsWith("5000"), true);
assert.ok(suggest("madh").some((x) => x.loc === "Madhapur" && x.pin === "500081"));
assert.ok(suggest("kuk").some((x) => x.pin === "500072"));
assert.deepEqual(suggest(""), []);
assert.equal(suggest("5000", 3).length, 3);
assert.equal(cleanPin("500 081x9"), "500081");
assert.equal(lookupPin("500081").ok, true); assert.equal(lookupPin("500099").ok, true);
assert.equal(lookupPin("500101").ok, false); assert.equal(lookupPin("110001").ok, false); assert.equal(lookupPin("50").partial, true);
assert.equal(new Set(PINCODES.map((p) => p[0])).size, PINCODES.length);
// new catalog
assert.ok(products.length >= 70);
assert.equal(new Set(products.map((p) => p.id)).size, products.length);
assert.ok(!products.some((p) => /chicken|mutton/i.test(p.category + p.name)), "no non-veg");
assert.ok(products.filter((p) => p.category === "Fruits").length >= 12);
for (const need of ["bachalakura","chukkakura","koyigura","roundsorakaya","dosakaya","dondakayahybrid","gokarakayalocal","gokarakayahybrid","chikkudukayahybrid","custardapple"]) assert.ok(products.find((p) => p.id === need), need);
assert.ok(products.every((p) => p.te && p.hi && p.price > 0));
assert.equal(CONFIG.freeDeliveryAbove, 299);
assert.equal(O.priceBreakdown(298, CONFIG).delivery, 30); assert.equal(O.priceBreakdown(299, CONFIG).delivery, 0);
assert.match(O.validateCheckout({ lines: [], totals, customer }, CONFIG), /empty/);
assert.match(O.validateCheckout({ lines, totals: { ...totals, subtotal: 10 }, customer }, CONFIG), /Minimum/);

// Apps Script mock (in-memory sheets)
class Sheet {
  constructor(rows) { this.rows = rows; }
  getLastRow() { return this.rows.length; }
  getRange(r, c, nr = 1, nc = 1) {
    const me = this;
    return {
      getValues: () => me.rows.slice(r - 1, r - 1 + nr).map((row) => row.slice(c - 1, c - 1 + nc)),
      setValues: (v) => v.forEach((row, i) => { me.rows[r - 1 + i] = me.rows[r - 1 + i] || []; row.forEach((x, j) => { me.rows[r - 1 + i][c - 1 + j] = x; }); }),
      setValue: (x) => { me.rows[r - 1][c - 1] = x; },
      getValue: () => me.rows[r - 1][c - 1],
      insertCheckboxes() { if (me.typed) throw new Error("This operation is not allowed on cells in typed columns."); },
    };
  }
  appendRow(row) { this.rows.push(row); }
  deleteRow(n) { this.rows.splice(n - 1, 1); }
}
const prodSheet = new Sheet([["ID"], ...FALLBACK_PRODUCTS.map((s) => [s.id, true, true, s.category, s.name, s.te, s.hi, s.price, s.unit, ""])]);
const ordSheet = new Sheet([["Time"]]);
const sheets = { Products: prodSheet, Orders: ordSheet };
const ctx = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: (n) => sheets[n] }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: { sleep() {} },
  Logger: { log() {} },
  ContentService: { MimeType: { JSON: "json" }, createTextOutput: (t) => ({ t, setMimeType() { return this; } }) },
  JSON, String, Number, Math, Date, Error, Array,
};
vm.createContext(ctx);
const code = readFileSync(new URL("../google-apps-script/Code.gs", import.meta.url), "utf8");
vm.runInContext(code, ctx);
const post = (o) => JSON.parse(vm.runInContext("doPost", ctx)({ postData: { contents: JSON.stringify(o) } }).t);
const getP = () => JSON.parse(vm.runInContext("doGet", ctx)().t).products;
const orders = () => ordSheet.rows.slice(1);

assert.equal(getP().length, N);
prodSheet.rows[1][2] = false;                       // untick "In stock" -> hidden
assert.equal(getP().length, N - 1); assert.ok(!getP().find((p) => p.id === FALLBACK_PRODUCTS[0].id));
prodSheet.rows[1][2] = true; prodSheet.rows[2][1] = false; // untick "Show" -> hidden
assert.equal(getP().length, N - 1); prodSheet.rows[2][1] = true;

const ok = { orderId: "F2F-1", name: "=HYPERLINK(1)", phone: "9014346193", address: "x", area: "y", items: [{ id: "potato", qty: 1.5 }, { id: "fake", qty: 1 }] };
assert.equal(post(ok).ok, true); assert.equal(orders().length, 1);
assert.equal(orders()[0][2][0], "'");               // formula neutralised
assert.equal(orders()[0][9].split("\n").length, 1);
assert.equal(post(ok).dup, true); assert.equal(orders().length, 1);
assert.equal(post({ ...ok, orderId: "F2", phone: "123" }).ok, false);
assert.equal(post({ ...ok, orderId: "F3", website: "spam" }).ok, true); assert.equal(orders().length, 1);
assert.equal(post({ ...ok, orderId: "F4", items: [{ id: "fake", qty: 1 }] }).ok, false);
post({ ...ok, orderId: "F5" }); assert.equal(orders().length, 2);

// admin: password rules (default password refuses; set one for the test)
assert.match(post({ action: "list", pw: "x" }).error, /change ADMIN_PASSWORD/);
vm.runInContext('ADMIN_PASSWORD = "secret123"', ctx);
assert.equal(post({ action: "list", pw: "nope" }).error, "Wrong password");
const L = post({ action: "list", pw: "secret123" });
assert.equal(L.ok, true); assert.equal(L.products.length, N); assert.equal(L.orders.length, 2);
assert.equal(L.orders[0].orderId, "F2F-5".replace("F2F-", "F")); // newest first
assert.equal(L.orders[0].status, "New");
let r = post({ action: "setStatus", pw: "secret123", orderId: "F5", status: "Delivered" });
assert.equal(r.orders[0].status, "Delivered");
assert.equal(post({ action: "setStatus", pw: "secret123", orderId: "F5", status: "bogus" }).ok, false);
// edit price + hide
const potato = L.products.find((p) => p.id === "potato");
r = post({ action: "saveProducts", pw: "secret123", products: [{ ...potato, price: 55, show: false }] });
assert.equal(r.products.find((p) => p.id === "potato").price, 55);
assert.ok(!getP().find((p) => p.id === "potato"));            // hidden from public site
r = post({ action: "saveProducts", pw: "secret123", products: [{ ...potato, price: 55, show: true }] });
assert.equal(getP().find((p) => p.id === "potato").price, 55);
// add new + delete
r = post({ action: "saveProducts", pw: "secret123", products: [{ id: "drumstick-123", name: "Drumstick", te: "మునగకాయ", hi: "सहजन", category: "Gourds", price: 80, unit: "kg", show: true }] });
assert.equal(getP().length, N + 1); assert.equal(r.products.length, N + 1);
assert.equal(post({ action: "saveProducts", pw: "secret123", products: [{ id: "bad", name: "Bad", price: 0, show: true }] }).ok, false);
r = post({ action: "deleteProduct", pw: "secret123", id: "drumstick-123" });
assert.equal(getP().length, N);
prodSheet.typed = true;                                 // simulate a Sheets "table" with typed columns
// addMissingProducts: older sheet gets only the new items
prodSheet.rows.splice(1);                               // pretend an old sheet with 2 items
prodSheet.rows.push(["spinach", true, true, "Leafy greens", "Spinach", "", "", 99, "bunch", ""], ["potato", true, true, "Roots & tubers", "Potato", "", "", 77, "kg", ""]);
assert.equal(vm.runInContext("addMissingProducts", ctx)(), N - 2);
assert.equal(prodSheet.rows.filter((r) => r[0] === "spinach").length, 1);
assert.equal(prodSheet.rows.find((r) => r[0] === "potato")[7], 77);   // your price kept
assert.equal(vm.runInContext("addMissingProducts", ctx)(), 0);
// updateProducts: removes non-veg rows, renames, adds missing
prodSheet.rows.splice(1);
prodSheet.rows.push(["chickencurry", true, true, "Chicken", "Chicken curry", "", "", 240, "kg", ""], ["ivygourd", true, true, "Gourds & squashes", "Ivy gourd (Tindora)", "x", "y", 55, "kg", ""], ["muttoncurry", true, true, "Mutton", "Mutton curry", "", "", 900, "kg", ""], ["cucumber", true, true, "Gourds & squashes", "Cucumber", "old", "खीरा", 30, "kg", ""]);
vm.runInContext("updateProducts", ctx)();
assert.ok(!prodSheet.rows.some((r) => /chicken|mutton/i.test(r[3])));
assert.equal(prodSheet.rows.find((r) => r[0] === "ivygourd")[4], "Dondakaya - Local (Ivy gourd)");
assert.equal(prodSheet.rows.find((r) => r[0] === "ivygourd")[7], 55);
assert.equal(prodSheet.rows.find((r) => r[0] === "cucumber")[5], "కీర దోసకాయ");
assert.ok(prodSheet.rows.find((r) => r[0] === "custardapple"));
assert.equal(prodSheet.rows.length - 1, N);
console.log("all logic tests passed");
