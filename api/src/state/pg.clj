(ns state.pg
  (:require
   [mount.core]
   [environ.core]
   [pg.core]
   [clojure.string]
   [pg.migrations.core]
   [pg.pool]
   [clojure.walk]
   [ring.util.codec])
  (:import
   (java.net URI)))

(defn create-config [connection-string]
  (let [uri (URI. connection-string)
        ssl-mode (clojure.walk/keywordize-keys (ring.util.codec/form-decode (.getQuery uri)))]
    {:host (.getHost uri)
     :port (.getPort uri)
     :user (first (clojure.string/split ":" (.getUserInfo uri)))
     :password (second (clojure.string/split ":" (.getUserInfo uri)))
     ;; TODO: sslmode
     ;; https://www.postgresql.org/docs/8.4/libpq-connect.html#LIBPQ-CONNECT-SSLMODE
     ;; disable - only try a non-SSL connection
     ;; allow - first try a non-SSL connection; if that fails, try an SSL connection
     ;; prefer (default) - first try an SSL connection; if that fails, try a non-SSL connection
     ;; require - only try an SSL connection. If a root CA file is present, verify the certificate in the same way as if verify-ca was specified
     ;; verify-ca - only try an SSL connection, and verify that the server certificate is issued by a trusted CA.
     ;; verify-full - only try an SSL connection, verify that the server certificate is issued by a trusted CA and that the server hostname matches that in the certificate.
     :use-ssl (clojure.walk/keywordize-keys (ring.util.codec/form-decode (.getQuery uri)))}))

;; TODO: parse connection string
(def pg2 (agent {:config {:host (environ.core/env :pg-host)
                          :port (environ.core/env :pg-port)
                          :user (environ.core/env :pg-user)
                          :password (environ.core/env :pg-password)
                          :database (environ.core/env :pg-database)
                          :use-ssl (environ.core/env :pg-use-ssl)
                          :migrations-table (clojure.string/join "-" [(environ.core/env :pg-migrations-table) (environ.core/env :java-env)])
                          :migrations-path (environ.core/env :pg-migrations-path)}}))

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
