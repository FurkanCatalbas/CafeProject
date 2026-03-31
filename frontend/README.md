# Cafe Smart UI

This frontend connects to implemented backend endpoints:

- `POST /auth-service/api/auth/register`
- `POST /auth-service/api/auth/token`
- `POST /auth-service/api/auth/refresh-token`
- `GET /user-service/api/users/{id}`
- `POST /user-service/api/users`
- `PUT /user-service/api/users`
- `DELETE /user-service/api/users/{id}` (ADMIN)

## Run

```bash
cd frontend
npm install
npm run dev
```

By default requests are sent to relative paths and proxied by Vite to `http://localhost:10101`.
You can override with:

```bash
VITE_API_BASE=http://localhost:10101 npm run dev
```
