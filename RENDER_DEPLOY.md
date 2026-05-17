# Render Deploy

This repository includes `render.yaml` for a demo Render deployment.

## Services

- `cafe-frontend`: React static site
- `cafe-gateway-service`: public API gateway
- `cafe-auth-service`, `cafe-user-service`, `cafe-place-service`, `cafe-product-service`, `cafe-order-service`, `cafe-music-service`: Spring Boot services

The Render blueprint disables Eureka and routes the gateway directly to each service URL. Local Docker Compose still uses Eureka by default.

## Deploy Steps

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from the repository.
3. Render will read `render.yaml` and create the services.
4. If Render changes any generated service URL, update these environment variables on `cafe-gateway-service`:
   - `AUTH_SERVICE_URI`
   - `USER_SERVICE_URI`
   - `PRODUCT_SERVICE_URI`
   - `ORDER_SERVICE_URI`
   - `PLACE_SERVICE_URI`
   - `MUSIC_SERVICE_URI`
5. Update `REACT_APP_API_URL` on `cafe-frontend` if the gateway URL is different, then redeploy the frontend.

## Database

The current Render demo uses each service's default H2 in-memory database. Data is lost when services restart.

For persistent data, create Render PostgreSQL databases and set the matching service environment variables:

- Auth: `AUTH_DB_URL`, `AUTH_DB_USERNAME`, `AUTH_DB_PASSWORD`, `AUTH_DB_DRIVER=org.postgresql.Driver`, `AUTH_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect`
- User: `USER_DB_URL`, `USER_DB_USERNAME`, `USER_DB_PASSWORD`, `USER_DB_DRIVER=org.postgresql.Driver`, `USER_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect`
- Product: `PRODUCT_DB_URL`, `PRODUCT_DB_USERNAME`, `PRODUCT_DB_PASSWORD`, `PRODUCT_DB_DRIVER=org.postgresql.Driver`, `PRODUCT_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect`
- Order: `ORDER_DB_URL`, `ORDER_DB_USERNAME`, `ORDER_DB_PASSWORD`, `ORDER_DB_DRIVER=org.postgresql.Driver`, `ORDER_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect`
- Place: `PLACE_DB_URL`, `PLACE_DB_USERNAME`, `PLACE_DB_PASSWORD`, `PLACE_DB_DRIVER=org.postgresql.Driver`, `PLACE_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect`
- Music: `MUSIC_VOTE_DB_URL`, `MUSIC_VOTE_DB_USERNAME`, `MUSIC_VOTE_DB_PASSWORD`, `MUSIC_VOTE_DB_DRIVER=org.postgresql.Driver`, `MUSIC_VOTE_DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect`

## Kafka

Render does not provide managed Kafka. The demo disables the product-service Kafka listener with `SPRING_KAFKA_LISTENER_AUTO_STARTUP=false`.

For full order/product event behavior, use an external Kafka provider and set `SPRING_KAFKA_BOOTSTRAP_SERVERS` on `cafe-product-service` and `cafe-order-service`.
