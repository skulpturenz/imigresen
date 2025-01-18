(ns imigresen-api.core.state.pg
  (:require
   [mount.core]
   [environ.core]
   [pg.core]
   [clojure.string]
   [pg.migrations.core]
   [pg.pool]
   [clojure.walk]
   [ring.util.codec]
   [pg.ssl]
   [clojure.core.match]
   [imigresen-api.core.env])
  (:import
   (java.net URI)))

(defn create-config
  [connection-string
   ssl-client-key-absolute-path?
   ssl-client-cert-absolute-path?
   ssl-cert-ca-absolute-path?]
  (when (and (not (nil? ssl-client-key-absolute-path?)) (not (nil? ssl-client-cert-absolute-path?)))
    [pg.ssl/context ssl-client-key-absolute-path? ssl-client-cert-absolute-path?])
  (when (not (nil? ssl-cert-ca-absolute-path?))
    (pg.ssl/context ssl-cert-ca-absolute-path?))
  (when (and (not (nil? ssl-client-key-absolute-path?)) (not (nil? ssl-client-cert-absolute-path?)) (not (nil? ssl-cert-ca-absolute-path?)))
    (pg.ssl/context ssl-client-key-absolute-path? ssl-client-cert-absolute-path? ssl-cert-ca-absolute-path?))
  (let [uri (URI. connection-string)
        ssl-mode (clojure.string/lower-case (clojure.walk/keywordize-keys (ring.util.codec/form-decode (.getQuery uri))))]
    {:host (.getHost uri)
     :port (.getPort uri)
     :user (first (clojure.string/split ":" (.getUserInfo uri)))
     :password (second (clojure.string/split ":" (.getUserInfo uri)))
     ;; https://www.postgresql.org/docs/8.4/libpq-connect.html#LIBPQ-CONNECT-SSLMODE
     :use-ssl (clojure.core.match/match ssl-mode
                "disable" false
                "allow" false
                "prefer" true
                "require" true
                "verify-ca" true
                "verify-full" true)}))

;; TODO: parse connection string
(def pg2 (agent {:config {:host (environ.core/env :pg-host)
                          :port (environ.core/env :pg-port)
                          :user (environ.core/env :pg-user)
                          :password (environ.core/env :pg-password)
                          :database (environ.core/env :pg-database)
                          :use-ssl (environ.core/env :pg-use-ssl)
                          :migrations-table (clojure.string/join
                                             "-"
                                             [(environ.core/env :pg-migrations-table)
                                              (imigresen-api.core.env/env :java-env #{"production" "development"} "development")])
                          :migrations-path (environ.core/env :pg-migrations-path)
                          :pool-min-size (environ.core/env :pg-pool-min-size)
                          :pool-max-size (environ.core/env :pg-pool-max-size)
                          :pool-expire-threshold-ms (environ.core/env :pg-pool-expire-threshold-ms)
                          :pool-borrow-conn-timeout-ms (environ.core/env :pg-pool-borrow-conn-timeout-ms)}}))

(defn start []
  (pg.migrations.core/migrate-all (:config @pg2))
  (send pg2 assoc :pool (pg.pool/pool (:config @pg2))))

(defn stop []
  (when (not (nil? (:pool @pg2)))
    (pg.pool/close (:pool @pg2))
    (send pg2 dissoc :pool)))

(defn borrow-connection "Borrow a connection from the connection pool" [] (pg.pool/borrow-connection (:pool @pg2)))

(mount.core/defstate pg
  :start (start)
  :stop (stop))
