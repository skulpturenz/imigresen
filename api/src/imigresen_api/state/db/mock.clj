(ns imigresen-api.state.db.mock
  (:require
   [mount.core :refer [defstate]]
   [imigresen-api.state.db.core :refer [start stop]]))

;; TODO: https://github.com/brettwooldridge/HikariCP/issues/393
;; https://duckdb.org/docs/api/java.html

(defstate db
  ;; TODO: pooling is not a thing for sqlite but should work?
  :start (start "jdbc:duckdb:")
  :stop (stop))
