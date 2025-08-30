(ns skulpture-eventing.entity.core
  (:require [skulpture-eventing.store.core :as store]
            [java-time.api :as jt]
            [taoensso.truss :as truss]
            [clojure.spec.alpha :as s]
            [skulpture-eventing.entity.apply :as apply]
            [skulpture-eventing.store.agents :as agents]
            [skulpture-eventing.entity.spec :as es]
            [next.jdbc.protocols :as jdbc-protocols]))

(def schema-registry
  "Used to ensure that the reduced state of the entity is valid.
   
   An entity can only be loaded if a schema is defined for it"
  (atom {}))

(defn aggregate
  "Gets the events associated with the entity id and determines the current state of the event,
   applying any additional events if specified. Additional events are not committed, to do so invoke `commit!`.
   
   An aggregate is composed of: the current state of the entity, events which have been committed and uncommitted events
   which have been applied to determine the current state. Expects a vector when events to apply are specified as
   order is important"
  ([entity transformer {:keys [committed-events uncommitted-events] :as _opts}]
   {:pre [(and (truss/have? keyword? entity)
               (truss/have? #(or (nil? %)
                                 (empty? %)
                                 (and (seq %)
                                      (vector? %)
                                      (apply/valid-stream? %))) committed-events)
               (truss/have? #(or (nil? %)
                                 (empty? %)
                                 (and (seq %)
                                      (vector? %)
                                      (every? es/event? %))) uncommitted-events)
               (truss/have? fn? transformer))]}
   (when (or (and (some? committed-events) (not-empty committed-events))
             (and (some? uncommitted-events) (not-empty uncommitted-events)))
     (let [current-state (apply/aggregate transformer (into [] cat [committed-events uncommitted-events]))
           schema (truss/have ((keyword entity)  @schema-registry))]
       (when (truss/have (partial s/valid? schema) current-state)
         {:aggregate current-state :events committed-events :uncommitted-events uncommitted-events}))))
  ([connectable entity entity-id transformer]
   {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
               (truss/have? keyword? entity)
               (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
               (truss/have? fn? transformer))]}
   (let [committed-events (store/load-by-entity-id connectable (str entity-id))]
     (when (and (some? committed-events) (not-empty committed-events))
       (let [current-state (apply/aggregate transformer committed-events)
             schema (truss/have ((keyword entity) @schema-registry))]
         (when (truss/have (partial s/valid? schema) current-state :data {:type :validation-error :explain (s/explain schema current-state)})
           {:aggregate current-state :events committed-events :uncommitted-events []})))))
  ([connectable entity entity-id-or-aggregate transformer events]
   {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
               (truss/have? keyword? entity)
               (truss/have? #(or (string? %) (number? %) (uuid? %) (es/aggregate? %)) entity-id-or-aggregate)
               (truss/have? fn? transformer)
               (truss/have? #(and (vector? %) (every? es/event? %)) events))]}
   (if (es/aggregate? entity-id-or-aggregate)
     (let [committed-events (:events entity-id-or-aggregate)
           uncommitted-events (:uncommitted-events entity-id-or-aggregate)
           current-state (apply/aggregate transformer (into [] cat [committed-events uncommitted-events events]))
           schema (truss/have ((keyword entity)  @schema-registry))]
       (when (truss/have (partial s/valid? schema) current-state)
         {:aggregate current-state :events committed-events :uncommitted-events events}))
     (let [committed-events (store/load-by-entity-id connectable (str entity-id-or-aggregate))]
       (if (and (some? committed-events) (not-empty committed-events))
         (let [current-state (apply/aggregate transformer (into [] cat [committed-events events]))
               schema (truss/have ((keyword entity)  @schema-registry))]
           (when (truss/have (partial s/valid? schema) current-state)
             {:aggregate current-state :events committed-events :uncommitted-events events}))
         (let [current-state (apply/aggregate transformer events)
               schema (truss/have ((keyword entity)  @schema-registry))]
           (when (truss/have (partial s/valid? schema) current-state)
             {:aggregate current-state :events [] :uncommitted-events events})))))))

(defn commit!
  "Commit uncommitted events in an aggregate"
  [connectable entity aggregate] {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
                                             (truss/have? keyword? entity)
                                             (truss/have? es/aggregate? aggregate))]}
  (let [schema ((keyword entity) @schema-registry)]
    (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
      (let [_result (truss/have (store/persist! connectable (:uncommitted-events aggregate)))]
        {:aggregate (:aggregate aggregate)
         :events (into [] cat [(:events aggregate) (:uncommitted-events aggregate)])
         :uncommitted-events []}))))

(defn persist!
  "Persist events for an entity without loading all its events"
  [connectable events] {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
                                   (truss/have? vector? events)
                                   (truss/have? es/aggregate? aggregate))]}
  (truss/have (store/persist! connectable events))
  events)

(defn next-revision
  "Determine the next revision of an entity from an aggregate or the current state.
   
   The latest revision of events for an entity is also the revision of the current state of the entity
   so revisions should only increase as more events are associated with an entity"
  ([entity aggregate]
   {:pre [(and (truss/have? keyword? entity)
               (truss/have? es/aggregate? aggregate))]}
   (let [schema (truss/have ((keyword entity) @schema-registry))]
     (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
       (apply/next-revision (:aggregate aggregate)))))
  ([connectable entity entity-id transformer]
   {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
               (truss/have? keyword? entity)
               (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
               (truss/have? fn? transformer))]}
   (let [aggregate (aggregate connectable entity entity-id transformer)
         schema (truss/have ((keyword entity) @schema-registry))]
     (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
       (apply/next-revision (:aggregate aggregate))))))

(defn next-revision'
  "Determine the next revision of an entity without loading its event stream
   
   Does not check whether the state of the entity is valid"
  [connectable entity-id] {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
                                      (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
                                      (truss/have? es/aggregate? aggregate))]}
  (store/next-revision connectable (str entity-id)))

(defn snapshot!
  "Creates and persists a snapshot event of the current state of the entity.
   
   Snapshot events are valuable when there are many events for an entity. If a snapshot exists then it is the
   starting point when events are loaded"
  [connectable entity entity-id transformer] {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
                                                         (truss/have? keyword? entity)
                                                         (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
                                                         (truss/have? fn? transformer))]}
  (let [aggregate (aggregate connectable entity entity-id transformer)
        revision (next-revision entity aggregate)
        event-data (dissoc (:aggregate aggregate) :revision)
        snapshot-event {:event-agent (:snapshot agents/system-agents)
                        :entity-id entity-id
                        :time-occurred (jt/instant)
                        :time-observed (jt/instant)
                        :event-data event-data
                        :revision revision}
        schema (truss/have ((keyword entity) @schema-registry))]
    (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
      (truss/have [:and #(some? %) #(= event-data (:event-data %))]
                  (store/persist! connectable [snapshot-event]))
      snapshot-event)))
