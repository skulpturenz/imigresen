(defproject skulpture/eventing "SNAPSHOT"
  :description "Clojure helpers for event sourcing"
  :url "https://skulpture.xyz"
  :lib true
  :license {:name "Eclipse Public License", :url "https://www.eclipse.org/legal/epl-2.0/"}
  :plugins [[lein-ancient "LATEST"]
            [dev.weavejester/lein-cljfmt "LATEST"]
            [lein-monolith "LATEST"]
            [lein-auto "LATEST"]
            [com.github.clj-kondo/lein-clj-kondo "0.2.5"]]
  :dependencies [[org.clojure/clojure "1.12.1"]
                 [com.github.seancorfield/honeysql "2.7.1310"]
                 [com.github.seancorfield/next.jdbc "1.3.1048"]
                 [com.taoensso/telemere "1.0.1"]
                 [danlentz/clj-uuid "0.2.0"]
                 [clojure.java-time "1.4.3"]
                 [com.taoensso/truss "2.1.0"]
                 [metosin/spec-tools "0.10.7"]
                 [org.clojure/core.cache "1.1.234"]
                 [org.typedclojure/typed.clj.runtime "1.3.0"]]
  :profiles {:jar {:jvm-opts ["-Dclojure.compiler.direct-linking=true"]
                   :jar-exclusions [#".*_test\.(clj|java)"]
                   :aot :all
                   :dependencies [[org.postgresql/postgresql "42.7.7" :scope "provided"]
                                  [clj-test-containers/clj-test-containers "0.7.4" :scope "provided"]
                                  [org.testcontainers/postgresql "1.21.2" :scope "provided"]
                                  [metosin/jsonista "0.3.13" :scope "provided"]
                                  [ring/ring-core "1.14.2" :scope "provided"]
                                  [mount "0.1.23" :scope "provided"]
                                  [com.zaxxer/HikariCP "6.3.0" :scope "provided"]
                                  [migratus "1.6.4" :scope "provided"]]}
             :uberjar {:jvm-opts ["-Dclojure.compiler.direct-linking=true"]
                       :uberjar-exclusions [#".*_test\.(clj|java)"]
                       :aot :all
                       :dependencies [[org.postgresql/postgresql "42.7.7" :scope "provided"]
                                      [clj-test-containers/clj-test-containers "0.7.4" :scope "provided"]
                                      [org.testcontainers/postgresql "1.21.2" :scope "provided"]
                                      [metosin/jsonista "0.3.13" :scope "provided"]
                                      [ring/ring-core "1.14.2" :scope "provided"]
                                      [mount "0.1.23" :scope "provided"]
                                      [com.zaxxer/HikariCP "6.3.0" :scope "provided"]
                                      [migratus "1.6.4" :scope "provided"]]}
             :kaocha {:env {:timbre-level "ERROR"
                            :log-level "ERROR"
                            :java-env "test"}
                      :dependencies [[lambdaisland/kaocha "1.91.1392"]
                                     [org.postgresql/postgresql "42.7.7"]
                                     [clj-test-containers/clj-test-containers "0.7.4"]
                                     [org.testcontainers/postgresql "1.21.2"]
                                     [metosin/jsonista "0.3.13"]
                                     [ring/ring-core "1.14.2"]
                                     [mount "0.1.23"]
                                     [com.zaxxer/HikariCP "6.3.0"]
                                     [migratus "1.6.4"]
                                     [org.typedclojure/typed.clj.checker "1.3.0"]]
                      :injections [(require 'clojure.set)]}}
  :test-paths ["src"]
  :cljfmt {:load-config-file? true}
  :aliases {"build.prod" ["uberjar"]
            "build.dev" ["do" "jar," "install"]
            "build.watch" ["auto" "build.dev"]
            "test" ["do", "deps," "with-profile" "+kaocha" "run" "-m" "kaocha.runner"]
            "test.watch" ["do" "deps," "with-profile" "+kaocha" "run" "-m" "kaocha.runner" "--watch"]})
