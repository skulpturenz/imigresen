(ns imigresen-api.state.db.mock
  (:require
   [mount.core :refer [defstate]]
   [imigresen-api.state.db.core :refer [start stop]]))

;; TODO: https://github.com/brettwooldridge/HikariCP/issues/393

(defstate db
  ;; TODO: pooling is not a thing for sqlite but should work?
  :start (start "jdbc:sqlite::memory:")
  :stop (stop))
