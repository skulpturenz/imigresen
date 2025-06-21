(ns imigresen-api.app.migrations
  (:require [migratus.core :as migratus]
            [imigresen-api.app.env :refer [env]]
            [clojure.spec.alpha :as s]))

(defn- create-config [data-source db-init-script migrations-dir migration-table-name]
  {:store :database
   :db {:datasource data-source}
   :migration-dir migrations-dir
   :init-script db-init-script
   :init-in-transaction? (env :db-init-in-transaction (s/and
                                                       string?
                                                       (s/conformer #(boolean (Boolean/valueOf %)))
                                                       boolean?))
   :migration-table-name migration-table-name})

;; https://github.com/yogthos/migratus?tab=readme-ov-file#configuration
;; https://github.com/yogthos/migratus?tab=readme-ov-file#usage
;; https://github.com/yogthos/migratus?tab=readme-ov-file#alternative-setup
(defn migrate [data-source db-init-script migrations-dir migrations-table-name]
  (migratus/init (create-config data-source db-init-script migrations-dir migrations-table-name))
  (migratus/migrate (create-config data-source db-init-script migrations-dir migrations-table-name)))
