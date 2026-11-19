/**
 * Field to Family - Google Sheet backend (free).
 * 1) Change ADMIN_PASSWORD below.  2) Run setupSheets once.
 * 3) Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * After editing this file later: Deploy > Manage deployments > pencil > New version > Deploy.
 *
 * Products tab : untick the box -> the vegetable disappears from the website.
 * Orders tab   : every order is added here automatically.
 * Admin page   : https://YOUR-SITE/admin  (uses ADMIN_PASSWORD)
 */

var ADMIN_PASSWORD = "change-this-password";

var PRODUCT_HEADERS = ["ID", "Show on website", "In stock", "Category", "Name", "Telugu", "Hindi", "Price", "Unit", "Image URL"];
var ORDER_HEADERS = ["Time", "Order ID", "Name", "Phone", "Address", "Area", "Map link", "Slot", "Payment", "Items", "Total (Rs)", "Notes", "Status"];
var STATUSES = ["New", "Confirmed", "Out for delivery", "Delivered", "Cancelled"];
var MIN_ORDER = 150, FREE_ABOVE = 299, DELIVERY_FEE = 30;

var SEED = /*SEED*/[];

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function setupSheets() {
  var ss = ss_();
  var p = ss.getSheetByName("Products") || ss.insertSheet("Products");
  if (p.getLastRow() < 2) {
    p.clear();
    p.appendRow(PRODUCT_HEADERS);
    var rows = SEED.map(function (s) { return [s.id, true, true, s.category, s.name, s.te, s.hi, s.price, s.unit, ""]; });
    p.getRange(2, 1, rows.length, PRODUCT_HEADERS.length).setValues(rows);
    p.getRange(2, 2, rows.length, 2).insertCheckboxes();
    p.setFrozenRows(1);
    p.getRange(1, 1, 1, PRODUCT_HEADERS.length).setFontWeight("bold").setBackground("#e9f0dd");
    p.autoResizeColumns(1, PRODUCT_HEADERS.length);
  }
  var o = ss.getSheetByName("Orders") || ss.insertSheet("Orders");
  if (o.getLastRow() < 1) {
    o.appendRow(ORDER_HEADERS);
    o.setFrozenRows(1);
    o.getRange(1, 1, 1, ORDER_HEADERS.length).setFontWeight("bold").setBackground("#fbe9c8");
  }
  var def = ss.getSheetByName("Sheet1");
  if (def && ss.getSheets().length > 1 && def.getLastRow() === 0) ss.deleteSheet(def);
}

/* Run this once after updating Code.gs: adds any new default items (e.g. chicken, mutton, more vegetables)
   that are not yet in your Products tab. It never changes items you already have. */
function addMissingProducts() {
  var sh = ss_().getSheetByName("Products");
  if (!sh) { setupSheets(); return; }
  var last = sh.getLastRow();
  var have = {};
  if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach(function (r) { have[String(r[0]).trim()] = true; });
  var added = 0;
  SEED.forEach(function (s) {
    if (have[s.id]) return;
    addProductRow_(sh, [s.id, true, true, s.category, s.name, s.te, s.hi, s.price, s.unit, ""]);
    added++;
  });
  return added;
}

/* Run this ONE function after pasting the new Code.gs. It
   1) removes any Chicken / Mutton rows from Products,
   2) renames the Ivy gourd, Broad beans and Cucumber (Telugu) rows to the new names, only if you had not changed them,
   3) adds every new vegetable and fruit that is missing.
   It never changes prices you already set. */
function updateProducts() {
  var sh = ss_().getSheetByName("Products");
  if (!sh) { setupSheets(); return "Created sheets"; }
  var removed = 0;
  for (var r = sh.getLastRow(); r >= 2; r--) {
    var cat = String(sh.getRange(r, 4).getValue()).toLowerCase();
    if (cat === "chicken" || cat === "mutton") { sh.deleteRow(r); removed++; }
  }
  var renames = { ivygourd: ["Ivy gourd (Tindora)", "Dondakaya - Local (Ivy gourd)"], broadbeans: ["Broad beans", "Chikkudukaya - Local (Broad beans)"] };
  var last = sh.getLastRow();
  if (last > 1) {
    var ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var id = String(ids[i][0]).trim();
      if (renames[id] && String(sh.getRange(i + 2, 5).getValue()) === renames[id][0]) sh.getRange(i + 2, 5).setValue(renames[id][1]);
      if (id === "cucumber") sh.getRange(i + 2, 6).setValue("\u0C15\u0C40\u0C30 \u0C26\u0C4B\u0C38\u0C15\u0C3E\u0C2F");
    }
  }
  var added = addMissingProducts();
  Logger.log("Removed " + removed + " non-veg rows, added " + added + " new items.");
  return "Removed " + removed + ", added " + added;
}

/* Adds one row to Products. Works whether or not the sheet uses "typed columns" (Sheets tables). */
function addProductRow_(sh, row) {
  var at = sh.getLastRow() + 1;
  try {
    sh.getRange(at, 1, 1, row.length).setValues([row]);
  } catch (e) {
    sh.appendRow(row);
    at = sh.getLastRow();
  }
  try { sh.getRange(at, 2, 1, 2).insertCheckboxes(); } catch (e2) { /* already checkboxes / typed column: fine */ }
  return at;
}

function truthy(v) { return v === true || String(v).toLowerCase() === "true" || String(v).toLowerCase() === "yes"; }

/* every product row; show = both boxes ticked */
function readAllProducts_() {
  var sh = ss_().getSheetByName("Products");
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getRange(2, 1, sh.getLastRow() - 1, PRODUCT_HEADERS.length).getValues();
  var out = [];
  v.forEach(function (r) {
    if (!r[0]) return;
    out.push({
      id: String(r[0]).trim(), show: truthy(r[1]) && truthy(r[2]), category: String(r[3] || "Other"),
      name: String(r[4]), te: String(r[5] || ""), hi: String(r[6] || ""),
      price: Number(r[7]) || 0, unit: String(r[8] || "kg"), image: String(r[9] || "")
    });
  });
  return out;
}

function readProducts_() {
  return readAllProducts_().filter(function (p) { return p.show && p.price > 0; }).map(function (p) {
    return { id: p.id, available: true, category: p.category, name: p.name, te: p.te, hi: p.hi, price: p.price, unit: p.unit, image: p.image };
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ products: readProducts_(), t: new Date().getTime() });
}

function clean_(s, n) {
  s = String(s == null ? "" : s).replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, n);
  if (/^[=+\-@]/.test(s)) s = "'" + s;             // stop spreadsheet formula injection
  return s;
}

function stepFor_(unit) { return String(unit).toLowerCase() === "kg" ? 0.5 : 1; }

function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (d.action) return admin_(d);
    return order_(d);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ---------------- customer order ---------------- */
function order_(d) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    if (d.website) return json_({ ok: true });      // honeypot: bots fill this
    var phone = String(d.phone || "").replace(/\D/g, "").slice(-10);
    if (!d.orderId || !/^[6-9]\d{9}$/.test(phone) || !d.items || !d.items.length || d.items.length > 60)
      return json_({ ok: false, error: "bad order" });

    var byId = {};
    readProducts_().forEach(function (p) { byId[p.id] = p; });
    var lines = [], sub = 0;
    d.items.forEach(function (it) {
      var p = byId[String(it.id)];
      var q = Number(it.qty);
      if (!p || !(q > 0) || q > 99) return;
      var st = stepFor_(p.unit);
      q = Math.round(q / st) * st;
      var lt = Math.round(p.price * q * 100) / 100;
      sub += lt;
      lines.push(p.name + " " + q + " " + p.unit + " = Rs " + lt);
    });
    if (!lines.length) return json_({ ok: false, error: "no valid items" });
    var total = sub + (sub >= FREE_ABOVE ? 0 : DELIVERY_FEE);

    lock.waitLock(20000); locked = true;
    var sh = ss_().getSheetByName("Orders");
    if (!sh) { setupSheets(); sh = ss_().getSheetByName("Orders"); }
    var oid = clean_(d.orderId, 30);
    var last = sh.getLastRow();
    if (last > 1) {
      var from = Math.max(2, last - 200);
      var ids = sh.getRange(from, 2, last - from + 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (ids[i][0] === oid) return json_({ ok: true, dup: true });
    }
    sh.appendRow([
      new Date(), oid, clean_(d.name, 80), "'" + phone, clean_(d.address, 250), clean_(d.area, 60),
      clean_(d.mapLink, 200), clean_(d.slot, 40), clean_(d.payment, 40),
      lines.join("\n"), total + (sub < MIN_ORDER ? "  (below minimum)" : ""),
      clean_(d.notes, 300), "New"
    ]);
    return json_({ ok: true, total: total });
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (x) {} }
  }
}

/* ---------------- admin ---------------- */
function admin_(d) {
  if (ADMIN_PASSWORD === "change-this-password" || String(ADMIN_PASSWORD).length < 6)
    return json_({ ok: false, error: "Open Code.gs in Apps Script, change ADMIN_PASSWORD (6+ characters), then deploy a New version." });
  if (String(d.pw) !== ADMIN_PASSWORD) { Utilities.sleep(1500); return json_({ ok: false, error: "Wrong password" }); }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (d.action === "saveProducts") saveProducts_(d.products || []);
    else if (d.action === "deleteProduct") deleteProduct_(String(d.id || ""));
    else if (d.action === "setStatus") setStatus_(String(d.orderId || ""), String(d.status || ""));
    else if (d.action !== "list") return json_({ ok: false, error: "unknown action" });
    return json_({ ok: true, products: readAllProducts_(), orders: readOrders_(), statuses: STATUSES });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function readOrders_() {
  var sh = ss_().getSheetByName("Orders");
  if (!sh || sh.getLastRow() < 2) return [];
  var n = Math.min(300, sh.getLastRow() - 1);
  var v = sh.getRange(sh.getLastRow() - n + 1, 1, n, ORDER_HEADERS.length).getValues();
  return v.reverse().map(function (r) {
    return {
      time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), orderId: String(r[1]), name: String(r[2]),
      phone: String(r[3]).replace(/\D/g, "").slice(-10), address: String(r[4]), area: String(r[5]), mapLink: String(r[6]),
      slot: String(r[7]), payment: String(r[8]), items: String(r[9]), total: String(r[10]), notes: String(r[11]),
      status: String(r[12] || "New")
    };
  });
}

function setStatus_(orderId, status) {
  if (STATUSES.indexOf(status) < 0) throw new Error("bad status");
  var sh = ss_().getSheetByName("Orders");
  if (!sh || sh.getLastRow() < 2) throw new Error("no orders");
  var ids = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === orderId) { sh.getRange(i + 2, 13).setValue(status); return; }
  }
  throw new Error("order not found");
}

function saveProducts_(list) {
  var sh = ss_().getSheetByName("Products");
  if (list.length > 100) throw new Error("too many changes at once");
  list.forEach(function (p) {
    var id = clean_(p.id, 40).replace(/[^A-Za-z0-9_-]/g, "");
    var price = Number(p.price);
    var name = clean_(p.name, 80);
    if (!id || !name || !(price > 0) || price > 100000) throw new Error("Check name and price for: " + (name || id));
    var row = [id, !!p.show, !!p.show, clean_(p.category, 40) || "Other", name, clean_(p.te, 80), clean_(p.hi, 80),
               Math.round(price * 100) / 100, clean_(p.unit, 12) || "kg", clean_(p.image, 400)];
    var last = sh.getLastRow();
    var ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [];
    var at = -1;
    for (var i = 0; i < ids.length; i++) if (String(ids[i][0]).trim() === id) { at = i + 2; break; }
    if (at < 0) {
      addProductRow_(sh, row);
    } else {
      sh.getRange(at, 1, 1, row.length).setValues([row]);
    }
  });
}

function deleteProduct_(id) {
  var sh = ss_().getSheetByName("Products");
  var last = sh.getLastRow();
  if (last < 2) return;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) { sh.deleteRow(i + 2); return; }
  }
}
