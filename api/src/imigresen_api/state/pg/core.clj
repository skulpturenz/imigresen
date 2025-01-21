(ns imigresen-api.state.pg.core
  (:require
   [mount.core]
   [environ.core]
   [pg.core]
   [clojure.string]
   [pg.migration.core]
   [pg.pool]
   [clojure.walk]
   [ring.util.codec]
   [pg.ssl]
   [clojure.core.match]
   [imigresen-api.app.env])
  (:import
   (java.net URI)))

(def pg2-agent (agent {}))

(defn use-ssl [ssl-mode]
  (clojure.core.match/match ssl-mode
    "disable" false
    "allow" false
    "prefer" true
    "require" true
    "verify-ca" true
    "verify-full" true
    :else false))

(defn parse-uri [connection-string]
  (let [uri (URI. connection-string)]
    {:host (.getHost uri)
     :port (let [port (try (.getPort uri) (catch Exception _e 5432))] (if (not= port -1) port 5432))
     :user (try (first (clojure.string/split (.getUserInfo uri) #":")) (catch Exception _e ""))
     :password (try (second (clojure.string/split (.getUserInfo uri) #":")) (catch Exception _e ""))
     :database (try (clojure.string/replace (.getPath uri) #"/" "") (catch Exception _e ""))
     ;; https://www.postgresql.org/docs/8.4/libpq-connect.html#LIBPQ-CONNECT-SSLMODE
     :use-ssl (use-ssl
               (:sslmode (try (clojure.walk/keywordize-keys (ring.util.codec/form-decode (.getQuery uri)))
                              (catch Exception _e {}))))}))

(defn config-pg2
  ([connection-string] (parse-uri connection-string))
  ([connection-string ssl-cert-ca-absolute-path?]
   (pg.ssl/context ssl-cert-ca-absolute-path?)
   (config-pg2 connection-string))
  ([connection-string ssl-client-key-absolute-path? ssl-client-cert-absolute-path?]
   (pg.ssl/context ssl-client-key-absolute-path? ssl-client-cert-absolute-path?)
   (config-pg2 connection-string))
  ([connection-string ssl-client-key-absolute-path? ssl-client-cert-absolute-path? ssl-cert-ca-absolute-path?]
   (pg.ssl/context ssl-client-key-absolute-path? ssl-client-cert-absolute-path? ssl-cert-ca-absolute-path?)
   (config-pg2 connection-string)))

(defn set-pg2-config []
  (send pg2-agent assoc :config (merge
                                 (config-pg2 (imigresen-api.app.env/env :pg-connection-string string?))
                                 {:migrations-table (clojure.string/join
                                                     "-"
                                                     [(environ.core/env :pg-migrations-table)
                                                      (imigresen-api.app.env/env :java-env imigresen-api.app.env/valid-environment? "development")])
                                  :migrations-path (environ.core/env :pg-migrations-path)
                                  :pool-min-size (environ.core/env :pg-pool-min-size)
                                  :pool-max-size (environ.core/env :pg-pool-max-size)
                                  :pool-expire-threshold-ms (environ.core/env :pg-pool-expire-threshold-ms)
                                  :pool-borrow-conn-timeout-ms (environ.core/env :pg-pool-borrow-conn-timeout-ms)})))
(defn start []
  (set-pg2-config)
  (pg.migration.core/migrate-all (:config @pg2-agent))
  (send pg2-agent assoc :pool (pg.pool/pool (:config @pg2-agent))))

(defn stop []
  (when (not (nil? (:pool @pg2-agent)))
    (pg.pool/close (:pool @pg2-agent))
    (send pg2-agent dissoc :pool)))

(defn borrow "Borrow a connection from the connection pool" [] (pg.pool/borrow-connection (:pool @pg2-agent)))

(mount.core/defstate pg-state
  :start (start)
  :stop (stop))
