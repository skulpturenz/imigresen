(ns skulpture-eventing.store.core-impl.load-by-entity-id-and-revision
  #_{:clj-kondo/ignore [:refer :refer-all]}
  (:require [clojure.core.cache :as cache]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [skulpture-eventing.store.agents :as agents]
            [skulpture-eventing.store.core-impl.shared :refer :all]))

(defn load-by-entity-id-and-revision
  [connectable entity-id revision]
  (let [cached-events (if (and *event-store-cache*
                               (cache/has? @lirs-cache entity-id))
                        (do
                          (swap! lirs-cache cache/hit entity-id)
                          (cache/lookup @lirs-cache entity-id))
                        {:events []
                         :revision 0
                         :dirty false})]
    (if (>= (:revision cached-events) revision)
      (filter #(<= (:revision %) revision) (:events cached-events))
      (let [revision-start (if (not-empty (:events cached-events))
                             (:revision (last cached-events))
                             0)
            query (-> {:with [[[:snapshots {:columns [:entity-id :revision :event-agent
                                                      :time-occurred :time-observed :event-data]}]
                               {:select [:entity-id :revision :event-agent
                                         :time-occurred :time-observed :event-data]
                                :from :event-journal
                                :where [:and
                                        [:= :entity-id :?entity-id]
                                        [:= :event-agent (:snapshot agents/system-agents)]
                                        [:<= :revision :?revision-end]
                                        [:>= :revision :?revision-start]]
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
                                                       0]]
                                        [:<= :revision :?revision-end]
                                        [:>= :revision :?revision-start]]
                                :order-by [[:time-occurred :asc] [:revision :asc]]}]]
                       :union-all [{:select [:*]
                                    :from :snapshots}
                                   {:select [:*]
                                    :from :events
                                    :order-by [[:time-occurred :asc] [:revision :asc]]}]}
                      (sql/format {:cache lirs-cache
                                   :params {:entity-id entity-id
                                            :revision-start revision-start
                                            :revision-end revision}}))
            result (jdbc/execute! connectable query)
            combined (into [] cat [(:events cached-events) result])]
        (swap! lirs-cache cache/miss entity-id {:events combined
                                                :revision (or (:revision (last combined)) 0)
                                                :dirty false})
        combined))))
