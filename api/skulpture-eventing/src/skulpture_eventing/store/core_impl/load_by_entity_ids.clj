(ns skulpture-eventing.store.core-impl.load-by-entity-ids
  (:require [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [skulpture-eventing.store.agents :as agents]))

(defn load-by-entity-ids
  [connectable entity-ids]
  (let [query (-> {:with [[[:snapshots {:columns [:entity-id :revision :event-agent
                                                  :time-occurred :time-observed :event-data]}]
                           {:select [:entity-id :revision :event-agent
                                     :time-occurred :time-observed :event-data]
                            :from :event-journal
                            :where [:and
                                    [:in :entity-id :?entity-ids]
                                    [:= :event-agent (:snapshot agents/system-agents)]]
                            :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]
                          [[:events {:columns [:entity-id :revision :event-agent
                                               :time-occurred :time-observed :event-data]}]
                           {:select [:entity-id :revision :event-agent
                                     :time-occurred :time-observed :event-data]
                            :from :event-journal
                            :where [:and
                                    [:in :entity-id :?entity-ids]
                                    [:> :revision [:coalesce
                                                   {:select [[[:max :revision]]]
                                                    :from :snapshots
                                                    :where [:= :event-journal.entity-id :snapshots.entity-id]}
                                                   :?revision-start]]]
                            :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]]
                   :union-all [{:select [:*]
                                :from :snapshots}
                               {:select [:*]
                                :from :events
                                :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]}
                  (sql/format {:params {:entity-ids (map str entity-ids)
                                        :revision-start 0}}))
        result (jdbc/execute! connectable query)]
    result))
