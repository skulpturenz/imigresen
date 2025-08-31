(ns skulpture-eventing.entity.core)

(def schema-registry
  "Used to ensure that the reduced state of the entity is valid.
   
   An entity can only be loaded if a schema is defined for it"
  (atom {}))

(declare aggregate)
(load "core/aggregate")

(declare commit!)
(load "core/commit")

(declare persist!)
(load "core/persist")

(declare next-revision
         next-revision')
(load "core/next_revision")

(declare snapshot!)
(load "core/snapshot")

(declare group->aggregates)
(load "core/group_aggregates")