(defproject imigresen-api "0.1.0-SNAPSHOT"
  :description "Imigresen API"
  :url "https://skulpture.xyz"
  :license {:name "MIT"
            :url "https://opensource.org/license/mit"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [com.stuartsierra/component "1.1.0"]
                 [com.github.steffan-westcott/clj-otel-api "0.2.7"]
                 [ring/ring-core "1.13.0"]
                 [ring/ring-jetty-adapter "1.13.0"]
                 [compojure "1.7.1"]
                 [keycloak-clojure/keycloak-clojure "1.31.2"]
                 [com.github.seancorfield/honeysql "2.6.1243"]
                 [com.github.igrishaev/pg2-core "0.1.29"]
                 [io.flipt/flipt-java "1.1.2"]]
  :main ^:skip-aot imigresen-api.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}}
  :test-paths ["src"])
