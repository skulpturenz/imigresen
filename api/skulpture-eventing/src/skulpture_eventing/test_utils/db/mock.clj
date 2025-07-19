(ns skulpture-eventing.test-utils.db.mock
  (:require [mount.core :refer [defstate] :as mount]
            [skulpture-eventing.test-utils.db.core :refer [start stop create-jdbc-connection-string]]
            [clj-test-containers.core :as tc]
            [clojure.java.io])
  (:import [org.testcontainers.containers PostgreSQLContainer]))

;; https://cljdoc.org/d/clj-test-containers/clj-test-containers/0.7.4/doc/readme
(def container (-> (tc/init {:container     (PostgreSQLContainer. "postgres:16-alpine")
                             :exposed-ports [5432]})
                   (tc/start!)))

(defn- start-mock []
  (let [host (:host container)
        port (.getMappedPort (:container container) 5432)
        user "test"
        password "test"
        database "test"]
    (start
     (create-jdbc-connection-string (str "postgresql://" user ":" password "@" host ":" port "/" database)))))

(defn- stop-mock []
  (stop)
  (tc/stop! container))

(defstate db
  :start (start-mock)
  :stop stop-mock)
