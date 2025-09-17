;; TODO: configure linting
;; https://github.com/technomancy/leiningen/blob/master/sample.project.clj#L177

(defproject imigresen/api "0.1.0-SNAPSHOT"
  :description "Imigresen API"
  :url "https://skulpture.xyz"
  :deployable true
  :license {:name "MIT"
            :url "https://opensource.org/license/mit"}
  :dependencies [[org.clojure/clojure "1.12.1"]
                 [ring/ring-core "1.14.2"]
                 [metosin/reitit "0.9.1"]
                 [metosin/ring-swagger-ui "5.20.0"]
                 [metosin/muuntaja "0.6.11"]
                 [mount "0.1.23"]
                 [camel-snake-kebab "0.4.3"]
                 [com.taoensso/truss "2.1.0"]
                 [com.taoensso/telemere "1.0.1"]
                 [io.opentelemetry/opentelemetry-api "1.50.0"]
                 [metosin/spec-tools "0.10.7"]
                 [org.clj-commons/pretty "3.4.1"]
                 [ring-logger "1.1.1"]
                 [ring/ring-jetty-adapter "1.14.2"]
                 [nrepl/nrepl "1.4.0"]
                 [cider/cider-nrepl "0.57.0"]
                 ;; lein monolith link imigresen/common
                 [imigresen/common "SNAPSHOT"]]
  :resource-paths ["resources"]

  :target-path "target/%s"
  :profiles {:dev {:env {:java-env "development"
                         :taoensso-telemere-rt-min-level ":debug"}
                   :main ^:skip-aot imigresen-api.app.server
                   :dependencies [[ring/ring-devel "1.14.1"]
                                  [io.github.tonsky/clj-reload "0.9.8"]
                                  [watchtower "0.1.1"]]}
             :uberjar {:env {:java-env "production"
                             :timbre-level "ERROR"
                             :log-level "ERROR"}
                       :uberjar-exclusions [#".*_test\.(clj|java)"]
                       :aot :all
                       :main imigresen-api.app.server
                       :dependencies [[ring/ring-devel "1.14.1" :scope "provided"]
                                      [ring/ring-mock "0.6.1" :scope "provided"]
                                      [org.clojure/data.json "2.5.1" :scope "provided"]]
                       ;; https://cljdoc.org/d/com.taoensso/telemere/1.0.1/api/taoensso.telemere.tools-logging#tools-logging-%3Etelemere!
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true -Dclojure.tools.logging.to-telemere=true -Djdk.tracePinnedThreads=full"]}
             :kaocha {:env {:timbre-level "ERROR"
                            :log-level "ERROR"
                            :java-env "test"}
                      :dependencies [[lambdaisland/kaocha "1.91.1392"]
                                     [org.clojure/data.json "2.5.1"]
                                     [ring/ring-mock "0.6.1"]]}}
  :plugins [[lein-environ "LATEST"]
            [lein-auto "LATEST"]
            [migratus-lein "0.7.3"]
            [lein-ancient "LATEST"]
            [dev.weavejester/lein-cljfmt "LATEST"]
            [lein-monolith "LATEST"]
            [lein-checkout-deps "1.0.0"]]
  :aliases {"dev" ["do" "deps," "run"]
            "build.prod" ["uberjar"]
            "build.watch" ["auto" "build.prod"]
            "test" ["do", "deps," "with-profile" "+kaocha" "run" "-m" "kaocha.runner"]
            "test.watch" ["do" "deps," "with-profile" "+kaocha" "run" "-m" "kaocha.runner" "--watch"]
            "repl" ["repl"]})
