FROM clojure AS build

WORKDIR /build

COPY --from=common . ./imigresen-common
COPY --from=eventing . ./skulpture-eventing
COPY . ./imigresen-api

RUN cd skulpture-eventing && lein test && lein install
RUN cd imigresen-common && lein test && lein install
RUN cd imigresen-api && lein test && lein build.prod

FROM eclipse-temurin:24-jre-alpine

# COPY --from=build /build/imigresen-common/target/common-SNAPSHOT-standalone.jar /app/common-standalone.jar
COPY --from=build /build/imigresen-api/target/uberjar/api-0.1.0-SNAPSHOT-standalone.jar /app/api-standalone.jar

ENTRYPOINT [ "java", "-jar", "/app/api-standalone.jar" ]

# note: if migrations are not included then try this
# see:
# ENTRYPOINT ["java", "-showversion", "-cp", "/app/common-standalone.jar:/app/api-standalone.jar", "imigresen_api.app.core.main"]
