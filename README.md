# Field to Family

A free, simple vegetable-ordering website for Hyderabad. No login, no database, no OTP, no paid services.

Customers pick vegetables, the order is typed out as a WhatsApp message, and WhatsApp opens ready to send to
**+91 90143 46193**. Every order is also logged automatically in a Google Sheet that you control from your phone.

Live site: https://field-to-family.vercel.app (or your new Vercel link)

---

## How it works

```
Customer opens link
      |
Sees available vegetables (from your Google Sheet)
      |
Picks items and quantities  ->  Basket
      |
Enters name, mobile, address, pincode (suggestions), area, slot, payment
      |
Reviews the auto-typed WhatsApp message
      |
Taps "Send order on WhatsApp"
      |-- WhatsApp opens with the message ready for 9014346193 (customer taps Send)
      |-- The order is added to the "Orders" tab of your Google Sheet automatically
```

Important limit: a free WhatsApp link cannot press Send for the customer. They tap Send themselves.
Sending fully automatically needs the paid WhatsApp Business API. The Sheet row is saved automatically either way,
so you always have a record.

## Features

- Mobile-first warm farm design, with English, Telugu and Hindi names
- Search and category filters
- Half-kg steps for kg items, whole units for bunch/piece items
- Minimum order Rs 150, free delivery above Rs 299, otherwise Rs 30 delivery
- Delivery in Hyderabad only: customers enter their pincode (suggestions appear as they type, city is set automatically)
- Optional "use my location" Google Maps link
- Basket and form details are remembered on the customer's phone
- The Google Sheet is the price and stock list, so you can edit it from your phone with no redeploy
- The server script re-checks prices, ignores unknown items, blocks duplicate orders and spam, and protects against formula injection

## Project structure

```
pages/index.js               The ordering page
pages/admin.js               Admin page (orders, prices, vegetables)
components/VegArt.js         Vegetable illustrations
components/Scenes.js         Farm, store and delivery drawings
components/Gallery.js        Farm and store section (photos or drawings)
pages/_app.js, _document.js  Page title, fonts, favicon
styles/globals.css           Design
lib/config.mjs               Your settings (numbers, email, Sheet URL, fees)
lib/catalog.mjs              Built-in vegetable list (used if the Sheet is unreachable)
lib/order.mjs                Totals, message text, validation (unit tested)
google-apps-script/Code.gs   Paste into Google Apps Script (the Sheet backend)
scripts/test-logic.mjs       Tests: npm test
scripts/build-code-gs.mjs    Regenerates Code.gs from the catalog
SETUP.md                     Short setup guide
```

## Setup (one time, about 15 minutes)

### Part A: Google Sheet
1. Go to sheets.google.com, create a blank spreadsheet and name it **Field to Family**.
2. Click **Extensions > Apps Script**.
3. Select all the code in the editor and delete it.
4. Open `google-apps-script/Code.gs`, copy everything, paste it into the editor and press **Ctrl+S**.
5. In the function dropdown choose **setupSheets** and click **Run**.
6. Allow permissions: **Review permissions > your account > Advanced > Go to project (unsafe) > Allow**.
   This is your own script.
7. Back in the spreadsheet you now have two tabs: **Products** (30 vegetables) and **Orders**.
8. In Apps Script click **Deploy > New deployment > gear icon > Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).

### Part B: Connect the site
1. Open `lib/config.mjs`.
2. Paste the URL into `sheetUrl: ""`, for example `sheetUrl: "https://script.google.com/macros/s/XXXX/exec",`.
3. Check these while you are there:
   - `whatsappNumber: "919014346193"` (country code 91 plus the number, no + or spaces)
   - `contact` (the 3 bulk-order numbers and the enquiry email), `meatNote`, `deliverySlots`, `paymentOptions`
   - `minOrder`, `freeDeliveryAbove`, `deliveryFee`

### Part C: GitHub (new repo)
1. Go to github.com/new, name it (for example `field-to-family`) and leave the README, .gitignore and license **unticked**.
2. In PowerShell inside this folder run:
   ```
   git init
   git add -A
   git commit -m "Field to Family: simple WhatsApp ordering site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/field-to-family.git
   git push -u origin main
   ```
   If git asks who you are, run `git config --global user.email "you@example.com"` and
   `git config --global user.name "Your Name"` first.

To overwrite an old repo instead of making a new one, use `git push --force origin main`.

### Part D: Vercel
1. Go to vercel.com/new and click **Import** next to the repo.
2. Keep the default settings. No environment variables are needed.
3. Click **Deploy**. In about a minute you get a live link.

### Part E: Test
1. Open the live link on your phone and add items totalling at least Rs 150.
2. Open the basket, fill in the details and tap **Send order on WhatsApp**.
3. Check that WhatsApp opens with the message ready for 9014346193.
4. Check that a new row appeared in the **Orders** tab.

## What is new in this version

- Free delivery above Rs 299 (website and Sheet script). Min order Rs 150, delivery fee Rs 30 otherwise.
- "Questions & bulk orders" section with 3 phone numbers (Call and WhatsApp buttons) and the enquiry email `fieldtofamily2026@gmail.com`.
  Edit them in `lib/config.mjs` under `contact`. Orders still go to `whatsappNumber`.
- Bigger Telugu and Hindi text (16 px) everywhere.
- 77 items, all vegetarian, each with its own drawing: 63 vegetables (gongura, bachala kura, chukka kura, koyi gura, round sorakaya,
  dosakaya, Dondakaya local / hybrid, Gokarakaya local / hybrid, Chikkudukaya local / hybrid, yam, arbi, broccoli, mushroom...)
  and 14 basic fruits (banana, apple, orange, mosambi, pomegranate, papaya, watermelon, muskmelon, grapes, guava, pineapple,
  sapota, custard apple, mango). There is no non-veg anywhere on the site.
- Location: pincode box with suggestions as you type (by digits or locality name), city set to Hyderabad automatically,
  other cities blocked, optional landmark, and "Use my location" which pins Google Maps and tries to fill the pincode and area.
  The pincode list is in `lib/pincodes.mjs` (approximate, add more any time; any 500001 to 500100 is accepted).
- Cursor ring and hover effects (mouse only), leaf burst when you tap Add, "added" toast, basket pop, scroll reveal, hero parallax.
  All switched off for people who prefer reduced motion.

### If you already have a live Google Sheet (do this once)
1. Apps Script: paste the new `Code.gs`, keep your own `ADMIN_PASSWORD`, save.
2. Choose the function **updateProducts** and click Run. It deletes any old Chicken / Mutton rows, adds the new vegetables and fruits,
   and never changes prices you already set.
3. Deploy > Manage deployments > pencil > Version: New version > Deploy.
4. The Rs 299 free delivery rule is in the script too, so step 3 is needed for the Sheet totals to match.
5. Set your real prices for the new items. The prices shipped are only starting values. Please also check the Telugu and Hindi names, especially Koyi gura and Gokarakaya (the Local / Hybrid split is my guess: rename them in the admin page).

## Pictures, photos and look

- **Vegetable pictures:** all 30 vegetables have built-in hand-drawn illustrations (free, nothing to download). New vegetables you add
  with a similar name (for example "Ash gourd", "Green chilli") get a matching picture automatically, otherwise a leaf badge.
- **Real vegetable photo:** paste an image link in the Image URL column of the Products sheet. The photo replaces the drawing.
- **Farm and store photos:** copy your pictures into `public/gallery/` as `farm.jpg`, `store.jpg` and `delivery.jpg`
  (about 1200 px wide, under 300 KB). They replace the drawings in the "Our farm & store" section automatically.
  Edit the titles and text in `lib/config.mjs` under `gallery`.
- **Popular tags:** edit `popular` in `lib/config.mjs`.
- **Promises** under the gallery (`promises` in config): keep only what is true for your business.
- **Order again:** returning customers get a one-tap button to repeat their last order (saved on their own phone).
- **Share with friends:** the footer button shares your link on WhatsApp. When your link is shared, WhatsApp shows a preview card
  (`public/og.png`). Make sure `siteUrl` in `lib/config.mjs` is your real website address.
- **Install on phone:** customers can "Add to Home screen" and the site opens like an app, with its own icon.

## Admin page (easiest way to run the shop)

Open **your-site/admin** (for example https://field-to-family.vercel.app/admin) and enter the admin password.

1. In Apps Script open `Code.gs`, change `var ADMIN_PASSWORD = "change-this-password";` to your own password (6+ characters), save.
2. **Deploy > Manage deployments > pencil icon > Version: New version > Deploy.** The URL stays the same.

Orders tab: all orders in one place, newest first. Change status (New, Confirmed, Out for delivery, Delivered, Cancelled) from the dropdown,
tap Call or WhatsApp customer, search by name/phone/order ID. It refreshes every minute.

Vegetables & prices tab: change prices, untick **Show** to hide a vegetable, add new vegetables, delete, and use **Hide all / Show all**.
Press **Save changes** at the bottom. The website updates within about a minute.

## Daily use in the Sheet itself (no code, no redeploy)

Edit the **Products** tab in your Google Sheet. Changes show on the site within about a minute.

| Column | What it does |
|---|---|
| ID | A unique short name, such as `tomato`. Do not change it for existing items. |
| Show on website / In stock | Untick EITHER box and the vegetable disappears from the website. |
| Category | Groups items on the page. |
| Name, Telugu, Hindi | The names shown to customers. |
| Price | Price in Rs per unit. |
| Unit | `kg`, `bunch` or `piece`. Kg items go in half-kg steps. |
| Image URL | Optional photo link. A letter shows if empty. |

- **Change a price:** edit the Price cell.
- **Add a vegetable:** add a new row with a unique ID.
- **Orders tab:** each order is a row with time, order ID, customer, phone, address, area, map link, slot, payment, items, total and notes.
  Use the **Status** column (New / Delivered and so on) to track delivery.

## Editing the settings later
Change `lib/config.mjs`, then run `git add -A`, `git commit -m "update"` and `git push`. Vercel redeploys on its own.

If you change `Code.gs`, in Apps Script go to **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**.
The URL stays the same. Do not click "New deployment", because that creates a different URL.

## Run on your computer (optional)
```
npm install
npm run dev      # http://localhost:3000
npm test         # logic tests
npm run build    # production build
```
Needs Node.js 18 or newer.

## Troubleshooting

| Problem | Fix |
|---|---|
| Site shows default vegetables and Sheet edits don't appear | `sheetUrl` is empty or wrong in `lib/config.mjs`. Fix it and push. |
| Orders don't appear in the Orders tab | In Apps Script check Deploy > Manage deployments: Execute as **Me**, access **Anyone**. Redeploy a new version after any change. |
| "Authorization required" when running `setupSheets` | Complete the permission steps in Part A, step 6. |
| WhatsApp opens but no number or message | Check `whatsappNumber` is digits only, with 91 at the start. |
| `git push` rejected | The repo isn't empty. Use a new empty repo, or `git push --force origin main` to overwrite. |
| `npm install` EPERM on Windows | Close editors, delete `node_modules` and `package-lock.json`, run `npm cache clean --force`, then install again. |
| A vegetable I unticked still shows | Wait a minute and refresh. Make sure the web app was redeployed as a New version after pasting the latest Code.gs. |
| Admin says "Open Code.gs... change ADMIN_PASSWORD" | Set a password in Code.gs and deploy a New version. |

## Safety notes
- There are no passwords or API keys in this project.
- Customers are not verified (OTP costs money). Orders are re-priced by the Sheet script, duplicates and bots are ignored,
  and you can phone-confirm unusual orders before delivering.
- Keep `recovery-codes.txt` and any `.env` files out of Git. They are listed in `.gitignore`.

## Limits
- WhatsApp opens prefilled, so the customer must tap Send.
- Google Apps Script is free but has daily quotas that are far above normal shop volume.
- Order data lives in your own Google account.

## Licence
Private project for Field to Family, Hyderabad.
