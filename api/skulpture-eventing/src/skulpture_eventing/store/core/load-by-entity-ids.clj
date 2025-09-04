(in-ns 'skulpture-eventing.store.core)
(require '[honey.sql :as sql]
         '[next.jdbc :as jdbc]
         '[skulpture-eventing.store.agents :as agents])

;; TODO: update for loading projects from `event_journal_projections`
(defn load-by-entity-ids
  "Load all events for entities by entity ids.

   Events are ordered by the time occurred and their revision.

   If snapshots are available starts from the snapshot."
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
                  (sql/format {:params {:entity-ids entity-ids
                                        :revision-start 0}}))
        result (jdbc/execute! connectable query)]
    result))
