# Phone number login (OTP) — setup guide

Accounts are now created and signed into with a mobile number and a 6-digit
code sent by SMS — there's no email or password anywhere in the customer or
staff login flow.

## The one honest catch

**There is no free way to text real customers.** Supabase needs a paid SMS
provider connected. Twilio's free trial only sends messages to phone numbers
you've manually added and verified in the Twilio console yourself — it
cannot text a customer who hasn't done that. So:

- **Testing with your own number**: free, works immediately with a trial account.
- **Real customers**: you need a Twilio account with billing enabled. Cost is
  small per message (a few paise to a few rupees depending on route), but it
  is not zero, and there's no way around that with any provider Supabase
  supports (Twilio, MessageBird, Vonage, TextLocal).
- **India-specific note**: TRAI's DLT regulations govern SMS to Indian
  numbers. Twilio generally handles this without extra registration on your
  part for OTP/transactional messages, but delivery can occasionally be less
  reliable for India than for other countries. If you see repeated delivery
  failures once you're live, TextLocal (India-focused, listed as a
  community-supported provider in Supabase) is the usual fallback — switching
  providers is a Supabase dashboard setting, not a code change.

## Setup steps

1. **Create a Twilio account** at [twilio.com](https://www.twilio.com/try-twilio).
2. In the Twilio console, get a **Twilio phone number** (Phone Numbers → Buy a number — a trial account gives you one free number to start with).
3. Note down three values from the Twilio console dashboard:
   - **Account SID**
   - **Auth Token**
   - The **Twilio phone number** you got in step 2
4. In Supabase: **Authentication → Providers → Phone** → toggle it on.
5. Choose **Twilio** as the SMS provider and paste in the Account SID, Auth Token, and Twilio phone number from step 3.
6. Save.
7. **While still on a Twilio trial**: Twilio console → Phone Numbers → Verified Caller IDs → add and verify your own number (you'll get a text/call to confirm it). Only verified numbers can receive OTPs until you upgrade the Twilio account with billing.
8. Test: open your site's `/login`, enter your own verified number, confirm you receive the code and can sign in.
9. **When ready for real customers**: add a payment method in the Twilio console to leave trial mode. No app code changes needed — it starts working for any number immediately.

## How the login flow works (for reference, no setup needed here)

- Customer enters their name (first time only) and phone number → the app calls Supabase's `signInWithOtp`, which texts a 6-digit code.
- They enter the code → `verifyOtp` completes sign-in. If the number is new, Supabase creates the account automatically at this point (no separate "sign up" step exists anymore — `/signup` just redirects to `/login`).
- Staff sign in separately at `/admin/login`, using the same OTP mechanism, but that page **never creates a new account** — it only lets existing Admin/Supervisor accounts in. See `ADMIN_SETUP.md` for how to grant someone staff access.
