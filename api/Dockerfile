FROM clojure AS build

WORKDIR /build

COPY . .

RUN lein build

FROM eclipse-temurin:24-jre-alpine

COPY --from=build /build/target/uberjar/imigresen-api-0.1.0-SNAPSHOT-standalone.jar /imigresen-api-0.1.0-SNAPSHOT-standalone.jar

ENTRYPOINT ["java", "-showversion", "-jar", "/imigresen-api-0.1.0-SNAPSHOT-standalone.jar"]
