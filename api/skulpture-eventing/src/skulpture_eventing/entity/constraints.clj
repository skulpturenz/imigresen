(ns skulpture-eventing.entity.constraints
  (:require [skulpture-eventing.entity.constraints-impl.has]
            [skulpture-eventing.entity.constraints-impl.migrate]
            [skulpture-eventing.entity.constraints-impl.where]))

(defn has
  "Build a HoneySQL DSL data structure to check if entities which fit constraints exists.
   Any additional inclusion and exclusion criteria should be expressed as a HoneySQL clause.

   Not meant to be a replacement for a constraints table.
   A constraints table is valuable when we need to do frequent fetches.
   This is useful in the infrequent case when we wouldn't need a constraints table otherwise"
  [filters]
  (skulpture-eventing.entity.constraints-impl.has/has filters))

(defn create-migration
  "Build a HoneySQL DSL data structure to migrate entities to constraints.
   Intended to be used as part of a migration script"
  [constraints-table aggregates ->constraint]
  (skulpture-eventing.entity.constraints-impl.migrate/create-migration constraints-table aggregates ->constraint))

(defn create-events
  "Build a HoneySQL DSL data structure to migrate constraints to events.
   Intended to be used as part of a migration script

   The aggregate to event mapper should return a vector of event(s)"
  [constraints ->event]
  (skulpture-eventing.entity.constraints-impl.migrate/create-events constraints ->event))

(defn where
  "Build a HoneySQL DSL data structure to query for entities which fit constraints.
   Any additional inclusion and exclusion criteria should be expressed as a HoneySQL clause.

   Not meant to be a replacement for a constraints table.
   A constraints table is valuable when we need to do frequent fetches.
   This is useful in the infrequent case when we wouldn't need a constraints table otherwise"
  [filters]
  (skulpture-eventing.entity.constraints-impl.where/where filters))
