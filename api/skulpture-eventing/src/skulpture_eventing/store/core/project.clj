(in-ns 'skulpture-eventing.store.core)
(require '[honey.sql :as sql]
         '[next.jdbc :as jdbc]
         '[skulpture-eventing.store.transformers :as transformers])

(defn project!
  "Persist a projection"
  [connectable agent projection-type entity-id snapshot revision]
  (let [query! (-> {:insert-into :event-journal
                    :values      (map transformers/snapshot->sql-value agent projection-type entity-id snapshot revision)
                    :returning   :*}
                   (sql/format))
        result (jdbc/execute! connectable query!)]
    result))
