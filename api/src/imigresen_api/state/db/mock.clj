(ns imigresen-api.state.db.mock
  (:require [mount.core :refer [defstate] :as mount]
            [imigresen-api.state.db.core :refer [start stop parse-connection-string]]
            [clj-test-containers.core :as tc])
  (:import [org.testcontainers.containers PostgreSQLContainer]))

;; https://cljdoc.org/d/clj-test-containers/clj-test-containers/0.7.4/doc/readme
(def container (-> (tc/init {:container     (PostgreSQLContainer. "postgres:16-alpine")
                             :exposed-ports [5432]})
                   (tc/start!)))

(defn- start-mock []
  (start (parse-connection-string (str "postgresql://" (:host container) ":5432"))))

(defn- stop-mock []
  (stop)
  (tc/stop! container))

(defstate db
  :start (start-mock)
  :stop (stop-mock))

(def fixture {#'imigresen-api.state.db.core/db (mount/start #'imigresen-api.state.db.mock/db)})
