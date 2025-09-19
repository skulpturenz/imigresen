(ns skulpture-eventing.store.core-impl.count-by-entity-id
  #_{:clj-kondo/ignore [:refer :refer-all]}
  (:require [clojure.core.cache :as cache]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [skulpture-eventing.store.core-impl.shared :refer :all]))

(defn count-by-entity-id
  [connectable entity-id]
  (let [cached-events (if (and *event-store-cache*
                               (cache/has? @lirs-cache entity-id))
                        (do
                          (swap! lirs-cache cache/hit entity-id)
                          (cache/lookup @lirs-cache entity-id))
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
                      (sql/format {:cache lirs-cache
                                   :params {:entity-id entity-id}}))
            result (jdbc/execute-one! connectable query)]
        (:count result)))))
