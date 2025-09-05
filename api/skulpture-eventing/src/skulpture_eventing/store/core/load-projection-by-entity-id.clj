(in-ns 'skulpture-eventing.store.core)
(require '[honey.sql :as sql]
         '[next.jdbc :as jdbc]
         '[skulpture-eventing.store.transformers :as transformers])

(defn load-projection-by-entity-id
  "Load the current projection of an entity"
  [connectable projection-type entity-id additional-filters]
  (let [query {:select :projection
               :from :event-journal-projections
               :where (into [:and] cat [[[:= :projection-type projection-type]]
                                        [[:entity-id entity-id]]
                                        [additional-filters]])}
        result (jdbc/execute-one! connectable query)]
    (transformers/projection<-sql-value result)))
