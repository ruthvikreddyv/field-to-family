# Field to Family - simple ordering site (free, no login, no database)

How it works: the customer picks vegetables, checkout writes the order as a WhatsApp message, WhatsApp opens
with it ready for 9014346193, and the customer taps Send. The order is also added to your Google Sheet automatically.

Note: a free WhatsApp link cannot press Send for the customer. They tap Send themselves. (Fully automatic
sending needs the paid WhatsApp Business API.) The Sheet row is saved automatically either way.

## Part 1 - Google Sheet (10 minutes, one time)
1. Go to sheets.google.com, create a blank sheet, name it "Field to Family".
2. Menu: Extensions > Apps Script.
3. Delete everything in the editor, open `google-apps-script/Code.gs` from this folder, copy all, paste, click Save.
4. In the function dropdown at the top choose `setupSheets`, click Run. Allow permissions
   (Advanced > Go to project (unsafe) > Allow - it is your own script).
   Two tabs appear: Products (30 vegetables) and Orders.
5. Click Deploy > New deployment > gear icon > Web app.
   Execute as: Me. Who has access: Anyone. Click Deploy, then copy the Web app URL (ends in /exec).
6. Open `lib/config.mjs` and paste the URL between the quotes of `sheetUrl: ""`.

## Part 2 - Put it on the website
Replace the old project files with this folder's contents, then in PowerShell:
```
git add -A
git commit -m "Simple WhatsApp ordering site"
git push --force origin main
```
A force push overwrites the old Supabase version. Vercel redeploys by itself.
You do not need any Environment Variables now, so you can delete the old ones.
Test: open https://field-to-family.vercel.app, place a test order, check the Orders tab.

## Daily use (no code, no redeploy)
- Change price: edit the Price cell in the Products tab.
- Out of stock today: untick Available (shows "Not available").
- Hide completely: untick Active.
- Add a vegetable: add a new row with a unique ID (e.g. brinjal2), name, Telugu, Hindi, price and unit (kg, bunch or piece).
- Photo: paste an image link in Image URL (otherwise a letter shows).
- Changes show on the site within a minute.
- Orders: new rows appear in Orders. Set Status as you deliver.

## If you edit Code.gs later
Deploy > Manage deployments > pencil > Version: New version > Deploy (the URL stays the same).

## Limits
- Customers are not verified (no OTP, because it costs money). The Sheet re-checks prices and ignores fake items,
  and you can phone-confirm odd orders before delivering.
- Old Supabase accounts and data are not carried over.
- Keep recovery-codes.txt out of Git (it is in .gitignore).

## Admin page
Open your-site/admin. Before first use, change ADMIN_PASSWORD at the top of Code.gs, then Deploy > Manage deployments > pencil > New version > Deploy.

## Updating an existing Sheet to the newest Code.gs
Paste the new Code.gs, run `updateProducts` once (removes old non-veg rows, adds new items, keeps your prices), then Deploy > Manage deployments > pencil > New version > Deploy.
