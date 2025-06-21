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
                 [metosin/reitit "0.9.1"]
                 [metosin/ring-swagger-ui "5.20.0"]
                 [metosin/muuntaja "0.6.11"]
                 [mount "0.1.23"]
                 [camel-snake-kebab "0.4.3"]
                 ;; comment when dev - use checkout
                 [imigresen/common "SNAPSHOT"]]
  :resource-paths ["resources"]
  :main ^:skip-aot imigresen-api.app.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot [imigresen-api.app.core]
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]
                       ;; checkout for dev
                       :dependencies [[imigresen/common "SNAPSHOT"]]}
             :test {:env {:timbre-level "ERROR"
                          :log-level "ERROR"}
                    :dependencies [;; checkout for dev
                                   ;; [imigresen/common "SNAPSHOT"]
                                   ]}}
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
