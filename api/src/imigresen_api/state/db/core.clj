(ns imigresen-api.state.db.core
  (:require
   [mount.core :refer [defstate]]
   [next.jdbc :as jdbc]
   [next.jdbc.connection :as connection]
   [migratus.core :as migratus]
   [imigresen-api.app.env :refer [env]])
  (:import
   (com.zaxxer.hikari HikariDataSource)))

(def ^:private db-agent (agent {}))

;; https://github.com/seancorfield/next-jdbc/blob/develop/doc/getting-started.md#connection-pooling
(defn start [jdbc-connection-string]
  (println "DB Pool start" " " jdbc-connection-string) ;; TODO: logging
  ;; supported db types
  ;; https://github.com/seancorfield/next-jdbc/blob/develop/src/next/jdbc/connection.clj
  (send db-agent assoc :jdbc-connection-string jdbc-connection-string)
  (send db-agent assoc :ds (connection/->pool HikariDataSource {:jdbcUrl jdbc-connection-string}))
  ;; initialize pool and validate
  (.close (jdbc/get-connection (:ds @db-agent)))
  ;; TODO: don't think we need to specify `:managed-connection?` as pooled
  (migratus/up {:connection (jdbc/get-connection (:ds @db-agent))}))

(defn stop []
  (println "DB Pool stop" " " (:jdbc-connection-string @db-agent)) ;; TODO: logging
  (.close ^HikariDataSource (:ds @db-agent)))

(defstate db-state
  ;; TODO: weird quotes thing
  :start (start (env :jdbc-connection-string string?))
  :stop (stop))
