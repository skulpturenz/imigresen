(defproject skulpture/eventing "SNAPSHOT"
  :description "Clojure helpers for event sourcing"
  :url "https://skulpture.xyz"
  :lib true
  :license {:name "Eclipse Public License", :url "https://www.eclipse.org/legal/epl-2.0/"}
  :plugins [[lein-ancient "LATEST"]
            [dev.weavejester/lein-cljfmt "LATEST"]
            [lein-monolith "LATEST"]
            [lein-auto "LATEST"]]
  :dependencies [[org.clojure/clojure "1.12.1"]
                 [com.github.seancorfield/honeysql "2.7.1310"]
                 [com.github.seancorfield/next.jdbc "1.3.1048"]
                 [com.taoensso/telemere "1.0.1"]
                 [danlentz/clj-uuid "0.2.0"]
                 [clojure.java-time "1.4.3"]
                 [com.taoensso/truss "2.1.0"]
                 [metosin/spec-tools "0.10.7"]
                 [org.clojure/core.cache "1.1.234"]]
  :profiles {:uberjar {:jvm-opts ["-Dclojure.compiler.direct-linking=true"]}
             :test {:env {:timbre-level "ERROR"
                          :log-level "ERROR"}
                    :dependencies [[org.postgresql/postgresql "42.7.7"]
                                   [clj-test-containers/clj-test-containers "0.7.4"]
                                   [org.testcontainers/postgresql "1.21.2"]
                                   [metosin/jsonista "0.3.13"]
                                   [ring/ring-core "1.14.2"]
                                   [mount "0.1.23"]
                                   [com.zaxxer/HikariCP "6.3.0"]
                                   [migratus "1.6.4"]]
                    :injections [(require 'clojure.set)]}}
  :test-paths ["src"]
  :aliases {"build.prod" ["uberjar"]
            "build.dev" ["do" "jar," "install"]
            "build.watch" ["auto" "build.dev"]
            "test" ["test"]
            "test.watch" ["auto" "test"]}
  :test-selectors {:default (complement :integration)
                   :unit (fn
                           ([m] (:unit m))
                           ([m s]
                            (and
                             (:unit m)
                             (or
                              (clojure.string/includes? (str (:ns m)) (name s))
                              (clojure.string/includes? (str (:name m)) (name s))))))
                   :integration (fn
                                  ([m] (:integration m))
                                  ([m s]
                                   (and
                                    (:integration m)
                                    (or
                                     (clojure.string/includes? (str (:ns m)) (name s))
                                     (clojure.string/includes? (str (:name m)) (name s))))))})
