(in-ns 'skulpture-eventing.store.core)
(require '[honey.sql :as sql]
         '[next.jdbc :as jdbc]
         '[skulpture-eventing.store.transformers :as transformers])

(defn load-projection-by-entity-ids
  "Load the current projection of entities"
  [connectable entities]
  (let [filters (map
                 (fn [[key value]]
                   (into [:and] cat [[[:= :projection-type (first %)]]
                                     ;; TODO: factor out entity id check
                                     [[:= :entity-id (if (or (string? %) (number? %) (uuid? %))
                                                       (str (second %))
                                                       (str (:entity-id (second %))))]]
                                     (when (not (or (string? %) (number? %) (uuid? %)))
                                       [(:filters (second %))])]))
                 entities)
        query {:select :projection
               :from :event-journal-projections
               :where [:or filters]}
        result (jdbc/execute! connectable query)]
    (map transformers/projection<-sql-value result)))
