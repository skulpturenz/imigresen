(ns imigresen-api.app.migrations
  (:require [migratus.core :as migratus]
            [imigresen-api.app.env :refer [env]]
            [clojure.spec.alpha :as s]))

(defn- create-config [data-source migrations-dir]
  {:store :database
   :db {:datasource data-source}
   :migration-dir migrations-dir
   :init-script (env :db-init-script string?)
   :init-in-transaction? (env :db-init-in-transaction (s/and
                                                       string?
                                                       (s/conformer #(boolean (Boolean/valueOf %)))
                                                       boolean?))
   :migration-table-name (env :db-migration-table-name string?)})

;; https://github.com/yogthos/migratus?tab=readme-ov-file#configuration
;; https://github.com/yogthos/migratus?tab=readme-ov-file#usage
;; https://github.com/yogthos/migratus?tab=readme-ov-file#alternative-setup
(defn migrate [data-source migrations-dir]
  (migratus/init (create-config data-source migrations-dir))
  (migratus/migrate (create-config data-source migrations-dir)))
