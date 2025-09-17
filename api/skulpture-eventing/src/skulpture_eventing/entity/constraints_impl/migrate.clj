(ns skulpture-eventing.entity.constraints-impl.migrate
  (:require [skulpture-eventing.entity-utils.apply :as apply]
            [taoensso.truss :as truss]))

(defn create-migration
  [constraints-table aggregates ->constraint]
  {:pre [(and (truss/have? keyword? constraints-table)
              (truss/have? vector? aggregates)
              (truss/have? fn? ->constraint))]}
  {:insert-into constraints-table
   :values (map ->constraint aggregates)
   :returning :*})

(defn create-events
  [constraints ->event]
  {:pre [(and (truss/have? vector? constraints)
              (truss/have? fn? ->event))]}
  {:insert-into :event-journal
   :values (into [] cat (map #(truss/have apply/valid-stream? (->event %)) constraints))
   :returning :*})
