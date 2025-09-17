(ns skulpture-eventing.entity.core-impl.group-aggregates
  (:require [skulpture-eventing.entity-utils.apply :as apply]
            [taoensso.truss :as truss]))

(defn group->aggregates
  [events ->aggregate]
  {:pre [(and (truss/have? vector? events)
              (truss/have? fn? ->aggregate))]}
  (update-vals (group-by :entity-id events)
               #(->aggregate (truss/have apply/valid-stream? (sort-by :revision %)))))
