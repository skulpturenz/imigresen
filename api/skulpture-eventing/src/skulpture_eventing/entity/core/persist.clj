(in-ns 'skulpture-eventing.entity.core)
(require '[taoensso.truss :as truss]
         '[skulpture-eventing.entity.spec :as es]
         '[next.jdbc.protocols :as jdbc-protocols]
         '[skulpture-eventing.store.protocol :as store-protocol])

(defn persist!
  "Persist events for an entity without loading all its events"
  [connectable events] {:pre [(and (truss/have? #(satisfies? store-protocol/EventStore %) connectable)
                                   (truss/have? #(or (and (vector? %) (every? es/event? %))
                                                     (es/event? %)) events))]}
  (truss/have (.persist! connectable (if (vector? events)
                                       events
                                       [events])))
  events)
