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
                 ;; comment when dev - use checkout
                 ;; lein monolith link imigresen/common
                 [imigresen/common "SNAPSHOT"] ;;
                 ]
  :resource-paths ["resources"]
  :main ^:skip-aot imigresen-api.app.core
  :target-path "target/%s"
  :profiles {:dev {:env {:java-env "development"
                         :taoensso-telemere-rt-min-level ":debug"}
                   :dependencies [[ring/ring-devel "1.14.1"]
                                  ;; imigresen-common deps for checkout
                                  [keycloak-clojure/keycloak-clojure "1.31.5"]
                                  [com.github.seancorfield/honeysql "2.7.1310"]
                                  [com.github.seancorfield/next.jdbc "1.3.1048"]
                                  [org.postgresql/postgresql "42.7.7"]
                                  [com.zaxxer/HikariCP "6.3.0"]
                                  [environ "1.2.0"]
                                  [metosin/reitit "0.9.1"]
                                  [metosin/ring-swagger-ui "5.20.0"]
                                  [metosin/muuntaja "0.6.11"]
                                  [mount "0.1.23"]
                                  [buddy/buddy-auth "3.0.323"]
                                  [org.clojure/core.match "1.1.0"]
                                  [migratus "1.6.4"]
                                  [org.slf4j/slf4j-log4j12 "2.0.17"]
                                  [com.taoensso/telemere "1.0.1"]
                                  [http-kit "2.8.0"]
                                  [danlentz/clj-uuid "0.2.0"]
                                  [clojure.java-time "1.4.3"]
                                  [org.threeten/threeten-extra "1.8.0"]
                                  [camel-snake-kebab "0.4.3"]
                                  [jumblerg/ring-cors "3.0.0"]
                                  [com.taoensso/truss "2.1.0"]
                                  [io.opentelemetry/opentelemetry-api "1.50.0"]
                                  [org.clojure/tools.logging "1.3.0"]
                                  [io.sentry/sentry-clj "7.22.227"]
                                  [metosin/spec-tools "0.10.7"]
                                  [metosin/jsonista "0.3.13"]
                                  [io.randomseed/phone-number "8.13.6-3"]
                                  ;; imigresen-common test deps for checkout
                                  ;; hmr fails otherwise
                                  [clj-test-containers/clj-test-containers "0.7.4"]
                                  [org.testcontainers/postgresql "1.21.2"]
                                  ;; not required for dev, its only used in tests but
                                  ;; hmr throws without it
                                  [ring/ring-mock "0.6.1"]
                                  ;; AWS dependencies
                                  [amazonica "0.3.168" :exclusions [com.amazonaws/aws-java-sdk
                                                                     com.amazonaws/amazon-kinesis-client
                                                                     com.amazonaws/dynamodb-lock-client]]
                                  [com.amazonaws/aws-java-sdk-s3 "1.12.788"]
                                  [com.amazonaws/aws-java-sdk-core "1.12.788"]]}
             :uberjar {:env {:java-env "production"}
                       :aot [imigresen-api.app.core]
                       ;; https://cljdoc.org/d/com.taoensso/telemere/1.0.1/api/taoensso.telemere.tools-logging#tools-logging-%3Etelemere!
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true -Dclojure.tools.logging.to-telemere=true"]
                       ;; checkout for dev
                       :dependencies [[imigresen/common "SNAPSHOT"]]}
             :test {:env {:timbre-level "ERROR"
                          :log-level "ERROR"
                          :java-env "test"}
                    :dependencies [;; checkout for dev
                                   [imigresen/common "SNAPSHOT"]
                                   [org.clojure/data.json "2.5.1"]
                                   [ring/ring-mock "0.6.1"]]}}
  :test-paths ["src"]
  :plugins [[lein-environ "LATEST"]
            [lein-ring "LATEST" :auto-refresh? true]
            [lein-auto "LATEST"]
            [migratus-lein "0.7.3"]
            [lein-ancient "LATEST"]
            [dev.weavejester/lein-cljfmt "LATEST"]
            [lein-monolith "LATEST"]]
  :ring {:init imigresen-api.app.core/init
         :destroy imigresen-api.app.core/destroy
         :handler imigresen-api.app.core/app
         :nrepl {:start true :port 3001}}
  ;; uncomment to seed database
  ;; :migratus {:migration-dir "seeds"}
  :aliases {"dev" ["ring" "server-headless"]
            "build" ["ring" "uberjar"]
            "build.watch" ["auto" "ring" "uberjar"]
            "test" ["test"]
            "test.watch" ["auto" "test"]
            "repl" ["repl"]}
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
