FROM clojure AS build

WORKDIR /build

COPY --from=common . ./imigresen-common
COPY . ./imigresen-api

RUN cd imigresen-common && lein install
RUN cd imigresen-api && lein build
RUN cd imigresen-common && lein build

FROM eclipse-temurin:24-jre-alpine

COPY --from=build /build/imigresen-common/target/uberjar/common-SNAPSHOT-standalone.jar /app/common-standalone.jar
COPY --from=build /build/imigresen-api/target/uberjar/api-0.1.0-SNAPSHOT-standalone.jar /app/api-standalone.jar

# Common uberjar includes migrations which are otherwise not included if we were to just do a `lein install`
# (because it uses thin jars) and build the API
ENTRYPOINT ["java", "-showversion", "-cp", "common-standalone.jar:api-standalone.jar", "imigresen_api.app.core.main"]
