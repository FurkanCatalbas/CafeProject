FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY backend ./backend

RUN mvn -f backend/pom.xml -DskipTests package

ARG SERVICE
RUN mkdir -p /app && cp backend/${SERVICE}/target/*.jar /app/app.jar

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /app/app.jar ./app.jar

ENV JAVA_OPTS=""
EXPOSE 10100 10101 10108 10109 10110 10111 10112 10113

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
