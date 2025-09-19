(ns skulpture-eventing.test-utils.db.core
  (:require [clojure.string :as str]
            [clojure.walk :as walk]
            [honey.sql :as sql]
            [jsonista.core :as j]
            [next.jdbc :as jdbc]
            [next.jdbc.connection :as connection]
            [next.jdbc.date-time :as dt]
            [next.jdbc.prepare :as prepare]
            [next.jdbc.result-set :as rs]
            [ring.util.codec :as ring-codec]
            [skulpture-eventing.test-utils.db.migrations :as migrations]
            [taoensso.truss :as truss])
  (:import (com.zaxxer.hikari HikariDataSource)
           (java.net URI)
           (java.sql PreparedStatement)
           (org.postgresql.util PGobject)))

(def ^:private db-agent (agent {}))

(dt/read-as-instant)

;; https://github.com/seancorfield/next-jdbc/blob/develop/doc/getting-started.md#connection-pooling
(defn start
  ([jdbc-connection-string]
   ;; supported db types
   ;; https://github.com/seancorfield/next-jdbc/blob/develop/src/next/jdbc/connection.clj
   (send db-agent assoc :jdbc-connection-string jdbc-connection-string)
   (let [ds (connection/->pool
             HikariDataSource
             {:jdbcUrl jdbc-connection-string
              :maximumPoolSize 1})
         opts jdbc/snake-kebab-opts]
     (send db-agent assoc :ds ds)
     (send db-agent assoc :ds-opts (jdbc/with-options ds opts))
     (send db-agent assoc :opts opts)
     (sql/set-options! {:checking :strict}))
   (await db-agent)
   ;; initialize pool and validate
   (.close (jdbc/get-connection (:ds @db-agent)))
   (migrations/migrate (:ds @db-agent) "init.sql" "migrations/" "migrations")
   ;; return agent
   db-agent))

(defn stop []
  (when (:ds @db-agent)
    (.close ^HikariDataSource (:ds @db-agent))
    (send db-agent dissoc :ds)
    (await db-agent))
  ;; return agent
  db-agent)

(defn- parse-connection-string [connection-string]
  (let [uri (URI. connection-string)
        query-params (truss/catching (walk/keywordize-keys (ring-codec/form-decode (.getQuery uri))))]
    {:host (.getHost uri)
     :port (or (truss/catching (.getPort uri)) 5432)
     :user (or (truss/catching (first (str/split (.getUserInfo uri) #":"))) "")
     :password (or (truss/catching (second (str/split (.getUserInfo uri) #":"))) "")
     :database (or (truss/catching (str/replace (.getPath uri) #"/" "")) "")
     :sslmode (if (not (nil? query-params))
                (:sslmode query-params)
                "prefer")}))

;; https://jdbc.postgresql.org/documentation/use/
(defn create-jdbc-connection-string [connection-string]
  (let [parsed (parse-connection-string connection-string)]
    (str "jdbc:postgresql://" (:host parsed) ":" (:port parsed) "/" (:database parsed) "?" (ring-codec/form-encode {:user (:user parsed)
                                                                                                                    :password (:password parsed)
                                                                                                                    :sslmode (:sslmode parsed)}))))

;; https://cljdoc.org/d/com.github.seancorfield/next.jdbc/1.3.1048/doc/getting-started/tips-tricks#working-with-json-and-jsonb
;; :decode-key-fn here specifies that JSON-keys will become keywords:
(def ->json j/write-value-as-string)
(def <-json #(j/read-value % j/keyword-keys-object-mapper))

(defn ->pgobject
  "Transforms Clojure data to a PGobject that contains the data as
  JSON. PGObject type defaults to `jsonb` but can be changed via
  metadata key `:pgtype`"
  [x]
  (let [pgtype (or (:pgtype (meta x)) "jsonb")]
    (doto (PGobject.)
      (.setType pgtype)
      (.setValue (->json x)))))

(defn <-pgobject
  "Transform PGobject containing `json` or `jsonb` value to Clojure data."
  [^PGobject v]
  (let [type (.getType v)
        value (.getValue v)]
    (if (#{"jsonb" "json"} type)
      (some-> value <-json (with-meta {:pgtype type}))
      value)))

;; if a SQL parameter is a Clojure hash map or vector, it'll be transformed
;; to a PGobject for JSON/JSONB:
(extend-protocol prepare/SettableParameter
  clojure.lang.IPersistentMap
  (set-parameter [m ^PreparedStatement s i]
    (.setObject s i (->pgobject m)))

  clojure.lang.IPersistentVector
  (set-parameter [v ^PreparedStatement s i]
    (.setObject s i (->pgobject v))))

;; if a row contains a PGobject then we'll convert them to Clojure data
;; while reading (if column is either "json" or "jsonb" type):
(extend-protocol rs/ReadableColumn
  org.postgresql.util.PGobject
  (read-column-by-label [^org.postgresql.util.PGobject v _]
    (<-pgobject v))
  (read-column-by-index [^org.postgresql.util.PGobject v _2 _3]
    (<-pgobject v)))
