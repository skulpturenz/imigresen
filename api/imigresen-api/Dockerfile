FROM clojure AS build

WORKDIR /build

COPY . .

RUN lein build

FROM eclipse-temurin:24-jre-alpine

COPY --from=build /build/target/uberjar/api-0.1.0-SNAPSHOT-standalone.jar /app/api-0.1.0-SNAPSHOT-standalone.jar

ENTRYPOINT ["java", "-showversion", "-jar", "/app/api-0.1.0-SNAPSHOT-standalone.jar"]
