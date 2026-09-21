# F2F local fix

The development seed emails were changed from `.local` addresses to valid `example.com` addresses because the API's EmailStr validation rejects reserved `.local` domains.

Local development credentials:
- Admin: admin@example.com / change-this-now
- Delivery partner: rider@example.com / change-this-now

Rebuild with:
`docker compose down`
`docker compose up --build db backend`
