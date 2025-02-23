(ns imigresen-api.state.db.core
  (:require [mount.core :refer [defstate]]
            [next.jdbc :as jdbc]
            [next.jdbc.result-set :as rs]
            [next.jdbc.date-time :as dt]
            [next.jdbc.connection :as connection]
            [imigresen-api.app.migrations :refer [migrate]]
            [imigresen-api.app.env :refer [env current-env]]
            [clojure.string :as str]
            [clojure.walk :refer [keywordize-keys]]
            [ring.util.codec :refer [form-decode form-encode]]
            [imigresen-api.app.utils :refer [caught exception?]]
            [taoensso.telemere :as t])
  (:import (com.zaxxer.hikari HikariDataSource)
           (java.net URI)))

(def ^:private db-agent (agent {}))

(dt/read-as-local)

;; https://github.com/seancorfield/next-jdbc/blob/develop/doc/getting-started.md#connection-pooling
(defn start
  ([jdbc-connection-string] (start jdbc-connection-string (env :db-migration-dir string?) (env :db-seed-dir string? "")))
  ([jdbc-connection-string migrations-dir seeds-dir]
   (t/log! {:level :debug :data jdbc-connection-string} "db state start")
   ;; supported db types
   ;; https://github.com/seancorfield/next-jdbc/blob/develop/src/next/jdbc/connection.clj
   (send db-agent assoc :jdbc-connection-string jdbc-connection-string)
   (let [ds (connection/->pool HikariDataSource {:jdbcUrl jdbc-connection-string})
         opts {:builder-fn rs/as-kebab-maps}]
     (send db-agent assoc :ds ds)
     (send db-agent assoc :ds-opts (jdbc/with-options ds opts))
     (send db-agent assoc :opts opts))
   (await db-agent)
   ;; initialize pool and validate
   (.close (jdbc/get-connection (:ds @db-agent)))
   (migrate (:ds @db-agent) (env :db-init-script string?) migrations-dir (env :db-migration-table-name string?))
   ;; seed db
   (when (and (not= seeds-dir "") (not (nil? seeds-dir)))
     (migrate (:ds @db-agent) nil seeds-dir (env :db-seed-migration-table-name string?)))
   ;; return agent
   db-agent))

(defn stop []
  (t/log! {:level :debug :data (:jdbc-connection-string @db-agent)} "db state stop")
  (.close ^HikariDataSource (:ds @db-agent))
  (send db-agent dissoc :ds)
  (await db-agent)
  ;; return agent
  db-agent)

(defn- parse-connection-string [connection-string]
  (let [uri (URI. connection-string)
        query-params (caught (keywordize-keys (form-decode (.getQuery uri))))]
    {:host (.getHost uri)
     :port (let [port (try (.getPort uri) (catch Exception _e 5432))] (if (not= port -1) port 5432))
     :user (try (first (str/split (.getUserInfo uri) #":")) (catch Exception _e ""))
     :password (try (second (str/split (.getUserInfo uri) #":")) (catch Exception _e ""))
     :database (try (str/replace (.getPath uri) #"/" "") (catch Exception _e ""))
     :sslmode (if (not (exception? query-params))
                (:sslmode query-params)
                "prefer")}))

;; https://jdbc.postgresql.org/documentation/use/
(defn create-jdbc-connection-string [connection-string]
  (let [parsed (parse-connection-string connection-string)]
    (str "jdbc:postgresql://" (:host parsed) ":" (:port parsed) "/" (:database parsed) "?" (form-encode {:user (:user parsed)
                                                                                                         :password (:password parsed)
                                                                                                         :sslmode (:sslmode parsed)}))))

(defstate db
  :start (start (create-jdbc-connection-string (when (contains? #{"production" "development"} current-env) (env :pg-connection-string string?))))
  :stop (stop))
