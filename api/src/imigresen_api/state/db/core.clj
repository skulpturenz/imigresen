(ns imigresen-api.state.db.core
  (:require [mount.core :refer [defstate]]
            [next.jdbc :as jdbc]
            [next.jdbc.connection :as connection]
            [imigresen-api.app.migrations :refer [migrate]]
            [imigresen-api.app.env :refer [env]]
            [clojure.string :as str]
            [clojure.walk :refer [keywordize-keys]]
            [ring.util.codec :refer [form-decode form-encode]]
            [imigresen-api.app.utils :refer [caught exception?]]
            [taoensso.telemere :as t])
  (:import (com.zaxxer.hikari HikariDataSource)
           (java.net URI)))

(def ^:private db-agent (agent {}))

;; https://github.com/seancorfield/next-jdbc/blob/develop/doc/getting-started.md#connection-pooling
(defn start [jdbc-connection-string]
  (t/log! {:level :debug :data jdbc-connection-string} "db state start")
  ;; supported db types
  ;; https://github.com/seancorfield/next-jdbc/blob/develop/src/next/jdbc/connection.clj
  (send db-agent assoc :jdbc-connection-string jdbc-connection-string)
  (send db-agent assoc :ds (connection/->pool HikariDataSource {:jdbcUrl jdbc-connection-string}))
  (await db-agent)
  ;; initialize pool and validate
  (.close (jdbc/get-connection (:ds @db-agent)))
  (migrate (:ds @db-agent))
  ;; return agent
  db-agent)

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
(defn- create-jdbc-connection-string [connection-string]
  (let [parsed (parse-connection-string connection-string)]
    (str "jdbc:postgresql://" (:host parsed) ":" (:port parsed) "/" (:database parsed) "?" (form-encode {:user (:user parsed)
                                                                                                         :password (:password parsed)
                                                                                                         :sslmode (:sslmode parsed)}))))

(defstate db
  :start (start (create-jdbc-connection-string (env :pg-connection-string string?)))
  :stop (stop))
