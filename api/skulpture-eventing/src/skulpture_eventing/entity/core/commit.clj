(in-ns 'skulpture-eventing.entity.core)
(require '[taoensso.truss :as truss]
         '[clojure.spec.alpha :as s]
         '[skulpture-eventing.entity.spec :as es]
         '[next.jdbc.protocols :as jdbc-protocols]
         '[skulpture-eventing.store.protocol :as store-protocol])

(declare schema-registry)

(defn commit!
  "Commit uncommitted events in an aggregate"
  [connectable entity aggregate] {:pre [(and (truss/have? #(satisfies? store-protocol/EventStore %) connectable)
                                             (truss/have? keyword? entity)
                                             (truss/have? es/aggregate? aggregate))]}
  (let [schema ((keyword entity) @schema-registry)]
    (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
      (let [_result (truss/have (.persist! connectable (:uncommitted-events aggregate)))]
        {:aggregate (:aggregate aggregate)
         :events (into [] cat [(:events aggregate) (:uncommitted-events aggregate)])
         :uncommitted-events []}))))
