(in-ns 'skulpture-eventing.entity.core)
(require '[skulpture-eventing.store.core :as store]
         '[java-time.api :as jt]
         '[taoensso.truss :as truss]
         '[clojure.spec.alpha :as s]
         '[skulpture-eventing.store.agents :as agents]
         '[next.jdbc.protocols :as jdbc-protocols])

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
