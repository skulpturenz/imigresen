(in-ns 'skulpture-eventing.entity.core)
(require '[clojure.spec.alpha :as s]
         '[next.jdbc.protocols :as jdbc-protocols]
         '[skulpture-eventing.entity-utils.apply :as apply]
         '[skulpture-eventing.entity.spec :as es]
         '[skulpture-eventing.store.core :as store]
         '[taoensso.truss :as truss])

(declare schema-registry)

(defn aggregate
  "Gets the events associated with the entity id and determines the current state of the event,
   applying any additional events if specified. Additional events are not committed, to do so invoke `commit!`.

   An aggregate is composed of: the current state of the entity, events which have been committed and uncommitted events
   which have been applied to determine the current state. Expects a vector when events to apply are specified as
   order is important"
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
       (when (truss/have (partial s/valid? schema) current-state)
         {:aggregate current-state
          :events committed-events
          :uncommitted-events uncommitted-events}))))
  ([connectable entity entity-id transformer]
   {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
               (truss/have? keyword? entity)
               (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id)
               (truss/have? fn? transformer))]}
   (let [committed-events (store/load-by-entity-id connectable (str entity-id))]
     (when (and (some? committed-events) (not-empty committed-events))
       (let [current-state (apply/aggregate transformer committed-events)
             schema (truss/have ((keyword entity) @schema-registry))]
         (when (truss/have (partial s/valid? schema) current-state :data {:type :validation-error
                                                                          :explain (s/explain schema current-state)})
           {:aggregate current-state
            :events committed-events
            :uncommitted-events []})))))
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
       (when (truss/have (partial s/valid? schema) current-state)
         {:aggregate current-state
          :events committed-events
          :uncommitted-events events}))
     (let [committed-events (store/load-by-entity-id connectable (str entity-id-or-aggregate))]
       (if (and (some? committed-events) (not-empty committed-events))
         (let [current-state (apply/aggregate transformer (into [] cat [committed-events events]))
               schema (truss/have ((keyword entity) @schema-registry))]
           (when (truss/have (partial s/valid? schema) current-state)
             {:aggregate current-state
              :events committed-events
              :uncommitted-events events}))
         (let [current-state (apply/aggregate transformer events)
               schema (truss/have ((keyword entity) @schema-registry))]
           (when (truss/have (partial s/valid? schema) current-state)
             {:aggregate current-state
              :events []
              :uncommitted-events events})))))))
