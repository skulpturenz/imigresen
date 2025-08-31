(in-ns 'skulpture-eventing.entity.constraints)
(require '[taoensso.truss :as truss])

(defn create-migration
  "Build a HoneySQL DSL data structure to migrate entities to constraints.
   Intended to be used as part of a migration script"
  [constraints-table aggregates ->constraint]
  {:pre [(and (truss/have? keyword? constraints-table)
              (truss/have? vector? aggregates)
              (truss/have? fn? ->constraint))]}
  {:insert-into constraints-table
   :values      (map ->constraint aggregates)
   :returning   :*})

(defn create-events
  "Build a HoneySQL DSL data structure to migrate constraints to events.
   Intended to be used as part of a migration script

   The aggregate to event mapper should return a vector of event(s)"
  [constraints ->event]
  {:pre [(and (truss/have? vector? constraints)
              (truss/have? fn? ->event))]}
  {:insert-into :event-journal
   :values      (into [] cat (map ->event constraints))
   :returning   :*})
