(ns skulpture-eventing.entity.core-impl.aggregate
  #_{:clj-kondo/ignore [:refer :refer-all]}
  (:require [clojure.spec.alpha :as s]
            [next.jdbc.protocols :as jdbc-protocols]
            [skulpture-eventing.entity-utils.apply :as apply]
            [skulpture-eventing.entity.core-impl.shared :refer :all]
            [skulpture-eventing.entity.spec :as es]
            [skulpture-eventing.store.core :as store]
            [taoensso.truss :as truss]
            [expound.alpha :as expound]))

(def expound #(expound/expound %1 %2 {:theme :figwheel-theme :print-specs? true}))
(defn throw-bad-state [schema x]
  (expound schema x)
  (throw (ex-info "Schema validation failed" {:data {:type :bad-state
                                                     :message (s/explain-str schema x)}})))

(defn aggregate
  ([entity transformer {:keys [committed-events uncommitted-events]
                        :as _opts}]
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
           schema (truss/have ((keyword entity) @schema-registry))]
       (cond
         (s/valid? #(s/valid? schema %) current-state) {:aggregate current-state
                                                        :events committed-events
                                                        :uncommitted-events uncommitted-events}
         :else (throw-bad-state schema current-state)))))
  ([connectable entity entity-id transformer]
   {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
               (truss/have? keyword? entity)
               (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
               (truss/have? fn? transformer))]}
   (let [committed-events (store/load-by-entity-id connectable (str entity-id))]
     (when (and (some? committed-events) (not-empty committed-events))
       (let [current-state (apply/aggregate transformer committed-events)
             schema (truss/have ((keyword entity) @schema-registry))]
         (cond
           (s/valid? #(s/valid? schema %) current-state) {:aggregate current-state
                                                          :events committed-events
                                                          :uncommitted-events []}
           :else (throw-bad-state schema current-state))))))
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
           schema (truss/have ((keyword entity) @schema-registry))]
       (cond
         (s/valid? #(s/valid? schema %) current-state) {:aggregate current-state
                                                        :events committed-events
                                                        :uncommitted-events events}
         :else (throw-bad-state schema current-state)))
     (let [committed-events (store/load-by-entity-id connectable (str entity-id-or-aggregate))]
       (if (and (some? committed-events) (not-empty committed-events))
         (let [current-state (apply/aggregate transformer (into [] cat [committed-events events]))
               schema (truss/have ((keyword entity) @schema-registry))]
           (cond
             (s/valid? #(s/valid? schema %) current-state) {:aggregate current-state
                                                            :events committed-events
                                                            :uncommitted-events events}
             :else (throw-bad-state schema current-state)))
         (let [current-state (apply/aggregate transformer events)
               schema (truss/have ((keyword entity) @schema-registry))]
           (cond
             (s/valid? #(s/valid? schema %) current-state) {:aggregate current-state
                                                            :events []
                                                            :uncommitted-events events}
             :else (throw-bad-state schema current-state))))))))
