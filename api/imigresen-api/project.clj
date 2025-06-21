;; TODO: configure linting
;; TODO: configure otel (sideload with jvm + logging)
;; https://github.com/technomancy/leiningen/blob/master/sample.project.clj#L177

(defproject imigresen/api "0.1.0-SNAPSHOT"
  :description "Imigresen API"
  :url "https://skulpture.xyz"
  :deployable true
  :license {:name "MIT"
            :url "https://opensource.org/license/mit"}
  :dependencies [[org.clojure/clojure "1.12.1"]
                 [ring/ring-core "1.14.2"]
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
                 [keycloak-clojure/keycloak-clojure "1.31.5"]
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
                 ;; comment when dev - use checkout
                 [imigresen/common "SNAPSHOT"]]
  :resource-paths ["migrations" "seeds"]
  :main ^:skip-aot imigresen-api.app.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot [imigresen-api.app.core]
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]
                       ;; checkout for dev
                       :dependencies [[imigresen/common "SNAPSHOT"]]}
             :test {:env {:timbre-level "ERROR"
                          :log-level "ERROR"}
                    :dependencies [[http-kit.fake "0.2.2"]
                                   [clj-test-containers/clj-test-containers "0.7.4"]
                                   [org.testcontainers/postgresql "1.21.2"]
                                   ;; checkout for dev
                                   [imigresen/common "SNAPSHOT"]]}}
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
