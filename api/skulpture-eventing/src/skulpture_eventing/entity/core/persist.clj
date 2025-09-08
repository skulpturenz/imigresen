(in-ns 'skulpture-eventing.entity.core)
(require '[skulpture-eventing.store.core :as store]
         '[taoensso.truss :as truss]
         '[skulpture-eventing.entity.spec :as es]
         '[next.jdbc.protocols :as jdbc-protocols])

(defn persist!
  "Persist events for an entity without loading all its events"
  [connectable events] {:pre [(and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
                                   (truss/have? #(or (and (vector? %) (every? es/event? %))
                                                     (es/event? %)) events))]}
  (truss/have (store/persist! connectable (if (vector? events)
                                            events
                                            [events])))
  events)
