(ns skulpture-eventing.store.core-impl.count-by-entity-id
  (:require [clojure.core.cache :as cache]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [skulpture-eventing.store.core-impl.shared :as shared]))

(defn count-by-entity-id
  [connectable entity-id]
  (let [cached-events (if (and shared/*event-store-cache*
                               (cache/has? @shared/lirs-cache entity-id))
                        (do
                          (swap! shared/lirs-cache cache/hit entity-id)
                          (cache/lookup @shared/lirs-cache entity-id))
                        {:events []
                         :revision 0
                         :dirty false})]
    (if (and (not= (:revision cached-events) 0)
             (not (:dirty cached-events))
             (not-empty cached-events))
      (count (:events cached-events))
      (let [query (-> {:select [[[:count :1]]]
                       :from :event-journal
                       :where [:= :entity-id :?entity-id]}
                      (sql/format {:cache shared/lirs-cache
                                   :params {:entity-id entity-id}}))
            result (jdbc/execute-one! connectable query)]
        (:count result)))))
