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
  "Used to ensure that the the reduced state of the entity is valid"
  (atom {}))

(defn aggregate
  "Get the current state of the entity or apply uncommitted events to an aggregate or an entity's current state"
  ([connectable entity entity-id transformer]
   {:pre [(and (truss/have #(satisfies? jdbc-protocols/Connectable %) connectable)
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
   {:pre [(and (truss/have #(satisfies? jdbc-protocols/Connectable %) connectable)
               (truss/have keyword? entity)
               (truss/have #(or (string? %) (number? %) (uuid? %) (es/aggregate? %)) entity-id-or-aggregate)
               (truss/have fn? transformer)
               (truss/have #(and (vector? %) (every? es/event? %)) events))]}
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
  [connectable entity aggregate] {:pre [(and (truss/have #(satisfies? jdbc-protocols/Connectable %) connectable)
                                             (truss/have? keyword? entity)
                                             (truss/have? es/aggregate? aggregate))]}
  (let [schema ((keyword entity) @schema-registry)]
    (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
      (let [_result (truss/have (store/persist! connectable (:uncommitted-events aggregate)))]
        {:aggregate (:aggregate aggregate)
         :events (into [] cat [(:events aggregate) (:uncommitted-events aggregate)])
         :uncommitted-events []}))))

(defn next-revision
  "Determine the next revision of the entity from an aggregate or the current state"
  ([entity aggregate]
   {:pre [(and (truss/have? keyword? entity)
               (truss/have? es/aggregate? aggregate))]}
   (let [schema (truss/have ((keyword entity) @schema-registry))]
     (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
       (apply/next-revision (:aggregate aggregate)))))
  ([connectable entity entity-id transformer]
   {:pre [(and (truss/have #(satisfies? jdbc-protocols/Connectable %) connectable)
               (truss/have? keyword? entity)
               (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
               (truss/have? fn? transformer))]}
   (let [aggregate (aggregate connectable entity entity-id transformer)
         schema (truss/have ((keyword entity) @schema-registry))]
     (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
       (apply/next-revision (:aggregate aggregate))))))

(defn snapshot
  "Create a snapshot event of the current state of the entity"
  [connectable entity entity-id transformer] {:pre [(and (truss/have #(satisfies? jdbc-protocols/Connectable %) connectable)
                                                         (truss/have? keyword? entity)
                                                         (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
                                                         (truss/have? fn? transformer))]}
  (let [aggregate (aggregate connectable entity entity-id transformer)
        revision (next-revision entity aggregate)
        snapshot-event {:event-agent (:snapshot agents/system-agents)
                        :entity-id entity-id
                        :time-occurred (jt/instant)
                        :time-observed (jt/instant)
                        :event (dissoc (:aggregate aggregate) :revision)
                        :revision revision}
        schema (truss/have ((keyword entity) @schema-registry))]
    (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
      (store/persist! connectable [snapshot-event])
      snapshot-event)))
