(ns skulpture-eventing.store.core
  (:require [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [skulpture-eventing.store.agents :as agents]
            [skulpture-eventing.store.transformers :as transformers]
            [clojure.core.cache :as cache]))

(def lirs-cache (atom (cache/lirs-cache-factory {})))

(def ^:dynamic *event-store-cache* true)

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
                        {:events [] :revision 0 :dirty false})]
    (if (and (not= (:revision cached-events) 0)
             (not (:dirty cached-events))
             (not-empty cached-events))
      (:events cached-events)
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
                       :union [{:select [:*]
                                :from :snapshots}
                               {:select [:*]
                                :from :events
                                :order-by [[:time-occurred :asc] [:revision :asc]]}]}
                      (sql/format {:cache lirs-cache :params {:entity-id entity-id
                                                              :revision-start revision-start}}))
            result (jdbc/execute! connectable query)
            combined (into [] cat [(:events cached-events) result])]
        (when (not (cache/has? @lirs-cache entity-id))
          (swap! lirs-cache cache/miss entity-id {:events combined
                                                  :revision (or (:revision (last combined)) 0)}))
        (:events (cache/lookup @lirs-cache entity-id))))))

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
                                                    :from :snapshots}
                                                   :?revision-start]]]
                            :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]]
                   :union [{:select [:*]
                            :from :snapshots}
                           {:select [:*]
                            :from :events
                            :order-by [[:entity-id :asc] [:time-occurred :asc] [:revision :asc]]}]}
                  (sql/format {:params {:entity-ids entity-ids
                                        :revision-start 0}}))
        result (jdbc/execute! connectable query)]
    result))

(defn load-by-entity-id-and-revision
  "Load all events for an entity by its id and revision.
   
   Events are ordered by the time occurred and their revision.
   
   If snapshots are available starts from the snapshot."
  [connectable entity-id revision]
  (let [cached-events (if (and *event-store-cache*
                               (cache/has? @lirs-cache entity-id))
                        (do
                          (swap! lirs-cache cache/hit entity-id)
                          (cache/lookup @lirs-cache entity-id))
                        {:events [] :revision 0 :dirty false})]
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
                       :union [{:select [:*]
                                :from :snapshots}
                               {:select [:*]
                                :from :events
                                :order-by [[:time-occurred :asc] [:revision :asc]]}]}
                      (sql/format {:cache lirs-cache :params {:entity-id entity-id
                                                              :revision-start revision-start
                                                              :revision-end revision}}))
            result (jdbc/execute! connectable query)
            combined (into [] cat [(:events cached-events) result])]
        (swap! lirs-cache cache/miss entity-id {:events combined
                                                :revision (or (:revision (last combined)) 0)
                                                :dirty false})
        (:events (cache/lookup @lirs-cache entity-id))))))

(defn count-by-entity-id
  "Count the number of events for an entity by its id"
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
      (count (:events cached-events))
      (let [query (-> {:select [[[:count :entity-id]]]
                       :from :event-journal
                       :where [:= :entity-id entity-id]}
                      (sql/format {:cache lirs-cache
                                   :params {:entity-id entity-id}}))
            result (jdbc/execute-one! connectable query)]
        (:count result)))))

(defn persist!
  "Persist a stream of events"
  [connectable events]
  ;; TODO: parameterizing values throws
  (let [query! (-> {:insert-into :event-journal
                    :columns [:event-agent :entity-id :time-occurred :time-observed :event-data :revision]
                    :values (map transformers/->sql-value events)
                    :returning :*}
                   (sql/format))
        result (jdbc/execute! connectable query!)
        entity-ids (distinct (map :entity-id events))]
    ;; we have cached values but the entity has been modified so
    ;; do a fetch from the db since the last revision we have in cache
    (doseq [x entity-ids
            :when (cache/has? @lirs-cache x)]
      (swap! lirs-cache assoc-in [x :dirty] true))
    result))
