;; TODO: configure linting
;; TODO: configure otel (sideload with jvm + logging)
;; TODO: cleanup deps for envs

(defproject imigresen-api "0.1.0-SNAPSHOT"
  :description "Imigresen API"
  :url "https://skulpture.xyz"
  :license {:name "MIT"
            :url "https://opensource.org/license/mit"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [ring/ring-core "1.13.0"]
                 [keycloak-clojure/keycloak-clojure "1.31.2"]
                 [com.github.seancorfield/honeysql "2.6.1270"]
                 [com.github.seancorfield/next.jdbc "1.3.981"]
                 [org.postgresql/postgresql "42.7.5"]
                 [com.zaxxer/HikariCP "6.2.1"]
                 [org.duckdb/duckdb_jdbc "1.1.3"]
                 [environ "1.2.0"]
                 [metosin/reitit "0.7.2"]
                 [metosin/ring-swagger-ui "5.18.2"]
                 [metosin/muuntaja "0.6.11"]
                 [mount "0.1.20"]
                 [keycloak-clojure/keycloak-clojure "1.31.2"]
                 [buddy/buddy-auth "3.0.1"]
                 [org.clojure/core.match "1.1.0"]
                 [migratus "1.6.3"]
                 [org.slf4j/slf4j-log4j12 "2.0.16"]
                 [com.taoensso/telemere "1.0.0-RC1"]
                 [http-kit "2.3.0"]
                 [http-kit.fake "0.2.1"]
                 [danlentz/clj-uuid "0.2.0"]
                 [clojure.java-time "1.4.3"]
                 [org.threeten/threeten-extra "1.2"]
                 [camel-snake-kebab "0.4.3"]
                 [jumblerg/ring-cors "3.0.0"]]
  :resource-paths ["migrations"]
  :main ^:skip-aot imigresen-api.app.core
  :target-path "target/%s"
  :profiles {:bin {:aot [imigresen-api.app.core]
                   :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}
             :uberjar {:aot [imigresen-api.app.core]
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}
             :test {:env {:java-env "test"}}}
  :test-paths ["src"]
  :plugins [[lein-environ "1.2.0"]
            [lein-ring "0.12.6" :auto-refresh? true]
            [lein-auto "0.1.3"]
            [migratus-lein "0.7.3"]]
  :ring {:init imigresen-api.app.core/init
         :destroy imigresen-api.app.core/destroy
         :handler imigresen-api.app.core/app
         :nrepl {:start true :port 3001}}
  :aliases {"dev" ["ring" "server-headless"]
            "build" ["ring" "uberjar"]
            "build.watch" ["auto" "ring" "uberjar"]
            "test" ["test"]
            "test.watch" ["auto" "test"]
            "repl" ["repl"]})
