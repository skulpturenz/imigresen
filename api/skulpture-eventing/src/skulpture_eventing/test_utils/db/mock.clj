(ns skulpture-eventing.test-utils.db.mock
  (:require [clj-test-containers.core :as tc]
            [clojure.java.io]
            [mount.core :as mount]
            [skulpture-eventing.test-utils.db.core :as db-mock])
  (:import [org.testcontainers.containers PostgreSQLContainer]))

;; https://cljdoc.org/d/clj-test-containers/clj-test-containers/0.7.4/doc/readme
(def container (delay (-> (tc/init {:container (PostgreSQLContainer. "postgres:16-alpine")
                                    :exposed-ports [5432]})
                          (tc/start!))))

(defn- start-mock []
  (let [host (:host @container)
        port (.getMappedPort (:container @container) 5432)
        user "test"
        password "test"
        database "test"]
    (db-mock/start
     (db-mock/create-jdbc-connection-string (str "postgresql://" user ":" password "@" host ":" port "/" database)))))

(defn- stop-mock []
  (db-mock/stop)
  (tc/stop! @container))

(mount/defstate db
  :start (start-mock)
  :stop stop-mock)
