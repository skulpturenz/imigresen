FROM clojure AS build

WORKDIR /build

COPY --from=common . ./imigresen-common
COPY . ./imigresen-api

RUN cd imigresen-common && lein install
RUN cd imigresen-api && lein build

FROM eclipse-temurin:24-jre-alpine

# COPY --from=build /build/imigresen-common/target/common-SNAPSHOT-standalone.jar /app/common-standalone.jar
COPY --from=build /build/imigresen-api/target/uberjar/api-0.1.0-SNAPSHOT-standalone.jar /app/api-standalone.jar

ENTRYPOINT [ "java", "-jar", "/app/api-standalone.jar" ]

# note: if migrations are not included then try this
# see: 
# ENTRYPOINT ["java", "-showversion", "-cp", "/app/common-standalone.jar:/app/api-standalone.jar", "imigresen_api.app.core.main"]
