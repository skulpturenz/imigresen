(ns skulpture-eventing.entity.core-impl.group-aggregates
  (:require [skulpture-eventing.entity-utils.apply :as apply]
            [taoensso.truss :as truss]))

(defn group->aggregates
  "Transform event streams bulk loaded entities into aggregates.
   Accepts a 1-arity mapper which takes the event stream for the entity and returns its aggregate"
  [events ->aggregate]
  {:pre [(and (truss/have? vector? events)
              (truss/have? fn? ->aggregate))]}
  (update-vals (group-by :entity-id events)
               #(->aggregate (truss/have apply/valid-stream? (sort-by :revision %)))))
