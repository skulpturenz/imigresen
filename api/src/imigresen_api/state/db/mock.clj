(ns imigresen-api.state.db.mock
  (:require [mount.core :refer [defstate] :as mount]
            [imigresen-api.state.db.core :refer [start stop]]))

;; https://duckdb.org/docs/api/java.html
(defstate db
  :start (start "jdbc:duckdb:" "migrations_mock/" nil)
  :stop (stop))

(def fixture {#'imigresen-api.state.db.core/db (mount/start #'imigresen-api.state.db.mock/db)})
