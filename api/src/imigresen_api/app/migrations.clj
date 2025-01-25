(ns imigresen-api.app.migrations
  (:require
   [migratus.core :as migratus]
   [imigresen-api.app.env :refer [env]]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]))

(defn- create-config [data-source]
  {:store :database
   :db {:datasource data-source}
   ;; TODO: when reading from env why are there quotes?
   :migration-dir (env :db-migration-dir (s/and string? (s/conformer #(str/replace % "\"" ""))))
   :init-script (env :db-init-script (s/and string? (s/conformer #(str/replace % "\"" ""))))
   :init-in-transaction? (env :db-init-in-transaction (s/and
                                                       string?
                                                       (s/conformer #(boolean (Boolean/valueOf (str/replace % "\"" ""))))
                                                       boolean?))
   :migration-table-name (env :db-migration-table-name (s/and string? (s/conformer #(str/replace % "\"" ""))))})

;; https://github.com/yogthos/migratus?tab=readme-ov-file#configuration
;; https://github.com/yogthos/migratus?tab=readme-ov-file#usage
;; https://github.com/yogthos/migratus?tab=readme-ov-file#alternative-setup
(defn migrate [data-source]
  (migratus/init (create-config data-source))
  (migratus/migrate (create-config data-source)))
