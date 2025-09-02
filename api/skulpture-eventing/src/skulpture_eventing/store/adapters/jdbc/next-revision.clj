(in-ns 'skulpture-eventing.store.adapters.jdbc)
(require '[honey.sql :as sql]
         '[next.jdbc :as jdbc])

(declare ^:dynamic *event-store-cache*)
(declare lirs-cache)

(defn- next-revision
  "Get the next revision without loading all events for an entity"
  [connectable entity-id]
  (let [cached-events (if (and *event-store-cache*
                               (cache/has? @lirs-cache entity-id))
                        (do
                          (swap! lirs-cache cache/hit entity-id)
                          (cache/lookup @lirs-cache entity-id))
                        {:events [] :revision 0 :dirty false})]
    (if (and (not= (:revision cached-events) 0)
             (not (:dirty cached-events))
             (not-empty cached-events))
      (inc' (:revision (last (:events cached-events))))
      (let [query (-> {:select [[[:max :revision]]]
                       :from   :event-journal
                       :where  [:= :entity-id :?entity-id]}
                      (sql/format {:cache  lirs-cache
                                   :params {:entity-id entity-id}}))
            result (jdbc/execute-one! connectable query)]
        (inc' (or (:max result) 0))))))
