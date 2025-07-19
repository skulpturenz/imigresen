(ns skulpture-eventing.store.core
  (:require [clj-uuid :as uuid]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [java-time.api :as jt]
            [skulpture-eventing.store.agents :as agents]))

(defn load-by-entity-id
  "Load all events for an entity by its id.
   
   Events are ordered by the time the occurred and their revision.
   
   If snapshots are available starts from the snapshot."
  [connectable entity-id]
  (let [query (-> {:with [[[:snapshots {:columns [:entity-id :revision :event-agent
                                                  :time-occurred :time-observed :event-data]}]
                           {:select [:entity-id :revision :event-agent
                                     :time-occurred :time-observed :event-data]
                            :from :event-journal
                            :where [:and
                                    [:= :entity-id entity-id]
                                    [:= :event-agent (:snapshot agents/system-agents)]]
                            :order-by [[:time-occurred :asc] [:revision :asc]]}]
                          [[:events {:columns [:entity-id :revision :event-agent
                                               :time-occurred :time-observed :event-data]}]
                           {:select [:entity-id :revision :event-agent
                                     :time-occurred :time-observed :event-data]
                            :from :event-journal
                            :where [:and
                                    [:= :entity-id entity-id]
                                    [:> :revision [:coalesce
                                                   {:select [[[:max :revision]]]
                                                    :from :snapshots}
                                                   0]]]
                            :order-by [[:time-occurred :asc] [:revision :asc]]}]]
                   :union [{:select [:*]
                            :from :snapshots}
                           {:select [:*]
                            :from :events
                            :order-by [[:time-occurred :asc] [:revision :asc]]}]}
                  (sql/format))
        result (jdbc/execute! connectable query)]
    result))

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
                                    [:in :entity-id entity-ids]
                                    [:= :event-agent (:snapshot agents/system-agents)]]
                            :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]
                          [[:events {:columns [:entity-id :revision :event-agent
                                               :time-occurred :time-observed :event-data]}]
                           {:select [:entity-id :revision :event-agent
                                     :time-occurred :time-observed :event-data]
                            :from :event-journal
                            :where [:and
                                    [:in :entity-id entity-ids]
                                    [:> :revision [:coalesce
                                                   {:select [[[:max :revision]]]
                                                    :from :snapshots}
                                                   0]]]
                            :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]]
                   :union [{:select [:*]
                            :from :snapshots}
                           {:select [:*]
                            :from :events
                            :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]}
                  (sql/format))
        result (jdbc/execute! connectable query)]
    result))

(defn load-by-entity-id-and-revision
  "Load all events for an entity by its id and revision.
   
   Events are ordered by the time occurred and their revision.
   
   If snapshots are available starts from the snapshot."
  [connectable entity-id revision]
  (let [query (-> {:with [[[:snapshots {:columns [:entity-id :revision :event-agent
                                                  :time-occurred :time-observed :event-data]}]
                           {:select [:entity-id :revision :event-agent
                                     :time-occurred :time-observed :event-data]
                            :from :event-journal
                            :where [:and
                                    [:= :entity-id entity-id]
                                    [:= :event-agent (:snapshot agents/system-agents)]
                                    [:<= :revision revision]]
                            :order-by [[:time-occurred :asc] [:revision :asc]]}]
                          [[:events {:columns [:entity-id :revision :event-agent
                                               :time-occurred :time-observed :event-data]}]
                           {:select [:entity-id :revision :event-agent
                                     :time-occurred :time-observed :event-data]
                            :from :event-journal
                            :where [:and
                                    [:= :entity-id entity-id]
                                    [:> :revision [:coalesce
                                                   {:select [[[:max :revision]]]
                                                    :from :snapshots}
                                                   0]]
                                    [:<= :revision revision]]
                            :order-by [[:time-occurred :asc] [:revision :asc]]}]]
                   :union [{:select [:*]
                            :from :snapshots}
                           {:select [:*]
                            :from :events
                            :order-by [[:time-occurred :asc] [:revision :asc]]}]}
                  (sql/format))
        result (jdbc/execute! connectable query)]
    result))

(defn count-by-entity-id
  "Count the number of events for an entity by its id"
  [connectable entity-id]
  (let [query (-> {:select [[[:count :entity-id]]]
                   :from :event-journal
                   :where [:= :entity-id entity-id]}
                  (sql/format))
        result (jdbc/execute-one! connectable query)]
    (:count result)))

(defn persist!
  "Persist a stream of events"
  [connectable events]
  (let [row-mapper #(vector (:event-agent %)
                            (str (or (:entity-id %) (uuid/v7)))
                            (or (:time-occurred %) (jt/instant))
                            (:time-observed %)
                            [:lift (:event-data %)]
                            (:revision %))
        query! (-> {:insert-into [:event-journal]
                    :columns [:event-agent :entity-id :time-occurred :time-observed :event-data :revision]
                    :values (map row-mapper events)
                    :returning :*}
                   (sql/format {:params {:events events}}))
        result (jdbc/execute! connectable query!)]
    result))
