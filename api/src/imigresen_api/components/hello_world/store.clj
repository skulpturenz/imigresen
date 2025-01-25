(ns imigresen-api.components.hello-world.store
  (:require
   [honey.sql :as sql]
   [next.jdbc :as jdbc]
   [imigresen-api.state.db.core :refer [db]]))

(defn get-data []
  (let [query {:select [["world" :hello]]}
        results (jdbc/execute! (:ds @db) (sql/format query))]
    (first results)))
