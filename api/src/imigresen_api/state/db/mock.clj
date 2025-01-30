(ns imigresen-api.state.db.mock
  (:require [mount.core :refer [defstate]]
            [imigresen-api.state.db.core :refer [start stop]]))

;; https://duckdb.org/docs/api/java.html
(defstate db
  :start (start "jdbc:duckdb:")
  :stop (stop))

(defmacro use-fixture []
  `(do
     (require '[mount.core :as mount]
              '[imigresen-api.state.db.mock]
              '[imigresen-api.state.db.core])
     (let [fixture# (fn []
                      (mount/start #'imigresen-api.state.db.mock/db)
                      (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
                      (f#)
                      (mount/stop))]
       (t/use-fixtures :once fixture#))))
