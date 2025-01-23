(ns imigresen-api.state.db.mock
  (:require
   [mount.core :refer [defstate]]
   [imigresen-api.state.db.core :as db]))

;; TODO: https://github.com/brettwooldridge/HikariCP/issues/393

(defstate db-state
  ;; TODO: pooling is not a thing for sqlite but should work?
  :start (db/start "jdbc:sqlite::memory:")
  :stop (db/stop))
