(in-ns 'skulpture-eventing.store.core)
(require '[clojure.core.cache :as cache]
         '[honey.sql :as sql]
         '[next.jdbc :as jdbc]
         '[skulpture-eventing.store.agents :as agents])

(declare ^:dynamic *event-store-cache*)
(declare lirs-cache)

(defn load-by-entity-id
  "Load all events for an entity by its id.

   Events are ordered by the time the occurred and their revision.

   If snapshots are available starts from the snapshot."
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
      (:events cached-events)
      (let [revision-start (if (not-empty (:events cached-events))
                             (:revision (last (:events cached-events)))
                             0)
            query (-> {:with [[[:snapshots {:columns [:entity-id :revision :event-agent
                                                      :time-occurred :time-observed :event-data]}]
                               {:select [:entity-id :revision :event-agent
                                         :time-occurred :time-observed :event-data]
                                :from :event-journal
                                :where [:and
                                        [:= :entity-id :?entity-id]
                                        [:= :event-agent (:snapshot agents/system-agents)]
                                        [:> :revision :?revision-start]]
                                :order-by [[:time-occurred :asc] [:revision :asc]]}]
                              [[:events {:columns [:entity-id :revision :event-agent
                                                   :time-occurred :time-observed :event-data]}]
                               {:select [:entity-id :revision :event-agent
                                         :time-occurred :time-observed :event-data]
                                :from :event-journal
                                :where [:and
                                        [:= :entity-id :?entity-id]
                                        [:> :revision [:coalesce
                                                       {:select [[[:max :revision]]]
                                                        :from :snapshots}
                                                       :?revision-start]]]
                                :order-by [[:time-occurred :asc] [:revision :asc]]}]]
                       :union-all [{:select [:*]
                                    :from :snapshots}
                                   {:select [:*]
                                    :from :events
                                    :order-by [[:time-occurred :asc] [:revision :asc]]}]}
                      (sql/format {:cache lirs-cache
                                   :params {:entity-id entity-id
                                            :revision-start revision-start}}))
            result (jdbc/execute! connectable query)
            combined (into [] cat [(:events cached-events) result])]

        (when (not (cache/has? @lirs-cache entity-id))
          (swap! lirs-cache cache/miss entity-id {:events combined
                                                  :revision (or (:revision (last combined)) 0)
                                                  :dirty false}))
        combined))))
