(in-ns 'skulpture-eventing.entity.core)
(require '[taoensso.truss :as truss]
         '[clojure.spec.alpha :as s]
         '[skulpture-eventing.entity-utils.apply :as apply]
         '[skulpture-eventing.entity.spec :as es]
         '[next.jdbc.protocols :as jdbc-protocols]
         '[skulpture-eventing.store.protocol :as store-protocol])

(declare schema-registry
         aggregate)

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
   {:pre [(and (truss/have? #(satisfies? store-protocol/EventStore %) connectable)
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
  [connectable entity-id] {:pre [(and (truss/have? #(satisfies? store-protocol/EventStore %) connectable)
                                      (truss/have? #(or (string? %) (number? %) (uuid? %)) entity-id))]}
  (.next-revision connectable (str entity-id)))
