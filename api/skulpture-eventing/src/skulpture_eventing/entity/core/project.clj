(in-ns 'skulpture-eventing.entity.core)
(require '[skulpture-eventing.store.core :as store]
         '[java-time.api :as jt]
         '[taoensso.truss :as truss]
         '[clojure.spec.alpha :as s]
         '[skulpture-eventing.store.agents :as agents]
         '[next.jdbc.protocols :as jdbc-protocols]
         '[skulpture-eventing.entity.spec :as es])

(defn project!
  "Creates and persists a projecion of the current state of the entity from an aggregate"
  ([connectable aggregate]
   {:pre [(and (or (truss/have? #(satisfies? jdbc-protocols/Transactable %) connectable)
                   (and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
                        (truss/have? #((complement satisfies?) jdbc-protocols/Wrapped connectable))))
               (truss/have? es/aggregate? aggregate)
               (truss/have? #(some? (get-in aggregate [:aggregate :revision]))))]}
   (let [projection-type (:entity aggregate)
         entity-id (:entity-id aggregate)
         revision (get-in aggregate [:aggregate :revision])
         projection (-> (get-in aggregate [:aggregate])
                        (dissoc :revision))
         agent (:event-agent (last (into [] cat [(:committed-events aggregate) (:uncommitted-events aggregate)])))]
     (store/project! connectable agent projection-type entity-id projection revision))))
