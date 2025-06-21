FROM clojure AS build

WORKDIR /build

COPY --from=common . ./imigresen-common
COPY . ./imigresen-api

RUN cd imigresen-common && lein install
RUN cd imigresen-api && lein build

FROM eclipse-temurin:24-jre-alpine

COPY --from=build /build/imigresen-api/target/uberjar/api-0.1.0-SNAPSHOT-standalone.jar /app/api-0.1.0-SNAPSHOT-standalone.jar

ENTRYPOINT ["java", "-showversion", "-jar", "/app/api-0.1.0-SNAPSHOT-standalone.jar"]
