fetch('http://localhost:3000/api/auth/internal/get-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'nazexa-db-design',
    client_secret: 'secret-db-design-123',
    userId: 'ab4d181d-57d4-4930-972c-e1d90cc2f902',
  }),
})
  .then((r) => r.json())
  .then(console.log);
