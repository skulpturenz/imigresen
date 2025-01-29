(ns imigresen-api.state.db.mock
  (:require [mount.core :refer [defstate]]
            [imigresen-api.state.db.core :refer [start stop]]))

;; https://duckdb.org/docs/api/java.html
(defstate db
  :start (start "jdbc:duckdb:")
  :stop (stop))
