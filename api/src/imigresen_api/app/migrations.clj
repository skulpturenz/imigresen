(ns imigresen-api.app.migrations
  (:require
   [migratus.core :as migratus]
   [imigresen-api.app.env :refer [env]]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]))

;; TODO
(def config {:store :database
             :migration-dir (env :db-migration-dir string?)
             :init-script (env :db-init-script string?)
             :init-in-transaction? (env :db-init-in-transaction (s/and
                                                                 string?
                                                                 (s/conformer #(boolean (Boolean/valueOf (str/replace % "\"" ""))))
                                                                 boolean?))
             :migration-table-name (env :db-migration-table-name string?)})

;; https://github.com/yogthos/migratus?tab=readme-ov-file#configuration
;; https://github.com/yogthos/migratus?tab=readme-ov-file#usage
(defn migrate [connection]
  (migratus/init (assoc config :db connection))
  (migratus/migrate (assoc config :db connection)))
