# Railway Deploy

This project is a monorepo with multiple Spring Boot services and a React frontend. On Railway, deploy each app as a separate service from the same GitHub repository.

## Services To Create

Create these Railway services from the same repo:

| Railway service | Dockerfile path |
| --- | --- |
| `frontend` | use Nixpacks, root directory `frontend` |
| `gateway-service` | `backend/gateway-service/Dockerfile.railway` |
| `auth-service` | `backend/auth-service/Dockerfile.railway` |
| `user-service` | `backend/user-service/Dockerfile.railway` |
| `place-service` | `backend/place-service/Dockerfile.railway` |
| `product-service` | `backend/product-service/Dockerfile.railway` |
| `order-service` | `backend/order-service/Dockerfile.railway` |
| `music-service` | `backend/music-service/Dockerfile.railway` |

`discovery-service` is not required on Railway. The gateway can route directly to each Railway service URL.

## Frontend

For the frontend service:

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Start command: `npx serve -s build -l $PORT`
- Environment variable: `REACT_APP_API_URL=https://<gateway-service-public-domain>`

Railway only exposes environment variables at build time for Create React App, so redeploy the frontend after setting `REACT_APP_API_URL`.

## Gateway Environment Variables

Set these on `gateway-service` after the backend services have Railway domains:

```env
EUREKA_CLIENT_ENABLED=false
AUTH_SERVICE_URI=https://<auth-service-domain>
USER_SERVICE_URI=https://<user-service-domain>
PRODUCT_SERVICE_URI=https://<product-service-domain>
ORDER_SERVICE_URI=https://<order-service-domain>
PLACE_SERVICE_URI=https://<place-service-domain>
MUSIC_SERVICE_URI=https://<music-service-domain>
```

If you enable Railway private networking, you can use private service URLs instead of public domains. Keep the full URI format, for example `http://service-name.railway.internal:PORT` if your Railway project exposes that format.

## Backend Environment Variables

Set this on every Spring Boot service deployed to Railway:

```env
EUREKA_CLIENT_ENABLED=false
```

The app already reads Railway's `PORT` variable through `server.port=${PORT:...}`.

## Database

The current demo works with default H2 in-memory databases, but data is lost when services restart.

For persistence, add Railway PostgreSQL and set the matching variables per service.

Auth service:

```env
AUTH_DB_URL=jdbc:postgresql://<host>:<port>/<db>
AUTH_DB_USERNAME=<user>
AUTH_DB_PASSWORD=<password>
AUTH_DB_DRIVER=org.postgresql.Driver
AUTH_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

User service:

```env
USER_DB_URL=jdbc:postgresql://<host>:<port>/<db>
USER_DB_USERNAME=<user>
USER_DB_PASSWORD=<password>
USER_DB_DRIVER=org.postgresql.Driver
USER_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

Product service:

```env
PRODUCT_DB_URL=jdbc:postgresql://<host>:<port>/<db>
PRODUCT_DB_USERNAME=<user>
PRODUCT_DB_PASSWORD=<password>
PRODUCT_DB_DRIVER=org.postgresql.Driver
PRODUCT_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

Order service:

```env
ORDER_DB_URL=jdbc:postgresql://<host>:<port>/<db>
ORDER_DB_USERNAME=<user>
ORDER_DB_PASSWORD=<password>
ORDER_DB_DRIVER=org.postgresql.Driver
ORDER_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

Place service:

```env
PLACE_DB_URL=jdbc:postgresql://<host>:<port>/<db>
PLACE_DB_USERNAME=<user>
PLACE_DB_PASSWORD=<password>
PLACE_DB_DRIVER=org.postgresql.Driver
PLACE_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

Music service:

```env
MUSIC_VOTE_DB_URL=jdbc:postgresql://<host>:<port>/<db>
MUSIC_VOTE_DB_USERNAME=<user>
MUSIC_VOTE_DB_PASSWORD=<password>
MUSIC_VOTE_DB_DRIVER=org.postgresql.Driver
MUSIC_VOTE_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

## Kafka

Railway does not provide Kafka as a first-party plugin. For demo deployment, disable the product-service Kafka listener:

```env
SPRING_KAFKA_LISTENER_AUTO_STARTUP=false
```

For full order/product event behavior, use an external Kafka provider and set this on both `product-service` and `order-service`:

```env
SPRING_KAFKA_BOOTSTRAP_SERVERS=<external-kafka-bootstrap-server>
```

## Recommended Deploy Order

1. Deploy `auth-service`, `user-service`, `place-service`, `product-service`, `order-service`, and `music-service`.
2. Set `EUREKA_CLIENT_ENABLED=false` on all backend services.
3. Set database variables if using PostgreSQL.
4. Deploy `gateway-service` and set route URI variables.
5. Deploy `frontend` with `REACT_APP_API_URL` pointing to the gateway public domain.
