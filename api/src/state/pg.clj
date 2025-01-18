(ns state.pg
  (:require
   [mount.core]
   [environ.core]
   [pg.core]
   [clojure.string]
   [pg.migrations.core]
   [pg.pool]))

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
