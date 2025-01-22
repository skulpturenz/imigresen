(defproject imigresen-api "0.1.0-SNAPSHOT"
  :description "Imigresen API"
  :url "https://skulpture.xyz"
  :license {:name "MIT"
            :url "https://opensource.org/license/mit"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [com.github.steffan-westcott/clj-otel-api "0.2.7"]
                 [ring/ring-core "1.13.0"]
                 [keycloak-clojure/keycloak-clojure "1.31.2"]
                 [com.github.seancorfield/honeysql "2.6.1243"]
                 [com.github.seancorfield/next.jdbc "1.3.981"]
                 [org.postgresql/postgresql "42.7.5"]
                 [org.xerial/sqlite-jdbc "3.48.0.0"]
                 [com.layerware/hugsql-core "0.5.3"]
                 [com.layerware/hugsql-adapter-next-jdbc "0.5.3"]
                 [io.flipt/flipt-java "1.1.2"]
                 [environ "1.2.0"]
                 [metosin/reitit "0.7.2"]
                 [metosin/ring-swagger-ui "5.18.2"]
                 [metosin/muuntaja "0.6.11"]
                 [mount "0.1.20"]
                 [keycloak-clojure/keycloak-clojure "1.31.2"]
                 [buddy/buddy-auth "3.0.1"]
                 [org.clojure/core.match "1.1.0"]
                 [migratus "1.6.3"]
                 [org.slf4j/slf4j-log4j12 "2.0.16"]]
  :main ^:skip-aot imigresen-api.app.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}}
  :test-paths ["src"]
  :plugins [[lein-environ "1.2.0"]
            [lein-ring "0.12.6" :auto-refresh? true]
            [lein-auto "0.1.3"]
            [migratus-lein "0.7.3"]]
  :ring {:handler imigresen-api.app.core/app}
  :aliases {"dev" ["ring" "server-headless"]
            "build" ["ring" "uberjar"]
            "build.watch" ["auto" "ring" "uberjar"]
            "test" ["test"]
            "test.watch" ["auto" "test"]
            "repl" ["repl"]})
