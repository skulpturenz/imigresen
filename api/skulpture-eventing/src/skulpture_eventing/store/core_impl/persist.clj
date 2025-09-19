(ns skulpture-eventing.store.core-impl.persist
  #_{:clj-kondo/ignore [:refer :refer-all]}
  (:require [clojure.core.cache :as cache]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [skulpture-eventing.store.core-impl.shared :refer :all]
            [skulpture-eventing.store.transformers :as transformers]))

(defn persist!
  [connectable events]
  (let [query! (-> {:insert-into :event-journal
                    :values (map transformers/->sql-value events)
                    :returning :*}
                   (sql/format))
        result (jdbc/execute! connectable query!)
        entity-ids (distinct (map #(str (:entity-id %)) events))]
    ;; we have cached values but the entity has been modified so
    ;; do a fetch from the db since the last revision we have in cache
    (doseq [x entity-ids
            :when (cache/has? @lirs-cache (str x))]
      (swap! lirs-cache assoc-in [(str x) :dirty] true))
    result))
